import React, { useRef } from "react";
import { Bar, Pie, Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import previewImage from "assets/preview/thudarum-1.jpg";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import ScheduledMovies from "views/schedule/movie/components/ScheduledMovies";
Chart.register(...registerables);

const MovieOrganizerReports = () => {
  const reportRef = useRef(null);

  const movies = [
    {
      id: 1,
      title: "Annyeshippin Kandethuvin",
      image: previewImage,
      releaseDate: "2025-05-20",
      status: "Released",
      lastUpdated: "2025-04-10",
      ticketsSold: 125000,
      totalSeats: 150000,
      boxOfficeRevenue: 3750000,
    },
    {
      id: 2,
      title: "Kumbalangi Nights",
      image: previewImage,
      releaseDate: "2025-03-10",
      status: "Completed",
      lastUpdated: "2025-03-05",
      ticketsSold: 98000,
      totalSeats: 120000,
      boxOfficeRevenue: 2940000,
    },
    {
      id: 3,
      title: "Kaduva",
      image: previewImage,
      releaseDate: "2025-04-18",
      status: "Upcoming",
      lastUpdated: "2025-04-12",
      ticketsSold: 45000,
      totalSeats: 100000,
      boxOfficeRevenue: 1350000,
    },
    {
      id: 4,
      title: "Super Sharanya",
      image: previewImage,
      releaseDate: "2025-02-01",
      status: "Cancelled",
      lastUpdated: "2025-01-25",
      ticketsSold: 0,
      totalSeats: 80000,
      boxOfficeRevenue: 0,
    },
    {
      id: 5,
      title: "Thudarum",
      image: previewImage,
      releaseDate: "2025-06-15",
      status: "Upcoming",
      lastUpdated: "2025-04-14",
      ticketsSold: 65000,
      totalSeats: 200000,
      boxOfficeRevenue: 1950000,
    },
  ];

  // Calculate statistics
  const totalStats = {
    totalMovies: movies.length,
    upcoming: movies.filter((m) => m.status === "Upcoming").length,
    released: movies.filter((m) => m.status === "Released").length,
    cancelled: movies.filter((m) => m.status === "Cancelled").length,
    totalRevenue: movies.reduce(
      (sum, movie) => sum + movie.boxOfficeRevenue,
      0
    ),
    totalTickets: movies.reduce((sum, movie) => sum + movie.ticketsSold, 0),
    avgOccupancy: Math.round(
      movies.reduce(
        (sum, movie) => sum + (movie.ticketsSold / movie.totalSeats) * 100,
        0
      ) / movies.length
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
      case "Released":
        return (
          <span className={`${baseClasses} bg-green-100 text-green-800`}>
            Released
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

  // Chart data
  const statusChartData = {
    labels: ["Upcoming", "Released", "Cancelled"],
    datasets: [
      {
        data: [totalStats.upcoming, totalStats.released, totalStats.cancelled],
        backgroundColor: ["#0dcaf0", "#198754", "#dc3545"],
        borderWidth: 1,
      },
    ],
  };

  const revenueChartData = {
    labels: movies.map((movie) => movie.title),
    datasets: [
      {
        label: "Box Office Revenue ($)",
        data: movies.map((movie) => movie.boxOfficeRevenue),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 2,
      },
    ],
  };

  const occupancyChartData = {
    labels: movies.map((movie) => movie.title),
    datasets: [
      {
        label: "Seat Occupancy Rate (%)",
        data: movies.map((movie) =>
          Math.round((movie.ticketsSold / movie.totalSeats) * 100)
        ),
        backgroundColor: "rgba(153, 102, 255, 0.6)",
        borderColor: "rgba(153, 102, 255, 1)",
        borderWidth: 2,
        tension: 0.3,
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
      ...ScheduledMovies.map((event) => [
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

  return (
    <div className="container mx-auto px-4 py-6" ref={reportRef}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-blue-600">Movie Reports</h2>
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

      {/* Movies Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Poster
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Movie
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Release Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Occupancy
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
              {movies.map((movie) => (
                <tr key={movie.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center justify-center">
                      <img
                        src={movie.image}
                        alt={movie.title}
                        className="w-12 h-12 rounded object-cover border-2 border-gray-100"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {movie.title}
                    </div>
                    <div className="text-sm text-gray-500">
                      Updated: {formatDate(movie.lastUpdated)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(movie.releaseDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="mr-2 text-sm text-gray-500">
                        {movie.ticketsSold.toLocaleString()}/
                        {movie.totalSeats.toLocaleString()}
                      </div>
                      <div className="w-20 bg-gray-200 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${
                            movie.status === "Cancelled"
                              ? "bg-red-500"
                              : "bg-blue-500"
                          }`}
                          style={{
                            width: `${
                              (movie.ticketsSold / movie.totalSeats) * 100
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                    ${movie.boxOfficeRevenue.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(movie.status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Movies */}
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
                d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
              />
            </svg>
          </div>
          <h3 className="text-gray-500 text-sm font-medium mb-1">
            Total Movies
          </h3>
          <p className="text-2xl font-bold text-gray-900">
            {totalStats.totalMovies}
          </p>
          <p className="text-xs text-gray-400">Currently managing</p>
        </div>

        {/* Total Tickets Sold */}
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
                d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
              />
            </svg>
          </div>
          <h3 className="text-gray-500 text-sm font-medium mb-1">
            Tickets Sold
          </h3>
          <p className="text-2xl font-bold text-gray-900">
            {totalStats.totalTickets.toLocaleString()}
          </p>
          <p className="text-xs text-gray-400">Total admissions</p>
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
          <p className="text-xs text-gray-400">Box office earnings</p>
        </div>

        {/* Avg Occupancy */}
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
            Avg Occupancy
          </h3>
          <p className="text-2xl font-bold text-gray-900">
            {totalStats.avgOccupancy}%
          </p>
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
            <div
              className="bg-yellow-500 h-1.5 rounded-full"
              style={{ width: `${totalStats.avgOccupancy}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Movie Status Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-gray-500 text-sm font-medium mb-3">
            Movie Status Distribution
          </h3>
          <div className="h-64">
            <Pie
              data={statusChartData}
              options={{
                maintainAspectRatio: false,
                plugins: { legend: { position: "bottom" } },
              }}
            />
          </div>
        </div>

        {/* Box Office Performance */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-gray-500 text-sm font-medium mb-3">
            Box Office Performance
          </h3>
          <div className="h-64">
            <Bar
              data={revenueChartData}
              options={{
                maintainAspectRatio: false,
                scales: { y: { beginAtZero: true } },
              }}
            />
          </div>
        </div>

        {/* Seat Occupancy Rates */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-gray-500 text-sm font-medium mb-3">
            Seat Occupancy Rates
          </h3>
          <div className="h-64">
            <Line
              data={occupancyChartData}
              options={{
                maintainAspectRatio: false,
                scales: { y: { beginAtZero: true, max: 100 } },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieOrganizerReports;
  