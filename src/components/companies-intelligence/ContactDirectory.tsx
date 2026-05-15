import React, { useState } from 'react'
import CommonDataTable, { type ColumnDefType } from './CommonTable'
import { SearchIcon } from 'lucide-react';
const CONTACTS_DATA = [
  { initials: "AR", name: "A. Rao", title: "VP, Data Center Expansion", fn: "Expansion Strategy", region: "APAC", country: "India, Singapore", email: "placeholder@operator.com", verified: "Q4 2026", colorIdx: 0 },
  { initials: "MK", name: "M. Keller", title: "Regional Director, Europe", fn: "Market Operations", region: "Europe", country: "Germany, France", email: "placeholder@operator.com", verified: "Q4 2026", colorIdx: 1 },
  { initials: "JL", name: "J. Lim", title: "Head of Site Acquisition", fn: "Real Estate", region: "Global", country: "Priority metros", email: "placeholder@operator.com", verified: "Q3 2026", colorIdx: 2 },
  { initials: "SC", name: "S. Chen", title: "Director, Power & Utilities", fn: "Energy Procurement", region: "APAC", country: "Japan, India", email: "placeholder@operator.com", verified: "Q4 2026", colorIdx: 3 },
  { initials: "DM", name: "D. Miller", title: "VP, Hyperscale Partnerships", fn: "Commercial", region: "North America", country: "United States", email: "placeholder@operator.com", verified: "Q4 2026", colorIdx: 4 },
  { initials: "NP", name: "N. Patel", title: "Procurement Lead", fn: "Equipment Sourcing", region: "Global", country: "UPS, cooling, racks", email: "placeholder@operator.com", verified: "Q3 2026", colorIdx: 5 },
  { initials: "ET", name: "E. Tan", title: "Sustainability Program Lead", fn: "ESG / Energy", region: "APAC", country: "Singapore, Japan", email: "placeholder@operator.com", verified: "Q4 2026", colorIdx: 6 },
  { initials: "FB", name: "F. Bernard", title: "Enterprise Sales Director", fn: "Sales", region: "Europe", country: "France, Benelux", email: "placeholder@operator.com", verified: "Q2 2026", colorIdx: 7 },
];
function Avatar({ initials, color = "bg-indigo-500" }: { initials: string, color?: string }) {
  return (
    <div className={`w-7 h-7 rounded-full ${color} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
      {initials}
    </div>
  );
}

const AVATAR_COLORS = [
  "bg-indigo-500", "bg-violet-500", "bg-sky-500", "bg-teal-500",
  "bg-rose-500", "bg-amber-500", "bg-emerald-500", "bg-pink-500",
];


function ContactDirectory() {
  const [globalFilter, setGlobalFilter] = useState("");
  const contactColumns: ColumnDefType<any>[] = [
    {
      key: "name", label: "Contact", minWidth: "min-w-[130px]", sortable: false,
      render: (v, row) => (
        <div className="flex items-center gap-2.5">
          <Avatar initials={row.initials} color={AVATAR_COLORS[row.colorIdx % AVATAR_COLORS.length]} />
          <span className="font-medium text-slate-800">{v}</span>
        </div>
      ),
    },
    {
      key: "title", label: "Title / Role", minWidth: "min-w-[200px]",
      render: (v) => <span className="text-slate-600">{v}</span>
    },
    { key: "fn", label: "Function", minWidth: "min-w-[160px]" },
    { key: "region", label: "Region", minWidth: "min-w-[110px]" },
    { key: "country", label: "Country Focus", minWidth: "min-w-[150px]" },
    {
      key: "email", label: "Email", minWidth: "min-w-[200px]",
      render: (v) => <span className="text-slate-400">{v}</span>
    },
    {
      key: "linkedin", label: "LinkedIn", sortable: false, minWidth: "min-w-[100px]",
      render: () => (
        <button className="text-indigo-600 font-medium text-xs hover:underline">View profile</button>
      ),
    },
    {
      key: "verified", label: "Last Verified", minWidth: "min-w-[110px]",
      render: (v) => <span className="text-slate-500">{v}</span>
    },
  ];
  return (
    <section className="overflow-hidden mt-5 bg-white border border-gray-100 rounded-2xl shadow-sm">
      <div className='space-y-4 md:flex items-center justify-between py-[14px] px-4 border-b border-[#0f172a0f]'>
        <div>
          <b className='text-[13px]'>Operator Decision Maker Contacts Directory</b>
          <p className='text-[12px]'>Dummy contact directory for BD, partnerships, expansion, and procurement stakeholders</p>
        </div>
        <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2 w-full sm:w-64">
          <SearchIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <input
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder={"Search Contact…"}
            className="border-none outline-none bg-transparent w-full text-[14px]"
          />
        </div>
      </div>
      <div className="pb-4">
        <CommonDataTable
          title="Operator Decision Maker Contacts Directory"
          subtitle="Dummy contact directory for BD, partnerships, expansion, and procurement stakeholders"
          meta={`${CONTACTS_DATA.length} dummy contacts`}
          notice="Visual-only directory. Email and LinkedIn fields are placeholders."
          columns={contactColumns}
          data={CONTACTS_DATA}
          searchKeys={["name", "title", "fn", "region", "country"]}
          defaultSort={{ key: "name", dir: "asc" }}
          showPagination={false}
          globalFilter={globalFilter}
          setGlobalFilter={setGlobalFilter}
        />
      </div>
    </section>
  )
}

export default ContactDirectory