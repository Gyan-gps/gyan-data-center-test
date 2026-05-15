import React from 'react';

// NOTE: This component has been integrated into the Login component
// and is no longer used separately in the Landing page.
// It's kept here for reference or potential future standalone use.

export const ValueProps: React.FC = () => {
  const valueProps = [
    {
      title: 'Single Source of Truth',
      description: 'Unified tracking of projects, facilities, companies, IT load, and news — structured and QCed for decision-grade use.'
    },
    {
      title: 'Projects & Capacity First',
      description: 'Purpose-built for monitoring announced/UC/operational assets with timelines, capacity, power, and ownership.'
    },
    {
      title: 'Benchmark & Compare',
      description: 'Stack operators, regions, and facilities across IT load, certifications, power sourcing, and expansion pipelines.'
    },
    {
      title: 'Signals → Actions',
      description: 'Curated news and change‑signals mapped back to entities, so your teams can act on what matters.'
    }
  ];

  return (
    <section className="border-y border-slate-200 bg-white" id="value">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {valueProps.map((prop, index) => (
            <div key={index} className="rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
              <h3 className="text-sm font-semibold text-[#0a2239]">{prop.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{prop.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
