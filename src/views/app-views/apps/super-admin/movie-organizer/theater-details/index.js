import React, { useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { Bar } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import { exportToPdf, exportToExcel } from "utils/exportUtils";
import { theaterData } from "mock/data/reportData";


Chart.register(...registerables);

const TheaterDetail = () => {
  const reportRef = useRef(null);
  const { theaterId } = useParams();

 

  // Bar chart data for shows
  const showsChartData = {
    labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    datasets: [{
      label: 'Daily Shows',
      data: theaterData.daily_shows,
      backgroundColor: 'rgba(79, 70, 229, 0.6)',
      borderColor: 'rgba(79, 70, 229, 1)',
      borderWidth: 2
    }]
  };

  const handleExportPdf = () => {
    exportToPdf(reportRef, `Theater_${theaterData.name}.pdf`);
  };

  const handleExportCsv = () => {
    exportToExcel(reportRef, `Theater_${theaterData.name}.xlsx`);
  };

  return (
    <div className="p-8" ref={reportRef}>
      {/* Header and Export Buttons */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <Link 
            to={`${APP_PREFIX_PATH}/movie-organizers`} 
            className="text-gray-500 hover:text-gray-700 text-sm mb-2 inline-block"
          >
            &larr; Back to Organizers
          </Link>
          <h1 className="text-2xl font-bold">{theaterData.name}</h1>
        </div>
        <div className="flex gap-4">
          <button onClick={handleExportCsv} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
            Export CSV
          </button>
          <button onClick={handleExportPdf} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Export PDF
          </button>
        </div>
      </div>

      {/* Theater Info */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h3 className="text-gray-500 text-sm font-medium">Location</h3>
            <p>{theaterData.city}, {theaterData.state}</p>
          </div>
          <div>
            <h3 className="text-gray-500 text-sm font-medium">Total Movies</h3>
            <p>{theaterData.total_movies}</p>
          </div>
          <div>
            <h3 className="text-gray-500 text-sm font-medium">Status</h3>
            <span className={`px-3 py-1 rounded-md text-sm ${
              theaterData.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}>
              {theaterData.is_active ? "Operational" : "Closed"}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="text-gray-500 text-sm font-medium mb-2">Total Capacity</h3>
          <p className="text-2xl font-bold">{theaterData.total_capacity}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="text-gray-500 text-sm font-medium mb-2">Now Showing</h3>
          <p className="text-2xl font-bold text-green-600">
            {theaterData.movies.length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="text-gray-500 text-sm font-medium mb-2">Average Rating</h3>
          <p className="text-2xl font-bold">
            {theaterData.movies.reduce((sum, movie) => sum + movie.rating, 0 / theaterData.movies.length).toFixed(1)}
          </p>
        </div>
      </div>

      {/* Shows Chart */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 mb-8">
        <h3 className="text-gray-500 text-sm font-medium mb-4">Weekly Show Schedule</h3>
        <div className="h-64">
          <Bar 
            data={showsChartData} 
            options={{ 
              maintainAspectRatio: false, 
              scales: { y: { beginAtZero: true } },
              plugins: {
                legend: { display: false }
              }
            }} 
          />
        </div>
      </div>

      {/* Movies Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 bg-gray-50">
          <h3 className="text-gray-700 font-medium">Currently Showing Movies</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Movie Title</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Genre</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Runtime</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Rating</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Showtimes</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Occupancy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {theaterData.movies.map((movie) => (
                <tr key={movie.id}>
                  <td className="px-6 py-4 font-medium text-gray-900">{movie.title}</td>
                  <td className="px-4 py-3 text-gray-500">{movie.genre}</td>
                  <td className="px-4 py-3">{movie.runtime} mins</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                      {movie.rating}/5
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {movie.showtimes.map((time, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                          {time}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 rounded-full">
                        <div 
                          className="h-2 bg-green-600 rounded-full" 
                          style={{ width: `${movie.occupancy}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{movie.occupancy}%</span>
                    </div>
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