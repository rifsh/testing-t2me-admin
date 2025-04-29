// import React from "react";
// import { useParams, Link } from "react-router-dom";
// import { Pie, Bar } from "react-chartjs-2";
// import { Chart, registerables } from "chart.js";
// Chart.register(...registerables);

// const EventDetail = () => {
//   const { eventId } = useParams();

//   // Mock data - in real app this would come from API
//   const events = [
//     {
//       id: 1,
//       title: "Tech Conference 2025",
//       image: "https://example.com/tech-conf.jpg",
//       description: "Annual technology conference featuring top industry experts and cutting-edge innovations.",
//       startDate: "2025-05-20",
//       endDate: "2025-05-22",
//       location: "Convention Center, New Delhi",
//       status: "Upcoming",
//       attendees: 250,
//       capacity: 300,
//       revenue: 12500,
//       ticketTypes: [
//         { name: "General Admission", price: 50, sold: 200 },
//         { name: "VIP Pass", price: 150, sold: 50 },
//       ]
//     },
//     // Add other events with similar structure
//   ];

//   const event = events.find(e => e.id === parseInt(eventId));

//   if (!event) {
//     return (
//       <div className="container mx-auto px-4 py-6 text-center">
//         <h2 className="text-2xl font-bold text-red-600 mb-4">Event not found</h2>
//         <Link to="/" className="text-blue-600 hover:underline">
//           Back to Events
//         </Link>
//       </div>
//     );
//   }

//   // Calculate statistics
//   const attendancePercentage = Math.round((event.attendees / event.capacity) * 100);
//   const ticketsSoldData = {
//     labels: event.ticketTypes.map(t => t.name),
//     datasets: [{
//       data: event.ticketTypes.map(t => t.sold),
//       backgroundColor: ["#0dcaf0", "#198754", "#ffc107"],
//     }]
//   };

//   const revenueComparisonData = {
//     labels: ["This Event", "Average Event"],
//     datasets: [{
//       label: "Revenue ($)",
//       data: [event.revenue, 8500], // Mock average
//       backgroundColor: ["#4c51bf", "#cbd5e0"],
//     }]
//   };

//   const formatDate = (dateString) => {
//     const options = { year: "numeric", month: "long", day: "numeric" };
//     return new Date(dateString).toLocaleDateString(undefined, options);
//   };

//   return (
//     <div className="container mx-auto px-4 py-6">
//       <div className="mb-6">
//         <Link
//           to="/"
//           className="text-blue-600 hover:text-blue-800 text-sm font-medium"
//         >
//           &larr; Back to Events
//         </Link>
//       </div>

//       {/* Event Header */}
//       <div className="bg-white rounded-lg shadow-md p-6 mb-8 border border-gray-200">
//         <h1 className="text-3xl font-bold text-gray-900 mb-4">{event.title}</h1>
//         <div className="flex flex-col md:flex-row gap-8">
//           <img
//             src={event.image}
//             alt={event.title}
//             className="w-full md:w-1/2 h-64 object-cover rounded-lg"
//           />
//           <div className="w-full md:w-1/2">
//             <div className="grid grid-cols-2 gap-4 mb-4">
//               <div>
//                 <p className="text-sm text-gray-500">Start Date</p>
//                 <p className="font-medium">{formatDate(event.startDate)}</p>
//               </div>
//               <div>
//                 <p className="text-sm text-gray-500">End Date</p>
//                 <p className="font-medium">{formatDate(event.endDate)}</p>
//               </div>
//               <div>
//                 <p className="text-sm text-gray-500">Location</p>
//                 <p className="font-medium">{event.location}</p>
//               </div>
//               <div>
//                 <p className="text-sm text-gray-500">Status</p>
//                 <p className="font-medium capitalize">{event.status}</p>
//               </div>
//             </div>
//             <div className="bg-gray-50 p-4 rounded-lg">
//               <p className="text-gray-600">{event.description}</p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//         <div className="bg-white p-6 rounded-lg border border-gray-200">
//           <h3 className="text-gray-500 text-sm font-medium mb-2">Attendance</h3>
//           <div className="flex items-center justify-between">
//             <p className="text-2xl font-bold">{event.attendees}/{event.capacity}</p>
//             <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
//               {attendancePercentage}%
//             </span>
//           </div>
//         </div>

//         <div className="bg-white p-6 rounded-lg border border-gray-200">
//           <h3 className="text-gray-500 text-sm font-medium mb-2">Total Revenue</h3>
//           <p className="text-2xl font-bold text-green-600">
//             ${event.revenue.toLocaleString()}
//           </p>
//         </div>

//         <div className="bg-white p-6 rounded-lg border border-gray-200">
//           <h3 className="text-gray-500 text-sm font-medium mb-2">Ticket Sales</h3>
//           <div className="flex justify-between items-center">
//             {event.ticketTypes.map((ticket, index) => (
//               <div key={index} className="text-center">
//                 <p className="text-sm text-gray-600">{ticket.name}</p>
//                 <p className="font-medium">{ticket.sold}</p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Charts */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
//         <div className="bg-white p-6 rounded-lg border border-gray-200">
//           <h3 className="text-gray-500 text-sm font-medium mb-4">Ticket Sales Distribution</h3>
//           <div className="h-64">
//             <Pie
//               data={ticketsSoldData}
//               options={{ maintainAspectRatio: false }}
//             />
//           </div>
//         </div>

//         <div className="bg-white p-6 rounded-lg border border-gray-200">
//           <h3 className="text-gray-500 text-sm font-medium mb-4">Revenue Comparison</h3>
//           <div className="h-64">
//             <Bar
//               data={revenueComparisonData}
//               options={{
//                 maintainAspectRatio: false,
//                 scales: { y: { beginAtZero: true } }
//               }}
//             />
//           </div>
//         </div>
//       </div>

//       {/* Ticket Pricing Table */}
//       <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
//         <table className="min-w-full">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Ticket Type</th>
//               <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Price</th>
//               <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Sold</th>
//               <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Remaining</th>
//             </tr>
//           </thead>
//           <tbody>
//             {event.ticketTypes.map((ticket, index) => (
//               <tr key={index} className="border-t border-gray-200">
//                 <td className="px-6 py-4 font-medium text-gray-900">{ticket.name}</td>
//                 <td className="px-6 py-4">${ticket.price}</td>
//                 <td className="px-6 py-4">{ticket.sold}</td>
//                 <td className="px-6 py-4">{event.capacity - ticket.sold}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default EventDetail;

import React from "react";
import { Link } from "react-router-dom";
import { Bar, Pie } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import previewImage from "assets/preview/event.jpg";
import { APP_PREFIX_PATH } from "configs/AppConfig";

Chart.register(...registerables);

const EventDetail = () => {
  // Mock data - replace with API call
  const event = {
    id: 1,
    title: "Tech Conference 2025",
    image: previewImage,
    description:
      "Annual technology conference featuring industry leaders and innovative startups.",
    startDate: "2025-05-20",
    endDate: "2025-05-22",
    location: "San Francisco Convention Center",
    status: "Upcoming",
    organizer: "Tech Events Inc.",
    attendees: 250,
    capacity: 300,
    revenue: 12500,
    ticketTypes: [
      { name: "General Admission", price: 50, sold: 200 },
      { name: "VIP Pass", price: 150, sold: 50 },
    ],
    schedule: [
      { date: "2025-05-20", time: "09:00", title: "Opening Keynote" },
      { date: "2025-05-20", time: "11:00", title: "AI Workshop" },
      { date: "2025-05-21", time: "10:00", title: "Startup Pitch Competition" },
    ],
  };

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
    labels: event.ticketTypes.map((t) => t.name),
    datasets: [
      {
        data: event.ticketTypes.map((t) => t.sold),
        backgroundColor: ["#0dcaf0", "#198754", "#dc3545"],
        borderWidth: 1,
      },
    ],
  };

  const revenueData = {
    labels: event.ticketTypes.map((t) => t.name),
    datasets: [
      {
        label: "Revenue ($)",
        data: event.ticketTypes.map((t) => t.price * t.sold),
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
            src={event.image}
            alt={event.title}
            className="w-full md:w-2/5 h-64 object-cover rounded-lg"
          />
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {event.title}
            </h1>
            <p className="text-gray-600 mb-4">{event.description}</p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500">Organizer</div>
                <div className="font-medium">{event.organizer}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Status</div>
                <div>{getStatusBadge(event.status)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Dates</div>
                <div className="font-medium">
                  {formatDate(event.startDate)} - {formatDate(event.endDate)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Location</div>
                <div className="font-medium">{event.location}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Attendance</div>
            <div className="text-2xl font-bold">
              {event.attendees}/{event.capacity}
            </div>
            <div className="text-sm text-gray-600">
              ({Math.round((event.attendees / event.capacity) * 100)}% filled)
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Total Revenue</div>
            <div className="text-2xl font-bold text-green-600">
              ${event.revenue.toLocaleString()}
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Ticket Types</div>
            <div className="text-2xl font-bold">{event.ticketTypes.length}</div>
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
            {event.schedule.map((item, index) => (
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
