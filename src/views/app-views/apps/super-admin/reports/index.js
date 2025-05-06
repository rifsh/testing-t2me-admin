import React, { useRef, useState } from "react";
import { Bar, Pie, Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import { Link } from "react-router-dom";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { DatePicker, Select } from "antd";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import * as XLSX from 'xlsx';
dayjs.extend(isBetween);

Chart.register(...registerables);

const { RangePicker } = DatePicker;
const { Option } = Select;

const SuperAdminReport = () => {
  const reportRef = useRef(null);
  const [activeTab, setActiveTab] = useState("total");
  const [timeFilter, setTimeFilter] = useState("all");
  const [customDateRange, setCustomDateRange] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    size: 5,
  });

  const eventOrganizers = [
    {
      id: 1,
      name: "Irshad",
      email: "irshad@mail.com",
      type: "event",
      events: 12,
      attendees: 4500,
      revenue: 125000,
      status: "Active",
      lastLogin: "2025-04-15",
      registrationDate: "2024-01-01",
      phone: "+91 9876543210",
      eventsList: [
        {
          id: 1,
          name: "Tech Conference",
          date: "2025-03-15",
          attendees: 1200,
          revenue: 50000,
        },
        {
          id: 2,
          name: "Startup Summit",
          date: "2025-04-20",
          attendees: 800,
          revenue: 30000,
        },
      ],
    },
    {
      id: 2,
      name: "Rifash",
      email: "rifash@mail.com",
      type: "event",
      events: 8,
      attendees: 12000,
      revenue: 385000,
      status: "Active",
      lastLogin: "2025-04-14",
      registrationDate: "2024-01-01",
      phone: "+91 9876543210",
      eventsList: [
        {
          id: 1,
          name: "Tech Conference",
          date: "2025-03-15",
          attendees: 1200,
          revenue: 50000,
        },
        {
          id: 2,
          name: "Startup Summit",
          date: "2025-04-20",
          attendees: 800,
          revenue: 30000,
        },
      ],
    },
    {
      id: 3,
      name: "Yasin",
      email: "yasin@gmail.co",
      type: "event",
      events: 5,
      attendees: 8000,
      revenue: 215000,
      status: "Inactive",
      lastLogin: "2025-04-10",
      registrationDate: "2024-01-01",
      phone: "+91 9876543210",
      eventsList: [
        {
          id: 1,
          name: "Tech Conference",
          date: "2025-03-15",
          attendees: 1200,
          revenue: 50000,
        },
        {
          id: 2,
          name: "Startup Summit",
          date: "2025-04-20",
          attendees: 800,
          revenue: 30000,
        },
      ],
    },
    {
      id: 4,
      name: "Jasim",
      email: "jasin@mail.com",
      type: "event",
      events: 3,
      attendees: 1500,
      revenue: 45000,
      status: "Inactive",
      lastLogin: "2025-04-12",
      registrationDate: "2024-01-01",
      phone: "+91 9876543210",
      eventsList: [
        {
          id: 1,
          name: "Tech Conference",
          date: "2025-03-15",
          attendees: 1200,
          revenue: 50000,
        },
        {
          id: 2,
          name: "Startup Summit",
          date: "2025-04-20",
          attendees: 800,
          revenue: 30000,
        },
      ],
    },
  ];

  const movieOrganizers = [
    {
      id: 101,
      name: "Jasim",
      email: "jasim@mail.com",
      type: "movie",
      movies: 5,
      attendees: 3000,
      revenue: 75000,
      status: "Active",
      lastLogin: "2025-04-16",
      registrationDate: "2024-01-01",
      phone: "+91 9876543210",
      moviesList: [
        {
          id: 101,
          name: "Thudarum",
          releaseDate: "2025-03-15",
          attendees: 1200,
          revenue: 50000,
          showtimes: ["10:00 AM", "02:30 PM", "07:00 PM"],
        },
        {
          id: 102,
          name: "Jimkhana",
          releaseDate: "2025-04-20",
          attendees: 800,
          revenue: 30000,
          showtimes: ["11:00 AM", "03:30 PM"],
        },
      ],
    },
    {
      id: 102,
      name: "Ahmad",
      email: "ahmad@mail.com",
      type: "movie",
      movies: 1,
      attendees: 3000,
      revenue: 75000,
      status: "Active",
      lastLogin: "2025-04-16",
      registrationDate: "2024-01-01",
      phone: "+91 9876543210",
      moviesList: [
        {
          id: 103,
          name: "Vikram",
          releaseDate: "2025-03-15",
          attendees: 1200,
          revenue: 50000,
          showtimes: ["10:00 AM", "02:30 PM", "07:00 PM"],
        },
      ],
    },
    {
      id: 103,
      name: "Farhan",
      email: "farhan@mail.com",
      type: "movie",
      movies: 2,
      attendees: 5000,
      revenue: 85000,
      status: "Active",
      lastLogin: "2025-04-16",
      registrationDate: "2024-01-01",
      phone: "+91 9876543210",
      moviesList: [
        {
          id: 104,
          name: "KGF",
          releaseDate: "2025-03-15",
          attendees: 1800,
          revenue: 60000,
          showtimes: ["10:00 AM", "02:30 PM", "07:00 PM"],
        },
        {
          id: 105,
          name: "Empuraan",
          releaseDate: "2025-04-20",
          attendees: 800,
          revenue: 30000,
          showtimes: ["11:00 AM", "03:30 PM"],
        },
      ],
    },
    {
      id: 104,
      name: "Syed",
      email: "syed@mail.com",
      type: "movie",
      movies: 3,
      attendees: 9000,
      revenue: 95000,
      status: "Active",
      lastLogin: "2025-04-16",
      registrationDate: "2024-01-01",
      phone: "+91 9876543210",
      moviesList: [
        {
          id: 106,
          name: "AaaduJeevitham",
          releaseDate: "2025-03-15",
          attendees: 1200,
          revenue: 50000,
          showtimes: ["10:00 AM", "02:30 PM", "07:00 PM"],
        },
        {
          id: 107,
          name: "Chitham",
          releaseDate: "2025-04-20",
          attendees: 1000,
          revenue: 20000,
          showtimes: ["11:00 AM", "03:30 PM"],
        },
        {
          id: 108,
          name: "Premalu",
          releaseDate: "2025-04-20",
          attendees: 3000,
          revenue: 25000,
          showtimes: ["11:00 AM", "03:30 PM"],
        },
      ],
    },
  ];
  const getStatusBadge = (status) => {
    const baseClasses = "px-3 py-1 rounded-md text-sm font-medium";
    switch (status) {
      case "Active":
        return (
          <span className={`${baseClasses} bg-green-100 text-green-800`}>
            Active
          </span>
        );
      case "Inactive":
        return (
          <span className={`${baseClasses} bg-red-100 text-red-800`}>
            Inactive
          </span>
        );
      default:
        return (
          <span className={`${baseClasses} bg-gray-100 text-gray-800`}>
            Unknown
          </span>
        );
    }
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case "events":
        return "Events";
      case "movies":
        return "Movies";
      default:
        return "Total (Events + Movies)";
    }
  };

  // Date filtering functions
  const getDateRange = () => {
    const now = dayjs();
    let startDate,
      endDate = now;

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
        [startDate, endDate] = customDateRange;
        break;
      default:
        return [null, null];
    }
    return [startDate?.startOf("day"), endDate?.endOf("day")];
  };

  const filterOrganizers = (organizers) => {
    const [startDate, endDate] = getDateRange();

    return organizers.filter((organizer) => {
      const items =
        organizer.type === "event"
          ? organizer.eventsList
          : organizer.moviesList;
      const dateField = organizer.type === "event" ? "date" : "releaseDate";

      return items.some((item) => {
        const itemDate = dayjs(item[dateField]);
        if (!startDate || !endDate) return true;
        return itemDate.isBetween(startDate, endDate, null, "[]");
      });
    });
  };

  // Modified getCurrentOrganizers with date filtering
  const getCurrentOrganizers = () => {
    let data;

    switch (activeTab) {
      case "events":
        data = eventOrganizers;
        break;
      case "movies":
        data = movieOrganizers;
        break;
      default:
        data = [
          ...eventOrganizers.map((org) => ({ ...org, type: "event" })),
          ...movieOrganizers.map((org) => ({ ...org, type: "movie" })),
        ];
        break;
    }

    const filteredData = filterOrganizers(data);
    const startIndex = (pagination.page - 1) * pagination.size;
    const endIndex = startIndex + pagination.size;

    return filteredData.slice(startIndex, endIndex);
  };

  // Updated statistics calculations
  const filteredEventOrganizers = filterOrganizers(eventOrganizers);
  const filteredMovieOrganizers = filterOrganizers(movieOrganizers);
  const filteredAllOrganizers = filterOrganizers([
    ...eventOrganizers.map((org) => ({ ...org, type: "event" })),
    ...movieOrganizers.map((org) => ({ ...org, type: "movie" })),
  ]);

  const platformStats = {
    totalEventOrganizers: filteredEventOrganizers.length,
    activeEventOrganizers: filteredEventOrganizers.filter(
      (o) => o.status === "Active"
    ).length,
    totalMovieOrganizers: filteredMovieOrganizers.length,
    activeMovieOrganizers: filteredMovieOrganizers.filter(
      (o) => o.status === "Active"
    ).length,
    totalOrganizers: filteredAllOrganizers.length,
    activeOrganizers: filteredAllOrganizers.filter((o) => o.status === "Active")
      .length,

    totalEvents: filteredEventOrganizers.reduce(
      (sum, org) => sum + org.events,
      0
    ),
    totalMovies: filteredMovieOrganizers.reduce(
      (sum, org) => sum + org.movies,
      0
    ),

    totalEventAttendees: filteredEventOrganizers.reduce(
      (sum, org) => sum + org.attendees,
      0
    ),
    totalMovieAttendees: filteredMovieOrganizers.reduce(
      (sum, org) => sum + org.attendees,
      0
    ),
    totalAttendees:
      filteredEventOrganizers.reduce((sum, org) => sum + org.attendees, 0) +
      filteredMovieOrganizers.reduce((sum, org) => sum + org.attendees, 0),

    totalEventRevenue: filteredEventOrganizers.reduce(
      (sum, org) => sum + org.revenue,
      0
    ),
    totalMovieRevenue: filteredMovieOrganizers.reduce(
      (sum, org) => sum + org.revenue,
      0
    ),
    totalRevenue:
      filteredEventOrganizers.reduce((sum, org) => sum + org.revenue, 0) +
      filteredMovieOrganizers.reduce((sum, org) => sum + org.revenue, 0),
  };

  // Update totalItems calculation
  const totalItems = (() => {
    switch (activeTab) {
      case "events":
        return filteredEventOrganizers.length;
      case "movies":
        return filteredMovieOrganizers.length;
      default:
        return filteredAllOrganizers.length;
    }
  })();

  const organizerPerformanceData = {
    labels: getCurrentOrganizers().map((org) => org.name),
    datasets: [
      {
        label: `${getTabTitle()} Revenue Generated ($)`,
        data: getCurrentOrganizers().map((org) => org.revenue),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 2,
      },
    ],
  };

  const statusDistributionData = {
    labels: ["Active", "Inactive"],
    datasets: [
      {
        data: [
          activeTab === "events"
            ? platformStats.activeEventOrganizers
            : activeTab === "movies"
            ? platformStats.activeMovieOrganizers
            : platformStats.activeOrganizers,

          activeTab === "events"
            ? eventOrganizers.length - platformStats.activeEventOrganizers
            : activeTab === "movies"
            ? movieOrganizers.length - platformStats.activeMovieOrganizers
            : platformStats.totalOrganizers - platformStats.activeOrganizers,
        ],
        backgroundColor: ["#198754", "#dc3545"],
        borderWidth: 1,
      },
    ],
  };

  // Timeline data
  const timelineData = {
    events: [12, 19, 15, 25, 18, 22],
    movies: [5, 8, 6, 10, 7, 9],
    total: [17, 27, 21, 35, 25, 31], // Sum of events and movies
  };

  const handleExportPdf = async () => {
    const input = reportRef.current;
    const canvas = await html2canvas(input, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    pdf.save("report.pdf");
  };


  const handleExportCsv = () => {
    const table = reportRef.current.querySelector('table');
    if (!table) {
      alert('No data available for export!');
      return;
    }
  
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.table_to_sheet(table);
  
    // Set column widths (adjust as needed)
    worksheet['!cols'] = [{ wch: 20 }, { wch: 30 }, { wch: 20 },{ wch: 15 },{ wch: 20 },{ wch: 20 },{ wch: 20 },{ wch: 20 }]; // adjust widths

  
    // Center-align all cells
    Object.keys(worksheet).forEach((key) => {
      if (key.startsWith('!')) return; // Skip metadata
      if (!worksheet[key].s) worksheet[key].s = {};
      worksheet[key].s.alignment = { horizontal: 'center', vertical: 'center' };
    });
  
    // Add worksheet and export
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
    XLSX.writeFile(workbook, 'Report.xlsx');
  
  };
  
  return (
    <div className="container mx-auto px-4 py-6" ref={reportRef}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-blue-600">Reports</h2>
        <div className="flex items-center gap-4">
          <Select
            value={timeFilter}
            onChange={(value) => {
              setTimeFilter(value);
              setPagination((prev) => ({ ...prev, page: 1 }));
              if (value !== "custom") setCustomDateRange([]);
            }}
            style={{ width: 180 }}
          >
            <Option value="all">All Dates</Option>
            <Option value="last-month">Last Month</Option>
            <Option value="last-3-months">Last 3 Months</Option>
            <Option value="last-year">Last Year</Option>
            <Option value="custom">Custom Range</Option>
          </Select>

          {timeFilter === "custom" && (
            <RangePicker
              value={customDateRange}
              onChange={(dates) => {
                setCustomDateRange(dates);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
            />
          )}

          <button
            onClick={handleExportPdf}
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
            onClick={handleExportCsv}
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

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab("total")}
          className={`px-4 py-2 rounded-lg ${
            activeTab === "total"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Total
        </button>
        <button
          onClick={() => setActiveTab("events")}
          className={`px-4 py-2 rounded-lg ${
            activeTab === "events"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Events
        </button>
        <button
          onClick={() => setActiveTab("movies")}
          className={`px-4 py-2 rounded-lg ${
            activeTab === "movies"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Movies
        </button>
      </div>

      {/* Platform Statistics */}
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
              ? platformStats.totalEventOrganizers
              : activeTab === "movies"
              ? platformStats.totalMovieOrganizers
              : platformStats.totalOrganizers}
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
              ? platformStats.activeEventOrganizers
              : activeTab === "movies"
              ? platformStats.activeMovieOrganizers
              : platformStats.activeOrganizers}
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
              ? platformStats.totalEvents
              : activeTab === "movies"
              ? platformStats.totalMovies
              : platformStats.totalEvents + platformStats.totalMovies}
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
            $
            {activeTab === "events"
              ? platformStats.totalEventRevenue.toLocaleString()
              : activeTab === "movies"
              ? platformStats.totalMovieRevenue.toLocaleString()
              : platformStats.totalRevenue.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Organizers Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Organizer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                {activeTab === "total" && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {activeTab === "events"
                    ? "Events"
                    : activeTab === "movies"
                    ? "Movies"
                    : "Items"}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Attendees
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {getCurrentOrganizers().map((organizer) => (
                <tr key={organizer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <Link
                      to={`${APP_PREFIX_PATH}/super-admin/organizer-details/${organizer.id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {organizer.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {organizer.email}
                  </td>
                  {activeTab === "total" && (
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-md text-sm font-medium ${
                          organizer.type === "event"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {organizer.type === "event" ? "Event" : "Movie"}
                      </span>
                    </td>
                  )}
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {activeTab === "events" ||
                    (activeTab === "total" && organizer.type === "event")
                      ? organizer.events
                      : organizer.movies}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {organizer.attendees.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-green-600">
                    ${organizer.revenue.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(organizer.status)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(organizer.lastLogin).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination outside table and aligned right */}
        <div className="flex justify-end p-4">
          <div className="flex items-center space-x-2">
            {/* Previous Button */}
            <button
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  page: Math.max(1, prev.page - 1),
                }))
              }
              disabled={pagination.page === 1}
              className={`w-8 h-8 flex items-center justify-center rounded-full border text-gray-600 ${
                pagination.page === 1
                  ? "bg-gray-200 cursor-not-allowed"
                  : "hover:bg-blue-100"
              }`}
            >
              ‹
            </button>

            {/* Page Numbers */}
            {Array.from({
              length: Math.ceil(totalItems / pagination.size),
            }).map((_, index) => {
              const pageNum = index + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      page: pageNum,
                    }))
                  }
                  className={`w-8 h-8 flex items-center justify-center rounded-full border text-sm ${
                    pagination.page === pageNum
                      ? "bg-blue-600 text-white"
                      : "hover:bg-blue-100 text-gray-600"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            {/* Next Button */}
            <button
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  page: Math.min(
                    Math.ceil(totalItems / pagination.size),
                    prev.page + 1
                  ),
                }))
              }
              disabled={
                pagination.page === Math.ceil(totalItems / pagination.size)
              }
              className={`w-8 h-8 flex items-center justify-center rounded-full border text-gray-600 ${
                pagination.page === Math.ceil(totalItems / pagination.size)
                  ? "bg-gray-200 cursor-not-allowed"
                  : "hover:bg-blue-100"
              }`}
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-gray-500 text-sm font-medium mb-3">
            Organizer {getTabTitle()} Revenue
          </h3>
          <div className="h-64">
            <Bar
              data={organizerPerformanceData}
              options={{
                indexAxis: "y",
                maintainAspectRatio: false,
                scales: { x: { beginAtZero: true } },
              }}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-gray-500 text-sm font-medium mb-3">
            {activeTab === "events"
              ? "Event"
              : activeTab === "movies"
              ? "Movie"
              : ""}{" "}
            Organizer Status Distribution
          </h3>
          <div className="h-64">
            <Pie
              data={statusDistributionData}
              options={{
                maintainAspectRatio: false,
                plugins: { legend: { position: "bottom" } },
              }}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-gray-500 text-sm font-medium mb-3">
            {getTabTitle()} Timeline
          </h3>
          <div className="h-64">
            {activeTab === "total" ? (
              <Line
                data={{
                  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
                  datasets: [
                    {
                      label: "Total Items",
                      data: timelineData.total,
                      borderColor: "#0d6efd",
                      backgroundColor: "rgba(13, 110, 253, 0.1)",
                      tension: 0.4,
                      fill: true,
                    },
                    {
                      label: "Events",
                      data: timelineData.events,
                      borderColor: "#198754",
                      tension: 0.4,
                      borderDash: [5, 5],
                      fill: false,
                    },
                    {
                      label: "Movies",
                      data: timelineData.movies,
                      borderColor: "#dc3545",
                      tension: 0.4,
                      borderDash: [5, 5],
                      fill: false,
                    },
                  ],
                }}
                options={{
                  maintainAspectRatio: false,
                  scales: { y: { beginAtZero: true } },
                }}
              />
            ) : (
              <Line
                data={{
                  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
                  datasets: [
                    {
                      label:
                        activeTab === "events"
                          ? "Events Created"
                          : "Movies Released",
                      data:
                        activeTab === "events"
                          ? timelineData.events
                          : timelineData.movies,
                      borderColor:
                        activeTab === "events" ? "#198754" : "#dc3545",
                      backgroundColor:
                        activeTab === "events"
                          ? "rgba(25, 135, 84, 0.1)"
                          : "rgba(220, 53, 69, 0.1)",
                      tension: 0.4,
                      fill: true,
                    },
                  ],
                }}
                options={{
                  maintainAspectRatio: false,
                  scales: { y: { beginAtZero: true } },
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-medium mb-4">Platform Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {activeTab === "total" && (
            <>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">
                  Event Organizers
                </h4>
                <p className="text-2xl font-bold">
                  {platformStats.totalEventOrganizers}
                </p>
                <p className="text-sm text-gray-500">
                  <span className="text-green-600 font-medium">
                    {platformStats.activeEventOrganizers}
                  </span>{" "}
                  active
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">
                  Movie Organizers
                </h4>
                <p className="text-2xl font-bold">
                  {platformStats.totalMovieOrganizers}
                </p>
                <p className="text-sm text-gray-500">
                  <span className="text-green-600 font-medium">
                    {platformStats.activeMovieOrganizers}
                  </span>{" "}
                  active
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">
                  Event Statistics
                </h4>
                <p className="text-lg font-bold">
                  {platformStats.totalEvents} events
                </p>
                <p className="text-sm text-gray-500">
                  {platformStats.totalEventAttendees.toLocaleString()} attendees
                </p>
                <p className="text-sm text-green-600 font-medium">
                  ${platformStats.totalEventRevenue.toLocaleString()} revenue
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">
                  Movie Statistics
                </h4>
                <p className="text-lg font-bold">
                  {platformStats.totalMovies} movies
                </p>
                <p className="text-sm text-gray-500">
                  {platformStats.totalMovieAttendees.toLocaleString()} attendees
                </p>
                <p className="text-sm text-green-600 font-medium">
                  ${platformStats.totalMovieRevenue.toLocaleString()} revenue
                </p>
              </div>
            </>
          )}

          {activeTab === "events" && (
            <>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">
                  Event Organizers
                </h4>
                <p className="text-2xl font-bold">
                  {platformStats.totalEventOrganizers}
                </p>
                <p className="text-sm text-gray-500">
                  <span className="text-green-600 font-medium">
                    {platformStats.activeEventOrganizers}
                  </span>{" "}
                  active
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">
                  Total Events
                </h4>
                <p className="text-2xl font-bold">
                  {platformStats.totalEvents}
                </p>
                <p className="text-sm text-gray-500">
                  {platformStats.totalEventAttendees.toLocaleString()} attendees
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">
                  Event Revenue
                </h4>
                <p className="text-2xl font-bold text-green-600">
                  ${platformStats.totalEventRevenue.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">
                  Average per organizer: $
                  {Math.round(
                    platformStats.totalEventRevenue /
                      platformStats.totalEventOrganizers
                  ).toLocaleString()}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">
                  Active Rate
                </h4>
                <p className="text-2xl font-bold">
                  {Math.round(
                    (platformStats.activeEventOrganizers /
                      platformStats.totalEventOrganizers) *
                      100
                  )}
                  %
                </p>
                <p className="text-sm text-gray-500">
                  {platformStats.activeEventOrganizers} active organizers
                </p>
              </div>
            </>
          )}

          {activeTab === "movies" && (
            <>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">
                  Movie Organizers
                </h4>
                <p className="text-2xl font-bold">
                  {platformStats.totalMovieOrganizers}
                </p>
                <p className="text-sm text-gray-500">
                  <span className="text-green-600 font-medium">
                    {platformStats.activeMovieOrganizers}
                  </span>{" "}
                  active
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">
                  Total Movies
                </h4>
                <p className="text-2xl font-bold">
                  {platformStats.totalMovies}
                </p>
                <p className="text-sm text-gray-500">
                  {platformStats.totalMovieAttendees.toLocaleString()} attendees
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">
                  Movie Revenue
                </h4>
                <p className="text-2xl font-bold text-green-600">
                  ${platformStats.totalMovieRevenue.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">
                  Average per organizer: $
                  {Math.round(
                    platformStats.totalMovieRevenue /
                      platformStats.totalMovieOrganizers
                  ).toLocaleString()}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">
                  Active Rate
                </h4>
                <p className="text-2xl font-bold">
                  {Math.round(
                    (platformStats.activeMovieOrganizers /
                      platformStats.totalMovieOrganizers) *
                      100
                  )}
                  %
                </p>
                <p className="text-sm text-gray-500">
                  {platformStats.activeMovieOrganizers} active organizers
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuperAdminReport;
