import React from "react";

export const Modules: React.FC = () => {
  const modules = [
    {
      title: "Data Centers",
      description:
        "Global database of datacenter facility profiles: status, type, city/region, power availability, certifications, connectivity, commissioning timeline.",
    },
    {
      title: "DCX AI",
      description:
        "DCX AI is an intelligent market research assistant from Mordor Intelligence that instantly converts complex data into actionable insights. It helps users find trusted answers in seconds instead of days.",
    },
    {
      title: "Companies",
      description:
        "Detailed profiles of data center operators, covering ownership, operations, and linked facility intelligence.",
    },
    {
      title: "Analytics",
      description:
        "Comparative dashboards and leaderboards highlighting top regions, capacity growth, project pipelines, and certifications.",
    },
    {
      title: "Insights",
      description:
        "Continuously updated feed of global data center project intelligence, aggregated from trusted APIs and RSS sources, with automated filtering, de-duplication, operator-level mapping, and insight gathering.",
    },
    {
      title: "Reports",
      description:
        "Access to 4,00+ Mordor Intelligence reports — from market briefs to deep-dive analyses — available to subscribers based on their plan.",
    },
  ];

  return (
    <section className="bg-slate-50" id="modules">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 w-full">
          <h2 className="text-2xl font-bold text-[#0a2239]">
            What Data Centre Intelligence Delivers?
          </h2>
          <p className="mt-2 text-slate-600">
            A centralized platform offering modular access to all features under
            one login, with permissions and subscriptions configured at the
            account level.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {modules.map((module, index) => (
            <div
              key={index}
              className="rounded-2xl border border-slate-200 bg-white p-6 hover:shadow-md transition-shadow"
            >
              <h3 className="text-base font-semibold text-[#0a2239]">
                {module.title}
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                {module.description}
              </p>
            </div>
          ))}

          {/* Ask Analyst - Full width */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 md:col-span-2 lg:col-span-3 hover:shadow-md transition-shadow">
            <h3 className="text-base font-semibold text-[#0a2239]">
              Ask Analyst
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Need something specific within / beyond our datacenter database coverage? Subscribers can submit data export
              requests, ask for a customized report, or suggest new records
              directly through the in-platform form
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
