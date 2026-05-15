import React, { useState } from 'react';
import { ExternalLink, ChevronDown } from 'lucide-react';
import { Loading } from '@/components/ui';
import type { NewsArticle } from '@/network/news/news.types';

function isValidImageUrl(url: string): boolean {
  if (!url || typeof url !== "string") return false;

  try {
    const parsed = new URL(url);
    const pathname = parsed.pathname.toLowerCase();

    // Reject GIF explicitly
    if (pathname.endsWith(".gif")) return false;

    // Allow only specific extensions
    return /\.(jpg|jpeg|png|webp)$/.test(pathname);
  } catch {
    // Invalid URL format
    return false;
  }
}

interface AdminNewsTableProps {
  news: NewsArticle[];
  isLoading: boolean;
}

export const AdminNewsTable: React.FC<AdminNewsTableProps> = ({ news, isLoading }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loading size="md" />
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <p className="text-gray-500">No news articles found</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {news.map((item) => {
        const itemId = item.uri || item._id || '';
        const isExpanded = expandedId === itemId;

        return (
          <div
            key={itemId}
            className="border border-gray-200 rounded-lg overflow-hidden bg-white hover:shadow-md transition-shadow"
          >
            {/* ================= HEADER ================= */}
            <button
              onClick={() => setExpandedId(isExpanded ? null : itemId)}
              className="w-full px-3 sm:px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 hover:bg-gray-50 transition-colors text-left"
            >
              <ChevronDown
                className={`w-5 h-5 text-gray-600 transition-transform ${
                  isExpanded ? 'rotate-180' : ''
                }`}
              />

              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm sm:text-base text-gray-900 line-clamp-2">
                  {item.LLM_headline || item.title || 'N/A'}
                </p>
                <p className="text-xs text-gray-500 line-clamp-1 mt-1">
                  {item.summary?.substring(0, 100)}...
                </p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    item.quality === 'Pass'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {item.quality || 'N/A'}
                </span>

                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    item.confidence && item.confidence > 0.8
                      ? 'bg-green-100 text-green-800'
                      : item.confidence && item.confidence > 0.6
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {item.confidence ? (item.confidence * 100).toFixed(0) + '%' : 'N/A'}
                </span>
              </div>
            </button>

            {/* ================= EXPANDED CONTENT ================= */}
            {isExpanded && (
              <div className="border-t border-gray-200 bg-gray-50 px-3 sm:px-4 py-4 space-y-5">

                {/* ---------- TOP ROW: IMAGE + URI + BUTTON ---------- */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">

                  {/* IMAGE */}
                  {isValidImageUrl(item.image) && (
                    <img
                      src={item.image}
                      alt="Article"
                      className="h-28 w-28 sm:h-32 sm:w-32 rounded border object-cover flex-shrink-0"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}

                  {/* TEXT + BUTTON */}
                  <div className="flex-1 space-y-2 min-w-0">
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase">URI</p>
                      <p className="text-sm text-gray-900 break-all">
                        {item.uri || 'N/A'}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          News Link <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* ---------- CATEGORY INLINE BAR ---------- */}
                <div className="flex flex-wrap gap-2">

                  {/* CATEGORY */}
                  {item.LLM_category?.map((c, i) => (
                    <span
                      key={i}
                      className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                    >
                      {c}
                    </span>
                  ))}

                  {/* TAGS */}
                  {item.LLM_cat_tags?.map((t, i) => (
                    <span
                      key={i}
                      className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded"
                    >
                      {t}
                    </span>
                  ))}

                  {/* CHILDREN */}
                  {item.LLM_cat_children?.map((c, i) => (
                    <span
                      key={i}
                      className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded"
                    >
                      {c}
                    </span>
                  ))}
                </div>

                {/* ---------- GRID INFO ---------- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase">
                      Primary Region
                    </p>
                    <p className="text-sm">{item.primary_region || 'N/A'}</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase">
                      Published Date
                    </p>
                    <p className="text-sm">
                      {item.publishedDate
                        ? new Date(item.publishedDate).toLocaleString()
                        : 'N/A'}
                    </p>
                  </div>

                  <div className="sm:col-span-2">
                    <p className="text-xs font-semibold text-gray-600 uppercase">
                      Secondary Regions
                    </p>
                    <p className="text-sm">
                      {item.secondary_regions?.length
                        ? item.secondary_regions.join(', ')
                        : 'N/A'}
                    </p>
                  </div>

                  <div className="sm:col-span-2">
                    <p className="text-xs font-semibold text-gray-600 uppercase">
                      Summary
                    </p>
                    <p className="text-sm line-clamp-4">{item.summary || 'N/A'}</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase">
                      Quality
                    </p>
                    <p className="text-sm">{item.quality || 'N/A'}</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase">
                      Confidence
                    </p>
                    <p className="text-sm">
                      {item.confidence
                        ? (item.confidence * 100).toFixed(2) + '%'
                        : 'N/A'}
                    </p>
                  </div>

                  <div className="sm:col-span-2">
                    <p className="text-xs font-semibold text-gray-600 uppercase">
                      Quality Reason
                    </p>
                    <p className="text-sm">{item.quality_reason || 'N/A'}</p>
                  </div>

                  <div className="sm:col-span-2">
                    <p className="text-xs font-semibold text-gray-600 uppercase">
                      Relevance Reason
                    </p>
                    <p className="text-sm">{item.relevance_reason || 'N/A'}</p>
                  </div>

                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
