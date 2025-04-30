// Organizer Report Page - Filter Months, pagination

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Bar, Pie } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import "jspdf-autotable";
import previewImage from "assets/preview/thudarum-1.jpg";
import eventImage from "assets/preview/event.jpg";
import { Link } from "react-router-dom";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import { Table, Select, DatePicker } from "antd";
import dayjs from "dayjs";

Chart.register(...registerables);

const { Option } = Select;
const { RangePicker } = DatePicker;

const OrganizerReport = () => {
  const [activeSegment, setActiveSegment] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");
  const [customDateRange, setCustomDateRange] = useState([]);
  const reportRef = useRef(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
  });

  // Sample Data
  const events = useMemo(
    () => [
      {
        id: 1,
        title: "Tech Conference 2025",
        image: eventImage,
        type: "event",
        startDate: "2025-03-20",
        endDate: "2025-03-22",
        status: "Upcoming",
        updatedAt: "2025-04-10",
        attendees: 250,
        capacity: 300,
        revenue: 12500,
      },
      {
        id: 2,
        title: "Startup Meetup",
        image: eventImage,
        type: "event",
        startDate: "2025-04-10",
        endDate: "2025-04-11",
        status: "Completed",
        updatedAt: "2025-03-05",
        attendees: 180,
        capacity: 200,
        revenue: 9000,
      },
      {
        id: 3,
        title: "AI Workshop",
        image: eventImage,
        type: "event",
        startDate: "2024-04-18",
        endDate: "2024-04-19",
        status: "Upcoming",
        updatedAt: "2025-04-12",
        attendees: 95,
        capacity: 120,
        revenue: 4750,
      },
      {
        id: 4,
        title: "Health Summit",
        image: eventImage,
        type: "event",
        startDate: "2025-02-01",
        endDate: "2025-02-03",
        status: "Cancelled",
        updatedAt: "2025-01-25",
        attendees: 0,
        capacity: 150,
        revenue: 0,
      },
      {
        id: 5,
        title: "Marketing Seminar",
        image: eventImage,
        type: "event",
        startDate: "2025-04-15",
        endDate: "2025-04-16",
        status: "Upcoming",
        updatedAt: "2025-04-14",
        attendees: 210,
        capacity: 250,
        revenue: 10500,
      },
      {
        id: 6,
        title: "Winter Tech Fest",
        image: eventImage,
        type: "event",
        startDate: "2024-12-15",
        endDate: "2024-12-17",
        status: "Completed",
        updatedAt: "2024-12-10",
        attendees: 320,
        capacity: 350,
        revenue: 16000,
      },
      {
        id: 7,
        title: "Spring Developer Conference",
        image: eventImage,
        type: "event",
        startDate: "2025-04-05",
        endDate: "2025-04-07",
        status: "Completed",
        updatedAt: "2025-04-01",
        attendees: 275,
        capacity: 300,
        revenue: 13750,
      },
    ],
    []
  );

  const movies = useMemo(
    () => [
      {
        id: 1,
        title: "Galactic Wars: New Dawn",
        image: previewImage,
        type: "movie",
        releaseDate: "2025-05-20",
        status: "Released",
        lastUpdated: "2025-04-10",
        ticketsSold: 125000,
        totalSeats: 150000,
        revenue: 3750000,
      },
      {
        id: 2,
        title: "Ocean's Legacy",
        image: previewImage,
        type: "movie",
        releaseDate: "2025-03-10",
        status: "Completed",
        lastUpdated: "2025-03-05",
        ticketsSold: 98000,
        totalSeats: 120000,
        revenue: 2940000,
      },
      {
        id: 3,
        title: "The Midnight Detective",
        image: previewImage,
        type: "movie",
        releaseDate: "2025-04-18",
        status: "Upcoming",
        lastUpdated: "2025-04-12",
        ticketsSold: 45000,
        totalSeats: 100000,
        revenue: 1350000,
      },
      {
        id: 4,
        title: "Desert Dreams",
        image: previewImage,
        type: "movie",
        releaseDate: "2025-02-01",
        status: "Cancelled",
        lastUpdated: "2025-01-25",
        ticketsSold: 0,
        totalSeats: 80000,
        revenue: 0,
      },
      {
        id: 5,
        title: "Future City",
        image: previewImage,
        type: "movie",
        releaseDate: "2025-06-15",
        status: "Upcoming",
        lastUpdated: "2025-04-14",
        ticketsSold: 65000,
        totalSeats: 200000,
        revenue: 1950000,
      },
      {
        id: 6,
        title: "Holiday Special",
        image: previewImage,
        type: "movie",
        releaseDate: "2024-12-20",
        status: "Completed",
        lastUpdated: "2024-12-15",
        ticketsSold: 150000,
        totalSeats: 180000,
        revenue: 4500000,
      },
      {
        id: 7,
        title: "Spring Awakening",
        image: previewImage,
        type: "movie",
        releaseDate: "2025-04-01",
        status: "Completed",
        lastUpdated: "2025-03-28",
        ticketsSold: 110000,
        totalSeats: 150000,
        revenue: 3300000,
      },
    ],
    []
  );

  // Filter items based on time filter
  const baseItems = useMemo(() => {
    return activeSegment === "all"
      ? [...events, ...movies]
      : activeSegment === "events"
      ? events
      : movies;
  }, [activeSegment, events, movies]);

  // Memoize the filtered items
  const filteredItems = useMemo(() => {
    if (timeFilter === "all" && customDateRange.length === 0) {
      return baseItems;
    }

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
        item.type === "event" ? item.startDate : item.releaseDate;
      const itemDate = dayjs(dateField);

      if (timeFilter === "custom") {
        return itemDate.isAfter(startDate) && itemDate.isBefore(endDate);
      }
      return itemDate.isAfter(startDate);
    });
  }, [baseItems, timeFilter, customDateRange]);

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
    try {
      if (!reportRef.current) {
        console.error("Report element not found");
        return;
      }

      const canvas = await html2canvas(reportRef.current, {
        scale: 1,
        logging: true,
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("landscape");
      const imgWidth = pdf.internal.pageSize.getWidth();
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save("events-report.pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  // Handle time filter change
  const handleTimeFilterChange = (value) => {
    setTimeFilter(value);
    if (value !== "custom") {
      setCustomDateRange([]);
    }
  };

  // Handle custom date range change
  const handleDateRangeChange = (dates) => {
    setCustomDateRange(dates);
    if (dates && dates.length === 2) {
      setTimeFilter("custom");
    }
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
            {timeFilter !== "all" && (
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
            )}
          </p>
        </div>

        {/* Enhanced Controls */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            {["all", "events", "movies"].map((segment) => (
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
              defaultValue="all"
              style={{ width: 150 }}
              onChange={handleTimeFilterChange}
              value={timeFilter}
            >
              <Option value="all">All Time</Option>
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
              />
            )}

            <button
              onClick={handleExportPDF}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center gap-2 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              PDF
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
            // showSizeChanger: true,
            // pageSizeOptions: ["5", "10", "20", "50"],
            // showTotal: (total, range) => (
            //   <span className="text-gray-600">
            //     Showing {range[0]}-{range[1]} of {total} items
            //   </span>
            // ),
          }}
        />
      </div>
    </div>
  );
};

export default OrganizerReport;
