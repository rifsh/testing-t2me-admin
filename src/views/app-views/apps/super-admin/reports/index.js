import React, { useEffect, useRef, useState } from "react";
import { Bar, Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import { Link } from "react-router-dom";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import { DatePicker, Select, message } from "antd";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { eventOrganizers, movieOrganizers } from "mock/data/reportData";
import { exportToExcel, exportToPdf } from "utils/exportUtils";
import { useDispatch, useSelector } from "react-redux";
import { fetchReports, fetchUserReports } from "store/slices/reportSlice";
dayjs.extend(isBetween);

Chart.register(...registerables);

const { RangePicker } = DatePicker;
const { Option } = Select;

const SuperAdminReport = () => {
  const dispatch = useDispatch();
  const { reportData, loading, error, userReports } = useSelector(
    (state) => state.report
  );
  const userReportsData = userReports?.data?.[0]?.items || [];
  console.log(userReportsData, "data");

  const reportRef = useRef(null);
  const [activeTab, setActiveTab] = useState("events");
  const [timeFilter, setTimeFilter] = useState("last-3-months");
  const [customDateRange, setCustomDateRange] = useState([]);
  const [pagination, setPagination] = useState({
    page: 6,
    size: 5,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        await dispatch(
          fetchReports({
            pageData: { page: 1, size: 10 },
            contentType: activeTab,
          })
        );
      } catch (err) {
        console.error("Failed to fetch reports:", err);
      }
    };

    fetchData();
  }, [dispatch, activeTab]);
  useEffect(() => {
    dispatch(
      fetchUserReports({
        search: "",
        active: true,
        events: activeTab === "events",
        movies: activeTab === "movies",
        page: pagination.page,
        size: pagination.size,
      })
    );
  }, [dispatch, activeTab, pagination]);

  console.log(userReports, "userReports");

  const getDateRange = () => {
    const now = dayjs();
    let startDate,
      endDate = now;

    switch (timeFilter) {
      case "last-month":
        startDate = now.subtract(1, "month");
        break;
      case "last-3-months":
        startDate = now.subtract(3, "month");
        break;
      case "last-year":
        startDate = now.subtract(1, "year");
        break;
      case "custom":
        [startDate, endDate] = customDateRange;
        if (startDate && endDate && endDate.diff(startDate, "month") > 3) {
          message.error("Maximum date range allowed is 3 months");
          return [null, null];
        }
        break;
      default:
        return [null, null];
    }
    return [startDate?.startOf("day"), endDate?.endOf("day")];
  };

  const filterOrganizers = (organizers) => {
    const [startDate, endDate] = getDateRange();

    return organizers.filter((organizer) => {
      const items =
        organizer.type === "event"
          ? organizer.eventsList
          : organizer.moviesList;
      const dateField = organizer.type === "event" ? "date" : "releaseDate";

      return items.some((item) => {
        const itemDate = dayjs(item[dateField]);
        if (!startDate || !endDate) return true;
        return itemDate.isBetween(startDate, endDate, null, "[]");
      });
    });
  };

  const getCurrentOrganizers = () => {
    let data;

    switch (activeTab) {
      case "events":
        data = eventOrganizers;
        break;
      case "movies":
        data = movieOrganizers;
        break;
      default:
        data = [
          ...eventOrganizers.map((org) => ({ ...org, type: "event" })),
          ...movieOrganizers.map((org) => ({ ...org, type: "movie" })),
        ];
        break;
    }

    const filteredData = filterOrganizers(data);
    const startIndex = (pagination.page - 1) * pagination.size;
    const endIndex = startIndex + pagination.size;

    return filteredData.slice(startIndex, endIndex);
  };

  // Updated statistics calculations
  const filteredEventOrganizers = filterOrganizers(eventOrganizers);
  const filteredMovieOrganizers = filterOrganizers(movieOrganizers);
  const filteredAllOrganizers = filterOrganizers([
    ...eventOrganizers.map((org) => ({ ...org, type: "event" })),
    ...movieOrganizers.map((org) => ({ ...org, type: "movie" })),
  ]);

  // Update totalItems calculation
  const totalItems = (() => {
    switch (activeTab) {
      case "events":
        return filteredEventOrganizers.length;
      case "movies":
        return filteredMovieOrganizers.length;
      default:
        return filteredAllOrganizers.length;
    }
  })();

  const organizerPerformanceData = {
    labels:
      userReports?.data?.[0]?.items?.map((organizer) => organizer.username) ||
      [],
    datasets: [
      {
        label: `${
          activeTab === "events" ? "Event" : "Movie"
        } Revenue Generated ($)`,
        data:
          userReports?.data?.[0]?.items?.map(
            (organizer) => organizer.total_revenue
          ) || [],
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 2,
      },
    ],
  };

  // Timeline data
  const timelineData = {
    events: [12, 19, 15, 25, 18, 22],
    movies: [5, 8, 6, 10, 7, 9],
    total: [17, 27, 21, 35, 25, 31],
  };

  const handleExportPdf = async () => {
    exportToPdf(reportRef, "MyReport.pdf");
  };

  const handleExportCsv = () => {
    exportToExcel(reportRef, "MyReport.xlsx");
  };

  return (
    <div className="container mx-auto px-4 py-6" ref={reportRef}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-blue-600">Reports</h2>
        <div className="flex items-center gap-4">
          <Select
            value={timeFilter}
            onChange={(value) => {
              setTimeFilter(value);
              setPagination((prev) => ({ ...prev, page: 1 }));
              if (value !== "custom") setCustomDateRange([]);
            }}
            style={{ width: 180 }}
          >
            <Option value="last-month">Last Month</Option>
            <Option value="last-3-months">Last 3 Months</Option>
            <Option value="last-year">Last Year</Option>
            <Option value="custom">Custom Range</Option>
          </Select>

          {timeFilter === "custom" && (
            <RangePicker
              value={customDateRange}
              onChange={(dates) => {
                if (dates && dates[0] && dates[1]) {
                  const monthDiff = dates[1].diff(dates[0], "month");
                  if (monthDiff > 3) {
                    message.error("Maximum date range allowed is 3 months");
                    return;
                  }
                }
                setCustomDateRange(dates);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              disabledDate={(current) => {
                if (!customDateRange[0]) return false;
                const tooLate = current.diff(customDateRange[0], "month") >= 3;
                const tooEarly = customDateRange[0].diff(current, "month") >= 3;
                return !!tooEarly || !!tooLate;
              }}
            />
          )}

          <button
            onClick={handleExportPdf}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Export PDF
          </button>
          <button
            onClick={handleExportCsv}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Export CSV
          </button>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab("events")}
          className={`px-4 py-2 rounded-lg ${
            activeTab === "events"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Events
        </button>
        <button
          onClick={() => setActiveTab("movies")}
          className={`px-4 py-2 rounded-lg ${
            activeTab === "movies"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Movies
        </button>
      </div>

      {/* Platform Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <div className="bg-blue-50 p-3 rounded-full inline-flex items-center justify-center mb-3">
            <svg
              className="w-6 h-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              ></path>
            </svg>
          </div>
          <h3 className="text-gray-500 text-sm font-medium mb-1">
            {activeTab === "events"
              ? "Event Organizers"
              : activeTab === "movies"
              ? "Movie Organizers"
              : "Total Organizers"}
          </h3>
          <p className="text-2xl font-bold text-gray-900">
            {activeTab === "events"
              ? reportData?.total_users_in_events
              : activeTab === "movies"
              ? reportData?.total_users_in_theatres
              : null}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <div className="bg-green-50 p-3 rounded-full inline-flex items-center justify-center mb-3">
            <svg
              className="w-6 h-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          </div>
          <h3 className="text-gray-500 text-sm font-medium mb-1">
            Active{" "}
            {activeTab === "events"
              ? "Event Organizers"
              : activeTab === "movies"
              ? "Movie Organizers"
              : "Organizers"}
          </h3>
          <p className="text-2xl font-bold text-gray-900">
            {activeTab === "events"
              ? reportData?.active_users_in_events
              : activeTab === "movies"
              ? reportData?.active_users_in_theatres
              : null}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <div className="bg-purple-50 p-3 rounded-full inline-flex items-center justify-center mb-3">
            <svg
              className="w-6 h-6 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              ></path>
            </svg>
          </div>
          <h3 className="text-gray-500 text-sm font-medium mb-1">
            {activeTab === "events"
              ? "Total Events"
              : activeTab === "movies"
              ? "Total Movies"
              : "Total Items"}
          </h3>
          <p className="text-2xl font-bold text-gray-900">
            {activeTab === "events"
              ? reportData?.total_events
              : activeTab === "movies"
              ? reportData?.total_movies
              : null}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <div className="bg-yellow-50 p-3 rounded-full inline-flex items-center justify-center mb-3">
            <svg
              className="w-6 h-6 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          </div>
          <h3 className="text-gray-500 text-sm font-medium mb-1">
            Total Revenue
          </h3>
          <p className="text-2xl font-bold text-gray-900">
            {activeTab === "events"
              ? reportData?.total_event_revenue
              : activeTab === "movies"
              ? reportData?.total_movie_revenue || 0
              : null}
          </p>
        </div>
      </div>

      {/* Organizers Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Organizer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                {activeTab === "total" && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {activeTab === "events"
                    ? "Events"
                    : activeTab === "movies"
                    ? "Movies"
                    : "Items"}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Attendees
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th> */}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* {getCurrentOrganizers().map((organizer) => (
                <tr key={organizer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <Link
                      to={`${APP_PREFIX_PATH}/super-admin/organizer-details/${organizer.id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {organizer.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {organizer.email}
                  </td>
                  {activeTab === "total" && (
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-md text-sm font-medium ${
                          organizer.type === "event"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {organizer.type === "event" ? "Event" : "Movie"}
                      </span>
                    </td>
                  )}
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {activeTab === "events" ||
                    (activeTab === "total" && organizer.type === "event")
                      ? organizer.events
                      : organizer.movies}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {organizer.attendees.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-green-600">
                    ${organizer.revenue.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(organizer.status)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(organizer.lastLogin).toLocaleDateString()}
                  </td>
                </tr>
              ))} */}

              {userReports?.data?.[0]?.items?.map((organizer, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <Link
                      to={`${APP_PREFIX_PATH}/super-admin/organizer-details/${organizer.id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {organizer.username}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {organizer.email}
                  </td>

                  {activeTab === "total" && (
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-md text-sm font-medium ${
                          organizer.event_count > 0
                            ? "bg-blue-100 text-blue-800"
                            : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {organizer.event_count > 0 ? "Event" : "Movie"}
                      </span>
                    </td>
                  )}

                  <td className="px-6 py-4 text-sm text-gray-500">
                    {activeTab === "events" ||
                    (activeTab === "total" && organizer.event_count > 0)
                      ? organizer.event_count
                      : organizer.movie_count ?? 0}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-500">
                    {organizer.total_attendees?.toLocaleString() ?? 0}
                  </td>

                  <td className="px-6 py-4 text-sm font-bold text-green-600">
                    ${organizer.total_revenue?.toLocaleString() ?? 0}
                  </td>

                  {/* <td className="px-6 py-4">
      {getStatusBadge(organizer.is_active ? "active" : "inactive")}
    </td> */}

                  {/* <td className="px-6 py-4 text-sm text-gray-500">
      -
    </td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination outside table and aligned right */}
        <div className="flex justify-end p-4">
          <div className="flex items-center space-x-2">
            {/* Previous Button */}
            <button
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  page: Math.max(1, prev.page - 1),
                }))
              }
              disabled={pagination.page === 1}
              className={`w-8 h-8 flex items-center justify-center rounded-full border text-gray-600 ${
                pagination.page === 1
                  ? "bg-gray-200 cursor-not-allowed"
                  : "hover:bg-blue-100"
              }`}
            >
              ‹
            </button>

            {/* Page Numbers */}
            {Array.from({
              length: Math.ceil(totalItems / pagination.size),
            }).map((_, index) => {
              const pageNum = index + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      page: pageNum,
                    }))
                  }
                  className={`w-8 h-8 flex items-center justify-center rounded-full border text-sm ${
                    pagination.page === pageNum
                      ? "bg-blue-600 text-white"
                      : "hover:bg-blue-100 text-gray-600"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            {/* Next Button */}
            <button
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  page: Math.min(
                    Math.ceil(totalItems / pagination.size),
                    prev.page + 1
                  ),
                }))
              }
              disabled={
                pagination.page === Math.ceil(totalItems / pagination.size)
              }
              className={`w-8 h-8 flex items-center justify-center rounded-full border text-gray-600 ${
                pagination.page === Math.ceil(totalItems / pagination.size)
                  ? "bg-gray-200 cursor-not-allowed"
                  : "hover:bg-blue-100"
              }`}
            >
              ›
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-gray-500 text-sm font-medium mb-3">
            Organizer {activeTab === "events" ? "Event" : "Movie"} Revenue
          </h3>
          <div className="h-64">
            <Bar
              data={organizerPerformanceData}
              options={{
                indexAxis: "y",
                maintainAspectRatio: false,
                scales: { x: { beginAtZero: true } },
              }}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-gray-500 text-sm font-medium mb-3">
            {activeTab === "events" ? "Event" : "Movie"} Timeline
          </h3>
          <div className="h-64">
            <Line
              data={{
                labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
                datasets: [
                  {
                    label:
                      activeTab === "events"
                        ? "Events Created"
                        : "Movies Released",
                    data:
                      activeTab === "events"
                        ? timelineData.events
                        : timelineData.movies,
                    borderColor: activeTab === "events" ? "#198754" : "#dc3545",
                    backgroundColor:
                      activeTab === "events"
                        ? "rgba(25, 135, 84, 0.1)"
                        : "rgba(220, 53, 69, 0.1)",
                    tension: 0.4,
                    fill: true,
                  },
                ],
              }}
              options={{
                maintainAspectRatio: false,
                scales: { y: { beginAtZero: true } },
              }}
            />
          </div>
        </div>
      </div>

      {/* Updated summary stats - removed total section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-medium mb-4">Platform Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {activeTab === "events" && (
            <>
              <div className="border-r border-gray-200 pr-6">
                <h4 className="text-sm font-medium text-gray-500 mb-2">
                  Total Events
                </h4>
                <p className="text-2xl font-bold">{reportData?.total_events}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {reportData?.active_users_in_events} organizers
                </p>
              </div>
              <div className="border-r border-gray-200 pr-6">
                <h4 className="text-sm font-medium text-gray-500 mb-2">
                  Total Attendance
                </h4>
                <p className="text-2xl font-bold text-blue-600">
                  {/* {platformStats.totalEventAttendees.toLocaleString()} */}0
                </p>
                {/* <p className="text-sm text-gray-500 mt-1">
                  Avg{" "}
                  {Math.round(
                    platformStats.totalEventAttendees /
                      platformStats.totalEvents
                  ).toLocaleString()}{" "}
                  per event
                </p> */}
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">
                  Event Revenue
                </h4>
                <p className="text-2xl font-bold text-green-600">
                  {reportData?.total_event_revenue}
                </p>
                {/* <p className="text-sm text-gray-500 mt-1">
                  $
                  {Math.round(
                    platformStats.totalEventRevenue /
                      platformStats.totalEventAttendees
                  ).toLocaleString()}{" "}
                  per attendee
                </p> */}
              </div>
            </>
          )}

          {activeTab === "movies" && (
            <>
              <div className="border-r border-gray-200 pr-6">
                <h4 className="text-sm font-medium text-gray-500 mb-2">
                  Total Movies
                </h4>
                <p className="text-2xl font-bold">{reportData?.total_movies}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {reportData?.total_users_in_movies} organizers
                </p>
              </div>
              <div className="border-r border-gray-200 pr-6">
                <h4 className="text-sm font-medium text-gray-500 mb-2">
                  Total Attendance
                </h4>
                <p className="text-2xl font-bold text-blue-600">{0}</p>
                {/* <p className="text-sm text-gray-500 mt-1">
                  Avg{" "}
                  {Math.round(
                    platformStats.totalMovieAttendees /
                      platformStats.totalMovies
                  ).toLocaleString()}{" "}
                  per movie
                </p> */}
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">
                  Movie Revenue
                </h4>
                <p className="text-2xl font-bold text-green-600">
                  ${reportData?.total_event_revenue}
                </p>
                {/* <p className="text-sm text-gray-500 mt-1">
                  $
                  {Math.round(
                    platformStats.totalMovieRevenue /
                      platformStats.totalMovieAttendees
                  ).toLocaleString()}{" "}
                  per attendee
                </p> */}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuperAdminReport;
