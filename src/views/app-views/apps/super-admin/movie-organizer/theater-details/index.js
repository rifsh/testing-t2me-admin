import React, { useEffect, useRef } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { Bar } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import { exportToPdf, exportToExcel } from "utils/exportUtils";
import { useDispatch, useSelector } from "react-redux";
import { fetchTheaterDetails } from "store/slices/reportSlice";
import { Alert, Spin } from "antd";

Chart.register(...registerables);

const TheaterDetail = () => {
  const reportRef = useRef(null);
  const { theaterId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    data: theater,
    loading,
    error,
  } = useSelector((state) => state.report.theaterDetails);
  const theaterData = theater?.[0];

  useEffect(() => {
    if (theaterId) {
      dispatch(fetchTheaterDetails(theaterId));
    }
  }, [dispatch, theaterId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }
  // Generate genre distribution data for chart
  const genreDistribution = theaterData?.movies?.reduce((acc, movie) => {
    acc[movie.genre] = (acc[movie.genre] || 0) + 1;
    return acc;
  }, {});

  // Chart data configuration
  const chartData = {
    labels: genreDistribution ? Object.keys(genreDistribution) : [],
    datasets: [
      {
        label: "Movies by Genre",
        data: genreDistribution ? Object.values(genreDistribution) : [],
        backgroundColor: [
          "#6366f1",
          "#10b981",
          "#3b82f6",
          "#f59e0b",
          "#ef4444",
        ],
        borderWidth: 1,
      },
    ],
  };

  const handleExportPdf = () => {
    exportToPdf(reportRef, `Theater_${theaterData?.name}.pdf`);
  };

  const handleExportExcel = () => {
    exportToExcel(reportRef, `Theater_${theaterData?.name}.xlsx`);
  };

  if (loading) return <Spin />;
  if (error) return <Alert message={error} />;
  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen" ref={reportRef}>
      {/* Header Section */}
      <div className="mb-8">
        <button
          onClick={handleGoBack}
          className="flex items-center text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200 mb-4"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Organizers
        </button>

        {/* Hero Section */}
        <div className="flex h-80 w-full bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300 border border-gray-100">
          {/* Left: Image Section */}
          {theaterData?.thumbnail_image && (
            <div className="w-3/5 relative justify-start">
              <img
                src={theaterData.thumbnail_image}
                alt="Theater"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
            </div>
          )}

          {/* Right: Text Content */}
          <div className="w-2/5 flex flex-col justify-end p-10 space-y-6 text-right">
            <div>
              <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium mb-4 inline-block">
                Theater Details
              </span>
              <h1 className="text-5xl font-bold text-gray-900 tracking-tight">
                {theaterData?.name}
              </h1>
            </div>

            <div className="flex items-center justify-end gap-3">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <p className="text-2xl text-gray-700 font-medium">
                {theaterData?.venue?.name}
              </p>
            </div>

            <div className="flex justify-end gap-4 mt-6 text-left">
              <button
                onClick={handleExportExcel}
                className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-md"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Export Excel
              </button>
              <button
                onClick={handleExportPdf}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Export PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Key Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-md hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-start">
            <div className="p-3 bg-blue-50 rounded-lg mr-4">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-gray-500 text-sm font-medium mb-1">
                Location
              </h3>
              <p className="text-lg font-semibold text-gray-800">
                {theaterData?.place?.name}, {theaterData?.place?.country?.name}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-md hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-start">
            <div className="p-3 bg-purple-50 rounded-lg mr-4">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-gray-500 text-sm font-medium mb-1">
                Screens
              </h3>
              <p className="text-lg font-semibold text-gray-800">
                {theaterData?.number_of_screens}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-md hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-start">
            <div className="p-3 bg-amber-50 rounded-lg mr-4">
              <svg
                className="w-6 h-6 text-amber-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-gray-500 text-sm font-medium mb-1">
                Capacity
              </h3>
              <p className="text-lg font-semibold text-gray-800">
                {theaterData?.capacity?.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-md hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-start">
            <div
              className={`p-3 rounded-lg mr-4 ${
                theaterData?.status ? "bg-green-50" : "bg-red-50"
              }`}
            >
              <svg
                className={`w-6 h-6 ${
                  theaterData?.status ? "text-green-600" : "text-red-600"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {theaterData?.status ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                )}
              </svg>
            </div>
            <div>
              <h3 className="text-gray-500 text-sm font-medium mb-1">Status</h3>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  theaterData?.status
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {theaterData?.status ? "Operational" : "Closed"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Movies Section */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-lg mb-8 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center">
            <svg
              className="w-6 h-6 text-indigo-600 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
              />
            </svg>
            <h3 className="text-xl font-bold text-gray-800">
              Currently Showing Movies
              <span className="ml-2 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                {theaterData?.movies?.length}
              </span>
            </h3>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                  Movie
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                  Genre
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                  Runtime
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                  Revenue
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {theaterData?.movies?.map((movie) => (
                <tr
                  key={movie.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <Link
                      to={`${APP_PREFIX_PATH}/super-admin/movie-organizer/theater-details/${theaterId}/movie-details/${movie.id}`}
                      className="group flex items-center gap-4"
                    >
                      <div className="relative w-16 h-20 rounded-lg overflow-hidden shadow-md group-hover:shadow-lg transition-shadow">
                        <img
                          src={movie.thumbnail_image}
                          alt={movie.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <span className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                        {movie.title}
                      </span>
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                      {movie.genre}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    <div className="flex items-center">
                      <svg
                        className="w-4 h-4 text-gray-500 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {movie.runtime} mins
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-900">
                    <div className="flex items-center">
                      <svg
                        className="w-4 h-4 text-green-500 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      ₹{(movie.total_revenue || 0).toLocaleString()}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Genre Distribution Chart */}
      <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-lg mb-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <div className="p-3 bg-indigo-50 rounded-lg mr-4">
              <svg
                className="w-6 h-6 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800">
              Movie Genre Distribution
            </h3>
          </div>
          <div className="flex">
            <button className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors font-medium mr-2">
              Monthly
            </button>
            <button className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg font-medium">
              All Time
            </button>
          </div>
        </div>
        <div className="h-96">
          <Bar
            data={chartData}
            options={{
              maintainAspectRatio: false,
              responsive: true,
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    precision: 0,
                  },
                  grid: {
                    color: "rgba(0, 0, 0, 0.05)",
                  },
                },
                x: {
                  grid: {
                    display: false,
                  },
                },
              },
              plugins: {
                legend: {
                  position: "top",
                  labels: {
                    boxWidth: 15,
                    usePointStyle: true,
                    padding: 20,
                  },
                },
                tooltip: {
                  backgroundColor: "rgba(53, 162, 235, 0.9)",
                  titleFont: {
                    size: 14,
                  },
                  bodyFont: {
                    size: 13,
                  },
                  padding: 12,
                  cornerRadius: 8,
                },
              },
              elements: {
                bar: {
                  borderRadius: 6,
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default TheaterDetail;
