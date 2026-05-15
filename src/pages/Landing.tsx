import React from 'react';
import { LandingHeader } from '@/components/landing/Header';
import { Hero } from '@/components/landing/Hero';
import { Modules } from '@/components/landing/Modules';
import { Capabilities } from '@/components/landing/Capabilities';
import { Audience } from '@/components/landing/Audience';
import { UseCases } from '@/components/landing/UseCases';
import { Login } from '@/components/landing/Login';
import { CTA } from '@/components/landing/CTA';
import { LandingFooter } from '@/components/landing/Footer';

export const Landing: React.FC = () => {
  return (
    <div className="antialiased text-slate-800">
      <LandingHeader />
      <Hero />
      <Login />
      <Modules />
      <Capabilities />
      <Audience />
      <UseCases />
      <CTA />
      <LandingFooter />
    </div>
  );
};
