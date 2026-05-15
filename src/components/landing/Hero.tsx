import React from 'react';
import LandingPageHeroImg from '@/assets/data-centers-landing-page-hero.png';

export const Hero: React.FC = () => {
  return (
    <section 
      className="relative overflow-hidden" 
      style={{background: 'linear-gradient(180deg, #f4f8fb, #ffffff)'}}
    >
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="mb-3 inline-block rounded-full bg-[#007ea7]/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white">
              B2B Projects & Facilities Intelligence 
            </p>
            <h1 className="text-3xl font-extrabold leading-tight text-[#0a2239] sm:text-4xl lg:text-5xl">
              Datacenter Database & Intelligence: Living Map of the World’s Data Centers
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600">
              Data Center Intelligence (DCI) delivers a unified, traceable datacenter database that connects projects, players, and capacity worldwide. Track real-time market movement with analyst validation, that integrates project data, ownership changes, lifecycle visibility, and market commentary into one comprehensive platform.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a 
                href="#request-demo" 
                className="inline-flex items-center justify-center rounded-xl bg-[#007ea7] hover:bg-[#006a8c] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors"
              >
                Request a Live Demo
              </a>
            </div>
          </div>
          
          <div className="relative">
            <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="aspect-16/10 w-full rounded-2xl bg-slate-100 flex items-center justify-center">
                <img src={LandingPageHeroImg} alt="Dashboard Preview" />
              </div>
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-600">
                <div className="flex flex-col justify-between border border-slate-200 p-3 text-center rounded-xl">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Datacenter Identified</div>
                  <div className="mt-1 text-base md:text-lg font-bold text-[#005073]">10,000+</div>
                </div>
                <div className="flex flex-col justify-between border border-slate-200 p-3 text-center rounded-xl">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Countries Covered</div>
                  <div className="mt-1 text-base md:text-lg font-bold text-[#005073]">148+</div>
                </div>
                <div className="flex flex-col justify-between border border-slate-200 p-3 text-center rounded-xl">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Companies Covered</div>
                  <div className="mt-1 text-base md:text-lg font-bold text-[#005073]">2270+</div>
                </div>
                <div className="flex flex-col justify-between border border-slate-200 p-3 text-center rounded-xl">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Cities Covered</div>
                  <div className="mt-1 text-base md:text-lg font-bold text-[#005073]">2226+</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
