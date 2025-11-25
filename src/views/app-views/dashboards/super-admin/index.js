import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { message, Spin } from "antd";
import {
  fetchReports,
  fetchUserReports,
} from "store/slices/reportSlice";
import { DEFAULT_PAGE_SIZE } from "constants/PageConstants";
import usePaginationHook from "utils/hooks/usePaginationHandler";
import SuperAdminHeader from "views/app-views/components/dashboard/SuperAdminHeader";
import SuperAdminStats from "views/app-views/components/dashboard/SuperAdminStats";
import OrganizersTable from "views/app-views/components/dashboard/OrganizersTable";
import RevenueDistributionChart from "views/app-views/components/dashboard/RevenueDistributionChart";
import ActivityDistributionChart from "views/app-views/components/dashboard/ActivityDistributionChart";
import PlatformSummary from "views/app-views/components/dashboard/PlatformSummary";

const SuperAdminReport = () => {
  const dispatch = useDispatch();
  const reportRef = useRef(null);

  const { reportData, userReports } = useSelector((state) => state.report);
  const userReportsData = userReports?.data?.items || [];
  const selectedCountry = useSelector((state) => state.report.selectedCountry);
  const { pagination } = useSelector((state) => state.report.userReports);

  // State management
  const [activeTab, setActiveTab] = useState("events");
  const [timeFilter, setTimeFilter] = useState("last-3-months");
  const [customDateRange, setCustomDateRange] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    status: null,
  });

  const [apiLoading, setApiLoading] = useState({
    reports: false,
    userReports: false,
    exports: false,
  });

  const [hasAutoSelected, setHasAutoSelected] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const isLoading =
    apiLoading.reports || apiLoading.userReports || apiLoading.exports;

  const handlePagination = usePaginationHook(fetchUserReports);

  // Initialize selected country
  useEffect(() => {
    if (!hasAutoSelected) {
      setHasAutoSelected(true);
      setIsInitialized(true);
    }
  }, [hasAutoSelected]);

  // Fetch report statistics
  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setApiLoading((prev) => ({ ...prev, reports: true }));
        await dispatch(
          fetchReports({
            pageData: DEFAULT_PAGE_SIZE,
            contentType: activeTab,
            countryId: selectedCountry,
          })
        );
      } catch (err) {
        message.error("Failed to load report statistics");
      } finally {
        setApiLoading((prev) => ({ ...prev, reports: false }));
      }
    };
    if (isInitialized) {
      fetchReportData();
    }
  }, [dispatch, activeTab, selectedCountry, isInitialized]);

  // Fetch user reports
  useEffect(() => {
    const fetchUserReportData = async () => {
      try {
        setApiLoading((prev) => ({ ...prev, userReports: true }));

        const query = {
          search: filters.search,
          active: filters.status,
          size: DEFAULT_PAGE_SIZE.size,
          page: DEFAULT_PAGE_SIZE.page,
          ...(activeTab === "events" && { events: true }),
          ...(activeTab === "movies" && { movies: true }),
          country_id: selectedCountry,
        };

        await dispatch(fetchUserReports(query));
      } catch (err) {
        message.error("Failed to load organizer data");
      } finally {
        setApiLoading((prev) => ({ ...prev, userReports: false }));
      }
    };

    if (isInitialized && selectedCountry) {
      fetchUserReportData();
    }
  }, [dispatch, activeTab, filters, selectedCountry, isInitialized]);

  return (
    <div className="min-h-screen bg-gray-50 mr-2" ref={reportRef}>
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
          <Spin size="large" tip="Processing..." />
        </div>
      )}

      <div className="mx-auto flex max-w-7xl flex-col gap-8 py-8">
        <SuperAdminHeader
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          timeFilter={timeFilter}
          setTimeFilter={setTimeFilter}
          customDateRange={customDateRange}
          setCustomDateRange={setCustomDateRange}
          reportRef={reportRef}
          isLoading={isLoading}
          setApiLoading={setApiLoading}
        />

        <SuperAdminStats activeTab={activeTab} reportData={reportData} />

        <OrganizersTable
          activeTab={activeTab}
          userReportsData={userReportsData}
          pagination={pagination}
          handlePagination={handlePagination}
          isLoading={isLoading}
        />

        <div className="grid gap-8 lg:grid-cols-2">
          <RevenueDistributionChart
            activeTab={activeTab}
            userReportsData={userReportsData}
          />

          <ActivityDistributionChart
            activeTab={activeTab}
            userReportsData={userReportsData}
          />
        </div>

        <PlatformSummary activeTab={activeTab} reportData={reportData} />
      </div>
    </div>
  );
};

export default SuperAdminReport;
