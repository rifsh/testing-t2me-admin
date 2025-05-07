import React from "react";
import { Link } from "react-router-dom";
import { Bar, Pie } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import { eventDetail } from "mock/data/reportData";

Chart.register(...registerables);

const EventDetail = () => {
  const getStatusBadge = (status) => {
    const baseClasses = "px-3 py-1 rounded-md text-sm font-medium";
    switch (status) {
      case "Upcoming":
        return (
          <span className={`${baseClasses} bg-blue-100 text-blue-800`}>
            Upcoming
          </span>
        );
      case "Completed":
        return (
          <span className={`${baseClasses} bg-green-100 text-green-800`}>
            Completed
          </span>
        );
      case "Cancelled":
        return (
          <span className={`${baseClasses} bg-red-100 text-red-800`}>
            Cancelled
          </span>
        );
      default:
        return (
          <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>
            Unknown
          </span>
        );
    }
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Chart data
  const ticketSalesData = {
    labels: eventDetail.ticketTypes.map((t) => t.name),
    datasets: [
      {
        data: eventDetail.ticketTypes.map((t) => t.sold),
        backgroundColor: ["#0dcaf0", "#198754", "#dc3545"],
        borderWidth: 1,
      },
    ],
  };

  const revenueData = {
    labels: eventDetail.ticketTypes.map((t) => t.name),
    datasets: [
      {
        label: "Revenue ($)",
        data: eventDetail.ticketTypes.map((t) => t.price * t.sold),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <Link
          to={`${APP_PREFIX_PATH}/organizer/reports`}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          &larr; Back to Events
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        {/* Event Header */}
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <img
            src={eventDetail.image}
            alt={eventDetail.title}
            className="w-full md:w-2/5 h-64 object-cover rounded-lg"
          />
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {eventDetail.title}
            </h1>
            <p className="text-gray-600 mb-4">{eventDetail.description}</p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500">Organizer</div>
                <div className="font-medium">{eventDetail.organizer}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Status</div>
                <div>{getStatusBadge(eventDetail.status)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Dates</div>
                <div className="font-medium">
                  {formatDate(eventDetail.startDate)} -{" "}
                  {formatDate(eventDetail.endDate)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Location</div>
                <div className="font-medium">{eventDetail.location}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Attendance</div>
            <div className="text-2xl font-bold">
              {eventDetail.attendees}/{eventDetail.capacity}
            </div>
            <div className="text-sm text-gray-600">
              (
              {Math.round((eventDetail.attendees / eventDetail.capacity) * 100)}
              % filled)
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Total Revenue</div>
            <div className="text-2xl font-bold text-green-600">
              ${eventDetail.revenue.toLocaleString()}
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Ticket Types</div>
            <div className="text-2xl font-bold">
              {eventDetail.ticketTypes.length}
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium mb-4">
              Ticket Sales Distribution
            </h3>
            <div className="h-64">
              <Pie
                data={ticketSalesData}
                options={{
                  maintainAspectRatio: false,
                  plugins: { legend: { position: "bottom" } },
                }}
              />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium mb-4">Revenue by Ticket Type</h3>
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

        {/* Schedule */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium mb-4">Event Schedule</h3>
          <div className="space-y-4">
            {eventDetail.schedule.map((item, index) => (
              <div
                key={index}
                className="flex items-center p-3 bg-gray-50 rounded-lg"
              >
                <div className="w-20">
                  <div className="text-sm font-medium">
                    {new Date(item.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                  <div className="text-sm text-gray-500">{item.time}</div>
                </div>
                <div className="ml-4 flex-1">
                  <div className="font-medium">{item.title}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
