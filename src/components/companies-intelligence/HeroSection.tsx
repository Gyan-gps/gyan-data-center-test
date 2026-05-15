import React from "react";

interface HeroSectionProps {
  loading?: boolean;

  company_logo: string;
  company_name: string;
  one_liner: string;
  brief: string;
  email: string;
  website: string;
  tags: string[];
};

function HeroSection({
  data,
  loading,
}: HeroSectionProps) {
  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-6 border border-slate-200">
        Loading...
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-[linear-gradient(135deg,color-mix(in_srgb,#2563eb_10%,#fff),color-mix(in_srgb,#7c3aed_8%,#fff))]">
      <div className="rounded-2xl p-4 lg:p-6 shadow-sm border border-[#0f172a1a]">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">

          {/* Left Section */}
          <div className="flex items-start md:items-center gap-4">

            {data?.company_logo ? (
              <img
                src={data.company_logo}
                alt={data.company_name}
                className="w-14 h-14 rounded-xl object-cover border border-slate-200 bg-white p-1"
              />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-bold text-sm">
                {data?.company_name
                  ?.slice(0, 2)
                  ?.toUpperCase()}
              </div>
            )}

            <div>
              <h1 className="text-xl font-bold text-slate-900 mb-1">
                {data?.company_name}
              </h1>

              <p className="text-sm text-slate-500 leading-relaxed max-w-xl">
                {data?.one_liner}
              </p>

              <div className="flex flex-wrap gap-2 mt-[10px]">

                {data?.tags?.map(
                  (tag, index) => {

                    const dotColors = [
                      "bg-indigo-500",
                      "bg-emerald-500",
                      "bg-amber-400",
                    ];

                    return (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1.5 border border-[#0f172a1a] py-[7px] px-[11px] rounded-full text-xs font-medium"
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${dotColors[index % dotColors.length]}`}
                        />

                        {tag}
                      </span>
                    );
                  }
                )}

              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex flex-col items-start lg:items-end gap-2 text-sm">

            {data?.email && (
              <a
                href={`mailto:${data.email}`}
                className="text-indigo-600 hover:underline"
              >
                {data.email}
              </a>
            )}

            {data?.website && (
              <div className="flex items-center gap-2 text-indigo-600">
                {data.website}

                {/* Top Right Arrow */}
                <a
                  href={data.website}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center hover:scale-110 transition-all duration-200"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 126 60"
                    className="w-5 h-10 fill-black"
                  >
                    <path d="M8 50 C30 15, 65 5, 100 12 L88 2 L118 12 L95 30 L100 18 C65 12, 35 20, 12 52 Z" />
                  </svg>
                </a>


              </div>
            )}

</div>

        </div>

        {/* About */}
        <div className="bg-white border border-slate-100 rounded-2xl px-6 py-5 shadow-sm mt-5">

          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">
            About the company
          </p>

          <p className="text-sm text-slate-800 font-medium leading-relaxed">
            {data?.brief}
          </p>

        </div>
      </div>
    </div>
  );
}

export default HeroSection;