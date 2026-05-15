
import type { Report } from "@/network";
import { synapseApiClient } from "@/services";
import type { User } from "@/types";


const fetchData = (reportData: { id: string }, userData: { id: string }) => {
  const body: { reportId: string; userId?: string } = {
    reportId: reportData.id,
  };

  if (userData?.id) {
    body.userId = userData.id;
  } const requests = [

    synapseApiClient.post(`/api/v1/flash/dci/details/toc`, body),
    synapseApiClient.post(`/api/v1/flash/dci/details/snippet`, body),
    synapseApiClient.post(
      `/api/v1/flash/dci/details/dashboard-get-all-graphs-by-tags`,
      body,
    ),
    synapseApiClient.post(`/api/v1/flash/dci/details/exec-summary`, body),

  ];
  return requests;
    
  
};

export const getAllRequiredDetailsForReport = async (
  reportData: Report | undefined,userData: User | null
) => {
  try {

    if (!reportData || !userData) {
      return null;
    }
    const promises = fetchData(reportData, userData);

    const [toc, snippet, dashboard,execSummary] = await Promise.all(promises);
    // sending promises output to the tabsData object
    const tabsData = {toc:toc,snippet:snippet,dashboard:dashboard,execSummary:execSummary};
    return tabsData;
  } catch (error) {
    console.error(error);
    return null;
  }
};


