import React, { useState, useRef, useEffect, useMemo } from "react";
import { Bar, Pie } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import "jspdf-autotable";
import { Link } from "react-router-dom";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import { Table, Select, DatePicker, message } from "antd";
import { organizerEvents, organizerMovies } from "mock/data/reportData";
import { exportToPdf, exportToExcel } from "utils/exportUtils";
import dayjs from "dayjs";

Chart.register(...registerables);

const { Option } = Select;
const { RangePicker } = DatePicker;

const OrganizerReport = () => {
  const [activeSegment, setActiveSegment] = useState("events");
  const [timeFilter, setTimeFilter] = useState("option");
  const [customDateRange, setCustomDateRange] = useState([]);
  const reportRef = useRef(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
  });

  const baseItems = useMemo(() => {
    return activeSegment === "events" ? organizerEvents : organizerMovies;
  }, [activeSegment, organizerEvents, organizerMovies]);

  const filteredItems = useMemo(() => {
    const now = dayjs();
    let startDate, endDate;

    switch (timeFilter) {
      case "last-month":
        startDate = now.subtract(1, "month");
        break;
      case "last-3-months":
        startDate = now.subtract(3, "month");
        break;
      case "last-year":
        startDate = now.subtract(1, "year");
        break;
      case "custom":
        if (customDateRange.length === 2) {
          startDate = customDateRange[0];
          endDate = customDateRange[1];
        }
        break;
      default:
        return baseItems;
    }

    return baseItems.filter((item) => {
      const dateField =
        activeSegment === "events" ? item.startDate : item.releaseDate;
      const itemDate = dayjs(dateField);

      if (timeFilter === "custom") {
        return itemDate.isAfter(startDate) && itemDate.isBefore(endDate);
      }
      return itemDate.isAfter(startDate);
    });
  }, [baseItems, timeFilter, customDateRange, activeSegment]);

  // Add custom date range validation
  const disabledCustomDate = (current) => {
    if (!customDateRange[0]) return false;
    const tooLate =
      customDateRange[0] && current.diff(customDateRange[0], "month") >= 3;
    const tooEarly =
      customDateRange[1] && customDateRange[1].diff(current, "month") >= 3;
    return !!tooEarly || !!tooLate;
  };

  const handleTimeFilterChange = (value) => {
    setTimeFilter(value);
    setCustomDateRange([]);
  };

  // date range handler with validation
  const handleDateRangeChange = (dates) => {
    if (dates && dates[0] && dates[1]) {
      const monthDiff = dates[1].diff(dates[0], "month");
      if (monthDiff > 3) {
        message.error("Maximum date range allowed is 3 months");
        return;
      }
    }
    setCustomDateRange(dates);
    if (dates && dates.length === 2) {
      setTimeFilter("custom");
    }
  };

  // Calculate paginated data
  const paginatedItems = useMemo(() => {
    const startIndex = (pagination.current - 1) * pagination.pageSize;
    return filteredItems.slice(startIndex, startIndex + pagination.pageSize);
  }, [filteredItems, pagination.current, pagination.pageSize]);

  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      current: 1,
      total: filteredItems.length,
    }));
  }, [filteredItems]);

  // Handle pagination change
  const handlePagination = (page, pageSize) => {
    setPagination({
      current: page,
      pageSize: pageSize,
      total: filteredItems.length,
    });
  };

  // Statistics calculations based on filtered items
  const totalStats = {
    totalItems: filteredItems.length,
    totalRevenue: filteredItems.reduce((sum, item) => sum + item.revenue, 0),
    upcoming: filteredItems.filter((i) => i.status === "Upcoming").length,
    completed: filteredItems.filter((i) => i.status === "Completed").length,
    released: filteredItems.filter((i) => i.status === "Released").length,
    cancelled: filteredItems.filter((i) => i.status === "Cancelled").length,
    totalAttendees: filteredItems.reduce(
      (sum, item) => (item.type === "event" ? sum + item.attendees : sum),
      0
    ),
    totalTickets: filteredItems.reduce(
      (sum, item) => (item.type === "movie" ? sum + item.ticketsSold : sum),
      0
    ),
  };

  // Enhanced formatting functions
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  // Enhanced chart configurations based on filtered items
  const statusChartData = {
    labels: ["Upcoming", "Completed", "Released", "Cancelled"],
    datasets: [
      {
        data: [
          totalStats.upcoming,
          totalStats.completed,
          totalStats.released,
          totalStats.cancelled,
        ],
        backgroundColor: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"],
        borderWidth: 0,
      },
    ],
  };

  const revenueChartData = {
    labels: filteredItems.map((i) => i.title),
    datasets: [
      {
        label: "Revenue",
        data: filteredItems.map((i) => i.revenue),
        backgroundColor: filteredItems.map((i) =>
          i.type === "event" ? "#3b82f6" : "#10b981"
        ),
        borderRadius: 4,
      },
    ],
  };

  // Enhanced status badges
  const getStatusBadge = (status) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case "Upcoming":
        return (
          <span className={`${baseClasses} bg-blue-100 text-blue-800`}>
            {status}
          </span>
        );
      case "Completed":
        return (
          <span className={`${baseClasses} bg-green-100 text-green-800`}>
            {status}
          </span>
        );
      case "Released":
        return (
          <span className={`${baseClasses} bg-orange-100 text-orange-800`}>
            {status}
          </span>
        );
      default:
        return (
          <span className={`${baseClasses} bg-red-100 text-red-800`}>
            {status}
          </span>
        );
    }
  };

  const handleExportPDF = async () => {
    exportToPdf(reportRef, "MyReport.pdf");
  };

  const handleExportCSV = () => {
    exportToExcel(reportRef, "MyReport.xlsx");
  };

  // Table columns configuration
  const tableColumns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (text, record) => (
        <Link
          to={
            record.type === "event"
              ? `${APP_PREFIX_PATH}/organizer/reports/event-details/${record.id}`
              : `${APP_PREFIX_PATH}/organizer/reports/movie-details/${record.id}`
          }
          className="flex items-center gap-4 hover:text-blue-600 transition-colors"
        >
          <img
            src={record.image}
            alt={record.title}
            className="w-12 h-12 rounded-lg object-cover border border-gray-200"
          />
          {record.title}
        </Link>
      ),
    },
    ...(activeSegment === "all"
      ? [
          {
            title: "Type",
            dataIndex: "type",
            key: "type",
            render: (type) => (
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  type === "event"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {type}
              </span>
            ),
          },
        ]
      : []),
    {
      title: "Dates",
      dataIndex: "dates",
      key: "dates",
      render: (_, record) =>
        record.type === "event"
          ? `${formatDate(record.startDate)} - ${formatDate(record.endDate)}`
          : formatDate(record.releaseDate),
    },
    {
      title: "Metrics",
      dataIndex: "metrics",
      key: "metrics",
      render: (_, record) => (
        <div className="flex items-center gap-4">
          <div className="w-24 bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                record.type === "event" ? "bg-blue-500" : "bg-green-500"
              }`}
              style={{
                width: `${Math.round(
                  record.type === "event"
                    ? (record.attendees / record.capacity) * 100
                    : (record.ticketsSold / record.totalSeats) * 100
                )}%`,
              }}
            />
          </div>
          <span className="text-sm text-gray-600">
            {record.type === "event"
              ? `${record.attendees}/${record.capacity}`
              : `${Math.round(
                  (record.ticketsSold / record.totalSeats) * 100
                )}%`}
          </span>
        </div>
      ),
    },
    {
      title: "Revenue",
      dataIndex: "revenue",
      key: "revenue",
      render: (revenue) => (
        <span className="font-semibold text-blue-600">
          {formatCurrency(revenue)}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => getStatusBadge(status),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-6" ref={reportRef}>
      {/* Enhanced Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Organizer Report</h2>
          <p className="text-gray-500 text-sm mt-1">
            Comprehensive overview of all {activeSegment} activities
            <span className="ml-2">
              (
              {timeFilter === "custom" && customDateRange.length === 2
                ? `Custom range: ${formatDate(
                    customDateRange[0]
                  )} to ${formatDate(customDateRange[1])}`
                : timeFilter === "last-month"
                ? "Last month"
                : timeFilter === "last-3-months"
                ? "Last 3 months"
                : timeFilter === "last-year"
                ? "Last year"
                : ""}
              )
            </span>
          </p>
        </div>

        {/* Enhanced Controls */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            {["events", "movies"].map((segment) => (
              <button
                key={segment}
                onClick={() => {
                  setActiveSegment(segment);
                  setPagination((prev) => ({ ...prev, current: 1 }));
                }}
                className={`px-4 py-2 rounded-md text-sm capitalize transition-colors ${
                  activeSegment === segment
                    ? "bg-white text-blue-600 shadow-sm"
                    : "hover:bg-gray-50 text-gray-600"
                }`}
              >
                {segment}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <Select
              defaultValue="last-month"
              style={{ width: 150 }}
              onChange={handleTimeFilterChange}
              value={timeFilter}
            >
              <Option value="last-month">Last Month</Option>
              <Option value="last-3-months">Last 3 Months</Option>
              <Option value="last-year">Last Year</Option>
              <Option value="custom">Custom Range</Option>
            </Select>

            {timeFilter === "custom" && (
              <RangePicker
                value={customDateRange}
                onChange={handleDateRangeChange}
                style={{ width: 250 }}
                disabledDate={disabledCustomDate}
                onCalendarChange={(dates) => dates && setCustomDateRange(dates)}
              />
            )}

            <button
              onClick={handleExportPDF}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Export PDF
            </button>
            <button
              onClick={handleExportCSV}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Items Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-gray-500 text-sm mb-1">Total Items</h3>
              <p className="text-2xl font-bold text-gray-900">
                {totalStats.totalItems}
              </p>
              <p className="text-xs text-gray-400">Currently managing</p>
            </div>
          </div>
        </div>

        {/* Total Revenue Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-50 rounded-lg">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-gray-500 text-sm mb-1">Total Revenue</h3>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(totalStats.totalRevenue)}
              </p>
              <p className="text-xs text-gray-400">All items combined</p>
            </div>
          </div>
        </div>

        {/* Total Attendance Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-50 rounded-lg">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-gray-500 text-sm mb-1">
                {activeSegment === "movies"
                  ? "Tickets Sold"
                  : activeSegment === "events"
                  ? "Total Attendees"
                  : "Total Participation"}
              </h3>
              <p className="text-2xl font-bold text-gray-900">
                {activeSegment === "movies"
                  ? totalStats.totalTickets.toLocaleString()
                  : activeSegment === "events"
                  ? totalStats.totalAttendees.toLocaleString()
                  : (
                      totalStats.totalAttendees + totalStats.totalTickets
                    ).toLocaleString()}
              </p>
              <p className="text-xs text-gray-400">
                {activeSegment === "movies"
                  ? "Movie tickets"
                  : activeSegment === "events"
                  ? "Event attendees"
                  : "Combined total"}
              </p>
            </div>
          </div>
        </div>

        {/* Active Items Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-50 rounded-lg">
              <svg
                className="w-6 h-6 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-gray-500 text-sm mb-1">Active Items</h3>
              <p className="text-2xl font-bold text-gray-900">
                {totalStats.upcoming + totalStats.released}
              </p>
              <p className="text-xs text-gray-400">
                {totalStats.upcoming} upcoming, {totalStats.released} released
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-gray-700 font-medium">Status Distribution</h3>
            <div className="flex gap-2">
              {statusChartData.labels.map((label, index) => (
                <div key={label} className="flex items-center gap-2 text-xs">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor:
                        statusChartData.datasets[0].backgroundColor[index],
                    }}
                  />
                  {label}
                </div>
              ))}
            </div>
          </div>
          <div className="h-64">
            <Pie
              data={statusChartData}
              options={{
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
              }}
            />
          </div>
        </div>

        {/* Enhanced Revenue Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-gray-700 font-medium mb-6">Revenue Breakdown</h3>
          <div className="h-64">
            <Bar
              data={revenueChartData}
              options={{
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: { color: "#f3f4f6" },
                    ticks: { callback: (value) => formatCurrency(value) },
                  },
                  x: { grid: { display: false } },
                },
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    callbacks: {
                      label: (context) => formatCurrency(context.parsed.y),
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Enhanced Data Table with Ant Design Pagination */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <Table
          columns={tableColumns}
          dataSource={paginatedItems}
          rowKey="id"
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: filteredItems.length,
            onChange: handlePagination,
          }}
        />
      </div>
    </div>
  );
};

export default OrganizerReport;
