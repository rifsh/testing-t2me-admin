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

  // Hardcoded data
  const eventOrganizers = [
    {
      id: 1,
      name: "Irshad",
      email: "irshad@mail.com",
      type: "event",
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
      type: "event",
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
      type: "event",
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
      type: "event",
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

  const movieOrganizers = [
    {
      id: 101,
      name: "Jasim",
      email: "jasim@mail.com",
      type: "movie",
      movies: 5,
      attendees: 3000,
      revenue: 75000,
      status: "Active",
      lastLogin: "2025-04-16",
      registrationDate: "2024-01-01",
      phone: "+91 9876543210",
      moviesList: [
        {
          id: 101,
          name: "Thudarum",
          releaseDate: "2025-03-15",
          attendees: 1200,
          revenue: 50000,
          showtimes: ["10:00 AM", "02:30 PM", "07:00 PM"],
        },
        {
          id: 102,
          name: "Jimkhana",
          releaseDate: "2025-04-20",
          attendees: 800,
          revenue: 30000,
          showtimes: ["11:00 AM", "03:30 PM"],
        },
      ],
    },
    {
      id: 102,
      name: "Ahmad",
      email: "ahmad@mail.com",
      type: "movie",
      movies: 1,
      attendees: 3000,
      revenue: 75000,
      status: "Active",
      lastLogin: "2025-04-16",
      registrationDate: "2024-01-01",
      phone: "+91 9876543210",
      moviesList: [
        {
          id: 103,
          name: "Vikram",
          releaseDate: "2025-03-15",
          attendees: 1200,
          revenue: 50000,
          showtimes: ["10:00 AM", "02:30 PM", "07:00 PM"],
        },
      ],
    },
    {
      id: 103,
      name: "Farhan",
      email: "farhan@mail.com",
      type: "movie",
      movies: 2,
      attendees: 5000,
      revenue: 85000,
      status: "Active",
      lastLogin: "2025-04-16",
      registrationDate: "2024-01-01",
      phone: "+91 9876543210",
      moviesList: [
        {
          id: 104,
          name: "KGF",
          releaseDate: "2025-03-15",
          attendees: 1800,
          revenue: 60000,
          showtimes: ["10:00 AM", "02:30 PM", "07:00 PM"],
        },
        {
          id: 105,
          name: "Empuraan",
          releaseDate: "2025-04-20",
          attendees: 800,
          revenue: 30000,
          showtimes: ["11:00 AM", "03:30 PM"],
        },
      ],
    },
    {
      id: 104,
      name: "Syed",
      email: "syed@mail.com",
      type: "movie",
      movies: 3,
      attendees: 9000,
      revenue: 95000,
      status: "Active",
      lastLogin: "2025-04-16",
      registrationDate: "2024-01-01",
      phone: "+91 9876543210",
      moviesList: [
        {
          id: 106,
          name: "AaaduJeevitham",
          releaseDate: "2025-03-15",
          attendees: 1200,
          revenue: 50000,
          showtimes: ["10:00 AM", "02:30 PM", "07:00 PM"],
        },
        {
          id: 107,
          name: "Chitham",
          releaseDate: "2025-04-20",
          attendees: 1000,
          revenue: 20000,
          showtimes: ["11:00 AM", "03:30 PM"],
        },
        {
          id: 108,
          name: "Premalu",
          releaseDate: "2025-04-20",
          attendees: 3000,
          revenue: 25000,
          showtimes: ["11:00 AM", "03:30 PM"],
        },
      ],
    },
  ];

  // Combine organizers and find the current one
  const organizer = [...eventOrganizers, ...movieOrganizers].find(
    (org) => org.id === parseInt(organizerId)
  );

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

  // Chart data - handles both event and movie organizers
  const itemsChartData = {
    labels:
      organizer.type === "event"
        ? organizer.eventsList?.map((event) => event.name)
        : organizer.moviesList?.map((movie) => movie.name),
    datasets: [
      {
        label: organizer.type === "event" ? "Event Revenue" : "Movie Revenue",
        data:
          organizer.type === "event"
            ? organizer.eventsList?.map((event) => event.revenue)
            : organizer.moviesList?.map((movie) => movie.revenue),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 2,
      },
    ],
  };

  const statusData = {
    labels: ["Active", "Inactive"],
    datasets: [
      {
        data: [
          organizer.status === "Active" ? 1 : 0,
          organizer.status === "Inactive" ? 1 : 0,
        ],
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
    const items =
      organizer.type === "event" ? organizer.eventsList : organizer.moviesList;
    const csvContent = [
      organizer.type === "event"
        ? ["Event Name", "Date", "Attendees", "Revenue"]
        : ["Movie Name", "Release Date", "Attendees", "Revenue", "Showtimes"],
      ...items.map((item) =>
        organizer.type === "event"
          ? [item.name, item.date, item.attendees, item.revenue]
          : [
              item.name,
              item.releaseDate,
              item.attendees,
              item.revenue,
              item.showtimes.join(", "),
            ]
      ),
    ]
      .map((e) => e.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${organizer.name}-${
      organizer.type === "event" ? "events" : "movies"
    }.csv`;
    a.click();
  };

  return (
    <div className="container mx-auto px-4 py-6" id="organizer-content">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <Link
            to="/super-admin/reports"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            &larr; Back to Organizers
          </Link>

          <div className="flex gap-2 ml-auto">
            {" "}
            {/* Added ml-auto here */}
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
            <p className="text-gray-600 capitalize">
              Type: {organizer.type} Organizer
            </p>
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
            Total {organizer.type === "event" ? "Events" : "Movies"}
          </h3>
          <p className="text-2xl font-bold">
            {organizer.type === "event" ? organizer.events : organizer.movies}
          </p>
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
            {organizer.type === "event" ? "Event" : "Movie"} Revenue
          </h3>
          <div className="h-64">
            <Bar
              data={itemsChartData}
              options={{
                maintainAspectRatio: false,
                scales: { y: { beginAtZero: true } },
              }}
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-gray-500 text-sm font-medium mb-4">
            Status Distribution
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

      {/* Items Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex justify-between items-center p-4 bg-gray-50">
          <h3 className="text-gray-700 font-medium">
            {organizer.type === "event" ? "Events" : "Movies"} List
          </h3>
          {/* <div className="flex gap-2">
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
          </div> */}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                  {organizer.type === "event" ? "Event" : "Movie"} Name
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                  {organizer.type === "event" ? "Date" : "Release Date"}
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                  Attendees
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                  Revenue
                </th>
                {organizer?.type === "movie" && (
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                    Showtimes
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {(organizer?.type === "event"
                ? organizer?.eventsList
                : organizer?.moviesList
              ).map((item, index) => (
                <tr key={index}>
                  {/* <td className="px-6 py-4">
                    <Link
                      to={`${APP_PREFIX_PATH}/super-admin/organizer-details/${
                        organizer.type === "event" ? "event" : "movie"
                      }-details/${item.id}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {item.name}
                    </Link>
                  </td> */}

                  <td className="px-6 py-4">
                    <Link
                      to={
                        organizer.type === "movie"
                          ? `${APP_PREFIX_PATH}/super-admin/organizer-details/movie-details/${item.id}`
                          : `${APP_PREFIX_PATH}/super-admin/organizer-details/event-details/${item.id}`
                      }
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {item.name}
                    </Link>
                  </td>

                  <td className="px-4 py-3 text-gray-500">
                    {new Date(
                      organizer.type === "event" ? item.date : item.releaseDate
                    ).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">{item.attendees}</td>
                  <td className="px-4 py-3 font-bold text-green-600">
                    ${item.revenue.toLocaleString()}
                  </td>
                  {organizer.type === "movie" && (
                    <td className="px-4 py-3 text-gray-500">
                      {item.showtimes.join(", ")}
                    </td>
                  )}
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
