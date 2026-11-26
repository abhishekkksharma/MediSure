import React from 'react'
import Navbar from '../Header/Navbar'
import Hero from './Hero'
import HomeSections from './HomeSections'
import Footer from './Footer'

function HomeMain() {
  return (
    <div className="flex min-h-screen flex-col">
      <section className="bg-[#F6E2E9]">
        <Navbar />
        <Hero />
      </section>
      <HomeSections />
      <Footer />
    </div>
  )
}

export default HomeMain
