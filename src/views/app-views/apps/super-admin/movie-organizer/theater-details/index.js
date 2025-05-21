import React, { useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Bar } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import { exportToPdf, exportToExcel } from "utils/exportUtils";
import { useDispatch, useSelector } from "react-redux";
import { fetchTheaterDetails } from "store/slices/reportSlice";
import { Alert, Spin } from "antd";
import usePaginationHook from "utils/hooks/usePaginationHandler";

Chart.register(...registerables);

const TheaterDetail = () => {
  const reportRef = useRef(null);
  const { theaterId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();


  const { pagination } = useSelector((state) => state.report.theaterDetails);
  
    const handlePagination = usePaginationHook(fetchTheaterDetails);
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

  const handleGoBack = () => {
    navigate(-1);
  };

  if (error) return <Alert message={error} />;
  console.log(theaterData, "data...");

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen" ref={reportRef}>
      {/* Header Section */}
      <div className="mb-6 md:mb-8">
        <button
          onClick={handleGoBack}
          className="flex items-center text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200 mb-4 text-sm md:text-base"
        >
          <svg
            className="w-4 h-4 md:w-5 md:h-5 mr-2"
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

        <div className="bg-white rounded-lg shadow-md p-6 mb-8 border border-gray-200">
          <div className="flex flex-col md:flex-row gap-8">
            <img
              src={theaterData?.thumbnail_image}
              alt="Theater"
              className="w-full md:w-1/3 h-64 object-cover rounded-lg border-2 border-white"
            />
            <div className="w-full md:w-2/3">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl font-bold text-gray-900">
                  {theaterData?.name}
                </h1>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    theaterData?.status
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {theaterData?.status ? "Operational" : "Closed"}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Company</p>
                  <p className="font-medium">
                    {theaterData?.company?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Venue</p>
                  <p className="font-medium">
                    {theaterData?.venue?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Location</p>
                  <p className="font-medium">
                    {theaterData?.place?.name},{" "}
                    {theaterData?.place?.country?.name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Contact</p>
                  <div className="space-y-1">
                    <p className="font-medium flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                      {theaterData?.phone_number}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Information Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="bg-white p-4 md:p-6 rounded-lg md:rounded-xl border border-gray-100 shadow-sm md:shadow-md hover:shadow-md md:hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-start">
            <div className="p-2 md:p-3 bg-blue-50 rounded-lg mr-3 md:mr-4">
              <svg
                className="w-5 h-5 md:w-6 md:h-6 text-blue-600"
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
              <h3 className="text-gray-500 text-xs md:text-sm font-medium mb-1">
                Location
              </h3>
              <p className="text-sm md:text-base lg:text-lg font-semibold text-gray-800">
                {theaterData?.place?.name}, {theaterData?.place?.country?.name}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-lg md:rounded-xl border border-gray-100 shadow-sm md:shadow-md hover:shadow-md md:hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-start">
            <div className="p-2 md:p-3 bg-purple-50 rounded-lg mr-3 md:mr-4">
              <svg
                className="w-5 h-5 md:w-6 md:h-6 text-purple-600"
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
              <h3 className="text-gray-500 text-xs md:text-sm font-medium mb-1">
                Screens
              </h3>
              <p className="text-sm md:text-base lg:text-lg font-semibold text-gray-800">
                {theaterData?.number_of_screens}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-lg md:rounded-xl border border-gray-100 shadow-sm md:shadow-md hover:shadow-md md:hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-start">
            <div className="p-2 md:p-3 bg-amber-50 rounded-lg mr-3 md:mr-4">
              <svg
                className="w-5 h-5 md:w-6 md:h-6 text-amber-600"
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
              <h3 className="text-gray-500 text-xs md:text-sm font-medium mb-1">
                Capacity
              </h3>
              <p className="text-sm md:text-base lg:text-lg font-semibold text-gray-800">
                {theaterData?.capacity?.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-lg md:rounded-xl border border-gray-100 shadow-sm md:shadow-md hover:shadow-md md:hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-start">
            <div
              className={`p-2 md:p-3 rounded-lg mr-3 md:mr-4 ${
                theaterData?.status ? "bg-green-50" : "bg-red-50"
              }`}
            >
              <svg
                className={`w-5 h-5 md:w-6 md:h-6 ${
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
              <h3 className="text-gray-500 text-xs md:text-sm font-medium mb-1">
                Status
              </h3>
              <span
                className={`px-2 py-1 md:px-3 md:py-1 rounded-full text-xs md:text-sm font-medium ${
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
      <div className="bg-white rounded-lg md:rounded-xl border border-gray-100 shadow-md md:shadow-lg mb-6 md:mb-8 overflow-hidden">
        <div className="p-4 md:p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 md:w-6 md:h-6 text-indigo-600 mr-2 md:mr-3"
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
            <h3 className="text-lg md:text-xl font-bold text-gray-800">
              Currently Showing Movies
              <span className="ml-2 px-2 py-1 md:px-3 md:py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs md:text-sm">
                {theaterData?.movies?.length}
              </span>
            </h3>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 md:px-6 md:py-4 text-left text-xs md:text-sm font-semibold text-gray-600 uppercase tracking-wider">
                  Movie
                </th>
                <th className="px-4 py-3 md:px-6 md:py-4 text-left text-xs md:text-sm font-semibold text-gray-600 uppercase tracking-wider">
                  Genre
                </th>
                <th className="px-4 py-3 md:px-6 md:py-4 text-left text-xs md:text-sm font-semibold text-gray-600 uppercase tracking-wider">
                  Runtime
                </th>
                <th className="px-4 py-3 md:px-6 md:py-4 text-left text-xs md:text-sm font-semibold text-gray-600 uppercase tracking-wider">
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
                  <td className="px-4 py-3 md:px-6 md:py-4">
                    <Link
                      to={`${APP_PREFIX_PATH}/super-admin/movie-organizer/theater-details/${theaterId}/movie-details/${movie.id}`}
                      className="group flex items-center gap-2 md:gap-4"
                    >
                      <div className="relative w-12 h-16 md:w-16 md:h-20 rounded-lg overflow-hidden shadow-sm md:shadow-md group-hover:shadow-md md:group-hover:shadow-lg transition-shadow">
                        <img
                          src={movie.thumbnail_image}
                          alt={movie.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <span className="text-sm md:text-base font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                        {movie.title}
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3 md:px-6 md:py-4">
                    <span className="px-2 py-1 md:px-3 md:py-1 bg-gray-100 text-gray-800 rounded-full text-xs md:text-sm font-medium">
                      {movie.genre}
                    </span>
                  </td>
                  <td className="px-4 py-3 md:px-6 md:py-4 text-gray-700 text-sm md:text-base">
                    <div className="flex items-center">
                      <svg
                        className="w-3 h-3 md:w-4 md:h-4 text-gray-500 mr-1 md:mr-2"
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
                  <td className="px-4 py-3 md:px-6 md:py-4 font-semibold text-gray-900 text-sm md:text-base">
                    <div className="flex items-center">
                      <svg
                        className="w-3 h-3 md:w-4 md:h-4 text-green-500 mr-1 md:mr-2"
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
      <div className="bg-white p-4 md:p-6 lg:p-8 rounded-lg md:rounded-xl border border-gray-100 shadow-md md:shadow-lg mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6 gap-3 sm:gap-0">
          <div className="flex items-center">
            <div className="p-2 md:p-3 bg-indigo-50 rounded-lg mr-3 md:mr-4">
              <svg
                className="w-5 h-5 md:w-6 md:h-6 text-indigo-600"
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
            <h3 className="text-lg md:text-xl font-bold text-gray-800">
              Movie Genre Distribution
            </h3>
          </div>
          <div className="flex">
            <button className="px-2 py-1 md:px-3 md:py-1 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors font-medium mr-2 text-xs md:text-sm">
              Monthly
            </button>
            <button className="px-2 py-1 md:px-3 md:py-1 bg-indigo-100 text-indigo-700 rounded-lg font-medium text-xs md:text-sm">
              All Time
            </button>
          </div>
        </div>
        <div className="h-64 sm:h-80 md:h-96">
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
                    boxWidth: 12,
                    usePointStyle: true,
                    padding: 10,
                    font: {
                      size: window.innerWidth < 768 ? 10 : 12,
                    },
                  },
                },
                tooltip: {
                  backgroundColor: "rgba(53, 162, 235, 0.9)",
                  titleFont: {
                    size: window.innerWidth < 768 ? 12 : 14,
                  },
                  bodyFont: {
                    size: window.innerWidth < 768 ? 11 : 13,
                  },
                  padding: 8,
                  cornerRadius: 6,
                },
              },
              elements: {
                bar: {
                  borderRadius: 4,
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
