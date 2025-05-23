import React, { useEffect, useState } from "react";
import { Pie, Bar } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCountryList,
  fetchEventDetails,
  setSelectedCountry,
} from "store/slices/reportSlice";
import { message, Select, Spin } from "antd";
Chart.register(...registerables);

const { Option } = Select;

const EventDetailReport = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState(true);

  const [page, setPage] = useState(1);
  const size = 50;
  const {
    data: event,
    loading,
    error,
  } = useSelector((state) => state.report.eventDetails);
  const eventData = event?.[0];
  const selectedCountry = useSelector((state) => state.report.selectedCountry);
  const { data } = useSelector((state) => state.report.countryList);
  useEffect(() => {
    const storedCountry = localStorage.getItem("selectedCountry");
    if (storedCountry) {
      dispatch(setSelectedCountry(JSON.parse(storedCountry)));
    }
  }, [dispatch]);
  const handleChange = (value) => {
    dispatch(setSelectedCountry(value));
    localStorage.setItem("selectedCountry", JSON.stringify(value)); // Save to localStorage
  };

  useEffect(() => {
    dispatch(
      fetchCountryList({ active: activeFilter, search: searchTerm, page, size })
    );
  }, [dispatch, activeFilter, searchTerm, page]);
  useEffect(() => {
    const fetchData = async () => {
      if (eventId && selectedCountry) {
        try {
          await dispatch(
            fetchEventDetails({
              eventId,
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
  }, [dispatch, eventId, selectedCountry]);

  const handleGoBack = () => navigate(-1);

  if (!eventData)
    return <div className="p-4 text-gray-500">No event data available</div>;

  // Chart data configurations
  const ticketRevenueData = {
    labels:
      eventData.revenue_by_ticket_type?.map((t) => t.ticket_type_name) || [],
    datasets: [
      {
        data: eventData.revenue_by_ticket_type?.map((t) => t.revenue) || [],
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
        ],
      },
    ],
  };
  console.log(eventData, "even");

  const scheduleRevenueData = {
    labels:
      eventData.schedule_revenue_details?.map(
        (schedule) => schedule.schedule_name
      ) || [],
    datasets: [
      {
        label: "Total Revenue",
        data:
          eventData.schedule_revenue_details?.map(
            (schedule) => schedule.total_revenue
          ) || [],
        backgroundColor: "#4BC0C0",
        borderRadius: 4,
      },
    ],
  };

  const currencyCode = eventData.revenue_by_country?.[0]?.currency_code || "";
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }
  return (
    <div className="mx-auto p-4 space-y-6">
      {/* Back Button */}
      <div className="flex items-center">
        <button
          onClick={handleGoBack}
          className="text-gray-500 hover:text-gray-700 text-sm"
        >
          &larr; Back
        </button>

        <div className="ml-auto">
          <Select
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
            {data?.[0]?.items?.map((country) => (
              <Option key={country.id} value={country.id}>
                {country.name}
              </Option>
            ))}
          </Select>
        </div>
      </div>
      {/* Event Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-800 border-b pb-2 mb-4">
          {eventData.event_name}
        </h2>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-50 p-4 rounded">
            <p className="text-sm text-gray-500">Category</p>
            <p className="font-medium">{eventData.category_name}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded">
            <p className="text-sm text-gray-500">Dates</p>
            <p className="font-medium">
              {new Date(eventData.earliest_start_date).toLocaleDateString()} -{" "}
              {new Date(eventData.latest_end_date).toLocaleDateString()}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded">
            <p className="text-sm text-gray-500">Total Revenue</p>
            <p className="text-xl font-bold text-blue-600">
              {eventData.total_revenue} {currencyCode}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded">
            <p className="text-sm text-gray-500">Total Attendees</p>
            <p className="text-xl font-bold text-green-600">
              {eventData.total_attendees}
            </p>
          </div>
        </div>
      </div>

      {/* Charts Section */}

      {/* Schedule Details */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Schedule Details</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Schedule
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dates
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Venue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Attendees
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {eventData.schedule_revenue_details?.map((schedule, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {schedule.schedule_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(schedule.start_date).toLocaleDateString()} -{" "}
                    {new Date(schedule.end_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {schedule.venue_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {schedule.total_attendees}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                    {schedule.total_revenue || 0} {currencyCode}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ticket Type Details */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Ticket Type status</h3>
        </div>
        {eventData.revenue_by_ticket_type?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ticket Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tickets Sold
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {eventData.revenue_by_ticket_type.map((ticket, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {ticket.ticket_type_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {ticket.ticket_price} {currencyCode}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {ticket.tickets_sold}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      {ticket.revenue} {currencyCode}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-4 text-center text-gray-500">
            No ticket type data available
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold text-center mb-4">
            Revenue by Ticket Type
          </h3>
          <div className="h-64 flex items-center justify-center">
            {ticketRevenueData.labels.length > 0 ? (
              <Pie
                data={ticketRevenueData}
                options={{
                  maintainAspectRatio: false,
                  plugins: {
                    tooltip: {
                      callbacks: {
                        label: (context) => {
                          const value = context.raw;
                          const total = context.dataset.data.reduce(
                            (a, b) => a + b,
                            0
                          );
                          const percentage = Math.round((value / total) * 100);
                          return `${context.label}: ${value} (${percentage}%)`;
                        },
                      },
                    },
                  },
                }}
              />
            ) : (
              <div className="text-center p-4 text-gray-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 mx-auto text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="mt-2">No revenue data available by ticket type</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold text-center mb-4">
            Revenue by Schedule
          </h3>
          <div className="h-64">
            <Bar
              data={scheduleRevenueData}
              options={{
                maintainAspectRatio: false,
                responsive: true,
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: "Revenue (₹)",
                      font: {
                        weight: "bold",
                      },
                    },
                    ticks: {
                      callback: function (value) {
                        return "₹" + value.toLocaleString();
                      },
                    },
                  },
                  x: {
                    title: {
                      display: true,
                      text: "Schedule Name",
                      font: {
                        weight: "bold",
                      },
                    },
                  },
                },
                plugins: {
                  tooltip: {
                    callbacks: {
                      label: function (context) {
                        return `Revenue: ₹${context.parsed.y.toLocaleString()}`;
                      },
                    },
                  },
                  legend: {
                    display: false, // Hide legend since we only have one dataset
                  },
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailReport;
