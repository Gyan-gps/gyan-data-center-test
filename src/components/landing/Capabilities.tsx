import React from 'react';

export const Capabilities: React.FC = () => {
  const capabilities = [
    {
      title: 'Project Intelligence',
      description: 'Track global data center developments from planning and permitting to construction, commissioning, expansion, and closures with real-time visibility into capacity pipelines and IT load changes.'
    },
    {
      title: 'Ownership Tracking & Competitive Intelligence',
      description: 'Monitor who controls capacity, who is building next, and how ownership and operator strategies are shifting. Enable accurate competitive benchmarking across regions, operators, and vendors.'
    },
    {
      title: 'Power, Sustainability & Infrastructure Signals',
      description: 'Gain insight into power availability, energy sourcing, ESG commitments, regulatory changes, and infrastructure constraints that influence feasibility and development timelines.'
    },
    {
      title: 'Geospatial Layers',
      description: 'Visualize data center locations, power grids, regional infrastructure, and site-level metrics on an interactive map to support site selection, risk evaluation, and market planning.'
    }
  ];

  return (
    <section className="bg-white" id="features">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 max-w-4l">
          <h2 className="text-2xl font-bold text-[#0a2239]">Data Center Intelligence: Connecting Projects, Players and Power</h2>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          {capabilities.map((capability, index) => (
            <div key={index} className="rounded-2xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
              <h3 className="text-base font-semibold text-[#0a2239]">{capability.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{capability.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
