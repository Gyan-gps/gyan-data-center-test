import React from 'react';

export const UseCases: React.FC = () => {
  const useCases = [
    {
      title: 'Market Expansion',
      description: 'Answer critical questions, where is capacity accelerating, and how will power availability affect the next wave of projects?'
    },
    {
      title: 'Competitive Benchmarking',
      description: 'Track ownership changes and vendor details to understand who is building what, and where.'
    },
    {
      title: 'Account Planning',
      description: 'Link facilities to company profiles and vendor ecosystems to find your next opportunity.'
    },
    {
      title: 'Investment Due Diligence',
      description: 'Mitigate risk with a dataset that connects projects to players and power availability.'
    }
  ];

  return (
    <section className="bg-white" id="usecases">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 w-full">
          <h2 className="text-2xl font-bold text-[#0a2239]">High-Value Use Cases of Datacenter Database</h2>
          <p className="mt-2 text-slate-600">
            Built for product, strategy, research, and sales teams that need reliable, structured coverage in one central datacenter database.
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          {useCases.map((useCase, index) => (
            <div key={index} className="rounded-2xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
              <h3 className="text-base font-semibold text-[#0a2239]">{useCase.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{useCase.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
