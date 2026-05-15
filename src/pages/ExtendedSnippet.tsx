import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import {
  getReportExtendedSnippetBySlug,
  getReportBySlug,
} from '@/network/datacenter/datacenter.api';
import { useAuthStore } from '@/store';
import Snippet from '@/components/Reports/ExtendedSnippet';
import { ReportDetails } from '@/components/Reports/ReportDetails';
const ExtendedSnippet: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!slug) navigate("/reports");
  }, [slug, navigate]);

  const { data: report, isLoading, error } = useQuery({
    queryKey: ["report", slug, user?.email],
    queryFn: () => getReportBySlug(slug!, user?.email || ""),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });

  const { data: reportSnippet } = useQuery({
    queryKey: ["report-snippet", slug],
    queryFn: () => getReportExtendedSnippetBySlug(slug!),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });

  if (isLoading)
    return (
      <div className="flex justify-center items-center py-20 text-gray-600 text-sm sm:text-base">
        Loading report details...
      </div>
    );

  if (error)
    return (
      <div className="text-center py-10 text-red-500 text-sm sm:text-base">
        Something went wrong! Please try again.
      </div>
    );

  if (!report)
    return (
      <div className="text-center py-10 text-gray-500 text-sm sm:text-base">
        No report found.
      </div>
    );

 return (
  <div className="w-full grid justify-center">
<div className="w-full sm:px-4 sm:py-4 px-2 py-2">
      <ReportDetails 
        report={report} 
        loading={isLoading}
        error={error?.message}
      />
    </div>

    <div className="max-w-7xl w-full px-3 py-2 sm:px-6 sm:py-4 md:px-10">
      {reportSnippet ? (
        <Snippet snippetData={reportSnippet} />
      ) : (
        <div className="text-center text-gray-600">
          Loading snippet data...
        </div>
      )}
    </div>
  </div>
);
};

export default ExtendedSnippet;
