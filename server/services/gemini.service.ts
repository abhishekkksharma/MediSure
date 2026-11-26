import { DEPARTMENT_LABELS, DEPARTMENT_NAMES, DepartmentName } from '../types/doctor.types';
import { ServiceError } from '../utils/ServiceError';

export type UrgencyLevel = 'low' | 'moderate' | 'high' | 'emergency';

export interface DiagnosisQA {
  question: string;
  answer: string;
}

export interface FollowUpDiagnosisResult {
  needsFollowUp: boolean;
  questions: string[];
  preliminaryNotes: string;
  urgencyLevel: UrgencyLevel;
}

export interface FinalDiagnosisResult {
  department: DepartmentName;
  possibleConditions: string[];
  summary: string;
  recommendedAction: string;
  urgencyLevel: UrgencyLevel;
  extractedSymptoms: string[];
}

const TRIAGE_SYSTEM_PROMPT = `
You are an expert hospital triage assistant for MediSure.
Your job is to evaluate a patient's reported symptoms and ask 2 to 4 concise, targeted follow-up questions to narrow down the right medical department and condition.
Never prescribe controlled medications or claim a definitive medical diagnosis; provide helpful triage guidance.

Respond ONLY with valid JSON matching this exact schema:
{
  "needsFollowUp": boolean,
  "questions": string[],
  "preliminaryNotes": string,
  "urgencyLevel": "low" | "moderate" | "high" | "emergency"
}
`.trim();

const buildFinalDiagnosisSystemPrompt = (): string => {
  const deptList = DEPARTMENT_NAMES.map(
    (key) => `- "${key}": ${DEPARTMENT_LABELS[key]}`
  ).join('\n');

  return `
You are an expert hospital triage and diagnosis assistant for MediSure.
Based on the patient's symptoms and their answers to follow-up questions, determine the single best hospital department and provide a clear clinical summary.

You MUST choose "department" as one of these exact keys:
${deptList}

Respond ONLY with valid JSON matching this exact schema:
{
  "department": "One of the exact department keys above",
  "possibleConditions": string[],
  "summary": string,
  "recommendedAction": string,
  "urgencyLevel": "low" | "moderate" | "high" | "emergency",
  "extractedSymptoms": string[]
}
`.trim();
};

class GeminiService {
  private getGeminiModel(): string {
    return process.env.GEMINI_MODEL || 'gemini-3.8-flash';
  }

  private getApiKey(): string {
    return process.env.GEMINI_API_KEY || '';
  }

  private getOpenRouterApiKey(): string {
    return process.env.OPENROUTER_API_KEY || '';
  }

  private getOpenRouterModel(): string {
    return process.env.OPENROUTER_MODEL || 'openrouter/free';
  }

  private parseJsonResponse<T>(rawText: string): T {
    const cleaned = rawText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```$/i, '')
      .trim();

    return JSON.parse(cleaned) as T;
  }

  private async callGeminiProvider<T>(systemPrompt: string, userPrompt: string): Promise<T> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new ServiceError(500, 'GEMINI_API_KEY is not configured');
    }

    const model = this.getGeminiModel();
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt }],
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: userPrompt }],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      throw new ServiceError(502, `Gemini API error (${response.status})`);
    }

    const data = (await response.json()) as {
      candidates?: Array<{
        content?: { parts?: Array<{ text?: string }> };
      }>;
    };

    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      throw new ServiceError(502, 'Empty response received from Gemini');
    }

    return this.parseJsonResponse<T>(rawText);
  }

  private async callOpenRouterProvider<T>(
    systemPrompt: string,
    userPrompt: string
  ): Promise<T> {
    const apiKey = this.getOpenRouterApiKey();
    if (!apiKey) {
      throw new ServiceError(500, 'OPENROUTER_API_KEY is not configured');
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': process.env.CLIENT_URL || 'http://localhost:3000',
        'X-Title': 'MediSure AI Diagnosis',
      },
      body: JSON.stringify({
        model: this.getOpenRouterModel(),
        temperature: 0.3,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', response.status, errorText);
      throw new ServiceError(502, `OpenRouter API error (${response.status})`);
    }

    const data = (await response.json()) as {
      choices?: Array<{
        message?: { content?: string };
      }>;
    };

    const rawText = data.choices?.[0]?.message?.content;
    if (!rawText) {
      throw new ServiceError(502, 'Empty response received from OpenRouter');
    }

    return this.parseJsonResponse<T>(rawText);
  }

  private async callGeminiJson<T>(systemPrompt: string, userPrompt: string): Promise<T> {
    try {
      return await this.callGeminiProvider<T>(systemPrompt, userPrompt);
    } catch (geminiError) {
      console.warn('Gemini failed, falling back to OpenRouter:', geminiError);
      return await this.callOpenRouterProvider<T>(systemPrompt, userPrompt);
    }
  }

  /**
   * Generates targeted follow-up triage questions based on the patient's initial symptoms.
   */
  public async getDiagnosis(
    userPrompt: string,
    history: DiagnosisQA[] = [],
    systemPrompt: string = TRIAGE_SYSTEM_PROMPT
  ): Promise<FollowUpDiagnosisResult> {
    if (!userPrompt || !userPrompt.trim()) {
      throw new ServiceError(400, 'Please describe your symptoms to begin diagnosis');
    }

    const formattedHistory =
      history.length > 0
        ? `\n\nPrevious Q&A:\n${history
            .map((item, i) => `${i + 1}. Q: ${item.question}\n   A: ${item.answer}`)
            .join('\n')}`
        : '';

    const fullPrompt = `Patient symptoms: ${userPrompt.trim()}${formattedHistory}`;

    try {
      const result = await this.callGeminiJson<FollowUpDiagnosisResult>(
        systemPrompt,
        fullPrompt
      );

      return {
        needsFollowUp: Boolean(result.needsFollowUp),
        questions: Array.isArray(result.questions) ? result.questions.slice(0, 4) : [],
        preliminaryNotes:
          result.preliminaryNotes ||
          'Please answer these quick questions so we can match you with the right specialist.',
        urgencyLevel: result.urgencyLevel || 'moderate',
      };
    } catch (error) {
      if (error instanceof ServiceError && error.statusCode === 400) {
        throw error;
      }

      // Graceful fallback if API key is missing/rate-limited
      return {
        needsFollowUp: true,
        questions: [
          'How long have you been experiencing these symptoms?',
          'Are you experiencing any fever, severe pain, or difficulty breathing?',
          'Do you have any existing medical conditions or allergies?',
        ],
        preliminaryNotes:
          'To ensure an accurate specialist match, please answer a few quick triage questions.',
        urgencyLevel: 'moderate',
      };
    }
  }

  /**
   * Produces the final department recommendation & clinical summary from symptoms + Q&A.
   */
  public async getFinalDiagnosis(
    userPrompt: string,
    qaHistory: DiagnosisQA[] = []
  ): Promise<FinalDiagnosisResult> {
    if (!userPrompt || !userPrompt.trim()) {
      throw new ServiceError(400, 'Symptoms are required for final diagnosis');
    }

    const qaText =
      qaHistory.length > 0
        ? qaHistory
            .map((item, i) => `${i + 1}. Q: ${item.question}\n   A: ${item.answer || 'Not specified'}`)
            .join('\n')
        : 'No additional follow-up answers provided.';

    const fullPrompt = `Patient symptoms: ${userPrompt.trim()}\n\nFollow-up Answers:\n${qaText}`;

    try {
      const result = await this.callGeminiJson<FinalDiagnosisResult>(
        buildFinalDiagnosisSystemPrompt(),
        fullPrompt
      );

      const validDept: DepartmentName = DEPARTMENT_NAMES.includes(result.department)
        ? result.department
        : 'GeneralMedicine';

      return {
        department: validDept,
        possibleConditions: Array.isArray(result.possibleConditions)
          ? result.possibleConditions
          : [],
        summary:
          result.summary ||
          `Based on your symptoms, a consultation with ${DEPARTMENT_LABELS[validDept]} is recommended.`,
        recommendedAction:
          result.recommendedAction ||
          'Please attend your scheduled doctor consultation and bring any prior medical records.',
        urgencyLevel: result.urgencyLevel || 'moderate',
        extractedSymptoms: Array.isArray(result.extractedSymptoms)
          ? result.extractedSymptoms
          : [userPrompt.trim()],
      };
    } catch {
      return {
        department: 'GeneralMedicine',
        possibleConditions: ['General consultation recommended'],
        summary: `Based on your reported symptoms ("${userPrompt.trim()}"), we recommend consulting a General Medicine physician for a thorough evaluation.`,
        recommendedAction: 'Book and attend an in-person or video consultation.',
        urgencyLevel: 'moderate',
        extractedSymptoms: [userPrompt.trim()],
      };
    }
  }
}

export const geminiService = new GeminiService();
export default GeminiService;
