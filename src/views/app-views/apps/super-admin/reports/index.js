import React, { useEffect, useRef, useState } from "react";
import { Bar, Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import { Link } from "react-router-dom";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import { DatePicker, Select, Table, message, Spin, Card } from "antd";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { exportToExcel, exportToPdf } from "utils/exportUtils";
import { useDispatch, useSelector } from "react-redux";
import { fetchReports, fetchUserReports } from "store/slices/reportSlice";

dayjs.extend(isBetween);
Chart.register(...registerables);

const { RangePicker } = DatePicker;
const { Option } = Select;

const SuperAdminReport = () => {
  const dispatch = useDispatch();
  const reportRef = useRef(null);
  const { reportData, userReports } = useSelector((state) => state.report);
  const userReportsData = userReports?.data?.[0]?.items || [];

  // State management
  const [activeTab, setActiveTab] = useState("events");
  const [timeFilter, setTimeFilter] = useState("last-3-months");
  const [customDateRange, setCustomDateRange] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    status: null,
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [apiLoading, setApiLoading] = useState({
    reports: false,
    userReports: false,
    exports: false,
  });

  // Fetch reports data with loader
  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setApiLoading((prev) => ({ ...prev, reports: true }));
        await dispatch(
          fetchReports({
            pageData: { page: 1, size: 10 },
            contentType: activeTab,
          })
        );
      } catch (err) {
        console.error("Failed to fetch reports:", err);
        message.error("Failed to load report statistics");
      } finally {
        setApiLoading((prev) => ({ ...prev, reports: false }));
      }
    };

    fetchReportData();
  }, [dispatch, activeTab]);

  // Fetch user reports with loader
  useEffect(() => {
    const fetchUserReportData = async () => {
      try {
        setApiLoading((prev) => ({ ...prev, userReports: true }));
        const query = {
          search: filters.search,
          active: filters.status,
          page: pagination.current,
          size: pagination.pageSize,
          ...(activeTab === "events" && { events: true }),
          ...(activeTab === "movies" && { movies: true }),
        };

        const response = await dispatch(fetchUserReports(query));

        if (response.payload?.data?.[0]?.pagination?.total) {
          setPagination((prev) => ({
            ...prev,
            total: response.payload.data[0].pagination.total,
          }));
        }
      } catch (err) {
        console.error("Failed to fetch user reports:", err);
        message.error("Failed to load organizer data");
      } finally {
        setApiLoading((prev) => ({ ...prev, userReports: false }));
      }
    };

    fetchUserReportData();
  }, [dispatch, activeTab, pagination.current, pagination.pageSize, filters]);

  // Export handlers with loaders
  const handleExportPdf = async () => {
    try {
      setApiLoading((prev) => ({ ...prev, exports: true }));
      await exportToPdf(reportRef, "SuperAdmin-Report.pdf");
      message.success("PDF exported successfully");
    } catch (err) {
      console.error("PDF export failed:", err);
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
      console.error("Excel export failed:", err);
      message.error("Failed to export Excel");
    } finally {
      setApiLoading((prev) => ({ ...prev, exports: false }));
    }
  };

  // Table columns
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
          className="text-blue-600 hover:text-blue-800"
        >
          {text}
        </Link>
      ),
    },
    {
      title: "Contact",
      dataIndex: "email",
    },
    {
      title: activeTab === "events" ? "Events" : "Movies",
      dataIndex: activeTab === "events" ? "event_count" : "movie_count",
    },
    // {
    //   title: "Attendees",
    //   dataIndex: "total_attendees",
    //   render: (value) => value?.toLocaleString() || "0",
    // },
    {
      title: "Revenue",
      dataIndex: "total_revenue",
      render: (value) => `${value?.toLocaleString() || "0"}`,
      className: "text-green-600 font-semibold",
    },
  ];
  // Chart data
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

  // Timeline data
  const timelineData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: `${activeTab === "events" ? "Events" : "Movies"} Over Time`,
        data: Array.from({ length: 6 }, () => Math.floor(Math.random() * 100)),
        borderColor: "#4f46e5",
        backgroundColor: "rgba(79, 70, 229, 0.1)",
        tension: 0.4,
      },
    ],
  };

  // StatCard component
  const StatCard = ({ title, value, icon, color, prefix = "" }) => {
    const colorClasses = {
      blue: "bg-blue-100 text-blue-600",
      green: "bg-green-100 text-green-600",
      purple: "bg-purple-100 text-purple-600",
      yellow: "bg-yellow-100 text-yellow-600",
    };

    return (
      <Card className="h-full">
        <div className="flex items-center gap-4">
          <div className={`${colorClasses[color]} p-3 rounded-full`}>
            {icon}
          </div>
          <div>
            <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
            <p className="text-2xl font-bold">
              {prefix}
              {typeof value === "number"
                ? value.toLocaleString()
                : value || "0"}
            </p>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6" ref={reportRef}>
      {/* Global loading overlay */}
      {(apiLoading.reports || apiLoading.userReports || apiLoading.exports) && (
        <div className="flex items-center justify-center z-50">
          <Spin size="large" tip="Processing..." />
        </div>
      )}

      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-blue-600">Reports Dashboard</h2>
        <div className="flex items-center gap-4">
          <Select
            value={timeFilter}
            onChange={(value) => {
              setTimeFilter(value);
              setPagination((prev) => ({ ...prev, current: 1 }));
              if (value !== "custom") setCustomDateRange([]);
            }}
            style={{ width: 180 }}
            disabled={apiLoading.userReports}
          >
            <Option value="last-month">Last Month</Option>
            <Option value="last-3-months">Last 3 Months</Option>
            <Option value="last-year">Last Year</Option>
            <Option value="custom">Custom Range</Option>
          </Select>

          {timeFilter === "custom" && (
            <RangePicker
              value={customDateRange}
              onChange={(dates) => {
                if (dates && dates[0] && dates[1]) {
                  const monthDiff = dates[1].diff(dates[0], "month");
                  if (monthDiff > 3) {
                    message.error("Maximum date range allowed is 3 months");
                    return;
                  }
                }
                setCustomDateRange(dates);
                setPagination((prev) => ({ ...prev, current: 1 }));
              }}
              disabled={apiLoading.userReports}
            />
          )}

          <button
            onClick={handleExportPdf}
            disabled={apiLoading.exports}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
          >
            {apiLoading.exports ? <Spin size="small" /> : <>Export PDF</>}
          </button>
          <button
            onClick={handleExportCsv}
            disabled={apiLoading.exports}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
          >
            {apiLoading.exports ? <Spin size="small" /> : <>Export Excel</>}
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-4 mb-6">
        {["events", "movies"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            disabled={apiLoading.userReports}
            className={`px-4 py-2 rounded-lg text-capitalize ${
              activeTab === tab
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            } ${apiLoading.userReports ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Statistics Cards */}
      <Spin spinning={apiLoading.reports} tip="Loading statistics...">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <div className="bg-blue-50 p-3 rounded-full inline-flex items-center justify-center mb-3">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                ></path>
              </svg>
            </div>
            <h3 className="text-gray-500 text-sm font-medium mb-1">
              {activeTab === "events"
                ? "Event Organizers"
                : activeTab === "movies"
                ? "Movie Organizers"
                : "Total Organizers"}
            </h3>
            <p className="text-2xl font-bold text-gray-900">
              {activeTab === "events"
                ? reportData?.total_users_in_events
                : activeTab === "movies"
                ? reportData?.total_users_in_theatres
                : null}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <div className="bg-green-50 p-3 rounded-full inline-flex items-center justify-center mb-3">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </div>
            <h3 className="text-gray-500 text-sm font-medium mb-1">
              Active{" "}
              {activeTab === "events"
                ? "Event Organizers"
                : activeTab === "movies"
                ? "Movie Organizers"
                : "Organizers"}
            </h3>
            <p className="text-2xl font-bold text-gray-900">
              {activeTab === "events"
                ? reportData?.active_users_in_events
                : activeTab === "movies"
                ? reportData?.active_users_in_theatres
                : null}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <div className="bg-purple-50 p-3 rounded-full inline-flex items-center justify-center mb-3">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                ></path>
              </svg>
            </div>
            <h3 className="text-gray-500 text-sm font-medium mb-1">
              {activeTab === "events"
                ? "Total Events"
                : activeTab === "movies"
                ? "Total Movies"
                : "Total Items"}
            </h3>
            <p className="text-2xl font-bold text-gray-900">
              {activeTab === "events"
                ? reportData?.total_events
                : activeTab === "movies"
                ? reportData?.total_movies
                : null}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <div className="bg-yellow-50 p-3 rounded-full inline-flex items-center justify-center mb-3">
              <svg
                className="w-6 h-6 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </div>
            <h3 className="text-gray-500 text-sm font-medium mb-1">
              Total Revenue
            </h3>
            <p className="text-2xl font-bold text-gray-900">
              {activeTab === "events"
                ? reportData?.total_event_revenue
                : activeTab === "movies"
                ? reportData?.total_movie_revenue || 0
                : null}
            </p>
          </div>
        </div>
      </Spin>

      {/* Organizers Table */}
      <Spin spinning={apiLoading.userReports} tip="Loading organizer data...">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8 overflow-hidden">
          <Table
            columns={columns}
            dataSource={userReportsData}
            rowKey="id"
            loading={apiLoading.userReports}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "50", "100"],
              onChange: (page, pageSize) =>
                setPagination({
                  current: page,
                  pageSize,
                  total: pagination.total,
                }),
            }}
          />
        </div>
      </Spin>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Spin spinning={apiLoading.userReports} tip="Loading chart data...">
          <Card title="Revenue Distribution" className="h-full">
            <div className="h-64">
              <Bar
                data={organizerPerformanceData}
                options={{
                  maintainAspectRatio: false,
                  scales: { y: { beginAtZero: true } },
                }}
              />
            </div>
          </Card>
        </Spin>

        <Spin spinning={apiLoading.reports} tip="Loading timeline data...">
          <Card
            title={`${activeTab === "events" ? "Events" : "Movies"} Timeline`}
            className="h-full"
          >
            <div className="h-64">
              <Line
                data={timelineData}
                options={{
                  maintainAspectRatio: false,
                  scales: { y: { beginAtZero: true } },
                }}
              />
            </div>
          </Card>
        </Spin>
      </div>

      {/* Summary Section */}
      <Spin spinning={apiLoading.reports} tip="Loading summary...">
        <Card title="Platform Summary" className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h3 className="text-lg font-medium mb-4">Platform Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {activeTab === "events" && (
                <>
                  <div className="border-r border-gray-200 pr-6">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">
                      Total Events
                    </h4>
                    <p className="text-2xl font-bold">
                      {reportData?.total_events}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {reportData?.active_users_in_events} organizers
                    </p>
                  </div>
                  {/* <div className="border-r border-gray-200 pr-6">
                <h4 className="text-sm font-medium text-gray-500 mb-2">
                  Total Attendance
                </h4>
                <p className="text-2xl font-bold text-blue-600">
                </p>
              </div> */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">
                      Event Revenue
                    </h4>
                    <p className="text-2xl font-bold text-green-600">
                      {reportData?.total_event_revenue}
                    </p>
                  </div>
                </>
              )}

              {activeTab === "movies" && (
                <>
                  <div className="border-r border-gray-200 pr-6">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">
                      Total Movies
                    </h4>
                    <p className="text-2xl font-bold">
                      {reportData?.total_movies}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {reportData?.total_users_in_movies} organizers
                    </p>
                  </div>
                  {/* <div className="border-r border-gray-200 pr-6">
                <h4 className="text-sm font-medium text-gray-500 mb-2">
                  Total Attendance
                </h4>
                <p className="text-2xl font-bold text-blue-600">{0}</p>
              </div> */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">
                      Movie Revenue
                    </h4>
                    <p className="text-2xl font-bold text-green-600">
                      ${reportData?.total_event_revenue}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </Card>
      </Spin>
    </div>
  );
};

export default SuperAdminReport;
