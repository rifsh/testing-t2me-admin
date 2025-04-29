import React from "react";
import { Link } from "react-router-dom";
import { Bar, Pie } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import previewImage from "assets/preview/thudarum-1.jpg";
import { APP_PREFIX_PATH } from "configs/AppConfig";

Chart.register(...registerables);

const MovieDetail = () => {
  // Mock data - replace with API call
  const movie = {
    id: 1,
    title: "Galactic Wars: New Dawn",
    image: previewImage,
    description:
      "Epic space adventure following the rebellion against the galactic empire in a distant future.",
    releaseDate: "2025-05-20",
    duration: "142 min",
    genre: "Sci-Fi, Action",
    director: "Alex Johnson",
    status: "Released",
    rating: "PG-13",
    ticketsSold: 125000,
    totalSeats: 150000,
    revenue: 3750000,
    showTimes: [
      { theater: "Cinema City", time: "10:00 AM", seatsAvailable: 45 },
      { theater: "Cinema City", time: "01:30 PM", seatsAvailable: 12 },
      { theater: "MegaPlex", time: "04:00 PM", seatsAvailable: 78 },
      { theater: "MegaPlex", time: "07:30 PM", seatsAvailable: 23 },
      { theater: "Starlight Theater", time: "09:45 PM", seatsAvailable: 56 },
    ],
    ticketTypes: [
      { name: "Standard", price: 12, sold: 80000 },
      { name: "Premium", price: 18, sold: 35000 },
      { name: "VIP", price: 25, sold: 10000 },
    ],
  };

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
    labels: movie.ticketTypes.map((t) => t.name),
    datasets: [
      {
        data: movie.ticketTypes.map((t) => t.sold),
        backgroundColor: ["#0dcaf0", "#198754", "#dc3545"],
        borderWidth: 1,
      },
    ],
  };

  const revenueData = {
    labels: movie.ticketTypes.map((t) => t.name),
    datasets: [
      {
        label: "Revenue ($)",
        data: movie.ticketTypes.map((t) => t.price * t.sold),
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
            src={movie.image}
            alt={movie.title}
            className="w-full md:w-2/5 h-64 object-cover rounded-lg"
          />
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {movie.title}
            </h1>
            <p className="text-gray-600 mb-4">{movie.description}</p>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-sm text-gray-500">Director</div>
                <div className="font-medium">{movie.director}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Status</div>
                <div>{getStatusBadge(movie.status)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Release Date</div>
                <div className="font-medium">
                  {formatDate(movie.releaseDate)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Genre</div>
                <div className="font-medium">{movie.genre}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Duration</div>
                <div className="font-medium">{movie.duration}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Rating</div>
                <div className="font-medium">{movie.rating}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Ticket Sales</div>
            <div className="text-2xl font-bold">
              {movie.ticketsSold.toLocaleString()}/
              {movie.totalSeats.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">
              ({Math.round((movie.ticketsSold / movie.totalSeats) * 100)}% sold)
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Total Revenue</div>
            <div className="text-2xl font-bold text-green-600">
              ${movie.revenue.toLocaleString()}
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Ticket Types</div>
            <div className="text-2xl font-bold">{movie.ticketTypes.length}</div>
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
                {movie.showTimes.map((show, index) => (
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
