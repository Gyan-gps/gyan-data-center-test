import React from "react";

type Section =
  | "ranking"
  | "capacity"
  | "competition"
  | "supply"
  | "directory";

interface Props {
  activeSection: Section;
}

const quickLinks = [
  { id: "ranking", label: "Leadership Dashboard" },
  { id: "capacity", label: "Capacity Overview" },
  { id: "competition", label: "Competitive Landscape" },
  { id: "supply", label: "Data Center Supply" },
  { id: "directory", label: "DC Directory" },
];

export const QuickLinksSidebar: React.FC = () => {
  const scrollToSection = (id: string) => {
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="h-full flex flex-col p-3 pt-16 pb-60 space-y-2 justify-center">
      <div className="text-xs font-semibold uppercase text-gray-500 mb-2">
        Explore
      </div>
      {quickLinks.map((link) => (
        <button
          key={link.id}
          data-quicklink={link.id}
          onClick={() => scrollToSection(link.id)}
          className={`text-left px-3 py-2 rounded-md text-sm transition-all w-full
            ${link.id === "ranking" ? "bg-blue-100 text-blue-700 font-semibold" : "text-gray-600 hover:bg-gray-100"}`}
        >
          {link.label}
        </button>
      ))}
    </div>
  );
};