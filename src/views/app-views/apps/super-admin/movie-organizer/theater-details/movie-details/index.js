import React, { useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Bar, Pie } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import { movies } from "mock/data/reportData";
import { exportToExcel, exportToPdf } from "utils/exportUtils";

Chart.register(...registerables);

const MovieDetail = () => {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const reportRef = useRef(null);

  const movie = movies.find((m) => m.id === parseInt(movieId));

  if (!movie) {
    return (
      <div className="container mx-auto px-4 py-6 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          Movie not found
        </h2>
        <Link
          to="/super-admin/movie-details"
          className="text-blue-600 hover:underline"
        >
          Back to Movies
        </Link>
      </div>
    );
  }

  // Chart data
  const showtimeSalesData = {
    labels: movie.showtimes.map((s) => s.type),
    datasets: [
      {
        data: movie.showtimes.map((s) => s.sold),
        backgroundColor: ["#0dcaf0", "#198754", "#ffc107"],
      },
    ],
  };

  const revenueData = {
    labels: movie.showtimes.map((s) => s.type),
    datasets: [
      {
        label: "Revenue per Showtime",
        data: movie.showtimes.map((s) => s.price * s.sold),
        backgroundColor: "#4c51bf",
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
      id="movie-content"
      ref={reportRef}
    >
      <div className="mb-6">
        <span
          onClick={() => navigate(-1)}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium cursor-pointer"
        >
          &larr; Back to Movies
        </span>
      </div>

      {/* Movie Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8 border border-gray-200">
        <div className="flex flex-col md:flex-row gap-8">
          <img
            src={movie.image}
            alt={movie.title}
            className="w-full md:w-1/2 h-64 object-cover rounded-lg"
          />
          <div className="w-full md:w-1/2">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {movie.title}
            </h1>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600">Release Date</p>
                <p className="font-medium">
                  {new Date(movie.releaseDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Duration</p>
                <p className="font-medium">{movie.duration}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Genre</p>
                <p className="font-medium">{movie.genre}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="font-medium capitalize">{movie.status}</p>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-600">{movie.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="text-gray-500 text-sm font-medium mb-2">Attendance</h3>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold">
              {movie.attendees}/{movie.capacity}
            </p>
            <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {Math.round((movie.attendees / movie.capacity) * 100)}%
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="text-gray-500 text-sm font-medium mb-2">
            Total Revenue
          </h3>
          <p className="text-2xl font-bold text-green-600">
            ${movie.revenue.toLocaleString()}
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="text-gray-500 text-sm font-medium mb-2">
            Showtime Sales
          </h3>
          <div className="flex justify-between items-center">
            {movie.showtimes.map((showtime, index) => (
              <div key={index} className="text-center">
                <p className="text-sm text-gray-600">{showtime.type}</p>
                <p className="font-medium">{showtime.sold}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-gray-500 text-sm font-medium mb-4">
            Showtime Sales Distribution
          </h3>
          <div className="h-64">
            <Pie
              data={showtimeSalesData}
              options={{ maintainAspectRatio: false }}
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-gray-500 text-sm font-medium mb-4">
            Revenue Breakdown
          </h3>
          <div className="h-64">
            <Bar
              data={revenueData}
              options={{
                maintainAspectRatio: false,
                scales: { y: { beginAtZero: true } },
              }}
            />
          </div>
        </div>
      </div>

      {/* Showtimes Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex justify-between items-center p-4 bg-gray-50">
          <h3 className="text-gray-700 font-medium">Showtime Details</h3>
          <div className="flex gap-2">
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
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                  Time
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                  Price
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                  Sold
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                  Remaining
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {movie.showtimes.map((showtime, index) => (
                <tr key={index}>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {showtime.time}
                  </td>
                  <td className="px-4 py-3">{showtime.type}</td>
                  <td className="px-4 py-3">${showtime.price}</td>
                  <td className="px-4 py-3">{showtime.sold}</td>
                  <td className="px-4 py-3">
                    {movie.capacity - showtime.sold}
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

export default MovieDetail;
