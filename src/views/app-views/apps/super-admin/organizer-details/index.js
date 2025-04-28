import React from "react";
import { useParams, Link } from "react-router-dom";
import { Bar, Pie } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { APP_PREFIX_PATH } from "configs/AppConfig";

Chart.register(...registerables);

const OrganizerDetail = () => {
  const { organizerId } = useParams();

  // Hardcoded data - replace with your actual data structure
  const organizers = [
    {
      id: 1,
      name: "Irshad",
      email: "irshad@mail.com",
      events: 12,
      attendees: 4500,
      revenue: 125000,
      status: "Active",
      lastLogin: "2025-04-15",
      registrationDate: "2024-01-01",
      phone: "+91 9876543210",
      eventsList: [
        {
          id: 1,
          name: "Tech Conference",
          date: "2025-03-15",
          attendees: 1200,
          revenue: 50000,
        },
        {
          id: 2,
          name: "Startup Summit",
          date: "2025-04-20",
          attendees: 800,
          revenue: 30000,
        },
      ],
    },
    {
      id: 2,
      name: "Rifash",
      email: "rifash@mail.com",
      events: 8,
      attendees: 12000,
      revenue: 385000,
      status: "Active",
      lastLogin: "2025-04-14",
      registrationDate: "2024-01-01",
      phone: "+91 9876543210",
      eventsList: [
        {
          id: 1,
          name: "Tech Conference",
          date: "2025-03-15",
          attendees: 1200,
          revenue: 50000,
        },
        {
          id: 2,
          name: "Startup Summit",
          date: "2025-04-20",
          attendees: 800,
          revenue: 30000,
        },
      ],
    },
    {
      id: 3,
      name: "Yasin",
      email: "yasin@gmail.co",
      events: 5,
      attendees: 8000,
      revenue: 215000,
      status: "Inactive",
      lastLogin: "2025-04-10",
      registrationDate: "2024-01-01",
      phone: "+91 9876543210",
      eventsList: [
        {
          id: 1,
          name: "Tech Conference",
          date: "2025-03-15",
          attendees: 1200,
          revenue: 50000,
        },
        {
          id: 2,
          name: "Startup Summit",
          date: "2025-04-20",
          attendees: 800,
          revenue: 30000,
        },
      ],
    },
    {
      id: 4,
      name: "Jasim",
      email: "jasin@mail.com",
      events: 3,
      attendees: 1500,
      revenue: 45000,
      status: "Inactive",
      lastLogin: "2025-04-12",
      registrationDate: "2024-01-01",
      phone: "+91 9876543210",
      eventsList: [
        {
          id: 1,
          name: "Tech Conference",
          date: "2025-03-15",
          attendees: 1200,
          revenue: 50000,
        },
        {
          id: 2,
          name: "Startup Summit",
          date: "2025-04-20",
          attendees: 800,
          revenue: 30000,
        },
      ],
    },
  ];

  const organizer = organizers.find((org) => org.id === parseInt(organizerId));

  if (!organizer) {
    return (
      <div className="container mx-auto px-4 py-6 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          Organizer not found
        </h2>
        <Link
          to="/super-admin/reports"
          className="text-blue-600 hover:underline"
        >
          Back to Reports
        </Link>
      </div>
    );
  }

  // Chart data
  const eventsChartData = {
    labels: organizer.eventsList.map((event) => event.name),
    datasets: [
      {
        label: "Revenue per Event",
        data: organizer.eventsList.map((event) => event.revenue),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 2,
      },
    ],
  };

  const statusData = {
    labels: ["Active Events", "Completed Events"],
    datasets: [
      {
        data: [8, 4],
        backgroundColor: ["#198754", "#dc3545"],
      },
    ],
  };

  // Export handlers
  const handleExportPDF = async () => {
    const input = document.getElementById("organizer-content");
    const canvas = await html2canvas(input);
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF();
    const imgWidth = 200;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 5, 5, imgWidth, imgHeight);
    pdf.save(`${organizer.name}-report.pdf`);
  };

  const handleExportCSV = () => {
    const csvContent = [
      ["Event Name", "Date", "Attendees", "Revenue"],
      ...organizer.eventsList.map((event) => [
        event.name,
        event.date,
        event.attendees,
        event.revenue,
      ]),
    ]
      .map((e) => e.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${organizer.name}-events.csv`;
    a.click();
  };

  return (
    <div className="container mx-auto px-4 py-6" id="organizer-content">
      <div className="mb-6">
        <Link
          to="/super-admin/reports"
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          &larr; Back to Organizers
        </Link>
      </div>

      {/* Organizer Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8 border border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {organizer.name}
            </h1>
            <p className="text-gray-600 mt-2">{organizer.email}</p>
            <p className="text-gray-600">Phone: {organizer.phone}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Registered:{" "}
              {new Date(organizer.registrationDate).toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-600">
              Last Login: {new Date(organizer.lastLogin).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="text-gray-500 text-sm font-medium mb-2">
            Total Events
          </h3>
          <p className="text-2xl font-bold">{organizer.events}</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="text-gray-500 text-sm font-medium mb-2">
            Total Revenue
          </h3>
          <p className="text-2xl font-bold text-green-600">
            ${organizer.revenue.toLocaleString()}
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="text-gray-500 text-sm font-medium mb-2">Status</h3>
          {organizer.status === "Active" ? (
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              Active
            </span>
          ) : (
            <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm">
              Inactive
            </span>
          )}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-gray-500 text-sm font-medium mb-4">
            Event Revenue
          </h3>
          <div className="h-64">
            <Bar
              data={eventsChartData}
              options={{
                maintainAspectRatio: false,
                scales: { y: { beginAtZero: true } },
              }}
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-gray-500 text-sm font-medium mb-4">
            Event Status
          </h3>
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

      {/* Events Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex justify-between items-center p-4 bg-gray-50">
          <h3 className="text-gray-700 font-medium">Events List</h3>
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
                  Event Name
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                  Attendees
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                  Revenue
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {organizer.eventsList.map((event, index) => (
                <tr key={index}>
                  <td className="px-6 py-4">
                    <Link
                      to={`${APP_PREFIX_PATH}/super-admin/organizer-details/event-details/${event.id}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {event.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(event.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">{event.attendees}</td>
                  <td className="px-4 py-3 font-bold text-green-600">
                    ${event.revenue.toLocaleString()}
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

export default OrganizerDetail;
