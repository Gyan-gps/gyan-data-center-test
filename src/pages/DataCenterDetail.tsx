import React from "react";
import { useParams, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, Loading } from "@/components/ui";
import { DataCenterDetail as DataCenterDetailComponent } from "@/components/datacenter/DataCenterDetail";
import { getDataCenterByDcId } from "@/network/datacenter/datacenter.api";

const DataCenterDetailPage: React.FC = () => {
  const { dcId } = useParams<{ dcId: string }>();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ["dataCenter", dcId],
    queryFn: () => getDataCenterByDcId(dcId!),
    enabled: !!dcId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
  const handleBack = () => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-red-600 mb-4">
              Error:{" "}
              {error instanceof Error
                ? error.message
                : "Failed to load data center details"}
            </div>
            <div className="space-x-4">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Retry
              </button>
              <button
                onClick={handleBack}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Go Back
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data?.asset) {
    return (
      <Card>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            Data center not found
          </div>
        </CardContent>
      </Card>
    );
  }

  // Merge news data into the asset for display
  const datacenterWithNews = {
    ...data.asset,
    news: data.news || [],
  };

  return (
    <DataCenterDetailComponent
      datacenter={datacenterWithNews}
      onBack={handleBack}
    />
  );
};

export default DataCenterDetailPage;
