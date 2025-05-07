import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Bar, Pie } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { events } from "mock/data/reportData";

Chart.register(...registerables);

const EventDetail = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const event = events.find((e) => e.id === parseInt(eventId));

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-6 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          Event not found
        </h2>
        <Link
          to="/super-admin/event-details"
          className="text-blue-600 hover:underline"
        >
          Back to Events
        </Link>
      </div>
    );
  }

  // Chart data
  const ticketSalesData = {
    labels: event.ticketTypes.map((t) => t.name),
    datasets: [
      {
        data: event.ticketTypes.map((t) => t.sold),
        backgroundColor: ["#0dcaf0", "#198754"],
      },
    ],
  };

  const revenueData = {
    labels: ["Current Revenue", "Potential Revenue"],
    datasets: [
      {
        data: [
          event.revenue,
          (event.capacity - event.attendees) * event.ticketTypes[0].price,
        ],
        backgroundColor: ["#4c51bf", "#cbd5e0"],
      },
    ],
  };

  // Export handlers
  const handleExportPDF = async () => {
    const input = document.getElementById("event-content");
    const canvas = await html2canvas(input);
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF();
    const imgWidth = 200;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 5, 5, imgWidth, imgHeight);
    pdf.save(`${event.title}-report.pdf`);
  };

  const handleExportCSV = () => {
    const csvContent = [
      ["Ticket Type", "Price", "Sold"],
      ...event.ticketTypes.map((ticket) => [
        ticket.name,
        ticket.price,
        ticket.sold,
      ]),
    ]
      .map((e) => e.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${event.title}-tickets.csv`;
    a.click();
  };

  return (
    <div className="container mx-auto px-4 py-6" id="event-content">
      <div className="mb-6">
        <span
          onClick={() => navigate(-1)}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium cursor-pointer"
        >
          &larr; Back to Events
        </span>
      </div>

      {/* Event Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8 border border-gray-200">
        <div className="flex flex-col md:flex-row gap-8">
          <img
            src={event.image}
            alt={event.title}
            className="w-full md:w-1/2 h-64 object-cover rounded-lg"
          />
          <div className="w-full md:w-1/2">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {event.title}
            </h1>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600">Start Date</p>
                <p className="font-medium">
                  {new Date(event.startDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">End Date</p>
                <p className="font-medium">
                  {new Date(event.endDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Location</p>
                <p className="font-medium">{event.location}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="font-medium capitalize">{event.status}</p>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-600">{event.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="text-gray-500 text-sm font-medium mb-2">Attendance</h3>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold">
              {event.attendees}/{event.capacity}
            </p>
            <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {Math.round((event.attendees / event.capacity) * 100)}%
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="text-gray-500 text-sm font-medium mb-2">
            Total Revenue
          </h3>
          <p className="text-2xl font-bold text-green-600">
            ${event.revenue.toLocaleString()}
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="text-gray-500 text-sm font-medium mb-2">
            Ticket Sales
          </h3>
          <div className="flex justify-between items-center">
            {event.ticketTypes.map((ticket, index) => (
              <div key={index} className="text-center">
                <p className="text-sm text-gray-600">{ticket.name}</p>
                <p className="font-medium">{ticket.sold}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-gray-500 text-sm font-medium mb-4">
            Ticket Sales Distribution
          </h3>
          <div className="h-64">
            <Pie
              data={ticketSalesData}
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

      {/* Tickets Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex justify-between items-center p-4 bg-gray-50">
          <h3 className="text-gray-700 font-medium">Ticket Details</h3>
          <div className="flex gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
            >
              Export CSV
            </button>
            <button
              onClick={handleExportPDF}
              className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
            >
              Export PDF
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                  Ticket Type
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                  Price
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                  Sold
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                  Remaining
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {event.ticketTypes.map((ticket, index) => (
                <tr key={index}>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {ticket.name}
                  </td>
                  <td className="px-4 py-3">${ticket.price}</td>
                  <td className="px-4 py-3">{ticket.sold}</td>
                  <td className="px-4 py-3">{event.capacity - ticket.sold}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
