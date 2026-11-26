import React from 'react'
import Link from 'next/link'
import Navbar from '../Header/Navbar'
import Hero from './Hero'



function HomeMain() {
  return (
    <section className='bg-[#edb4e1]'>
    <Navbar/>
    <Hero/>
    </section>
  )
}

export default HomeMain
