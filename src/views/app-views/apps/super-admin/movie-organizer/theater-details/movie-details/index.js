import React, { useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Bar, Pie } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import { exportToExcel, exportToPdf } from "utils/exportUtils";
import { useDispatch, useSelector } from "react-redux";
import { fetchMovieDetails } from "store/slices/reportSlice";
import { APP_PREFIX_PATH } from "configs/AppConfig";

Chart.register(...registerables);

const MovieDetail = () => {
  const { movieId, theaterId } = useParams();
  const navigate = useNavigate();
  const reportRef = useRef(null);
  const dispatch = useDispatch();

  const { data, loading, error } = useSelector((state) => state.report.movieDetails);
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

  if (loading) return <div className="container mx-auto px-4 py-6 text-center">Loading...</div>;
  if (error) return <div className="container mx-auto px-4 py-6 text-center text-red-600">Error: {error}</div>;
  if (!movie) return (
    <div className="container mx-auto px-4 py-6 text-center">
      <h2 className="text-2xl font-bold text-red-600 mb-4">Movie not found</h2>
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

  // Direct data access for rendering (no unnecessary calculated values)
  const schedules = movie.schedules || [];

  // Since schedules is empty, create placeholders for the UI
  const noSchedulesMessage = "No showtime data available";
  
  // Placeholder data for when schedules are empty
  const showtimeSalesData = {
    labels: ["No Data"],
    datasets: [{
      data: [1],
      backgroundColor: ["#e5e7eb"]
    }]
  };

  const revenueData = {
    labels: ["No Data"],
    datasets: [{
      label: "Revenue per Showtime Type",
      data: [0],
      backgroundColor: "#e5e7eb"
    }]
  };

  // Stats for display (with safe defaults)
  const totalAttendees = 0;
  const totalCapacity = 0;
  const occupancyRate = 0;
  const totalRevenue = 0;

  // Export handlers
  const handleExportPDF = () => exportToPdf(reportRef, "MovieReport.pdf");
  const handleExportCSV = () => exportToExcel(reportRef, "MovieReport.xlsx");

  return (
    <div className="container mx-auto px-4 py-6" id="movie-content" ref={reportRef}>
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
            src={movie.thumbnail_image}
            alt={movie.title}
            className="w-full md:w-1/2 h-64 object-cover rounded-lg"
          />
          <div className="w-full md:w-1/2">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{movie.title}</h1>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600">Runtime</p>
                <p className="font-medium">{formatDuration(movie.runtime)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Theater</p>
                <p className="font-medium">{theatre?.name || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Shows</p>
                <p className="font-medium">{schedules.length}</p>
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
            <p className="text-2xl font-bold">{totalAttendees}/{totalCapacity}</p>
            <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {occupancyRate}%
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="text-gray-500 text-sm font-medium mb-2">Total Revenue</h3>
          <p className="text-2xl font-bold text-green-600">
            ${totalRevenue.toLocaleString()}
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="text-gray-500 text-sm font-medium mb-2">Status</h3>
          <div className="flex justify-center items-center h-full">
            <p className="text-gray-500 italic">{noSchedulesMessage}</p>
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
              className="px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 disabled:opacity-50"
              disabled={schedules.length === 0}
            >
              Export CSV
            </button>
            <button
              onClick={handleExportPDF}
              className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
              disabled={schedules.length === 0}
            >
              Export PDF
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          {schedules.length > 0 ? (
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Time</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Price</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Sold</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Capacity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {schedules.map((schedule, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {new Date(schedule.start_time).toLocaleTimeString()}
                    </td>
                    <td className="px-4 py-3">{schedule.type}</td>
                    <td className="px-4 py-3">${schedule.price}</td>
                    <td className="px-4 py-3">{schedule.seats_sold}</td>
                    <td className="px-4 py-3">{schedule.total_seats}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-gray-500 italic">
              No showtime data available for this movie. Schedules may need to be created.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieDetail;