import React, { useState } from "react";

export interface SegmentTable {
  heading?: string;
  data: (string | number | null)[][];
  source?: string;
  note?: string;
}

interface ExtendedRdTableProps {
  tableData: SegmentTable;
}

const ExtendedRdTable: React.FC<ExtendedRdTableProps> = ({ tableData }) => {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  if (!tableData?.data || tableData.data.length === 0) return null;
  const toggleRow = (rowIndex: number) => {
    const updated = new Set(expandedRows);
    if (updated.has(rowIndex)) updated.delete(rowIndex);
    else updated.add(rowIndex);
    setExpandedRows(updated);
  };
  // const alignClass =
  //   tableData.data[0]?.length > 3 ? "text-left" : "text-center";

  const formatCell = (cell: string | number | null) => {
    if (cell == null) return "";
    let str = String(cell);

    str = str.replace(
      /(?<=\d|\s)pp\b/g,
      `<abbr title="percentage points" style="text-decoration: none;"> pp</abbr>`
    );

    str = str.replace(
      /(?<=\d|\s)yrs\b/g,
      `<abbr title="years" style="text-decoration: none;"> yrs</abbr>`
    );

    return str;
  };


  return (
    <div className="w-full overflow-x-auto md:overflow-visible">
      <table
        className="min-w-full border-none border-[#C0E3F1] md:border text-sm md:text-base"
        style={{ borderCollapse: "collapse" }}
      >
        {/* HEADER (Desktop Only) */}
        <thead
          className="hidden md:table-header-group bg-[#f5f7fa]"
        >
          <tr>
            {tableData.data[0].map((heading, idx) => (
              <th
                key={idx}
                className="border border-[#dde3ea] px-4 py-2 font-semibold text-[#191919] text-center"
                style={{ height: "50px", fontSize: "14px" }}
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>

        {/* BODY */}
      <tbody className="block space-y-3 md:table-row-group md:space-y-0">
  {tableData.data.slice(1).map((row, rowIndex) => {
    const hasData = row.some(cell => String(cell ?? "").trim() !== "");
    if (!hasData) return null;

    const isExpanded = expandedRows.has(rowIndex);

    return (
      <tr
        key={rowIndex}
        className="block rounded-lg border border-gray-300 text-[#000] md:table-row md:border-none"
      >
        {row.map((cell, colIndex) => {
          const formattedCell = formatCell(cell);

          return (
            <React.Fragment key={colIndex}>
              {colIndex === 0 && (
                <td
                  onClick={() => toggleRow(rowIndex)}
                  className="relative block bg-[#E8F2FA] border border-[#dde3ea] px-3 py-3 md:table-cell md:px-4 md:py-2 cursor-pointer"
                >
                  <span
                    className="flex md:hidden"
                    dangerouslySetInnerHTML={{ __html: formattedCell }}
                  />
                  <span
                    className="hidden md:block"
                    dangerouslySetInnerHTML={{ __html: formattedCell }}
                  />
                </td>
              )}

              {/* Mobile expanded content */}
              {colIndex !== 0 && (
                <td
                  className={`block md:hidden border border-[#dde3ea] px-3 py-2 ${
                    isExpanded ? "block" : "hidden"
                  }`}
                >
                  <span dangerouslySetInnerHTML={{ __html: formattedCell }} />
                </td>
              )}

              {/* Desktop column */}
              {colIndex !== 0 && (
                <td
                  className="hidden md:table-cell border border-[#dde3ea] px-4 py-2"
                >
                  <span dangerouslySetInnerHTML={{ __html: formattedCell }} />
                </td>
              )}
            </React.Fragment>
          );
        })}
      </tr>
    );
  })}
</tbody>


        {/* FOOTER — SOURCE & NOTES */}
        {(tableData.source || tableData.note) && (
          <tfoot className="block space-y-2 md:table-footer-group md:space-y-0">
            {tableData.source && (
              <tr className="block md:table-row">
                <td
                  colSpan={tableData.data[0].length}
                  className="font-medium text-gray-800 md:border-none md:bg-transparent px-2 md:px-0 pt-3 text-[13px]"
                >
                  Source: {tableData.source}
                </td>
              </tr>
            )}
            {tableData.note && (
              <tr className="block md:table-row">
                <td
                  colSpan={tableData.data[0].length}
                  className="rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 md:border-none md:bg-transparent"
                >
                  {tableData.note}
                </td>
              </tr>
            )}
          </tfoot>
        )}
      </table>
    </div>
  );
};

export default ExtendedRdTable;
