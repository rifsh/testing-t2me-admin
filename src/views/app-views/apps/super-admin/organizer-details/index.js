import React, { useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { Bar, Pie } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import { eventOrganizers, movieOrganizers } from "mock/data/reportData";
import { exportToPdf, exportToExcel } from "utils/exportUtils";

Chart.register(...registerables);

const OrganizerDetail = () => {
  const { organizerId } = useParams();
  const reportRef = useRef(null);

  const organizer = [...eventOrganizers, ...movieOrganizers].find(
    (org) => org.id === parseInt(organizerId)
  );

  if (!organizer) {
    return (
      <div className="container mx-auto px-4 py-6 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          Organizer not found
        </h2>
        <Link
          to="/super-admin/reports"
          className="text-blue-600 hover:underline"
        >
          Back to Reports
        </Link>
      </div>
    );
  }

  // Chart data - handles both event and movie organizers
  const itemsChartData = {
    labels:
      organizer.type === "event"
        ? organizer.eventsList?.map((event) => event.name)
        : organizer.moviesList?.map((movie) => movie.name),
    datasets: [
      {
        label: organizer.type === "event" ? "Event Revenue" : "Movie Revenue",
        data:
          organizer.type === "event"
            ? organizer.eventsList?.map((event) => event.revenue)
            : organizer.moviesList?.map((movie) => movie.revenue),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 2,
      },
    ],
  };

  const statusData = {
    labels: ["Active", "Inactive"],
    datasets: [
      {
        data: [
          organizer.status === "Active" ? 1 : 0,
          organizer.status === "Inactive" ? 1 : 0,
        ],
        backgroundColor: ["#198754", "#dc3545"],
      },
    ],
  };

  // Export handlers
  const handleExportPDF = async () => {
    exportToPdf(reportRef, "MyReport.pdf");
  };

  const handleExportCSV = () => {
    exportToExcel(reportRef, "MyReport.xlsx");
  };

  return (
    <div
      className="container mx-auto px-4 py-6"
      id="organizer-content"
      ref={reportRef}
    >
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <Link
            to="/super-admin/reports"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            &larr; Back to Organizers
          </Link>

          <div className="flex gap-2 ml-auto">
            {" "}
            <button
              onClick={handleExportCSV}
              className="px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
            >
              Export CSV
            </button>
            <button
              onClick={handleExportPDF}
              className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
            >
              Export PDF
            </button>
          </div>
        </div>
      </div>
      {/* Organizer Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8 border border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {organizer.name}
            </h1>
            <p className="text-gray-600 mt-2">{organizer.email}</p>
            <p className="text-gray-600">Phone: {organizer.phone}</p>
            <p className="text-gray-600 capitalize">
              Type: {organizer.type} Organizer
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Registered:{" "}
              {new Date(organizer.registrationDate).toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-600">
              Last Login: {new Date(organizer.lastLogin).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="text-gray-500 text-sm font-medium mb-2">
            Total {organizer.type === "event" ? "Events" : "Movies"}
          </h3>
          <p className="text-2xl font-bold">
            {organizer.type === "event" ? organizer.events : organizer.movies}
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="text-gray-500 text-sm font-medium mb-2">
            Total Revenue
          </h3>
          <p className="text-2xl font-bold text-green-600">
            ${organizer.revenue.toLocaleString()}
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="text-gray-500 text-sm font-medium mb-2">Status</h3>
          {organizer.status === "Active" ? (
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              Active
            </span>
          ) : (
            <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm">
              Inactive
            </span>
          )}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-gray-500 text-sm font-medium mb-4">
            {organizer.type === "event" ? "Event" : "Movie"} Revenue
          </h3>
          <div className="h-64">
            <Bar
              data={itemsChartData}
              options={{
                maintainAspectRatio: false,
                scales: { y: { beginAtZero: true } },
              }}
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-gray-500 text-sm font-medium mb-4">
            Status Distribution
          </h3>
          <div className="h-64">
            <Pie
              data={statusData}
              options={{
                maintainAspectRatio: false,
                plugins: { legend: { position: "bottom" } },
              }}
            />
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex justify-between items-center p-4 bg-gray-50">
          <h3 className="text-gray-700 font-medium">
            {organizer.type === "event" ? "Events" : "Movies"} List
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                  {organizer.type === "event" ? "Event" : "Movie"} Name
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                  {organizer.type === "event" ? "Date" : "Release Date"}
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                  Attendees
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                  Revenue
                </th>
                {organizer?.type === "movie" && (
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                    Showtimes
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {(organizer?.type === "event"
                ? organizer?.eventsList
                : organizer?.moviesList
              ).map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-4">
                    <Link
                      to={
                        organizer.type === "movie"
                          ? `${APP_PREFIX_PATH}/super-admin/organizer-details/movie-details/${item.id}`
                          : `${APP_PREFIX_PATH}/super-admin/organizer-details/event-details/${item.id}`
                      }
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {item.name}
                    </Link>
                  </td>

                  <td className="px-4 py-3 text-gray-500">
                    {new Date(
                      organizer.type === "event" ? item.date : item.releaseDate
                    ).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">{item.attendees}</td>
                  <td className="px-4 py-3 font-bold text-green-600">
                    ${item.revenue.toLocaleString()}
                  </td>
                  {organizer.type === "movie" && (
                    <td className="px-4 py-3 text-gray-500">
                      {item.showtimes.join(", ")}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrganizerDetail;
