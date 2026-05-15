import React from "react";
import { Badge } from "@/components/ui";
import type { NewsStreamItem } from "@/network/signals/signals.types";

interface NewsCardProps {
  article: NewsStreamItem;
}

export const NewsCard: React.FC<NewsCardProps> = ({ article }) => {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200">
      <div className="p-3 sm:p-4">
        {/* Header with source info */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2 sm:gap-0">
          <div className="flex items-center space-x-2">
            <span className="text-xs sm:text-sm font-medium text-blue-600 truncate">
              {article.source.title}
            </span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-500">
              {formatDate(article.publishedDate)}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            {article.categories.length > 0 && (
              <Badge variant="default" className="text-xs px-2 py-1">
                {article.categories[0]}
              </Badge>
            )}
          </div>
        </div>

        {/* Article content */}
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col sm:flex-row gap-3 sm:gap-4"
        >
          {/* Article image - Show at top on mobile */}
          {article.image && (
            <div className="shrink-0 order-1 sm:order-2 self-center sm:self-start">
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-32 sm:w-24 sm:h-20 max-w-xs mx-auto sm:mx-0 object-cover rounded-lg"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
          )}

          <div className="flex-1 order-2 sm:order-1">
            <h3 className="font-semibold text-gray-900 text-sm sm:text-base leading-tight mb-2 line-clamp-2">
              <div className="hover:text-blue-600 transition-colors active:text-blue-700">
                {article.title}
              </div>
            </h3>

            <p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-2">
              {article.body}
            </p>

            {/* Footer info */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-gray-500 gap-2 sm:gap-4">
              <div className="flex items-center space-x-3 sm:space-x-4">
                {article.subcategories.length > 0 && (
                  <span className="truncate">{article.subcategories[0]}</span>
                )}
                {article.isDuplicate && (
                  <span className="text-orange-600">Duplicate</span>
                )}
              </div>
            </div>
          </div>
        </a>
      </div>
    </div>
  );
};
