import React from "react";
import { Link } from "react-router-dom";
import { Bar, Pie } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import { movieDetail } from "mock/data/reportData";

Chart.register(...registerables);

const MovieDetail = () => {
  const getStatusBadge = (status) => {
    const baseClasses = "px-3 py-1 rounded-md text-sm font-medium";
    switch (status) {
      case "Released":
        return (
          <span className={`${baseClasses} bg-green-100 text-green-800`}>
            Released
          </span>
        );
      case "Upcoming":
        return (
          <span className={`${baseClasses} bg-blue-100 text-blue-800`}>
            Upcoming
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
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Chart data
  const ticketSalesData = {
    labels: movieDetail.ticketTypes.map((t) => t.name),
    datasets: [
      {
        data: movieDetail.ticketTypes.map((t) => t.sold),
        backgroundColor: ["#0dcaf0", "#198754", "#dc3545"],
        borderWidth: 1,
      },
    ],
  };

  const revenueData = {
    labels: movieDetail.ticketTypes.map((t) => t.name),
    datasets: [
      {
        label: "Revenue ($)",
        data: movieDetail.ticketTypes.map((t) => t.price * t.sold),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <Link
          to={`${APP_PREFIX_PATH}/organizer/reports`}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          &larr; Back to Movies
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        {/* Movie Header */}
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <img
            src={movieDetail.image}
            alt={movieDetail.title}
            className="w-full md:w-2/5 h-64 object-cover rounded-lg"
          />
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {movieDetail.title}
            </h1>
            <p className="text-gray-600 mb-4">{movieDetail.description}</p>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-sm text-gray-500">Director</div>
                <div className="font-medium">{movieDetail.director}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Status</div>
                <div>{getStatusBadge(movieDetail.status)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Release Date</div>
                <div className="font-medium">
                  {formatDate(movieDetail.releaseDate)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Genre</div>
                <div className="font-medium">{movieDetail.genre}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Duration</div>
                <div className="font-medium">{movieDetail.duration}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Rating</div>
                <div className="font-medium">{movieDetail.rating}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Ticket Sales</div>
            <div className="text-2xl font-bold">
              {movieDetail.ticketsSold.toLocaleString()}/
              {movieDetail.totalSeats.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">
              (
              {Math.round(
                (movieDetail.ticketsSold / movieDetail.totalSeats) * 100
              )}
              % sold)
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Total Revenue</div>
            <div className="text-2xl font-bold text-green-600">
              ${movieDetail.revenue.toLocaleString()}
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Ticket Types</div>
            <div className="text-2xl font-bold">
              {movieDetail.ticketTypes.length}
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium mb-4">
              Ticket Sales Distribution
            </h3>
            <div className="h-64">
              <Pie
                data={ticketSalesData}
                options={{
                  maintainAspectRatio: false,
                  plugins: { legend: { position: "bottom" } },
                }}
              />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium mb-4">Revenue by Ticket Type</h3>
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

        {/* Show Times */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium mb-4">Show Times</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Theater
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Seats Available
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {movieDetail.showTimes.map((show, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {show.theater}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {show.time}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {show.seatsAvailable}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          show.seatsAvailable > 20
                            ? "bg-green-100 text-green-800"
                            : show.seatsAvailable > 0
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {show.seatsAvailable > 20
                          ? "Available"
                          : show.seatsAvailable > 0
                          ? "Limited"
                          : "Sold Out"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetail;
