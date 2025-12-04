"use client";

import React from 'react';
import { Hero } from './components/Hero';
import { VisualFeatures } from './components/VisualFeatures';
import { Features } from './components/Features';
import { ComparisonSection } from './components/ComparisonSection';
import { Pricing } from './components/Pricing';
import { Footer } from './components/Footer';

export default function Home() {
  const handleNavigate = (page: string) => {
    // Navigation handled by Next.js Link components
  };

  return (
    <div className="min-h-screen bg-white">
      <Hero onNavigate={handleNavigate} />
      <VisualFeatures />
      <Features onNavigate={handleNavigate} />
      <ComparisonSection />
      <Pricing />
      <Footer />
    </div>
  );
}
