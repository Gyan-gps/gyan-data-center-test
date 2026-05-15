import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import {
    getReportExtendedSnippetBySlug,
    getReportBySlug,
} from '@/network/datacenter/datacenter.api';
import { useAuth } from "@/hooks";

import Snippet from '@/components/Reports/ExtendedSnippet';
import { ReportDetails } from '@/components/Reports/ReportDetails';
import Contents from './Contents';
import ExecSummary from './ExecSummary/ExecSummary';
import ReportDetailsTab from './Report';
import DatasheetDetailsTab from './DataSheet';
import AllGraphsDashboard from './Dashboard';
import AnswerEngine from './AnswerEngine/AnswerEngine';
import { getAllRequiredDetailsForReport } from './fetchData';
import { Loading } from '@/components';
const ReportTabs: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = React.useState("snippet");
    const [selectedSlide, setSelectedSlide] = React.useState<number | null>(null);
    const { user } = useAuth();
    const [tabsLoading, setTabsLoading] = React.useState(true);
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
    const createTabs = async () => {
        const isUserAllowed =
            report?.subscribed === "yes" &&
            report?.subscriptionStatus === "Approved" &&
            report?.report_expiry &&
            new Date(report?.report_expiry) > new Date();
        const tabs: { key: string; label: string }[] = [];
        const tabContent: Record<string, React.ReactNode> = {};
        //  Always show snippet (if exists)
        if (reportSnippet) {
            tabs.push({ key: "snippet", label: "Snippet" });
            tabContent["snippet"] = <Snippet snippetData={reportSnippet} />;
        }




        //  If user not allowed → STOP here
        if (!isUserAllowed) {
            return { tabs, tabContent };
        }
        const tabsToShow = await getAllRequiredDetailsForReport(report, user);


        // 2. CONTENT (TOC)
        if (tabsToShow && tabsToShow.toc.data?.isDataAvailable) {
            tabs.push({ key: "content", label: "Content" });
            tabContent["content"] = <Contents
                data={tabsToShow.toc.data.data.TOC || []}
                setSelectedSlide={setSelectedSlide}
                setCurrentTab={setActiveTab}
            />;
        }

        // 3. DASHBOARD
        if (tabsToShow && tabsToShow.dashboard?.data.isDataAvailable) {
            tabs.push({ key: "dashboard", label: "Dashboard" });
            tabContent["dashboard"] = (
                <AllGraphsDashboard
                    data={tabsToShow.dashboard.data.data}
                    orderOfTags={tabsToShow.dashboard.data.orderOfTags}
                    setSelectedSlide={setSelectedSlide}
                    setCurrentTab={setActiveTab}
                />
            );
        }

        // 4. EXEC SUMMARY
        if (tabsToShow && tabsToShow.execSummary?.data?.isDataAvailable) {
            tabs.push({ key: "executive-summary", label: "Executive Summary" });
            tabContent["executive-summary"] = (
                <ExecSummary
                    data={tabsToShow.execSummary.data.data.exec_summary}
                    snippetData={tabsToShow.snippet.data.data.snippets}
                />
            );
        }

        // 5. REPORT DETAILS
        if (report?.custom?.report_pdfs) {
            tabs.push({ key: "report", label: "Report" });
            tabContent["report"] = (
                <ReportDetailsTab
                    key={selectedSlide}
                    title={report?.title}
                    reportPdf={report?.custom?.report_pdfs || []}
                    reportPpt={report?.ppt_url || []}
                    selectedSlide={selectedSlide}
                />
            );
        }

        // 6. DATA SHEET
        if (report?.custom?.report_excel) {
            tabs.push({ key: "data-sheet", label: "Data Sheet" });
            tabContent["data-sheet"] = (
                <DatasheetDetailsTab
                    reportExcel={report?.custom?.report_excel}

                />
            );
        }

        tabs.push({ key: "synapse-ai", label: "DCX AI" });
        tabContent["synapse-ai"] = (
            <AnswerEngine
                id={report?.id}
                title={report?.title}
                uploadId={report?.uploadId}
                from={"flash"}
            />
        );




        return { tabs, tabContent };
    };

    const [tabs, setTabs] = React.useState<{ key: string; label: string }[]>([]);
    const [tabContent, setTabContent] = React.useState<Record<string, React.ReactNode>>({});

    useEffect(() => {
        if (!report || !user) return;

        const fetchTabs = async () => {
            setTabsLoading(true); // start loading

            const result = await createTabs();
            if (!result) return;

            setTabs(result.tabs);
            setTabContent(result.tabContent);

            setTabsLoading(false);
        };

        fetchTabs();
    }, [report, user, reportSnippet,selectedSlide]);

    useEffect(() => {
        if (tabs.length && !tabs.find(t => t.key === activeTab)) {
            setActiveTab(tabs[0].key);
        }
    }, [tabs]);


    if (isLoading)
        return (
            <div className="flex justify-center items-center py-20 text-gray-600 text-sm sm:text-base">
                <Loading text="Loading Report Details..." />
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
        <div className="w-full">
            <div className="w-full sm:px-4 sm:pt-4 sm:pb-0 px-2 pt-2 pb-0">
                <ReportDetails
                    report={report}
                    loading={isLoading}
                    error={error?.message}
                />
            </div>
            <div className="w-full px-3 pt-0 pb-2 sm:px-6 sm:pt-0 sm:pb-4 md:px-10">
                {/* Tabs */}
                <div className="mb-6 w-full">
                    <div className="w-full bg-white backdrop-blur-md p-2 shadow-inner">

                        <div className="flex justify-center">
                            <div className="flex gap-2 overflow-x-auto no-scrollbar">

                                {tabs.map((tab) => (
                                    <button
                                        key={tab.key}
                                        onClick={() => setActiveTab(tab.key)}
                                        className={`relative whitespace-nowrap px-5 py-2.5 text-sm rounded-xl transition-all duration-300
  ${tab.key === "synapse-ai"
                                                ? "bg-[#ffedc7] text-[#a94d19] shadow-md rounded-lg border-none"
                                                : activeTab === tab.key
                                                    ? "text-blue-500 underline underline-offset-4 decoration-2"
                                                    : "text-gray-500 hover:text-gray-800 hover:bg-white/60"
                                            }`}
                                    >
                                        {tab.label}


                                    </button>
                                ))}

                            </div>
                        </div>

                    </div>
                </div>

                {/* Tab Contents*/}

                <div>
                    {tabsLoading || tabs.length === 0 ? (
                        <div className="flex justify-center items-center py-20 text-gray-500">
                            <Loading text="Loading Content..." />
                        </div>
                    ) : (
                        tabContent[activeTab]
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReportTabs;
