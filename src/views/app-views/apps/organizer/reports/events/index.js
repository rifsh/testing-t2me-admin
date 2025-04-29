// evnt report page updated code

import React, { useRef } from "react";
import { Bar, Pie, Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import previewImage from "assets/preview/event.jpg";
import { jsPDF } from "jspdf";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import html2canvas from "html2canvas";
import { Link } from "react-router-dom";
Chart.register(...registerables);

const OrganizerReports = () => {
  const reportRef = useRef(null);

  const scheduledEvents = [
    {
      id: 1,
      title: "Tech Conference 2025",
      image: previewImage,
      startDate: "2025-05-20",
      endDate: "2025-05-22",
      status: "Upcoming",
      updatedAt: "2025-04-10",
      attendees: 250,
      capacity: 300,
      revenue: 12500,
    },
    {
      id: 2,
      title: "Startup Meetup",
      image: previewImage,
      startDate: "2025-03-10",
      endDate: "2025-03-11",
      status: "Completed",
      updatedAt: "2025-03-05",
      attendees: 180,
      capacity: 200,
      revenue: 9000,
    },
    {
      id: 3,
      title: "AI Workshop",
      image: previewImage,
      startDate: "2025-04-18",
      endDate: "2025-04-19",
      status: "Upcoming",
      updatedAt: "2025-04-12",
      attendees: 95,
      capacity: 120,
      revenue: 4750,
    },
    {
      id: 4,
      title: "Health Summit",
      image: previewImage,
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
      image: previewImage,
      startDate: "2025-06-15",
      endDate: "2025-06-16",
      status: "Upcoming",
      updatedAt: "2025-04-14",
      attendees: 210,
      capacity: 250,
      revenue: 10500,
    },
  ];

  // Calculate statistics (same as before)
  const totalStats = {
    scheduled: scheduledEvents.length,
    upcoming: scheduledEvents.filter((e) => e.status === "Upcoming").length,
    completed: scheduledEvents.filter((e) => e.status === "Completed").length,
    cancelled: scheduledEvents.filter((e) => e.status === "Cancelled").length,
    totalRevenue: scheduledEvents.reduce(
      (sum, event) => sum + event.revenue,
      0
    ),
    totalAttendees: scheduledEvents.reduce(
      (sum, event) => sum + event.attendees,
      0
    ),
    avgAttendance: Math.round(
      scheduledEvents.reduce(
        (sum, event) => sum + (event.attendees / event.capacity) * 100,
        0
      ) / scheduledEvents.length
    ),
  };

  const getStatusBadge = (status) => {
    const baseClasses = "px-3 py-1 rounded-md text-sm font-medium";
    switch (status) {
      case "Upcoming":
        return (
          <span className={`${baseClasses} bg-blue-100 text-blue-800`}>
            Upcoming
          </span>
        );
      case "Completed":
        return (
          <span className={`${baseClasses} bg-green-100 text-green-800`}>
            Completed
          </span>
        );
      case "Cancelled":
        return (
          <span className={`${baseClasses} bg-red-100 text-red-800`}>
            Cancelled
          </span>
        );
      default:
        return (
          <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>
            Unknown
          </span>
        );
    }
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Chart data (same as before)
  const statusChartData = {
    labels: ["Upcoming", "Completed", "Cancelled"],
    datasets: [
      {
        data: [totalStats.upcoming, totalStats.completed, totalStats.cancelled],
        backgroundColor: ["#0dcaf0", "#198754", "#dc3545"],
        borderWidth: 1,
      },
    ],
  };

  const handleExportCSV = () => {
    const csvContent = [
      [
        "Title",
        "Start Date",
        "End Date",
        "Attendees",
        "Capacity",
        "Revenue",
        "Status",
      ],
      ...scheduledEvents.map((event) => [
        `"${event.title}"`,
        event.startDate,
        event.endDate,
        event.attendees,
        event.capacity,
        event.revenue,
        event.status,
      ]),
    ]
      .map((e) => e.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "events-report.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // PDF Export Handler
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

  const revenueChartData = {
    labels: scheduledEvents.map((event) => event.title),
    datasets: [
      {
        label: "Revenue ($)",
        data: scheduledEvents.map((event) => event.revenue),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 2,
      },
    ],
  };

  const attendanceChartData = {
    labels: scheduledEvents.map((event) => event.title),
    datasets: [
      {
        label: "Attendance Rate (%)",
        data: scheduledEvents.map((event) =>
          Math.round((event.attendees / event.capacity) * 100)
        ),
        backgroundColor: "rgba(153, 102, 255, 0.6)",
        borderColor: "rgba(153, 102, 255, 1)",
        borderWidth: 2,
        tension: 0.3,
      },
    ],
  };

  return (
    <div className="container mx-auto px-4 py-6" ref={reportRef}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-blue-600">Events Reports</h2>
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
          >
            Export CSV
          </button>
          <button
            onClick={handleExportPDF}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            Export PDF
          </button>
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Image
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Event
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dates
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Attendance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {scheduledEvents.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center justify-center">
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-100"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      to={`${APP_PREFIX_PATH}/organizer/reports/events/event-details/${event.id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {event.title}
                    </Link>
                    {/* <div className="text-sm font-medium text-gray-900">
                      {event.title}
                    </div> */}
                    <div className="text-sm text-gray-500">
                      Updated: {new Date(event.updatedAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(event.startDate)} - {formatDate(event.endDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="mr-2 text-sm text-gray-500">
                        {event.attendees}/{event.capacity}
                      </div>
                      <div className="w-20 bg-gray-200 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${
                            event.status === "Cancelled"
                              ? "bg-red-500"
                              : "bg-blue-500"
                          }`}
                          style={{
                            width: `${
                              (event.attendees / event.capacity) * 100
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                    ${event.revenue.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(event.status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Events */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <div className="bg-blue-50 p-3 rounded-full inline-flex items-center justify-center mb-3">
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
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-gray-500 text-sm font-medium mb-1">
            Total Events
          </h3>
          <p className="text-2xl font-bold text-gray-900">
            {totalStats.scheduled}
          </p>
          <p className="text-xs text-gray-400">Last updated today</p>
        </div>

        {/* Total Attendees */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <div className="bg-cyan-50 p-3 rounded-full inline-flex items-center justify-center mb-3">
            <svg
              className="w-6 h-6 text-cyan-600"
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
          <h3 className="text-gray-500 text-sm font-medium mb-1">
            Total Attendees
          </h3>
          <p className="text-2xl font-bold text-gray-900">
            {totalStats.totalAttendees}
          </p>
          <p className="text-xs text-gray-400">Across all events</p>
        </div>

        {/* Total Revenue */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <div className="bg-green-50 p-3 rounded-full inline-flex items-center justify-center mb-3">
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
          <h3 className="text-gray-500 text-sm font-medium mb-1">
            Total Revenue
          </h3>
          <p className="text-2xl font-bold text-gray-900">
            ${totalStats.totalRevenue.toLocaleString()}
          </p>
          <p className="text-xs text-gray-400">From ticket sales</p>
        </div>

        {/* Avg Attendance */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <div className="bg-yellow-50 p-3 rounded-full inline-flex items-center justify-center mb-3">
            <svg
              className="w-6 h-6 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <h3 className="text-gray-500 text-sm font-medium mb-1">
            Avg Attendance
          </h3>
          <p className="text-2xl font-bold text-gray-900">
            {totalStats.avgAttendance}%
          </p>
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
            <div
              className="bg-yellow-500 h-1.5 rounded-full"
              style={{ width: `${totalStats.avgAttendance}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Event Status Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-gray-500 text-sm font-medium mb-3">
            Event Status Distribution
          </h3>
          <div className="h-64">
            <Pie
              data={statusChartData}
              options={{
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "bottom",
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Event Revenue */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-gray-500 text-sm font-medium mb-3">
            Event Revenue
          </h3>
          <div className="h-64">
            <Bar
              data={revenueChartData}
              options={{
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Attendance Rates */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-gray-500 text-sm font-medium mb-3">
            Attendance Rates
          </h3>
          <div className="h-64">
            <Line
              data={attendanceChartData}
              options={{
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 100,
                  },
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizerReports;

// import React, { useRef, useState, useEffect } from "react";
// import { Bar, Pie, Line } from "react-chartjs-2";
// import { Chart, registerables } from "chart.js";
// import previewImage from "assets/preview/event.jpg";
// import { jsPDF } from "jspdf";
// import { APP_PREFIX_PATH } from "configs/AppConfig";
// import html2canvas from "html2canvas";
// import { Link } from "react-router-dom";
// Chart.register(...registerables);

// const OrganizerReports = () => {
//   const reportRef = useRef(null);
//   const [selectedReportType, setSelectedReportType] = useState("total");

//   const scheduledEvents = [
//     // Sample event data - you would replace this with your actual data
//     {
//       id: "event-1",
//       title: "Summer Music Festival",
//       image: previewImage,
//       startDate: "2025-04-15",
//       endDate: "2025-04-17",
//       attendees: 850,
//       capacity: 1000,
//       revenue: 42500,
//       status: "Completed",
//       updatedAt: "2025-04-18",
//     },
//     {
//       id: "event-2",
//       title: "Tech Conference 2025",
//       image: previewImage,
//       startDate: "2025-05-20",
//       endDate: "2025-05-22",
//       attendees: 450,
//       capacity: 600,
//       revenue: 31500,
//       status: "Upcoming",
//       updatedAt: "2025-04-10",
//     },
//     {
//       id: "event-3",
//       title: "Holiday Charity Gala",
//       image: previewImage,
//       startDate: "2025-06-12",
//       endDate: "2025-06-12",
//       attendees: 0,
//       capacity: 300,
//       revenue: 0,
//       status: "Cancelled",
//       updatedAt: "2025-04-05",
//     },
//   ];

//   const movies = [
//     // Sample movie data - you would replace this with your actual data
//     {
//       id: "movie-1",
//       title: "The Last Adventure",
//       image: previewImage,
//       releaseDate: "2025-04-10",
//       ticketsSold: 1200,
//       totalSeats: 1500,
//       boxOfficeRevenue: 18000,
//       status: "Released",
//       lastUpdated: "2025-04-20",
//     },
//     {
//       id: "movie-2",
//       title: "Midnight Mysteries",
//       image: previewImage,
//       releaseDate: "2025-05-05",
//       ticketsSold: 800,
//       totalSeats: 1200,
//       boxOfficeRevenue: 12000,
//       status: "Upcoming",
//       lastUpdated: "2025-04-15",
//     },
//     {
//       id: "movie-3",
//       title: "Beyond the Horizon",
//       image: previewImage,
//       releaseDate: "2025-06-01",
//       ticketsSold: 0,
//       totalSeats: 1000,
//       boxOfficeRevenue: 0,
//       status: "Cancelled",
//       lastUpdated: "2025-04-12",
//     },
//   ];

//   const getCurrentData = () => {
//     if (selectedReportType === "total") {
//       // Transform movie data to match event data structure for combined view
//       const transformedMovies = movies.map((movie) => ({
//         id: `movie-${movie.id}`,
//         title: movie.title,
//         image: movie.image,
//         startDate: movie.releaseDate,
//         endDate: movie.releaseDate,
//         attendees: movie.ticketsSold,
//         capacity: movie.totalSeats,
//         revenue: movie.boxOfficeRevenue,
//         status: movie.status === "Released" ? "Completed" : movie.status,
//         updatedAt: movie.lastUpdated,
//         type: "movie",
//       }));

//       // Add type indicator to events
//       const eventsWithType = scheduledEvents.map((event) => ({
//         ...event,
//         type: "event",
//       }));

//       return [...eventsWithType, ...transformedMovies];
//     }

//     return selectedReportType === "events" ? scheduledEvents : movies;
//   };

//   const calculateStats = () => {
//     const data = getCurrentData();

//     // For total view, we need to handle calculations differently
//     if (selectedReportType === "total") {
//       return {
//         total: data.length,
//         upcoming: data.filter((item) => item.status === "Upcoming").length,
//         completed: data.filter((item) => item.status === "Completed").length,
//         cancelled: data.filter((item) => item.status === "Cancelled").length,
//         totalRevenue: data.reduce((sum, item) => sum + item.revenue, 0),
//         totalAttendees: data.reduce((sum, item) => sum + item.attendees, 0),
//         totalCapacity: data.reduce((sum, item) => sum + item.capacity, 0),
//         avgAttendance: Math.round(
//           data.reduce(
//             (sum, item) => sum + (item.attendees / item.capacity) * 100,
//             0
//           ) / data.length
//         ),
//         eventsCount: data.filter((item) => item.type === "event").length,
//         moviesCount: data.filter((item) => item.type === "movie").length,
//       };
//     }

//     // For events or movies view
//     return {
//       total: data.length,
//       upcoming: data.filter((item) => item.status === "Upcoming").length,
//       completed: data.filter((item) =>
//         selectedReportType === "events"
//           ? item.status === "Completed"
//           : item.status === "Released"
//       ).length,
//       cancelled: data.filter((item) => item.status === "Cancelled").length,
//       totalRevenue: data.reduce(
//         (sum, item) =>
//           sum +
//           (selectedReportType === "events"
//             ? item.revenue
//             : item.boxOfficeRevenue),
//         0
//       ),
//       totalAttendees: data.reduce(
//         (sum, item) =>
//           sum +
//           (selectedReportType === "events" ? item.attendees : item.ticketsSold),
//         0
//       ),
//       totalCapacity: data.reduce(
//         (sum, item) =>
//           sum +
//           (selectedReportType === "events" ? item.capacity : item.totalSeats),
//         0
//       ),
//       avgAttendance: Math.round(
//         data.reduce(
//           (sum, item) =>
//             sum +
//             (selectedReportType === "events"
//               ? item.attendees / item.capacity
//               : item.ticketsSold / item.totalSeats) *
//               100,
//           0
//         ) / (data.length || 1)
//       ),
//       eventsCount: selectedReportType === "events" ? data.length : 0,
//       moviesCount: selectedReportType === "movies" ? data.length : 0,
//     };
//   };

//   const [totalStats, setTotalStats] = useState(calculateStats());

//   useEffect(() => {
//     setTotalStats(calculateStats());
//   }, [selectedReportType]);

//   const handleReportTypeChange = (type) => {
//     setSelectedReportType(type);
//   };

//   const getStatusBadge = (status) => {
//     const baseClasses = "px-3 py-1 rounded-md text-sm font-medium";
//     const statusMap = {
//       Upcoming: { class: "bg-blue-100 text-blue-800", label: "Upcoming" },
//       Completed: { class: "bg-green-100 text-green-800", label: "Completed" },
//       Released: { class: "bg-green-100 text-green-800", label: "Released" },
//       Cancelled: { class: "bg-red-100 text-red-800", label: "Cancelled" },
//     };

//     return (
//       <span
//         className={`${baseClasses} ${
//           statusMap[status]?.class || "bg-gray-100 text-gray-800"
//         }`}
//       >
//         {statusMap[status]?.label || status}
//       </span>
//     );
//   };

//   const getItemTypeBadge = (type) => {
//     const baseClasses = "ml-2 px-2 py-0.5 text-xs rounded-md font-medium";
//     return (
//       <span
//         className={`${baseClasses} ${
//           type === "event"
//             ? "bg-indigo-100 text-indigo-800"
//             : "bg-purple-100 text-purple-800"
//         }`}
//       >
//         {type === "event" ? "Event" : "Movie"}
//       </span>
//     );
//   };

//   const formatDate = (dateString) => {
//     const options = { year: "numeric", month: "short", day: "numeric" };
//     return new Date(dateString).toLocaleDateString(undefined, options);
//   };

//   const handleExportCSV = () => {
//     const data = getCurrentData();
//     let headers, csvRows;

//     if (selectedReportType === "total") {
//       headers = [
//         "Type",
//         "Title",
//         "Date",
//         "Attendees",
//         "Capacity",
//         "Revenue",
//         "Status",
//       ];
//       csvRows = data.map((item) => [
//         item.type === "event" ? "Event" : "Movie",
//         `"${item.title}"`,
//         item.type === "event"
//           ? `${formatDate(item.startDate)} - ${formatDate(item.endDate)}`
//           : formatDate(item.startDate),
//         item.attendees,
//         item.capacity,
//         item.revenue,
//         item.status,
//       ]);
//     } else if (selectedReportType === "events") {
//       headers = [
//         "Title",
//         "Start Date",
//         "End Date",
//         "Attendees",
//         "Capacity",
//         "Revenue",
//         "Status",
//       ];
//       csvRows = data.map((item) => [
//         `"${item.title}"`,
//         item.startDate,
//         item.endDate,
//         item.attendees,
//         item.capacity,
//         item.revenue,
//         item.status,
//       ]);
//     } else {
//       // movies
//       headers = [
//         "Title",
//         "Release Date",
//         "Tickets Sold",
//         "Total Seats",
//         "Box Office Revenue",
//         "Status",
//       ];
//       csvRows = data.map((item) => [
//         `"${item.title}"`,
//         item.releaseDate,
//         item.ticketsSold,
//         item.totalSeats,
//         item.boxOfficeRevenue,
//         item.status,
//       ]);
//     }

//     const csvContent = [headers, ...csvRows].map((e) => e.join(",")).join("\n");

//     const blob = new Blob([csvContent], { type: "text/csv" });
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = `${selectedReportType}-report.csv`;
//     a.click();
//     window.URL.revokeObjectURL(url);
//   };

//   const handleExportPDF = async () => {
//     try {
//       const canvas = await html2canvas(reportRef.current, { scale: 1 });
//       const imgData = canvas.toDataURL("image/png");
//       const pdf = new jsPDF("landscape");
//       const imgWidth = pdf.internal.pageSize.getWidth();
//       const imgHeight = (canvas.height * imgWidth) / canvas.width;
//       pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
//       pdf.save(`${selectedReportType}-report.pdf`);
//     } catch (error) {
//       console.error("Error generating PDF:", error);
//     }
//   };

//   const statusChartData = {
//     labels: ["Upcoming", "Completed", "Cancelled"],
//     datasets: [
//       {
//         data: [totalStats.upcoming, totalStats.completed, totalStats.cancelled],
//         backgroundColor: ["#0dcaf0", "#198754", "#dc3545"],
//         borderWidth: 1,
//       },
//     ],
//   };

//   const revenueChartData = {
//     labels: getCurrentData().map((item) => item.title),
//     datasets: [
//       {
//         label: "Revenue ($)",
//         data: getCurrentData().map((item) =>
//           selectedReportType === "movies" ? item.boxOfficeRevenue : item.revenue
//         ),
//         backgroundColor:
//           selectedReportType === "total"
//             ? getCurrentData().map((item) =>
//                 item.type === "event"
//                   ? "rgba(75, 192, 192, 0.6)"
//                   : "rgba(153, 102, 255, 0.6)"
//               )
//             : "rgba(75, 192, 192, 0.6)",
//         borderColor:
//           selectedReportType === "total"
//             ? getCurrentData().map((item) =>
//                 item.type === "event"
//                   ? "rgba(75, 192, 192, 1)"
//                   : "rgba(153, 102, 255, 1)"
//               )
//             : "rgba(75, 192, 192, 1)",
//         borderWidth: 2,
//       },
//     ],
//   };

//   const attendanceChartData = {
//     labels: getCurrentData().map((item) => item.title),
//     datasets: [
//       {
//         label: "Attendance Rate (%)",
//         data: getCurrentData().map((item) => {
//           if (selectedReportType === "events") {
//             return Math.round((item.attendees / item.capacity) * 100);
//           } else if (selectedReportType === "movies") {
//             return Math.round((item.ticketsSold / item.totalSeats) * 100);
//           } else {
//             return Math.round((item.attendees / item.capacity) * 100);
//           }
//         }),
//         backgroundColor:
//           selectedReportType === "total"
//             ? getCurrentData().map((item) =>
//                 item.type === "event"
//                   ? "rgba(75, 192, 192, 0.6)"
//                   : "rgba(153, 102, 255, 0.6)"
//               )
//             : "rgba(153, 102, 255, 0.6)",
//         borderColor:
//           selectedReportType === "total"
//             ? getCurrentData().map((item) =>
//                 item.type === "event"
//                   ? "rgba(75, 192, 192, 1)"
//                   : "rgba(153, 102, 255, 1)"
//               )
//             : "rgba(153, 102, 255, 1)",
//         borderWidth: 2,
//         tension: 0.3,
//       },
//     ],
//   };

//   // For total view, add a distribution chart
//   const distributionChartData = {
//     labels: ["Events", "Movies"],
//     datasets: [
//       {
//         data: [totalStats.eventsCount, totalStats.moviesCount],
//         backgroundColor: [
//           "rgba(75, 192, 192, 0.6)",
//           "rgba(153, 102, 255, 0.6)",
//         ],
//         borderColor: ["rgba(75, 192, 192, 1)", "rgba(153, 102, 255, 1)"],
//         borderWidth: 1,
//       },
//     ],
//   };

//   const getRatioColor = (percentage) => {
//     if (percentage >= 75) return "text-green-600";
//     if (percentage >= 50) return "text-blue-600";
//     if (percentage >= 25) return "text-yellow-600";
//     return "text-red-600";
//   };

//   return (
//     <div className="container mx-auto px-4 py-6" ref={reportRef}>
//       <div className="flex justify-between items-center mb-6">
//         <h2 className="text-2xl font-bold text-blue-600">
//           {selectedReportType === "total"
//             ? "Overall Reports"
//             : selectedReportType === "events"
//             ? "Events Reports"
//             : "Movies Reports"}
//         </h2>
//         <div className="flex gap-4">
//           <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
//             <button
//               onClick={() => handleReportTypeChange("total")}
//               className={`px-4 py-2 rounded-md text-sm ${
//                 selectedReportType === "total"
//                   ? "bg-white shadow-sm text-blue-600"
//                   : "text-gray-500"
//               }`}
//             >
//               Total
//             </button>
//             <button
//               onClick={() => handleReportTypeChange("events")}
//               className={`px-4 py-2 rounded-md text-sm ${
//                 selectedReportType === "events"
//                   ? "bg-white shadow-sm text-blue-600"
//                   : "text-gray-500"
//               }`}
//             >
//               Events
//             </button>
//             <button
//               onClick={() => handleReportTypeChange("movies")}
//               className={`px-4 py-2 rounded-md text-sm ${
//                 selectedReportType === "movies"
//                   ? "bg-white shadow-sm text-blue-600"
//                   : "text-gray-500"
//               }`}
//             >
//               Movies
//             </button>
//           </div>
//           <div className="flex gap-2">
//             <button
//               onClick={handleExportCSV}
//               className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
//             >
//               Export CSV
//             </button>
//             <button
//               onClick={handleExportPDF}
//               className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
//             >
//               Export PDF
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Summary Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//         {/* Total Card */}
//         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
//           <div className="bg-blue-50 p-3 rounded-full inline-flex items-center justify-center mb-3">
//             <svg
//               className="w-6 h-6 text-blue-600"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth="2"
//                 d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
//               />
//             </svg>
//           </div>
//           <h3 className="text-gray-500 text-sm font-medium mb-1">
//             {selectedReportType === "total"
//               ? "Total Items"
//               : selectedReportType === "events"
//               ? "Total Events"
//               : "Total Movies"}
//           </h3>
//           <p className="text-2xl font-bold text-gray-900">{totalStats.total}</p>
//           {selectedReportType === "total" && (
//             <div className="flex justify-center items-center mt-2 text-xs gap-2">
//               <span className="inline-flex items-center px-2 py-1 rounded bg-indigo-50 text-indigo-700">
//                 Events: {totalStats.eventsCount}
//               </span>
//               <span className="inline-flex items-center px-2 py-1 rounded bg-purple-50 text-purple-700">
//                 Movies: {totalStats.moviesCount}
//               </span>
//             </div>
//           )}
//           <p className="text-xs text-gray-400 mt-2">Last updated today</p>
//         </div>

//         {/* Attendance Card */}
//         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
//           <div className="bg-cyan-50 p-3 rounded-full inline-flex items-center justify-center mb-3">
//             <svg
//               className="w-6 h-6 text-cyan-600"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth="2"
//                 d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
//               />
//             </svg>
//           </div>
//           <h3 className="text-gray-500 text-sm font-medium mb-1">
//             {selectedReportType === "events"
//               ? "Total Attendees"
//               : selectedReportType === "movies"
//               ? "Total Tickets Sold"
//               : "Total Attendees/Tickets"}
//           </h3>
//           <p className="text-2xl font-bold text-gray-900">
//             {totalStats.totalAttendees.toLocaleString()}
//           </p>
//           <p className="text-xs text-gray-400">
//             {selectedReportType === "total"
//               ? `${Math.round(
//                   (totalStats.totalAttendees / totalStats.totalCapacity) * 100
//                 )}% of capacity`
//               : `Across all ${selectedReportType}`}
//           </p>
//         </div>

//         {/* Revenue Card */}
//         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
//           <div className="bg-green-50 p-3 rounded-full inline-flex items-center justify-center mb-3">
//             <svg
//               className="w-6 h-6 text-green-600"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth="2"
//                 d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//               />
//             </svg>
//           </div>
//           <h3 className="text-gray-500 text-sm font-medium mb-1">
//             Total Revenue
//           </h3>
//           <p className="text-2xl font-bold text-gray-900">
//             ${totalStats.totalRevenue.toLocaleString()}
//           </p>
//           <p className="text-xs text-gray-400">
//             {selectedReportType === "events"
//               ? "From ticket sales"
//               : selectedReportType === "movies"
//               ? "From box office"
//               : "Combined revenue"}
//           </p>
//         </div>

//         {/* Avg Attendance Card */}
//         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
//           <div className="bg-yellow-50 p-3 rounded-full inline-flex items-center justify-center mb-3">
//             <svg
//               className="w-6 h-6 text-yellow-600"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth="2"
//                 d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
//               />
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth="2"
//                 d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
//               />
//             </svg>
//           </div>
//           <h3 className="text-gray-500 text-sm font-medium mb-1">
//             Average{" "}
//             {selectedReportType === "events"
//               ? "Attendance"
//               : selectedReportType === "movies"
//               ? "Ticket Sales"
//               : "Attendance"}{" "}
//             Rate
//           </h3>
//           <p
//             className={`text-2xl font-bold ${getRatioColor(
//               totalStats.avgAttendance
//             )}`}
//           >
//             {totalStats.avgAttendance}%
//           </p>
//           <p className="text-xs text-gray-400">Capacity utilization</p>
//         </div>
//       </div>

//       {/* Data Table */}
//       <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8 overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Image
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Title
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   {selectedReportType === "events"
//                     ? "Dates"
//                     : selectedReportType === "movies"
//                     ? "Release Date"
//                     : "Date"}
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   {selectedReportType === "events"
//                     ? "Attendance"
//                     : selectedReportType === "movies"
//                     ? "Tickets Sold"
//                     : "Attendance/Tickets"}
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   {selectedReportType === "events"
//                     ? "Revenue"
//                     : selectedReportType === "movies"
//                     ? "Box Office Revenue"
//                     : "Revenue"}
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Status
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {getCurrentData().map((item) => (
//                 <tr key={item.id} className="hover:bg-gray-50">
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="flex items-center justify-center">
//                       <img
//                         src={item.image}
//                         alt={item.title}
//                         className="w-12 h-12 rounded-full object-cover border-2 border-gray-100"
//                       />
//                     </div>
//                   </td>
//                   <td className="px-6 py-4">
//                     <div className="flex items-center">
//                       <Link
//                         to={
//                           selectedReportType === "total"
//                             ? `${APP_PREFIX_PATH}/organizer/reports/${
//                                 item.type
//                               }s/${item.id.replace(`${item.type}-`, "")}`
//                             : `${APP_PREFIX_PATH}/organizer/reports/${selectedReportType}/${item.id}`
//                         }
//                         className="text-blue-600 hover:text-blue-800 font-medium"
//                       >
//                         {item.title}
//                       </Link>
//                       {selectedReportType === "total" &&
//                         getItemTypeBadge(item.type)}
//                     </div>
//                     <div className="text-sm text-gray-500">
//                       Updated: {formatDate(item.updatedAt || item.lastUpdated)}
//                     </div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                     {selectedReportType === "movies"
//                       ? formatDate(item.releaseDate)
//                       : item.type === "movie" && selectedReportType === "total"
//                       ? formatDate(item.startDate)
//                       : `${formatDate(item.startDate)} - ${formatDate(
//                           item.endDate
//                         )}`}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="flex items-center">
//                       <div className="mr-2 text-sm text-gray-500">
//                         {`${item.attendees}/${item.capacity}`}
//                       </div>
//                       <div className="w-20 bg-gray-200 rounded-full h-1.5">
//                         <div
//                           className={`h-1.5 rounded-full ${
//                             item.status === "Cancelled"
//                               ? "bg-red-500"
//                               : selectedReportType === "total" &&
//                                 item.type === "movie"
//                               ? "bg-purple-500"
//                               : "bg-blue-500"
//                           }`}
//                           style={{
//                             width: `${Math.round(
//                               (item.attendees / item.capacity) * 100
//                             )}%`,
//                           }}
//                         ></div>
//                       </div>
//                     </div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
//                     $
//                     {(selectedReportType === "movies" && item?.boxOfficeRevenue
//                       ? item?.boxOfficeRevenue
//                       : item?.revenue
//                     )?.toLocaleString()}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     {getStatusBadge(item?.status)}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Charts Section */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
//         {selectedReportType === "total" ? (
//           // Distribution Chart for Total View
//           <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//             <h3 className="text-lg font-semibold text-gray-700 mb-4">
//               Events vs Movies Distribution
//             </h3>
//             <div className="w-full h-64">
//               <Pie
//                 data={distributionChartData}
//                 options={{
//                   responsive: true,
//                   maintainAspectRatio: false,
//                   plugins: {
//                     legend: {
//                       position: "bottom",
//                       labels: {
//                         padding: 20,
//                         boxWidth: 12,
//                       },
//                     },
//                     tooltip: {
//                       callbacks: {
//                         label: function (context) {
//                           const label = context.label || "";
//                           const value = context.raw || 0;
//                           const total = context.dataset.data.reduce(
//                             (a, b) => a + b,
//                             0
//                           );
//                           const percentage = Math.round((value / total) * 100);
//                           return `${label}: ${value} (${percentage}%)`;
//                         },
//                       },
//                     },
//                   },
//                 }}
//               />
//             </div>
//           </div>
//         ) : null}

//         {/* Status Chart */}
//         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//           <h3 className="text-lg font-semibold text-gray-700 mb-4">
//             Status Distribution
//           </h3>
//           <div className="w-full h-64">
//             <Pie
//               data={statusChartData}
//               options={{
//                 responsive: true,
//                 maintainAspectRatio: false,
//                 plugins: {
//                   legend: {
//                     position: "bottom",
//                     labels: {
//                       padding: 20,
//                       boxWidth: 12,
//                     },
//                   },
//                   tooltip: {
//                     callbacks: {
//                       label: function (context) {
//                         const label = context.label || "";
//                         const value = context.raw || 0;
//                         const total = context.dataset.data.reduce(
//                           (a, b) => a + b,
//                           0
//                         );
//                         const percentage = Math.round((value / total) * 100);
//                         return `${label}: ${value} (${percentage}%)`;
//                       },
//                     },
//                   },
//                 },
//               }}
//             />
//           </div>
//         </div>

//         {/* Revenue Chart */}
//         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//           <h3 className="text-lg font-semibold text-gray-700 mb-4">
//             {selectedReportType === "total"
//               ? "Revenue Breakdown"
//               : selectedReportType === "events"
//               ? "Revenue Breakdown"
//               : "Box Office Revenue Breakdown"}
//           </h3>
//           <div className="w-full h-64">
//             <Bar
//               data={revenueChartData}
//               options={{
//                 responsive: true,
//                 maintainAspectRatio: false,
//                 scales: {
//                   y: {
//                     beginAtZero: true,
//                     ticks: {
//                       callback: function (value) {
//                         return "$" + value.toLocaleString();
//                       },
//                     },
//                   },
//                   x: {
//                     ticks: {
//                       maxRotation: 45,
//                       minRotation: 45,
//                     },
//                   },
//                 },
//                 plugins: {
//                   legend: {
//                     display: selectedReportType === "total",
//                   },
//                   tooltip: {
//                     callbacks: {
//                       title: function (context) {
//                         const index = context[0].dataIndex;
//                         const data = getCurrentData()[index];
//                         return data.title;
//                       },
//                       label: function (context) {
//                         const value = context.raw || 0;
//                         return `Revenue: $${value.toLocaleString()}`;
//                       },
//                     },
//                   },
//                 },
//               }}
//             />
//           </div>
//         </div>

//         {/* Attendance Chart */}
//         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//           <h3 className="text-lg font-semibold text-gray-700 mb-4">
//             {selectedReportType === "total"
//               ? "Attendance/Ticket Sales Rates"
//               : selectedReportType === "events"
//               ? "Attendance Rates"
//               : "Ticket Sales Rates"}
//           </h3>
//           <div className="w-full h-64">
//             <Line
//               data={attendanceChartData}
//               options={{
//                 responsive: true,
//                 maintainAspectRatio: false,
//                 scales: {
//                   y: {
//                     beginAtZero: true,
//                     max: 100,
//                     ticks: {
//                       callback: function (value) {
//                         return value + "%";
//                       },
//                     },
//                   },
//                   x: {
//                     ticks: {
//                       maxRotation: 45,
//                       minRotation: 45,
//                     },
//                   },
//                 },
//                 plugins: {
//                   legend: {
//                     display: selectedReportType === "total",
//                   },
//                   tooltip: {
//                     callbacks: {
//                       title: function (context) {
//                         const index = context[0].dataIndex;
//                         const data = getCurrentData()[index];
//                         return data.title;
//                       },
//                       label: function (context) {
//                         const value = context.raw || 0;
//                         return `Attendance Rate: ${value}%`;
//                       },
//                     },
//                   },
//                 },
//               }}
//             />
//           </div>
//         </div>
//       </div>

//       {/* Performance Analysis Section */}
//       <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
//         <h3 className="text-lg font-semibold text-gray-700 mb-4">
//           Performance Analysis
//         </h3>
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {/* Completed vs Total */}
//           <div className="border border-gray-100 rounded-lg p-4 bg-gray-50">
//             <h4 className="text-sm font-medium text-gray-600 mb-2">
//               {selectedReportType === "movies"
//                 ? "Released Rate"
//                 : "Completion Rate"}
//             </h4>
//             <div className="flex items-center">
//               <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
//                 <div
//                   className="bg-blue-600 h-2.5 rounded-full"
//                   style={{
//                     width: `${
//                       (totalStats?.completed / totalStats?.total) * 100
//                     }%`,
//                   }}
//                 ></div>
//               </div>
//               <span className="text-sm font-medium text-gray-700">
//                 {Math.round((totalStats?.completed / totalStats?.total) * 100)}%
//               </span>
//             </div>
//             <p className="text-xs text-gray-500 mt-2">
//               {totalStats?.completed}{" "}
//               {selectedReportType === "movies" ? "released" : "completed"} out
//               of {totalStats?.total} total
//             </p>
//           </div>

//           {/* Cancellation Rate */}
//           <div className="border border-gray-100 rounded-lg p-4 bg-gray-50">
//             <h4 className="text-sm font-medium text-gray-600 mb-2">
//               Cancellation Rate
//             </h4>
//             <div className="flex items-center">
//               <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
//                 <div
//                   className="bg-red-500 h-2.5 rounded-full"
//                   style={{
//                     width: `${
//                       (totalStats?.cancelled / totalStats?.total) * 100
//                     }%`,
//                   }}
//                 ></div>
//               </div>
//               <span className="text-sm font-medium text-gray-700">
//                 {Math.round((totalStats?.cancelled / totalStats?.total) * 100)}%
//               </span>
//             </div>
//             <p className="text-xs text-gray-500 mt-2">
//               {totalStats?.cancelled} cancelled out of {totalStats?.total} total
//             </p>
//           </div>

//           {/* Average Revenue */}
//           <div className="border border-gray-100 rounded-lg p-4 bg-gray-50">
//             <h4 className="text-sm font-medium text-gray-600 mb-2">
//               Average Revenue
//             </h4>
//             <p className="text-xl font-bold text-green-600">
//               $
//               {Math.round(
//                 totalStats?.totalRevenue / totalStats?.total
//               )?.toLocaleString()}
//             </p>
//             <p className="text-xs text-gray-500 mt-2">
//               Per{" "}
//               {selectedReportType === "events"
//                 ? "event"
//                 : selectedReportType === "movies"
//                 ? "movie"
//                 : "item"}
//             </p>
//           </div>
//         </div>

//         {/* Performance Summary */}
//         <div className="mt-6 pt-6 border-t border-gray-100">
//           <h4 className="text-sm font-medium text-gray-600 mb-3">
//             Performance Summary
//           </h4>
//           <div className="prose prose-sm text-gray-500">
//             <p>
//               {selectedReportType === "total"
//                 ? `You have ${totalStats?.total} total items (${totalStats?.eventsCount} events and ${totalStats?.moviesCount} movies).
//                  ${totalStats.completed} items are completed with ${totalStats.cancelled} cancellations.`
//                 : selectedReportType === "events"
//                 ? `You have organized ${
//                     totalStats?.total
//                   } events with ${totalStats?.totalAttendees?.toLocaleString()} total attendees.
//                  The average attendance rate is ${
//                    totalStats.avgAttendance
//                  }%, generating $${totalStats.totalRevenue?.toLocaleString()} in revenue.`
//                 : `You have listed ${
//                     totalStats.total
//                   } movies with ${totalStats.totalAttendees?.toLocaleString()} tickets sold.
//                  The average ticket sales rate is ${
//                    totalStats.avgAttendance
//                  }%, generating $${totalStats.totalRevenue?.toLocaleString()} in box office revenue.`}
//             </p>
//             <p className="mt-2">
//               {totalStats.avgAttendance >= 75
//                 ? "Your attendance rate is excellent! Your content is very popular with audiences."
//                 : totalStats.avgAttendance >= 50
//                 ? "Your attendance rate is good. Most of your content is attracting reasonable audiences."
//                 : totalStats.avgAttendance >= 25
//                 ? "Your attendance rate is modest. Consider marketing strategies to increase attendance."
//                 : "Your attendance rate is low. Consider reviewing content selection or marketing strategies."}
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Recommendations */}
//       <div className="bg-blue-50 rounded-lg shadow-sm border border-blue-100 p-6 mb-8">
//         <h3 className="text-lg font-semibold text-blue-700 mb-4">
//           Recommendations
//         </h3>
//         <ul className="space-y-3">
//           <li className="flex items-start">
//             <div className="flex-shrink-0 h-5 w-5 relative mt-1">
//               <div className="absolute h-5 w-5 rounded-full bg-blue-200 flex items-center justify-center">
//                 <div className="h-2.5 w-2.5 rounded-full bg-blue-600"></div>
//               </div>
//             </div>
//             <p className="ml-3 text-sm text-blue-800">
//               {totalStats.cancelled > 0
//                 ? "Consider reviewing reasons for cancellations to reduce future occurrences."
//                 : "Great job on having no cancellations! Maintain your scheduling practices."}
//             </p>
//           </li>
//           <li className="flex items-start">
//             <div className="flex-shrink-0 h-5 w-5 relative mt-1">
//               <div className="absolute h-5 w-5 rounded-full bg-blue-200 flex items-center justify-center">
//                 <div className="h-2.5 w-2.5 rounded-full bg-blue-600"></div>
//               </div>
//             </div>
//             <p className="ml-3 text-sm text-blue-800">
//               {totalStats.avgAttendance < 60
//                 ? "Implement targeted marketing campaigns to boost attendance rates for upcoming events."
//                 : "Your attendance rates are strong. Continue your effective marketing strategies."}
//             </p>
//           </li>
//           <li className="flex items-start">
//             <div className="flex-shrink-0 h-5 w-5 relative mt-1">
//               <div className="absolute h-5 w-5 rounded-full bg-blue-200 flex items-center justify-center">
//                 <div className="h-2.5 w-2.5 rounded-full bg-blue-600"></div>
//               </div>
//             </div>
//             <p className="ml-3 text-sm text-blue-800">
//               {selectedReportType === "total"
//                 ? `Consider balancing your portfolio between events and movies based on performance data.`
//                 : selectedReportType === "events"
//                 ? `Analyze your most successful events and consider scheduling similar themes in the future.`
//                 : `Review the genres and themes of your most successful movies to guide future selections.`}
//             </p>
//           </li>
//         </ul>
//       </div>

//       {/* Footer */}
//       <div className="text-center text-gray-500 text-xs mb-4">
//         <p>
//           Data last updated: {new Date().toLocaleDateString()}{" "}
//           {new Date().toLocaleTimeString()}
//         </p>
//         <p>© 2025 EventsHub Management System</p>
//       </div>
//     </div>
//   );
// };

// export default OrganizerReports;

//total report

// import React, { useState } from "react";
// import { Bar, Pie } from "react-chartjs-2";
// import { Chart, registerables } from "chart.js";
// import { jsPDF } from "jspdf";
// import html2canvas from "html2canvas";
// import "jspdf-autotable";

// Chart.register(...registerables);

// const CombinedReport = () => {
//   const [activeSegment, setActiveSegment] = useState("all");

//   // Sample Data
//   const events = [
//     {
//       id: 1,
//       title: "Tech Conference 2025",
//       image:
//         "https://media.licdn.com/dms/image/v2/C561BAQE-51J-8KkMZg/company-background_10000/company-background_10000/0/1584559866970/eventscom_cover?e=2147483647&v=beta&t=3bktbE7ts5aNwH8XEUM5rW0G2aMbuQ1b2dHBVQgZqmA",
//       startDate: "2025-05-20",
//       endDate: "2025-05-22",
//       status: "Upcoming",
//       updatedAt: "2025-04-10",
//       attendees: 250,
//       capacity: 300,
//       revenue: 12500,
//     },
//     {
//       id: 2,
//       title: "Startup Meetup",
//       image:
//         "https://mediaim.expedia.com/destination/9/cd8a3f3db7149b0ce36d052aea1182df.jpg",
//       startDate: "2025-03-10",
//       endDate: "2025-03-11",
//       status: "Completed",
//       updatedAt: "2025-03-05",
//       attendees: 180,
//       capacity: 200,
//       revenue: 9000,
//     },
//     {
//       id: 3,
//       title: "AI Workshop",
//       image:
//         "https://s7ap1.scene7.com/is/image/incredibleindia/india-gate-delhi-1-attr-hero?qlt=82&ts=1727351922349",
//       startDate: "2025-04-18",
//       endDate: "2025-04-19",
//       status: "Upcoming",
//       updatedAt: "2025-04-12",
//       attendees: 95,
//       capacity: 120,
//       revenue: 4750,
//     },
//     {
//       id: 4,
//       title: "Health Summit",
//       image:
//         "https://aurifer.tax/wp-content/uploads/2023/03/1295CA28-51B0-4890-B288-7E2B6ABCA328.jpeg",
//       startDate: "2025-02-01",
//       endDate: "2025-02-03",
//       status: "Cancelled",
//       updatedAt: "2025-01-25",
//       attendees: 0,
//       capacity: 150,
//       revenue: 0,
//     },
//     {
//       id: 5,
//       title: "Marketing Seminar",
//       image:
//         "https://media.licdn.com/dms/image/v2/C561BAQE-51J-8KkMZg/company-background_10000/company-background_10000/0/1584559866970/eventscom_cover?e=2147483647&v=beta&t=3bktbE7ts5aNwH8XEUM5rW0G2aMbuQ1b2dHBVQgZqmA",
//       startDate: "2025-06-15",
//       endDate: "2025-06-16",
//       status: "Upcoming",
//       updatedAt: "2025-04-14",
//       attendees: 210,
//       capacity: 250,
//       revenue: 10500,
//     },
//     // Add more events...
//   ];

//   const movies = [
//     {
//             id: 1,
//             title: "Galactic Wars: New Dawn",
//             image: "https://m.media-amazon.com/images/M/MV5BZTVhN2VmNTgtMjQ0ZC00OTc1LWE2ZGItMjFkYTUzMzcyMTJkXkEyXkFqcGc@._V1_.jpg",
//             releaseDate: "2025-05-20",
//             status: "Released",
//             lastUpdated: "2025-04-10",
//             ticketsSold: 125000,
//             totalSeats: 150000,
//             revenue: 3750000,
//           },
//           {
//             id: 2,
//             title: "Ocean's Legacy",
//             image: "https://assets.vogue.in/photos/5db957d8177d2f00087466b4/2:3/w_2560%2Cc_limit/Kumbalangi-Nights-01.jpg",
//             releaseDate: "2025-03-10",
//             status: "Completed",
//             lastUpdated: "2025-03-05",
//             ticketsSold: 98000,
//             totalSeats: 120000,
//             revenue: 2940000,
//           },
//           {
//             id: 3,
//             title: "The Midnight Detective",
//             image: "https://m.media-amazon.com/images/M/MV5BZWY1NWZlNDMtMTgxNC00ZGNiLTgwZjgtZWRkZmY4ZjVhN2M1XkEyXkFqcGc@._V1_.jpg",
//             releaseDate: "2025-04-18",
//             status: "Upcoming",
//             lastUpdated: "2025-04-12",
//             ticketsSold: 45000,
//             totalSeats: 100000,
//             revenue: 1350000,
//           },
//           {
//             id: 4,
//             title: "Desert Dreams",
//             image: "https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/941f52133698221.61c36c24decd0.jpg",
//             releaseDate: "2025-02-01",
//             status: "Cancelled",
//             lastUpdated: "2025-01-25",
//             ticketsSold: 0,
//             totalSeats: 80000,
//             revenue: 0,
//           },
//           {
//             id: 5,
//             title: "Future City",
//             image: "https://preview.redd.it/thudarum-%E0%B4%A4-%E0%B4%9F%E0%B4%B0-reviews-and-ratings-25-april-2025-v0-wvwwwke7cwwe1.jpeg?width=640&crop=smart&auto=webp&s=3ff281a27c3cc8c4a1282fd494b4144315e6fc4e",
//             releaseDate: "2025-06-15",
//             status: "Upcoming",
//             lastUpdated: "2025-04-14",
//             ticketsSold: 65000,
//             totalSeats: 200000,
//             revenue: 1950000,
//           },
//     // Add more movies...
//   ];

//   // Combined data handling
//   const items = activeSegment === "all" ? [...events, ...movies] :
//                 activeSegment === "events" ? events : movies;

//   // Statistics calculations
//   const totalStats = {
//     totalItems: items.length,
//     totalRevenue: items.reduce((sum, item) => sum + item.revenue, 0),
//     upcoming: items.filter(i => i.status === "Upcoming").length,
//     completed: items.filter(i => i.status === "Completed").length,
//     released: items.filter(i => i.status === "Released").length,
//     cancelled: items.filter(i => i.status === "Cancelled").length,
//     totalAttendees: items.reduce((sum, item) =>
//       item.type === "event" ? sum + item.attendees : sum, 0),
//     totalTickets: items.reduce((sum, item) =>
//       item.type === "movie" ? sum + item.ticketsSold : sum, 0),
//   };

//   // Formatting functions
//   const formatDate = (dateString) => {
//     const options = { year: "numeric", month: "short", day: "numeric" };
//     return new Date(dateString).toLocaleDateString(undefined, options);
//   };

//   const formatCurrency = (amount) =>
//     new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

//   // Chart configurations
//   const statusChartData = {
//     labels: ["Upcoming", "Completed", "Released", "Cancelled"],
//     datasets: [{
//       data: [
//         totalStats.upcoming,
//         totalStats.completed,
//         totalStats.released,
//         totalStats.cancelled
//       ],
//       backgroundColor: ["#0dcaf0", "#198754", "#ffc107", "#dc3545"]
//     }]
//   };

//   const revenueChartData = {
//     labels: items.map(i => i.title),
//     datasets: [{
//       label: "Revenue",
//       data: items.map(i => i.revenue),
//       backgroundColor: items.map(i =>
//         i.type === "event" ? "rgba(75, 192, 192, 0.6)" : "rgba(255, 159, 64, 0.6)")
//     }]
//   };

//   // Export functionality
//   const exportCSV = () => {
//     const csvContent = [
//       ["Title", "Type", "Dates", "Metrics", "Revenue", "Status"],
//       ...items.map(item => [
//         `"${item.title}"`,
//         item.type.toUpperCase(),
//         item.type === "event" ?
//           `${formatDate(item.startDate)} - ${formatDate(item.endDate)}` :
//           formatDate(item.releaseDate),
//         item.type === "event" ?
//           `Attendees: ${item.attendees}/${item.capacity}` :
//           `Tickets: ${item.ticketsSold.toLocaleString()}/${item.totalSeats.toLocaleString()}`,
//         formatCurrency(item.revenue),
//         item.status
//       ])
//     ].map(e => e.join(",")).join("\n");

//     const blob = new Blob([csvContent], { type: "text/csv" });
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = `${activeSegment}-report.csv`;
//     a.click();
//   };

//   const exportPDF = async () => {
//     const pdf = new jsPDF("landscape");
//     const input = document.getElementById("report-content");
//     const canvas = await html2canvas(input, { scale: 2 });
//     const imgData = canvas.toDataURL("image/png");
//     const imgWidth = 280;
//     const imgHeight = (canvas.height * imgWidth) / canvas.width;

//     pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
//     pdf.save(`${activeSegment}-report.pdf`);
//   };

//   return (
//     <div className="container mx-auto px-4 py-6" id="report-content">
//       {/* Header Section */}
//       <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
//         <h2 className="text-2xl font-bold text-blue-600">
//           Combined Management Report
//         </h2>

//         {/* Controls */}
//         <div className="flex flex-col sm:flex-row gap-4">
//           <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
//             {["all", "events", "movies"].map((segment) => (
//               <button
//                 key={segment}
//                 onClick={() => setActiveSegment(segment)}
//                 className={`px-4 py-2 rounded-md text-sm capitalize ${
//                   activeSegment === segment
//                     ? "bg-blue-600 text-white"
//                     : "hover:bg-gray-200"
//                 }`}
//               >
//                 {segment}
//               </button>
//             ))}
//           </div>

//           <div className="flex gap-2">
//             <button
//               onClick={exportCSV}
//               className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
//             >
//               Export CSV
//             </button>
//             <button
//               onClick={exportPDF}
//               className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
//             >
//               Export PDF
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Summary Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
//         <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
//           <h3 className="text-gray-500 text-sm mb-1">Total {activeSegment === "all" ? "Items" : activeSegment}</h3>
//           <p className="text-2xl font-bold text-gray-900">
//             {totalStats.totalItems}
//           </p>
//         </div>

//         <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
//           <h3 className="text-gray-500 text-sm mb-1">Total Revenue</h3>
//           <p className="text-2xl font-bold text-green-600">
//             {formatCurrency(totalStats.totalRevenue)}
//           </p>
//         </div>

//         <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
//           <h3 className="text-gray-500 text-sm mb-1">
//             {activeSegment === "movies" ? "Tickets Sold" : "Attendees"}
//           </h3>
//           <p className="text-2xl font-bold text-gray-900">
//             {(activeSegment === "movies"
//               ? totalStats.totalTickets
//               : totalStats.totalAttendees
//             ).toLocaleString()}
//           </p>
//         </div>

//         <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
//           <h3 className="text-gray-500 text-sm mb-1">Active</h3>
//           <p className="text-2xl font-bold text-gray-900">
//             {totalStats.upcoming + totalStats.released}
//           </p>
//         </div>
//       </div>

//       {/* Charts Section */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
//         <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
//           <h3 className="text-gray-700 font-medium mb-4">Status Distribution</h3>
//           <div className="h-64">
//             <Pie
//               data={statusChartData}
//               options={{
//                 maintainAspectRatio: false,
//                 plugins: { legend: { position: "bottom" } }
//               }}
//             />
//           </div>
//         </div>

//         <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
//           <h3 className="text-gray-700 font-medium mb-4">Revenue Breakdown</h3>
//           <div className="h-64">
//             <Bar
//               data={revenueChartData}
//               options={{
//                 maintainAspectRatio: false,
//                 scales: { y: { beginAtZero: true } },
//                 plugins: { legend: { display: false } }
//               }}
//             />
//           </div>
//         </div>
//       </div>

//       {/* Data Table */}
//       <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
//                 {activeSegment === "all" && <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>}
//                 <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dates</th>
//                 <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Metrics</th>
//                 <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
//                 <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200">
//               {items.map(item => (
//                 <tr key={item.id} className="hover:bg-gray-50">
//                   <td className="px-4 py-3 font-medium text-gray-900 max-w-[200px] truncate">
//                     {item.title}
//                   </td>

//                   {activeSegment === "all" && (
//                     <td className="px-4 py-3 text-gray-500 capitalize">
//                       {item.type}
//                     </td>
//                   )}

//                   <td className="px-4 py-3 text-gray-500">
//                     {item.type === "event"
//                       ? `${formatDate(item.startDate)} - ${formatDate(item.endDate)}`
//                       : formatDate(item.releaseDate)}
//                   </td>

//                   <td className="px-4 py-3">
//                     <div className="flex items-center gap-2">
//                       <span className="text-sm">
//                         {item.type === "event"
//                           ? `${item.attendees}/${item.capacity}`
//                           : `${item.ticketsSold?.toLocaleString()}/${item?.totalSeats?.toLocaleString()}`}
//                       </span>
//                       <div className="w-20 bg-gray-200 rounded-full h-2">
//                         <div
//                           className={`h-2 rounded-full ${
//                             item.type === "event" ? "bg-blue-500" : "bg-orange-500"
//                           }`}
//                           style={{
//                             width: `${Math.round(
//                               (item.type === "event"
//                                 ? (item.attendees / item.capacity) * 100
//                                 : (item.ticketsSold / item.totalSeats) * 100
//                             ))}%`
//                           }}
//                         />
//                       </div>
//                     </div>
//                   </td>

//                   <td className="px-4 py-3 font-semibold text-green-600">
//                     {formatCurrency(item.revenue)}
//                   </td>

//                   <td className="px-4 py-3">
//                     <span className={`px-2 py-1 rounded-full text-xs font-medium ${
//                       item.status === "Upcoming" ? "bg-blue-100 text-blue-800" :
//                       item.status === "Completed" ? "bg-green-100 text-green-800" :
//                       item.status === "Released" ? "bg-purple-100 text-purple-800" :
//                       "bg-red-100 text-red-800"
//                     }`}>
//                       {item.status}
//                     </span>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CombinedReport;
