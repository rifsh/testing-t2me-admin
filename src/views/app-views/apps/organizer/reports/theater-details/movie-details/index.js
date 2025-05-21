import React, { useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Bar, Pie } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import { exportToExcel, exportToPdf } from "utils/exportUtils";
import { useDispatch, useSelector } from "react-redux";
import { fetchMovieDetails } from "store/slices/reportSlice";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import { Spin } from "antd";

Chart.register(...registerables);

const MovieDetail = () => {
  const { movieId, theaterId } = useParams();
  const navigate = useNavigate();
  const reportRef = useRef(null);
  const dispatch = useDispatch();

  const { data, loading, error } = useSelector(
    (state) => state.report.movieDetails
  );
  const movieData = data?.[0];
  const movie = movieData?.movie;
  const theatre = movieData?.theatre;

  useEffect(() => {
    if (movieId && theaterId) {
      dispatch(fetchMovieDetails({ movieId, theaterId }));
    }
  }, [dispatch, movieId, theaterId]);

  // Error handling
  if (!theaterId) {
    return (
      <div className="container mx-auto px-4 py-6 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          Theater ID missing
        </h2>
        <Link
          to={`${APP_PREFIX_PATH}/super-admin/movie-organizer`}
          className="text-blue-600 hover:underline"
        >
          Back to Theaters
        </Link>
      </div>
    );
  }

  if (error)
    return (
      <div className="container mx-auto px-4 py-6 text-center text-red-600">
        Error: {error}
      </div>
    );
  if (!movie)
    return (
      <div className="container mx-auto px-4 py-6 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          Movie not found
        </h2>
        <Link
          to={`${APP_PREFIX_PATH}/super-admin/movie-organizer`}
          className="text-blue-600 hover:underline"
        >
          Back to Movies
        </Link>
      </div>
    );

  // Helper functions
  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const remaining = minutes % 60;
    return `${hours}h ${remaining}m`;
  };

  const formatShowtime = (startTime, endTime, movieDate) => {
    const options = { hour: "numeric", minute: "2-digit", hour12: true };
    const start = new Date(`${movieDate}T${startTime}`).toLocaleTimeString(
      "en-US",
      options
    );
    const end = new Date(`${movieDate}T${endTime}`).toLocaleTimeString(
      "en-US",
      options
    );
    return `${start} - ${end}`;
  };

  // Calculate statistics
  const calculateStats = () => {
    return movie.schedules.reduce(
      (acc, schedule) => ({
        totalAttendees: (acc.totalAttendees || 0) + schedule.seats_sold,
        totalCapacity: (acc.totalCapacity || 0) + schedule.total_seats,
        totalRevenue:
          (acc.totalRevenue || 0) + schedule.seats_sold * schedule.price,
        totalShows: (acc.totalShows || 0) + 1,
      }),
      {}
    );
  };

  const stats = calculateStats();
  const occupancyRate =
    stats.totalCapacity > 0
      ? Math.round((stats.totalAttendees / stats.totalCapacity) * 100)
      : 0;

  // Chart data
  const showtimeSalesData = {
    labels: movie.schedules.map((_, index) => `Show ${index + 1}`),
    datasets: [
      {
        data: movie.schedules.map((s) => s.seats_sold),
        backgroundColor: ["#6366f1", "#10b981", "#3b82f6"],
        hoverOffset: 4,
      },
    ],
  };

  const revenueData = {
    labels: movie.schedules.map((_, index) => `Show ${index + 1}`),
    datasets: [
      {
        label: "Revenue (₹)",
        data: movie.schedules.map((s) => s.seats_sold * s.price),
        backgroundColor: "#3b82f6",
        borderWidth: 1,
      },
    ],
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

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
            src={movie?.thumbnail_image}
            alt={movie?.title}
            className="w-full md:w-1/2 h-64 object-cover rounded-lg"
            onError={(e) => (e.target.src = "/fallback-image.jpg")}
          />
          <div className="w-full md:w-1/2">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {movie?.title}
            </h1>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600">Runtime</p>
                <p className="font-medium">{formatDuration(movie?.runtime)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Theater</p>
                <p className="font-medium">{theatre?.name || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Shows</p>
                <p className="font-medium">{stats?.totalShows}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="font-medium text-green-600">
                  {stats?.totalRevenue || 0}
                </p>
              </div>
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
              {stats?.totalAttendees || 0}/{stats?.totalCapacity || 0}
            </p>
            <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {occupancyRate}%
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="text-gray-500 text-sm font-medium mb-2">
            Average Price
          </h3>
          <p className="text-2xl font-bold text-purple-600">
            {movie?.schedules?.reduce((sum, s) => sum + s.price, 0) /
              movie?.schedules?.length || 0}
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="text-gray-500 text-sm font-medium mb-2">Screens</h3>
          <p className="text-2xl font-bold">
            {new Set(movie?.schedules.map((s) => s.screen_number)).size}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-gray-500 text-sm font-medium mb-4">
            Seats Sold per Show
          </h3>
          <div className="h-64">
            <Pie
              data={showtimeSalesData}
              options={{
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: "bottom" },
                },
              }}
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-gray-500 text-sm font-medium mb-4">
            Revenue per Show (₹)
          </h3>
          <div className="h-64">
            <Bar
              data={revenueData}
              options={{
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: (value) => `₹${value.toLocaleString()}`,
                    },
                  },
                },
                plugins: {
                  legend: { display: false },
                },
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
              onClick={() =>
                exportToExcel(reportRef, `${movie?.title}_Report.xlsx`)
              }
              className="px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
            >
              Export Excel
            </button>
            <button
              onClick={() =>
                exportToPdf(reportRef, `${movie?.title}_Report.pdf`)
              }
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
                  Date
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                  Time
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                  Screen
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                  Price (₹)
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                  Sold
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                  Capacity
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                  Revenue (₹)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {movie.schedules.map((schedule, index) => {
                const revenue = schedule.seats_sold * (schedule.price || 0);
                return (
                  <tr key={index}>
                    <td className="px-4 py-3">
                      {new Date(schedule.movie_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      {formatShowtime(
                        schedule.start_time,
                        schedule.end_time,
                        schedule.movie_date
                      )}
                    </td>
                    <td className="px-4 py-3">{schedule.screen_name}</td>
                    <td className="px-4 py-3">
                      {schedule.price ? `₹${schedule.price.toFixed(2)}` : "N/A"}
                    </td>
                    <td className="px-4 py-3">{schedule.seats_sold}</td>
                    <td className="px-4 py-3">{schedule.total_seats}</td>
                    <td className="px-4 py-3 font-medium text-green-600">
                      ₹{(revenue || 0).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MovieDetail;
