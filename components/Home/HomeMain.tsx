import React from 'react'
import Link from 'next/link'
import Navbar from '../Header/Navbar'
import Hero from './Hero'



function HomeMain() {
  return (
    <section className='bg-[#F6E2E9]'>
    <Navbar/>
    <Hero/>
    </section>
  )
}

export default HomeMain
