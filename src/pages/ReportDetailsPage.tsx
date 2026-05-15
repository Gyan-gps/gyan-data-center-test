import React from 'react';
import { useParams, useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { getReportBySlug, getReportSnippetBySlug } from '@/network/datacenter/datacenter.api';
import { ReportDetails } from '@/components/Reports/ReportDetails';
import { useAuthStore } from '@/store';

const ReportDetailsPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { user } = useAuthStore();

  const {
    data: report,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['report', slug, user?.email],
    queryFn: () => getReportBySlug(slug!, user?.email || ''),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });

  const {
    data: reportSnippet,
  } = useQuery({
    queryKey: ['report-snippet', slug],
    queryFn: () => getReportSnippetBySlug(slug!),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  })

  // If no slug is provided, redirect to reports page
  if (!slug) {
    navigate("/reports");
    return null;
  }

  return (
    <div className="container mx-auto sm:px-4 sm:py-8 px-2 py-4">
      <ReportDetails 
        report={report} 
        loading={isLoading}
        error={error?.message}
        snippetData={reportSnippet}
      />
    </div>
  );
};

export default ReportDetailsPage;