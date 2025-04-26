

import React from "react";
import { Bar, Pie, Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

const OrganizerReports = () => {
  const scheduledEvents = [
    {
      id: 1,
      title: "Tech Conference 2025",
      image:
        "https://media.licdn.com/dms/image/v2/C561BAQE-51J-8KkMZg/company-background_10000/company-background_10000/0/1584559866970/eventscom_cover?e=2147483647&v=beta&t=3bktbE7ts5aNwH8XEUM5rW0G2aMbuQ1b2dHBVQgZqmA",
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
      image:
        "https://mediaim.expedia.com/destination/9/cd8a3f3db7149b0ce36d052aea1182df.jpg",
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
      image:
        "https://s7ap1.scene7.com/is/image/incredibleindia/india-gate-delhi-1-attr-hero?qlt=82&ts=1727351922349",
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
      image:
        "https://aurifer.tax/wp-content/uploads/2023/03/1295CA28-51B0-4890-B288-7E2B6ABCA328.jpeg",
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
      image:
        "https://media.licdn.com/dms/image/v2/C561BAQE-51J-8KkMZg/company-background_10000/company-background_10000/0/1584559866970/eventscom_cover?e=2147483647&v=beta&t=3bktbE7ts5aNwH8XEUM5rW0G2aMbuQ1b2dHBVQgZqmA",
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
    <div className="container mx-auto px-4 py-6">
      <h2 className="text-2xl font-bold text-blue-600 mb-6">
        Good Morning Suresh Kumar
      </h2>

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
                    <div className="text-sm font-medium text-gray-900">
                      {event.title}
                    </div>
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
