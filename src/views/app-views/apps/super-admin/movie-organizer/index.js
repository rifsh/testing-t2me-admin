import React, { useRef, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Bar, Pie } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import { exportToPdf, exportToExcel } from "utils/exportUtils";
import { useDispatch, useSelector } from "react-redux";
import { fetchMovieUserDetails } from "store/slices/reportSlice";
import { Spin, Alert } from "antd";

Chart.register(...registerables);

const MovieOrganizerDetail = () => {
  const reportRef = useRef(null);
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector(
    (state) => state.report.movieUserDetails
  );
  const { organizerId } = useParams();

  useEffect(() => {
    if (organizerId) {
      dispatch(fetchMovieUserDetails(organizerId));
    }
  }, [dispatch, organizerId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <Alert message="Error" description={error} type="error" showIcon />
      </div>
    );
  }

  if (!data || !data[0]) {
    return null;
  }

  const organizer = data[0]; // Access the first item in the array

  // Transform API data to match your component structure
  const organizerData = {
    username: organizer.username || "N/A",
    email: organizer.email || "N/A",
    is_active: organizer.is_active || false,
    total_theaters: organizer.total_theaters || 0,
    total_movies: organizer.total_movies || 0,
    total_revenue: organizer.total_revenue || 0,
    theaters:
      organizer.theaters?.map((theater) => ({
        id: theater.theater_id,
        name: theater.theater_name,
        company_name: theater.company_name,
        screen_count: theater.screens_count,
        movies_count: theater.movies_count,
        is_active: theater.is_active, // Assuming this exists in your theater object
      })) || [],
  };

  // Bar chart data - Screens per Theater
  const theatersChartData = {
    labels: organizerData.theaters.map((theater) => theater.name),
    datasets: [
      {
        label: "Screen Count",
        data: organizerData.theaters.map((theater) => theater.screen_count),
        backgroundColor: "rgba(79, 70, 229, 0.6)",
        borderColor: "rgba(79, 70, 229, 1)",
        borderWidth: 2,
      },
    ],
  };

  // Pie chart data - Theater Status (assuming you have is_active in theater data)
  const statusData = {
    labels: ["Active", "Inactive"],
    datasets: [
      {
        data: [
          organizerData.theaters.filter((t) => t.is_active).length,
          organizerData.theaters.filter((t) => !t.is_active).length,
        ],
        backgroundColor: ["#3B82F6", "#9CA3AF"],
      },
    ],
  };

  // Bar chart data - Movies per Theater
  const moviesChartData = {
    labels: organizerData.theaters.map((theater) => theater.name),
    datasets: [
      {
        label: "Movies Count",
        data: organizerData.theaters.map((theater) => theater.movies_count),
        backgroundColor: "rgba(34, 197, 94, 0.6)",
        borderColor: "rgba(34, 197, 94, 1)",
        borderWidth: 2,
      },
    ],
  };

  const handleExportPdf = () => {
    exportToPdf(reportRef, "MovieOrganizerTheaters.pdf");
  };

  const handleExportCsv = () => {
    exportToExcel(reportRef, "MovieOrganizerTheaters.xlsx");
  };

  return (
    <div className="p-8" ref={reportRef}>
      {/* Header with Export Buttons */}
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          Movie Organizer: {organizerData.username}
        </h1>
        <div className="flex gap-4">
          <button
            onClick={handleExportCsv}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Export CSV
          </button>
          <button
            onClick={handleExportPdf}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Export PDF
          </button>
        </div>
      </div>

      {/* Organizer Info */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h3 className="text-gray-500 text-sm font-medium">Email</h3>
            <p>{organizerData.email}</p>
          </div>
          <div>
            <h3 className="text-gray-500 text-sm font-medium">Status</h3>
            <span
              className={`px-3 py-1 rounded-md text-sm ${
                organizerData.is_active
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {organizerData.is_active ? "Active" : "Inactive"}
            </span>
          </div>
          <div>
            <h3 className="text-gray-500 text-sm font-medium">Total Revenue</h3>
            <p>${organizerData.total_revenue || 0}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="text-gray-500 text-sm font-medium mb-2">
            Total Theaters
          </h3>
          <p className="text-2xl font-bold">{organizerData.total_theaters}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="text-gray-500 text-sm font-medium mb-2">
            Total Movies
          </h3>
          <p className="text-2xl font-bold">{organizerData.total_movies}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="text-gray-500 text-sm font-medium mb-2">
            Active Theaters
          </h3>
          <p className="text-2xl font-bold text-green-600">
            {organizerData.theaters.filter((t) => t.is_active).length}
          </p>
        </div>
      </div>

      {/* Charts - 3 columns for better layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-gray-500 text-sm font-medium mb-4">
            Screens per Theater
          </h3>
          <div className="h-64">
            <Bar
              data={theatersChartData}
              options={{
                maintainAspectRatio: false,
                scales: { y: { beginAtZero: true } },
              }}
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-gray-500 text-sm font-medium mb-4">
            Movies per Theater
          </h3>
          <div className="h-64">
            <Bar
              data={moviesChartData}
              options={{
                maintainAspectRatio: false,
                scales: { y: { beginAtZero: true } },
              }}
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-gray-500 text-sm font-medium mb-4">
            Theater Status
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

      {/* Theater Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 bg-gray-50">
          <h3 className="text-gray-700 font-medium">Theaters List</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                  Theater Name
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                  Company
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                  Screens
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                  Movies
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {organizerData.theaters.map((theater) => (
                <tr key={theater.id}>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {theater.name}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {theater.company_name}
                  </td>
                  <td className="px-4 py-3">{theater.screen_count}</td>
                  <td className="px-4 py-3">{theater.movies_count}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        theater.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {theater.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      to={`${APP_PREFIX_PATH}/movie-organizer/theater-details/1`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MovieOrganizerDetail;
