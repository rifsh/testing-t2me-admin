import React, { useEffect, useRef, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import { Link } from "react-router-dom";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import { DatePicker, Select, Table, message, Spin, Card } from "antd";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { exportToExcel, exportToPdf } from "utils/exportUtils";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCountryList,
  fetchReports,
  fetchUserReports,
  setSelectedCountry,
} from "store/slices/reportSlice";
import usePaginationHook from "utils/hooks/usePaginationHandler";
import { DEFAULT_PAGE_SIZE } from "constants/PageConstants";

dayjs.extend(isBetween);
Chart.register(...registerables);

const { RangePicker } = DatePicker;
const { Option } = Select;

const SuperAdminReport = () => {
  const dispatch = useDispatch();
  const reportRef = useRef(null);
  const { reportData, userReports } = useSelector((state) => state.report);
  const userReportsData = userReports?.data?.[0]?.items || [];
  const { data } = useSelector((state) => state.report.countryList);

  // State management
  const [activeTab, setActiveTab] = useState("events");
  const [timeFilter, setTimeFilter] = useState("last-3-months");
  const [customDateRange, setCustomDateRange] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState(true);

  const [filters, setFilters] = useState({
    search: "",
    status: null,
  });

  const { pagination } = useSelector((state) => state.report);
  const handlePagination = usePaginationHook(fetchUserReports);

  const [apiLoading, setApiLoading] = useState({
    reports: false,
    userReports: false,
    exports: false,
  });

  const selectedCountry = useSelector((state) => state.report.selectedCountry);
  const [hasAutoSelected, setHasAutoSelected] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Combined loading state
  const isLoading =
    apiLoading.reports || apiLoading.userReports || apiLoading.exports;

  useEffect(() => {
    if (data?.[0]?.items?.length > 0 && !hasAutoSelected) {
      const firstCountryId = data[0].items[0].id;
      dispatch(setSelectedCountry(firstCountryId));
      localStorage.setItem("selectedCountry", JSON.stringify(firstCountryId));
      setHasAutoSelected(true);
      setIsInitialized(true);
    }
  }, [data, dispatch, hasAutoSelected]);

  useEffect(() => {
    dispatch(fetchCountryList({ active: activeFilter, search: searchTerm }));
  }, [dispatch, activeFilter, searchTerm]);

  useEffect(() => {
    const fetchReportData = async () => {
      if (!selectedCountry || !isInitialized) return;
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
    fetchReportData();
  }, [dispatch, activeTab, selectedCountry, isInitialized]);
  console.log(DEFAULT_PAGE_SIZE, "page");

  useEffect(() => {
    const fetchUserReportData = async () => {
      try {
        setApiLoading((prev) => ({ ...prev, reports: true }));

        const query = {
          search: filters.search,
          active: filters.status,
          page: pagination.page, // <-- include this
          size: pagination.size, // <-- and this
          ...(activeTab === "events" && { events: true }),
          ...(activeTab === "movies" && { movies: true }),
          country_id: selectedCountry,
        };

        await dispatch(fetchUserReports(query));
      } catch (err) {
        message.error("Failed to load organizer data");
      } finally {
        setApiLoading((prev) => ({ ...prev, reports: false }));
      }
    };
    fetchUserReportData();
  }, [dispatch, activeTab, filters, selectedCountry]);

  const handleExportPdf = async () => {
    try {
      setApiLoading((prev) => ({ ...prev, exports: true }));
      await exportToPdf(reportRef, "SuperAdmin-Report.pdf");
      message.success("PDF exported successfully");
    } catch (err) {
      message.error("Failed to export PDF");
    } finally {
      setApiLoading((prev) => ({ ...prev, exports: false }));
    }
  };

  const handleExportCsv = async () => {
    try {
      setApiLoading((prev) => ({ ...prev, exports: true }));
      await exportToExcel(reportRef, "SuperAdmin-Report.xlsx");
      message.success("Excel exported successfully");
    } catch (err) {
      message.error("Failed to export Excel");
    } finally {
      setApiLoading((prev) => ({ ...prev, exports: false }));
    }
  };
  const columns = [
    {
      title: "Organizer",
      dataIndex: "username",
      render: (text, record) => (
        <Link
          to={
            activeTab === "events"
              ? `${APP_PREFIX_PATH}/super-admin/organizer-details/${record.id}`
              : `${APP_PREFIX_PATH}/super-admin/movie-organizer-detail/${record.id}`
          }
          className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm"
        >
          {text}
        </Link>
      ),
      fixed: "left",
      width: 150,
    },
    {
      title: "Contact",
      dataIndex: "email",
      render: (email) => <span className="text-xs sm:text-sm">{email}</span>,
      width: 200,
    },
    {
      title: activeTab === "events" ? "Events" : "Movies",
      dataIndex: activeTab === "events" ? "event_count" : "movie_count",
      render: (count) => <span className="text-xs sm:text-sm">{count}</span>,
      width: 120,
    },
    {
      title: "Revenue",
      dataIndex: "revenue_by_country",
      render: (revenueByCountry, record) => {
        const primaryRevenue = revenueByCountry?.[0] || {};
        const totalRevenue = record.total_revenue || 0;

        return (
          <div className="flex flex-col">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="font-semibold text-green-600 text-xs sm:text-sm">
                  {totalRevenue.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
                {primaryRevenue.currency_code && (
                  <span className="ml-1 sm:ml-2 text-xs bg-gray-100 px-1 sm:px-2 py-0.5 rounded text-gray-600">
                    {primaryRevenue.currency_code}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      },
      width: 150,
    },
  ];

  const organizerPerformanceData = {
    labels: userReportsData.map((org) => org.username),
    datasets: [
      {
        label: `${activeTab === "events" ? "Event" : "Movie"} Revenue`,
        data: userReportsData.map((org) => org.total_revenue || 0),
        backgroundColor: "rgba(79, 70, 229, 0.6)",
        borderColor: "rgba(79, 70, 229, 1)",
        borderWidth: 2,
      },
    ],
  };

  const chartData = {
    labels: userReportsData.map((user) => user?.username),
    datasets: [
      {
        label: "Events per User",
        data: userReportsData.map(
          (user) => user.event_count || user.movie_count
        ),
        backgroundColor: [
          "#4f46e5",
          "#10b981",
          "#f59e0b",
          "#ef4444",
          "#8b5cf6",
          "#ec4899",
          "#14b8a6",
          "#f97316",
          "#64748b",
          "#84cc16",
        ],
        borderColor: "rgba(255, 255, 255, 0.8)",
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4" ref={reportRef}>
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
          <Spin size="large" tip="Processing..." />
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center mb-4">
        {/* Tabs */}
        <div className="flex gap-2 w-full sm:w-auto">
          {["events", "movies"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              disabled={isLoading}
              className={`flex-1 sm:flex-none px-3 py-2 text-xs sm:text-sm rounded-lg transition-colors ${
                activeTab === tab
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Filters and Export */}
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center w-full sm:w-auto">
          <div className="flex flex-col sm:flex-row gap-2 flex-1">
            <Select
              showSearch
              placeholder="Country"
              className="w-full sm:w-40 text-xs sm:text-sm"
              value={selectedCountry}
              onChange={(value) => {
                dispatch(setSelectedCountry(value));
                localStorage.setItem("selectedCountry", JSON.stringify(value));
              }}
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
              disabled={isLoading}
            >
              {data?.[0]?.items?.map((country) => (
                <Option
                  key={country.id}
                  value={country.id}
                  className="text-xs sm:text-sm"
                >
                  {country.name}
                </Option>
              ))}
            </Select>

            <Select
              value={timeFilter}
              className="w-full sm:w-40 text-xs sm:text-sm"
              onChange={(value) => {
                setTimeFilter(value);
                // setPagination((prev) => ({ ...prev, current: 1 }));
                if (value !== "custom") setCustomDateRange([]);
              }}
              disabled={isLoading}
            >
              <Option value="last-month">Last Month</Option>
              <Option value="last-3-months">Last 3 Months</Option>
              <Option value="last-year">Last Year</Option>
              <Option value="custom">Custom Range</Option>
            </Select>

            {timeFilter === "custom" && (
              <RangePicker
                className="w-full sm:w-48 text-xs sm:text-sm"
                value={customDateRange}
                onChange={(dates) => {
                  if (
                    dates?.[0] &&
                    dates?.[1] &&
                    dates[1].diff(dates[0], "month") > 3
                  ) {
                    message.error("Maximum date range allowed is 3 months");
                    return;
                  }
                  setCustomDateRange(dates);
                  // setPagination((prev) => ({ ...prev, current: 1 }));
                }}
                disabled={isLoading}
              />
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleExportPdf}
              disabled={isLoading}
              className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 text-xs sm:text-sm rounded-lg flex items-center justify-center gap-1 disabled:opacity-50"
            >
              <span className="hidden sm:inline">Export</span> PDF
            </button>
            <button
              onClick={handleExportCsv}
              disabled={isLoading}
              className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white px-3 py-2 text-xs sm:text-sm rounded-lg flex items-center justify-center gap-1 disabled:opacity-50"
            >
              <span className="hidden sm:inline">Export</span> Excel
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {[
          {
            title:
              activeTab === "events" ? "Event Organizers" : "Movie Organizers",
            value:
              activeTab === "events"
                ? reportData?.total_users_in_events
                : reportData?.total_users_in_theatres,
            icon: "👥",
            color: "blue",
          },
          {
            title: `Active ${
              activeTab === "events" ? "Event" : "Movie"
            } Organizers`,
            value:
              activeTab === "events"
                ? reportData?.active_users_in_events
                : reportData?.active_users_in_theatres,
            icon: "✅",
            color: "green",
          },
          {
            title: activeTab === "events" ? "Total Events" : "Total Movies",
            value:
              activeTab === "events"
                ? reportData?.total_events
                : reportData?.total_movies,
            icon: "📅",
            color: "purple",
          },
          {
            title: `${activeTab === "events" ? "Events" : "Movies"} Revenue`,
            value:
              activeTab === "events"
                ? reportData?.total_event_revenue
                : reportData?.total_movie_revenue || 0,
            icon: "💰",
            color: "yellow",
          },
        ].map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-xs border border-gray-100 p-3"
          >
            <div className="flex items-center gap-3">
              <div className={`bg-${stat.color}-50 p-2 rounded-full`}>
                <span className="text-xl">{stat.icon}</span>
              </div>
              <div>
                <h3 className="text-xs font-medium text-gray-500 mb-1">
                  {stat.title}
                </h3>
                <p className="text-lg font-semibold text-gray-900">
                  {typeof stat.value === "number"
                    ? stat.value.toLocaleString()
                    : stat.value || "N/A"}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Organizers Table */}
      <div className="bg-white rounded-lg shadow-xs border border-gray-100 mb-4 overflow-x-auto">
        <Table
          columns={columns}
          dataSource={userReportsData}
          rowKey="id"
          pagination={{
            current: pagination.page,
            pageSize: pagination.size,
            total: pagination.total,
            onChange: (page, pageSize) =>
              handlePagination(page, pageSize,"", activeTab),
          }}
          scroll={{ x: 800, y: 400 }}
          size="small"
          className="force-visible-columns"
          style={{ minWidth: "800px" }}
        />
        <style>{`
          @media (max-width: 768px) {
            .force-visible-columns .ant-table-cell {
              white-space: nowrap;
              padding: 8px 12px !important;
            }
            .force-visible-columns .ant-table-thead .ant-table-cell {
              font-size: 12px;
            }
          }
        `}</style>
      </div>
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <Card
          title="Revenue Distribution"
          className="!p-3 shadow-xs border border-gray-100"
          headStyle={{ padding: "0.75rem", fontSize: "0.875rem" }}
        >
          <div className="h-48 sm:h-56 md:h-64">
            <Bar
              data={organizerPerformanceData}
              options={{
                maintainAspectRatio: false,
                responsive: true,
                plugins: {
                  legend: { display: false },
                  tooltip: { bodyFont: { size: 14 } },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: { font: { size: 12 } },
                  },
                  x: {
                    ticks: { font: { size: 12 } },
                  },
                },
              }}
            />
          </div>
        </Card>

        <Card
          title="Activity Distribution"
          className="!p-3 shadow-xs border border-gray-100"
          headStyle={{ padding: "0.75rem", fontSize: "0.875rem" }}
        >
          <div className="h-48 sm:h-56 md:h-64">
            <Bar
              data={chartData}
              options={{
                maintainAspectRatio: false,
                responsive: true,
                plugins: {
                  legend: { display: false },
                  tooltip: { bodyFont: { size: 14 } },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: { font: { size: 12 } },
                  },
                  x: {
                    ticks: {
                      font: { size: 12 },
                      callback: (value) =>
                        userReportsData[value]?.username?.substring(0, 6) +
                        "...",
                    },
                  },
                },
              }}
            />
          </div>
        </Card>
      </div>

      {/* Summary Section */}
      <Card
        title="Platform Summary"
        className="!p-3 shadow-xs border border-gray-100 mb-4"
        headStyle={{ padding: "0.75rem", fontSize: "0.875rem" }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="p-3 bg-gray-50 rounded-lg">
            <h4 className="text-xs font-medium text-gray-500 mb-1">
              Total {activeTab === "events" ? "Events" : "Movies"}
            </h4>
            <p className="text-lg font-semibold">
              {activeTab === "events"
                ? reportData?.total_events?.toLocaleString()
                : reportData?.total_movies?.toLocaleString()}
            </p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <h4 className="text-xs font-medium text-gray-500 mb-1">
              {activeTab === "events" ? "Active Organizers" : "Active Theaters"}
            </h4>
            <p className="text-lg font-semibold">
              {activeTab === "events"
                ? reportData?.active_users_in_events?.toLocaleString()
                : reportData?.active_users_in_theatres?.toLocaleString()}
            </p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <h4 className="text-xs font-medium text-gray-500 mb-1">
              Total Revenue ({activeTab === "events" ? "Events" : "Movies"})
            </h4>
            <p className="text-lg font-semibold text-green-600">
              {activeTab === "events"
                ? reportData?.total_event_revenue?.toLocaleString()
                : reportData?.total_movie_revenue?.toLocaleString()}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SuperAdminReport;
