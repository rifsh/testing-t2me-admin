import React, { useState, useRef, useEffect, useMemo } from "react";
import { Bar } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import { Link } from "react-router-dom";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import { Select, DatePicker, message } from "antd";
import { exportToPdf, exportToExcel } from "utils/exportUtils";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import { getUserdata } from "store/slices/authSlice";
import {
  fetchCountryList,
  fetchMovieUserDetails,
  fetchUserDetails,
  fetchUserTheaters,
  setSelectedCountry,
} from "store/slices/reportSlice";
import usePaginationHook from "utils/hooks/usePaginationHandler";
import { DEFAULT_PAGE_SIZE } from "constants/PageConstants";
import LoadingOverlay from "components/util-components/Loader";

Chart.register(...registerables);

const { Option } = Select;
const { RangePicker } = DatePicker;

const OrganizerReport = () => {
  const [activeSegment, setActiveSegment] = useState("events");
  const [timeFilter, setTimeFilter] = useState("option");
  const [customDateRange, setCustomDateRange] = useState([]);
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
  const { data: userDetailsData, loading: userDetailsLoading } = useSelector(
    (state) => state.report.userDetails
  );
  const { data: movieUserDetailsData, loading: movieUserDetailsLoading } =
    useSelector((state) => state.report.movieUserDetails);

  const handlePagination = usePaginationHook(fetchMovieUserDetails);

  const handleChange = (value) => {
    dispatch(setSelectedCountry(value));
  };

  useEffect(() => {
    if (!organizerId) return;

    if (activeSegment === "events") {
      dispatch(
        fetchUserDetails({ userId: organizerId, countryId: selectedCountry })
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

  const userTheaterList = userTheaters?.items;
  const organizerInfo = userDetailsData?.[0] || movieUserDetailsData?.[0];

  const handleTimeFilterChange = (value) => {
    setTimeFilter(value);
    setCustomDateRange([]);
  };

  const disabledCustomDate = (current) => {
    if (!customDateRange[0]) return false;
    const tooLate =
      customDateRange[0] && current.diff(customDateRange[0], "month") >= 3;
    const tooEarly =
      customDateRange[1] && customDateRange[1].diff(current, "month") >= 3;
    return !!tooEarly || !!tooLate;
  };

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

  const handleExportPDF = async () => {
    exportToPdf(reportRef, "MyReport.pdf");
  };

  const handleExportCSV = () => {
    exportToExcel(reportRef, "MyReport.xlsx");
  };

  const filterControls = (
    <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap">
      <Select
        className="w-full rounded-2xl border-none bg-white/40 text-sm sm:w-40"
        value={timeFilter}
        onChange={handleTimeFilterChange}
        dropdownStyle={{ borderRadius: 12 }}
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
          className="w-full rounded-2xl border-none bg-white/40 text-sm sm:w-64"
          disabledDate={disabledCustomDate}
          onCalendarChange={(dates) => dates && setCustomDateRange(dates)}
        />
      )}

      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
        <button
          onClick={handleExportPDF}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white/90 px-5 py-2 text-sm font-semibold text-blue-600 shadow hover:bg-white sm:w-auto"
        >
          Export PDF
        </button>
        <button
          onClick={handleExportCSV}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-500 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-blue-600 sm:w-auto"
        >
          Export CSV
        </button>
      </div>
    </div>
  );

  const totalPrimaryCount =
    activeSegment === "events"
      ? organizerInfo?.total_events
      : movieUserDetailsData?.total_theaters;
  const totalRevenue =
    activeSegment === "events"
      ? organizerInfo?.total_revenue
      : movieUserDetailsData?.total_revenue;
  const totalParticipation =
    activeSegment === "events"
      ? organizerInfo?.total_attendees
      : movieUserDetailsData?.total_tickets;

  const topPerformers = useMemo(() => {
    const source =
      activeSegment === "events" ? organizerInfo?.events : userTheaterList;
    if (!source) return [];

    return [...source].sort((a, b) => {
      const aRevenue =
        activeSegment === "events"
          ? Number(a?.event_revenue) || 0
          : Number(a?.theatre_revenue) || 0;
      const bRevenue =
        activeSegment === "events"
          ? Number(b?.event_revenue) || 0
          : Number(b?.theatre_revenue) || 0;
      return bRevenue - aRevenue;
    });
  }, [activeSegment, organizerInfo, userTheaterList]);

  // Generate chart data from API with old styling
  const revenueTrendData = useMemo(() => {
    const source =
      activeSegment === "events" ? organizerInfo?.events : userTheaterList;

    if (!source || source.length === 0) {
      return {
        labels: ["No Data"],
        data: [0],
        backgroundColor: ["rgba(92, 195, 246, 0.3)"],
      };
    }

    // Take top 3 items for the chart
    const topItems = [...source].sort((a, b) => {
      const aRevenue =
        activeSegment === "events"
          ? Number(a?.event_revenue) || 0
          : Number(a?.theatre_revenue) || 0;
      const bRevenue =
        activeSegment === "events"
          ? Number(b?.event_revenue) || 0
          : Number(b?.theatre_revenue) || 0;
      return bRevenue - aRevenue;
    });
    const labels = topItems.map((item) =>
      activeSegment === "events"
        ? item.event_name.slice(0, 15)
        : item.theater_name.slice(0, 15)
    );
    const hintText = topItems.map((item) =>
      activeSegment === "events" ? item.event_name : item.theater_name
    );

    const data = topItems.map((item) =>
      activeSegment === "events"
        ? item.event_revenue
        : item.theatre_revenue || 0
    );

    // Apply the old styling pattern - light, solid, light
    const backgroundColor = data.map((_, index) => {
      if (index === 1) return "rgb(92, 177, 246)"; // Middle bar - solid blue
      return "rgba(92, 195, 246, 0.3)"; // Side bars - light blue
    });

    return { labels, hintText, data, backgroundColor };
  }, [activeSegment, organizerInfo, userTheaterList]);

  return (
    <div className="min-h-screen mr-2" ref={reportRef}>
      <LoadingOverlay loading={userDetailsLoading || movieUserDetailsLoading} />
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="space-y-8">
            <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-blue-500 via-blue-500 to-blue-600 text-white shadow-2xl">
              <div className="relative overflow-hidden p-8">
                <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/20 blur-0" />
                <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-white/10" />
                <div className="relative z-10 flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                  <div className="max-w-xl">
                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/70">
                      Organizer analytics
                    </p>
                    <h1 className="mt-3 text-3xl font-semibold leading-tight text-white">
                      Sharpen your insights with professional reports
                    </h1>
                    <p className="mt-4 text-sm text-white/80">
                      Switch between event and movie performance to explore
                      revenue, attendance, and venue outcomes with your live
                      data.
                    </p>
                  </div>
                  <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                    <span className="text-xs font-medium uppercase tracking-wide text-white/70">
                      Active segment
                    </span>
                    <div className="flex gap-2 rounded-full bg-white/20 p-1 shadow-lg backdrop-blur">
                      {["events", "movies"].map((segment) => (
                        <button
                          key={segment}
                          onClick={() => setActiveSegment(segment)}
                          className={`rounded-full px-5 py-2 text-sm capitalize transition-all ${
                            activeSegment === segment
                              ? "bg-white text-blue-600 shadow"
                              : "text-white/80 hover:bg-white/10"
                          }`}
                        >
                          {segment}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="relative z-10 mt-6">{filterControls}</div>
              </div>
            </section>

            <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              <div className="rounded-3xl border border-white/60 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="rounded-2xl bg-blue-50 p-4 text-blue-500">
                    <svg
                      className="h-6 w-6"
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
                    <p className="text-sm text-gray-500">
                      {activeSegment === "events"
                        ? "Total events"
                        : "Total theaters"}
                    </p>
                    <p className="mt-1 text-3xl font-semibold text-gray-900">
                      {totalPrimaryCount ?? "—"}
                    </p>
                    <p className="text-xs text-gray-400">
                      Currently managed items
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-white/60 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="rounded-2xl bg-green-50 p-4 text-green-500">
                    <svg
                      className="h-6 w-6"
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
                    <p className="text-sm text-gray-500">Total revenue</p>
                    <p className="mt-1 text-3xl font-semibold text-gray-900">
                      {totalRevenue ? Number(totalRevenue).toFixed(2) : "—"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {organizerInfo?.total_revenue_by_country?.[0]
                        ?.currency_code || "AED"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-white/60 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="rounded-2xl bg-blue-50 p-4 text-blue-500">
                    <svg
                      className="h-6 w-6"
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
                    <p className="text-sm text-gray-500">
                      {activeSegment === "movies"
                        ? "Tickets sold"
                        : "Total attendees"}
                    </p>
                    <p className="mt-1 text-3xl font-semibold text-gray-900">
                      {totalParticipation ?? "—"}
                    </p>
                    <p className="text-xs text-gray-400">
                      Engagement across the period
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-3xl bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                Revenue Trend
              </h3>

              <div className="mt-6">
                <Bar
                  data={{
                    labels: revenueTrendData.labels, 
                    datasets: [
                      {
                        data: revenueTrendData.data,
                        backgroundColor: revenueTrendData.backgroundColor,
                        borderRadius: 8,
                        barThickness: 40,
                      },
                    ],
                  }}
                  options={{
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: function (value) {
                            return value.toLocaleString();
                          },
                        },
                      },
                      x: {
                        grid: { display: false },
                        ticks: {
                          callback: function (value, index) {
                            // Display truncated label on x-axis
                            const label = this.getLabelForValue(value);
                            return label;
                          },
                        },
                      },
                    },
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        callbacks: {
                          title: function (context) {
                            // Show full name in tooltip
                            return revenueTrendData.hintText[
                              context[0].dataIndex
                            ];
                          },
                          label: function (context) {
                            return `Revenue: ${Number(context.parsed.y).toFixed(
                              2
                            )} AED`;
                          },
                        },
                      },
                    },
                  }}
                  height={180}
                />
              </div>
            </section>
          </div>

          <aside className="space-y-8">
            <section className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900">
                  {activeSegment === "events" ? "Top Events" : "Top Theaters"}
                </h3>
              </div>
              <div className="space-y-3">
                {topPerformers?.map((item) => {
                  const isEventItem = activeSegment === "events";
                  const itemId = isEventItem ? item.id : item.theater_id;
                  const itemName = isEventItem
                    ? item.event_name
                    : item.theater_name;
                  const itemRevenue = isEventItem
                    ? item.event_revenue
                    : item.theatre_revenue || 0;

                  return (
                    <div
                      key={itemId}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center text-white font-semibold">
                            {itemName?.[0]}
                          </div>
                          <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {itemName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {Number(itemRevenue).toFixed(2)} AED
                          </p>
                        </div>
                      </div>
                      <Link
                        to={`${APP_PREFIX_PATH}/organizer/reports/${
                          isEventItem ? "event-details" : "theater-details"
                        }/${itemId}`}
                        className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
                      >
                        View
                      </Link>
                    </div>
                  );
                })}
                {topPerformers.length === 0 && (
                  <p className="text-xs text-gray-500 text-center py-4">
                    No data available
                  </p>
                )}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default OrganizerReport;
