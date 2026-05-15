import { CompanyDetail } from "@/components/companies/CompanyDetails";
import { getCompanyDetailsById } from "@/network";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router";

export const CompanyDetailsPage: React.FC = () => {
  const { companyId } = useParams<{ companyId: string; companyName: string }>();
  const navigate = useNavigate();

  const {
    data: companyDetails,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ["companyDetails", companyId],
    queryFn: () => getCompanyDetailsById(companyId!),
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });

  if (!companyId) {
    navigate("/companies");
    return null;
  }

  const handleBack = () => navigate(-1);
  return (
    <CompanyDetail
      companyDetails={companyDetails}   
      loading={loading}
      error={error?.message}
      onBack={handleBack}
    />
  );
};

