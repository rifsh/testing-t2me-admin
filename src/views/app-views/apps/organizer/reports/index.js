import React, { useState, useRef, useEffect, useMemo } from "react";
import { Bar, Pie } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import "jspdf-autotable";
import { Link } from "react-router-dom";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import { Select, DatePicker, message, Button, Spin, Table } from "antd";
import { exportToPdf, exportToExcel } from "utils/exportUtils";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import { getUserdata } from "store/slices/authSlice";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";

import {
  fetchCountryList,
  fetchMovieUserDetails,
  fetchUserDetails,
  fetchUserTheaters,
  setSelectedCountry,
} from "store/slices/reportSlice";
import usePaginationHook from "utils/hooks/usePaginationHandler";
import { DEFAULT_PAGE_SIZE } from "constants/PageConstants";

Chart.register(...registerables);

const { Option } = Select;
const { RangePicker } = DatePicker;

const OrganizerReport = () => {
  const [activeSegment, setActiveSegment] = useState("events");
  const [timeFilter, setTimeFilter] = useState("option");
  const [customDateRange, setCustomDateRange] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  const reportRef = useRef(null);

  const dispatch = useDispatch();

  const { userData } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getUserdata());
  }, [dispatch]);
  const organizerId = userData?.id;

  const { data: userTheaters } = useSelector(
    (state) => state.report.userTheaters
  );

  const { data: organizer } = useSelector((state) => state.report.userDetails);
  const selectedCountry = useSelector((state) => state.report.selectedCountry);

  const { pagination } = useSelector((state) => state.report.userTheaters);

  const handlePagination = usePaginationHook(fetchMovieUserDetails);
  const { data: countryData } = useSelector(
    (state) => state.report.countryList
  );
  const eventOrganizer = organizer;
  const handleChange = (value) => {
    dispatch(setSelectedCountry(value));
  };
  useEffect(() => {
    if (!organizerId) return;

    if (activeSegment === "events") {
      console.log("Calling fetchUserDetails...");
      dispatch(
        fetchUserDetails({
          userId: organizerId,
          countryId: selectedCountry,
        })
      );
    } else {
      dispatch(
        fetchMovieUserDetails({
          userId: organizerId,
          countryId: selectedCountry,
        })
      );
    }
  }, [dispatch, organizerId, activeSegment, selectedCountry]);

  useEffect(() => {
    const fetchData = async () => {
      if (organizerId && selectedCountry) {
        try {
          await dispatch(
            fetchUserTheaters({
              pageData: DEFAULT_PAGE_SIZE,
              userId: organizerId,
              countryId: selectedCountry,
            })
          );
        } catch (error) {
          console.error("Failed to fetch user details:", error);
          message.error(
            error.payload?.message || "Failed to load user details"
          );
        }
      }
    };

    fetchData();
  }, [dispatch, organizerId, selectedCountry]);

  useEffect(() => {
    dispatch(fetchCountryList({ active: activeFilter, search: searchTerm }));
  }, [dispatch, activeFilter, searchTerm]);

  const { data: userDetailsData, loading: userDetailsLoading } = useSelector(
    (state) => state.report.userDetails
  );

  const { data: movieUserDetailsData, loading: movieUserDetailsLoading } =
    useSelector((state) => state.report.movieUserDetails);

  const userTheaterList = userTheaters?.items;

  const data =
    activeSegment === "events" ? userDetailsData : movieUserDetailsData;

  const baseItems = useMemo(() => {
    if (activeSegment === "events") {
      return (
        data?.map((event) => ({
          id: event.id,
          title: event.event_name,
          type: "event",
          startDate: event.created_at,
          endDate: event.updated_at,
          revenue: event.event_revenue,
          attendees: event.attendees_count,
          capacity: 100,
          status: "Upcoming",
          image: "default-event.jpg",
        })) || []
      );
    } else {
      return (
        data?.theaters?.map((theater) => ({
          id: theater.theater_id,
          title: theater.theater_name,
          type: "movie",
          releaseDate: theater.created_at, // Use actual date field if available
          revenue: theater.theatre_revenue || 0,
          ticketsSold: theater.screens_count,
          totalSeats: 100, // Replace with actual seats if available
          status: "Released", // Update with actual status logic
          image: "default-movie.jpg", // Add image URL if available in API
        })) || []
      );
    }
  }, [activeSegment, eventOrganizer, data]);

  const filteredItems = useMemo(() => {
    const now = dayjs();
    let startDate, endDate;

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
        if (customDateRange.length === 2) {
          startDate = customDateRange[0];
          endDate = customDateRange[1];
        }
        break;
      default:
        return baseItems;
    }

    return baseItems.filter((item) => {
      const dateField =
        activeSegment === "events" ? item.startDate : item.releaseDate;
      const itemDate = dayjs(dateField);

      if (timeFilter === "custom") {
        return itemDate.isAfter(startDate) && itemDate.isBefore(endDate);
      }
      return itemDate.isAfter(startDate);
    });
  }, [baseItems, timeFilter, customDateRange, activeSegment]);

  // Add custom date range validation
  const disabledCustomDate = (current) => {
    if (!customDateRange[0]) return false;
    const tooLate =
      customDateRange[0] && current.diff(customDateRange[0], "month") >= 3;
    const tooEarly =
      customDateRange[1] && customDateRange[1].diff(current, "month") >= 3;
    return !!tooEarly || !!tooLate;
  };

  const handleTimeFilterChange = (value) => {
    setTimeFilter(value);
    setCustomDateRange([]);
  };

  // date range handler with validation
  const handleDateRangeChange = (dates) => {
    if (dates && dates[0] && dates[1]) {
      const monthDiff = dates[1].diff(dates[0], "month");
      if (monthDiff > 3) {
        message.error("Maximum date range allowed is 3 months");
        return;
      }
    }
    setCustomDateRange(dates);
    if (dates && dates.length === 2) {
      setTimeFilter("custom");
    }
  };

  // Enhanced formatting functions
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleExportPDF = async () => {
    exportToPdf(reportRef, "MyReport.pdf");
  };

  const handleExportCSV = () => {
    exportToExcel(reportRef, "MyReport.xlsx");
  };

  const chartData =
    activeSegment === "events"
      ? {
          labels: data?.[0]?.events?.map((event) => event?.event_name) || [],
          datasets: [
            {
              label: "Event Revenue",
              data:
                data?.[0]?.events?.map((event) => event?.event_revenue) || [],
              backgroundColor: "rgba(75, 192, 192, 0.6)",
              borderColor: "rgba(75, 192, 192, 1)",
              borderWidth: 2,
            },
          ],
        }
      : {
          labels:
            data?.[0]?.theaters?.map((theater) => theater?.theater_name) || [],
          datasets: [
            {
              label: "Theater Revenue",
              data:
                data?.[0]?.theaters?.map(
                  (theater) => theater?.theater_revenue
                ) || [],
              backgroundColor: "rgba(255, 159, 64, 0.6)",
              borderColor: "rgba(255, 159, 64, 1)",
              borderWidth: 2,
            },
          ],
        };

  const statusData = {
    labels: ["Active", "Inactive"],
    datasets: [
      {
        data: [data?.[0]?.is_active ? 1 : 0, data?.[0]?.is_active ? 0 : 1],
        backgroundColor: ["#198754", "#dc3545"],
      },
    ],
  };
  console.log(data?.[0], "data");
  console.log(userTheaters, "theaters");

  const getColumns = (activeSegment) => [
    {
      title: activeSegment === "events" ? "Event Name" : "Theater Name",
      dataIndex: activeSegment === "events" ? "event_name" : "theater_name",
      key: "name",
      fixed: "left",
      width: 200,
      render: (text, record) => (
        <Link
          to={`${APP_PREFIX_PATH}/organizer/reports/${
            activeSegment === "events" ? "event-details" : "theater-details"
          }/${activeSegment === "events" ? record.id : record.theater_id}`}
          className="text-blue-600 hover:text-blue-800 font-semibold"
        >
          {text}
        </Link>
      ),
      className: "px-6 py-4",
    },
    {
      title: activeSegment === "events" ? "Attendees" : "Number of Screens",
      dataIndex:
        activeSegment === "events" ? "attendees_count" : "screens_count",
      key: "count",
      width: 150,
      render: (text) => text?.toLocaleString(),
      className: "px-4 py-3",
    },
    ...(activeSegment !== "events"
      ? [
          {
            title: "Number of Movies",
            dataIndex: "movies_count",
            key: "movies",
            width: 150,
            className: "px-4 py-3",
          },
        ]
      : []),
    {
      title: "Revenue",
      key: "revenue",
      width: 200,
      render: (_, record) => (
        <div className="text-green-600 text-sm space-y-1">
          {activeSegment === "events"
            ? record.event_revenue
            : record.theatre_revenue || 0}
        </div>
      ),
      className: "px-4 py-3",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-6" ref={reportRef}>
      <Spin
        spinning={userDetailsLoading || movieUserDetailsLoading}
        tip="Loading report data..."
        size="large"
        className="pt-8"
      >
      
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
         <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl">
                {["events", "movies"].map((segment) => (
                  <button
                    key={segment}
                    onClick={() => {
                      setActiveSegment(segment);
                      // setPagination((prev) => ({ ...prev, current: 1 }));
                    }}
                    className={`px-4 py-1 rounded-2xl text-sm capitalize transition-colors ${
                      activeSegment === segment
                        ? "bg-green-400 text-white shadow-sm"
                        : "bg-gray-50 text-gray-600"
                    }`}
                  >
                    {segment}
                  </button>
                ))}
              </div>
          {/* <div>
            <p className="text-gray-500 text-sm mt-1">
              <span className="ml-2">
                {timeFilter === "custom" && customDateRange.length === 2
                  ? `Custom range: ${formatDate(
                      customDateRange[0]
                    )} to ${formatDate(customDateRange[1])}`
                  : timeFilter === "last-month"
                  ? "Last month"
                  : timeFilter === "last-3-months"
                  ? "Last 3 months"
                  : timeFilter === "last-year"
                  ? "Last year"
                  : ""}
              </span>
            </p>
          </div> */}

          <div className="flex flex-col sm:flex-row gap-3 md:w-auto">
            {/* Mobile Expand Button */}
            <div className="sm:hidden">
              <Button
                icon={
                  isExpanded ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />
                }
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-2"
              >
                Filters
              </Button>
            </div>

            {/* Filters Container */}
            <div
              className={`${
                isExpanded ? "flex" : "hidden"
              } sm:flex flex-col sm:flex-row gap-3  sm:w-auto`}
            >
              {/* Segment Selector */}
             

              {/* Country Select */}
              {/* <Select
                showSearch
                placeholder="Select Country"
                optionFilterProp="children"
                style={{ width: 200 }}
                value={selectedCountry}
                onChange={handleChange}
                filterOption={(input, option) =>
                  option.children.toLowerCase().includes(input.toLowerCase())
                }
              >
                {countryData?.[0]?.items?.map((country) => (
                  <Option key={country.id} value={country.id}>
                    {country.name}
                  </Option>
                ))}
              </Select> */}

              {/* Date Filters */}
              <div className="flex flex-col sm:flex-row gap-2">
                <Select
                  defaultValue="last-month"
                  style={{ width: 150 }}
                  onChange={handleTimeFilterChange}
                  value={timeFilter}
                >
                  <Option value="last-month">Last Month</Option>
                  <Option value="last-3-months">Last 3 Months</Option>
                  <Option value="last-year">Last Year</Option>
                  <Option value="custom">Custom Range</Option>
                </Select>

                {timeFilter === "custom" && (
                  <RangePicker
                    value={customDateRange}
                    onChange={handleDateRangeChange}
                    style={{ width: 250 }}
                    disabledDate={disabledCustomDate}
                    onCalendarChange={(dates) =>
                      dates && setCustomDateRange(dates)
                    }
                  />
                )}

                {/* Export Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={handleExportPDF}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg items-center gap-2"
                  >
                    Export PDF
                  </button>

                  <button
                    onClick={handleExportCSV}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg items-center gap-2"
                  >
                    Export CSV
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        

        {/* Enhanced Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {/* Total Items Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-gray-500 text-sm mb-1">
                  {activeSegment === "events"
                    ? "Total events"
                    : "Total theaters"}
                </h3>
                <p className="text-2xl font-bold text-gray-900">
                  {activeSegment === "events"
                    ? data?.[0]?.total_events
                    : data?.total_theaters}
                </p>
                <p className="text-xs text-gray-400">Currently managing</p>
              </div>
            </div>
          </div>

          {/* Total Revenue Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-gray-500 text-sm mb-1">Total Revenue</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {data?.[0]?.total_revenue}
                </p>
                <p className="text-xs text-gray-400">All items combined</p>
              </div>
            </div>
          </div>

          {/* Total Attendance Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-50 rounded-lg">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-gray-500 text-sm mb-1">
                  {activeSegment === "movies"
                    ? "Tickets Sold"
                    : activeSegment === "events"
                    ? "Total Attendees"
                    : "Total Participation"}
                </h3>
                <p className="text-2xl font-bold text-gray-900">
                  {data?.[0]?.total_attendees}
                </p>
                <p className="text-xs text-gray-400">
                  {activeSegment === "movies"
                    ? "Movie tickets"
                    : activeSegment === "events"
                    ? "Event attendees"
                    : "Combined total"}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
          {/* <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="p-4 bg-gray-50">
            <h3 className="text-gray-700 font-medium">
              {activeSegment === "events" ? "Events List" : "Theaters List"}
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                    {activeSegment === "events" ? "Event Name" : "Theater Name"}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                    {activeSegment === "events"
                      ? "Attendees"
                      : "Number of Screens"}
                  </th>
                  {activeSegment !== "events" && (
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                      Number of Movies
                    </th>
                  )}

                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                    Revenue
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {activeSegment === "events"
                  ? data?.[0]?.events?.map((event) => (
                      <tr key={event?.id}>
                        <td className="px-6 py-4">
                          <Link
                            to={`${APP_PREFIX_PATH}/organizer/reports/event-details/${event.id}`}
                            className="text-blue-600 hover:text-blue-800 font-semibold"
                          >
                            {event?.event_name}
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          {event?.attendees_count?.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-green-600 text-sm space-y-1">
                       

                          {event?.event_revenue}
                        </td>
                      </tr>
                    ))
                  : data?.theaters?.map((theater) => (
                      <tr key={theater.theater_id}>
                        <td className="px-6 py-4">
                          <Link
                            to={`${APP_PREFIX_PATH}/organizer/reports/theater-details/${theater.theater_id}`}
                            className="text-blue-600 hover:text-blue-800 font-semibold"
                          >
                            {theater?.theater_name}
                          </Link>
                        </td>
                        <td className="px-4 py-3">{theater?.screens_count}</td>
                        <td className="px-4 py-3">{theater?.movies_count}</td>

                        <td className="px-4 py-3 text-green-600 text-sm space-y-1">
                        

                          {theater?.theatre_revenue || 0}
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </div> */}

          <div className="overflow-x-auto mb-8">
            <Table
              columns={getColumns(activeSegment)}
              dataSource={
                activeSegment === "events" ? data?.[0]?.events : userTheaterList
              }
              rowKey={(record) =>
                activeSegment === "events" ? record.id : record.theater_id
              }
              pagination={{
                current: pagination?.current,
                pageSize: pagination?.pageSize,
                total: pagination?.total,
                onChange: (page, pageSize) => handlePagination(page, pageSize),
              }}
              scroll={{ x: 800 }}
              className="force-visible-columns"
              style={{ minWidth: "800px" }}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-gray-500 text-sm font-medium mb-4">Revenue</h3>
            <div className="h-64">
              <Bar
                data={chartData}
                options={{
                  maintainAspectRatio: false,
                  scales: { y: { beginAtZero: true } },
                }}
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-gray-500 text-sm font-medium mb-4">Status</h3>
            <div className="h-64">
              <Pie
                data={statusData}
                options={{
                  maintainAspectRatio: false,
                  plugins: { legend: { position: "bottom" } },
                }}
              />
            </div>
          </div>
        </div>
      </Spin>
    </div>
  );
};

export default OrganizerReport;
