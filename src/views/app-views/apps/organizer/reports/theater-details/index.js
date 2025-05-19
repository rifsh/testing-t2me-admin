import React, { useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Bar } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import { exportToPdf, exportToExcel } from "utils/exportUtils";
import { useDispatch, useSelector } from "react-redux";
import { fetchTheaterDetails } from "store/slices/reportSlice";
import { Alert, Spin } from "antd";
import { APP_PREFIX_PATH } from "configs/AppConfig";

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
  console.log(theaterId, "data........");

  useEffect(() => {
    if (theaterId) {
      dispatch(fetchTheaterDetails(theaterId));
    }
  }, [dispatch, theaterId]);

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
    <div className="p-8" ref={reportRef}>
      {/* Header Section */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <button
            onClick={handleGoBack}
            className="text-gray-500 hover:text-gray-700 text-sm mb-2 inline-block"
          >
            &larr; Back to Organizers
          </button>

          <div className="flex items-center gap-4">
            {theaterData?.thumbnail_image && (
              <img
                src={theaterData.thumbnail_image}
                alt="Theater"
                className="w-16 h-16 rounded-lg object-cover"
              />
            )}
            <div>
              <h1 className="text-2xl font-bold">{theaterData?.name}</h1>
              <p className="text-gray-600">{theaterData?.venue?.name}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <button
            onClick={handleExportExcel}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Export Excel
          </button>
          <button
            onClick={handleExportPdf}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Export PDF
          </button>
        </div>
      </div>

      {/* Key Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="text-gray-500 text-sm font-medium mb-1">Location</h3>
          <p className="font-medium">
            {theaterData?.place?.name}, {theaterData?.place?.country?.name}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="text-gray-500 text-sm font-medium mb-1">Screens</h3>
          <p className="font-medium">{theaterData?.number_of_screens}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="text-gray-500 text-sm font-medium mb-1">Capacity</h3>
          <p className="font-medium">
            {theaterData?.capacity?.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="text-gray-500 text-sm font-medium mb-1">Status</h3>
          <span
            className={`px-2 py-1 rounded-md text-xs font-medium ${
              theaterData?.status
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {theaterData?.status ? "Operational" : "Closed"}
          </span>
        </div>
      </div>

      {/* Genre Distribution Chart */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 mb-8">
        <h3 className="text-lg font-semibold mb-4">Movie Genre Distribution</h3>
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
                },
              },
              plugins: {
                legend: {
                  position: "top",
                },
              },
            }}
          />
        </div>
      </div>

      {/* Movies Section */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">
            Currently Showing Movies ({theaterData?.movies?.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                  Movie
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                  Genre
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                  Runtime
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                  Revenue
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {theaterData?.movies?.map((movie) => (
                <tr key={movie.id}>
                  {/* <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={movie.thumbnail_image}
                        alt={movie.title}
                        className="w-12 h-16 object-cover rounded-md"
                      />
                      <span className="font-medium">{movie.title}</span>
                    </div>

                    
                  </td> */}

                  <td className="px-4 py-4">
                    <Link
                      to={`${APP_PREFIX_PATH}/organizer/reports/theater-details/${theaterId}/movie-details/${movie.id}`}
                      className="text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={movie.thumbnail_image}
                          alt={movie.title}
                          className="w-12 h-16 object-cover rounded-md"
                        />
                        <span className="font-medium">{movie.title}</span>
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-4">
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                      {movie.genre}
                    </span>
                  </td>
                  <td className="px-4 py-4">{movie.runtime} mins</td>
                  <td className="px-4 py-4 font-medium">
                    ₹{(movie.total_revenue || 0).toLocaleString()}
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

export default TheaterDetail;
