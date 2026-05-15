import React from 'react';

export const Audience: React.FC = () => {
  const audiences = [
    {
      title: 'Hyperscale Cloud',
      points: [
        'Expansion planning & site screening',
        'Latency & interconnect considerations',
        'Competitive & capacity benchmarking'
      ]
    },
    {
      title: 'Colocation Providers',
      points: [
        'Tenant demand & pipeline tracking',
        'Pricing/positioning vs. peers',
        'Utilization & upgrades planning'
      ]
    },
    {
      title: 'Investors & REITs',
      points: [
        'Market-entry and M&A targeting',
        'Asset validation & pipeline visibility',
        'Risk/return triangulation'
      ]
    },
    {
      title: 'Telecom & Network',
      points: [
        'Interconnection opportunities',
        'Backbone & edge build‑outs',
        'Partner mapping'
      ]
    },
    {
      title: 'Real Estate Developers',
      points: [
        'Hotspots & land/power evaluation',
        'Tenant pipeline & anchor prospects',
        'Permitting & build timelines'
      ]
    },
    {
      title: 'Energy & Utilities',
      points: [
        'Power demand projections',
        'Renewables & grid planning',
        'Strategic partnerships'
      ]
    }
  ];

  return (
    <section className="bg-slate-50" id="audience">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 w-full">
          <h2 className="text-2xl font-bold text-[#0a2239]">Who Uses Data Center Intelligence (and Why) </h2>
          <p className="mt-2 text-slate-600">
            Features tailored to hyperscalers, operators, investors, and network providers - delivering datacenter database and insights aligned to each role's priorities.
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {audiences.map((audience, index) => (
            <div key={index} className="rounded-2xl border border-slate-200 bg-white p-6 hover:shadow-md transition-shadow">
              <h3 className="text-base font-semibold text-[#0a2239]">{audience.title}</h3>
              <ul className="mt-2 list-inside list-disc text-sm text-slate-600 space-y-1">
                {audience.points.map((point, pointIndex) => (
                  <li key={pointIndex}>{point}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
