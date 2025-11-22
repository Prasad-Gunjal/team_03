import React from 'react'
import Navbar from '../components/LandingPage/Navbar'

import HeroSection from '../components/LandingPage/HeroSection'
import Footer from '../components/LandingPage/Footer'
import FeaturesSection from '../components/LandingPage/FeaturesSection'
import ImpactSection from '../components/LandingPage/ImpactSection'
import { HowItWorks } from '../components/LandingPage/HowItWorks'
import ImpactMetrics from '../components/LandingPage/ImpactMetrics'
import CommunitySection from '../components/LandingPage/CommunitySection'

const Home = () => {
  return (
    <div className="relative">
      <Navbar/>
      
      <section id="hero">
        <HeroSection/>
      </section>
      
      <section id="features">
        <FeaturesSection/>
      </section>
      
      <section id="impact">
        <ImpactSection/>
      </section>
      
      <section id="how-it-works">
        <HowItWorks/>
      </section>
      
      <section id="metrics">
        <ImpactMetrics/>
      </section>
      
      <section id="community">
        <CommunitySection/>
      </section>
      
      <Footer/>
    </div>
  )
}

export default Home