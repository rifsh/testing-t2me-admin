// event report , seprated , just testing

// import React from "react";
// import { Bar, Pie, Line } from "react-chartjs-2";
// import { Chart, registerables } from "chart.js";
// import { Link } from "react-router-dom";
// import { APP_PREFIX_PATH } from "configs/AppConfig";

// Chart.register(...registerables);

// const SuperAdminReport = () => {
//   // Mock data
//   const organizers = [
//     {
//       id: 1,
//       name: "Irshad",
//       email: "irshad@mail.com",
//       events: 12,
//       attendees: 4500,
//       revenue: 125000,
//       status: "Active",
//       lastLogin: "2025-04-15",
//     },
//     {
//       id: 2,
//       name: "Rifash",
//       email: "rifash@mail.com",
//       events: 8,
//       attendees: 12000,
//       revenue: 385000,
//       status: "Active",
//       lastLogin: "2025-04-14",
//     },
//     {
//       id: 3,
//       name: "Yasin",
//       email: "yasin@gmail.co",
//       events: 5,
//       attendees: 8000,
//       revenue: 215000,
//       status: "Inactive",
//       lastLogin: "2025-04-10",
//     },
//     {
//       id: 4,
//       name: "Jasim",
//       email: "jasin@mail.com",
//       events: 3,
//       attendees: 1500,
//       revenue: 45000,
//       status: "Inactive",
//       lastLogin: "2025-04-12",
//     },
//   ];

//   // Statistics calculations
//   const platformStats = {
//     totalOrganizers: organizers.length,
//     activeOrganizers: organizers.filter((o) => o.status === "Active").length,
//     totalEvents: organizers.reduce((sum, org) => sum + org.events, 0),
//     totalAttendees: organizers.reduce((sum, org) => sum + org.attendees, 0),
//     totalRevenue: organizers.reduce((sum, org) => sum + org.revenue, 0),
//     avgRevenuePerOrganizer: Math.round(
//       organizers.reduce((sum, org) => sum + org.revenue, 0) / organizers.length
//     ),
//   };

//   const getStatusBadge = (status) => {
//     const baseClasses = "px-3 py-1 rounded-md text-sm font-medium";
//     switch (status) {
//       case "Active":
//         return (
//           <span className={`${baseClasses} bg-green-100 text-green-800`}>
//             Active
//           </span>
//         );
//       case "Inactive":
//         return (
//           <span className={`${baseClasses} bg-red-100 text-red-800`}>
//             Inactive
//           </span>
//         );

//       default:
//         return (
//           <span className={`${baseClasses} bg-gray-100 text-gray-800`}>
//             Unknown
//           </span>
//         );
//     }
//   };

//   // Chart data
//   const organizerPerformanceData = {
//     labels: organizers.map((org) => org.name),
//     datasets: [
//       {
//         label: "Revenue Generated ($)",
//         data: organizers.map((org) => org.revenue),
//         backgroundColor: "rgba(75, 192, 192, 0.6)",
//         borderColor: "rgba(75, 192, 192, 1)",
//         borderWidth: 2,
//       },
//     ],
//   };

//   const statusDistributionData = {
//     labels: ["Active", "Inactive", "Pending"],
//     datasets: [
//       {
//         data: [
//           platformStats.activeOrganizers,
//           organizers.filter((o) => o.status === "Inactive").length,
//           organizers.filter((o) => o.status === "Pending").length,
//         ],
//         backgroundColor: ["#198754", "#dc3545", "#ffc107"],
//         borderWidth: 1,
//       },
//     ],
//   };

//   const eventsTimelineData = {
//     labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
//     datasets: [
//       {
//         label: "Events Created",
//         data: [12, 19, 15, 25, 18, 22],
//         borderColor: "#0d6efd",
//         tension: 0.4,
//         fill: false,
//       },
//     ],
//   };

//   return (
//     <div className="container mx-auto px-4 py-6">
//       <h2 className="text-2xl font-bold text-blue-600 mb-6">Reports</h2>

//       {/* Organizers Table */}
//       <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8 overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Organizer
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Contact
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Events
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Attendees
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Revenue
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Status
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Last Login
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {organizers.map((organizer) => (
//                 <tr key={organizer.id} className="hover:bg-gray-50">
//                   <td className="px-6 py-4">
//                     <Link
//                       to={`${APP_PREFIX_PATH}/super-admin/organizer-details/${organizer.id}`}
//                       className="text-blue-600 hover:text-blue-800 font-medium"
//                     >
//                       {organizer.name}
//                     </Link>
//                   </td>
//                   <td className="px-6 py-4 text-sm text-gray-500">
//                     {organizer.email}
//                   </td>
//                   <td className="px-6 py-4 text-sm text-gray-500">
//                     {organizer.events}
//                   </td>
//                   <td className="px-6 py-4 text-sm text-gray-500">
//                     {organizer.attendees.toLocaleString()}
//                   </td>
//                   <td className="px-6 py-4 text-sm font-bold text-green-600">
//                     ${organizer.revenue.toLocaleString()}
//                   </td>
//                   <td className="px-6 py-4">
//                     {getStatusBadge(organizer.status)}
//                   </td>
//                   <td className="px-6 py-4 text-sm text-gray-500">
//                     {new Date(organizer.lastLogin).toLocaleDateString()}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Platform Summary Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//         {/* Total Organizers */}
//         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
//           <div className="bg-blue-50 p-3 rounded-full inline-flex items-center justify-center mb-3">
//             <svg
//               className="w-6 h-6 text-blue-600"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth="2"
//                 d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
//               />
//             </svg>
//           </div>
//           <h3 className="text-gray-500 text-sm font-medium mb-1">
//             Total Organizers
//           </h3>
//           <p className="text-2xl font-bold text-gray-900">
//             {platformStats.totalOrganizers}
//           </p>
//           <p className="text-xs text-gray-400">Registered organizers</p>
//         </div>

//         {/* Active Organizers */}
//         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
//           <div className="bg-green-50 p-3 rounded-full inline-flex items-center justify-center mb-3">
//             <svg
//               className="w-6 h-6 text-green-600"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth="2"
//                 d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
//               />
//             </svg>
//           </div>
//           <h3 className="text-gray-500 text-sm font-medium mb-1">
//             Active Organizers
//           </h3>
//           <p className="text-2xl font-bold text-gray-900">
//             {platformStats.activeOrganizers}
//           </p>
//           <p className="text-xs text-gray-400">Currently active</p>
//         </div>

//         {/* Total Events */}
//         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
//           <div className="bg-purple-50 p-3 rounded-full inline-flex items-center justify-center mb-3">
//             <svg
//               className="w-6 h-6 text-purple-600"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth="2"
//                 d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
//               />
//             </svg>
//           </div>
//           <h3 className="text-gray-500 text-sm font-medium mb-1">
//             Total Events
//           </h3>
//           <p className="text-2xl font-bold text-gray-900">
//             {platformStats.totalEvents}
//           </p>
//           <p className="text-xs text-gray-400">Across all organizers</p>
//         </div>

//         {/* Total Revenue */}
//         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
//           <div className="bg-yellow-50 p-3 rounded-full inline-flex items-center justify-center mb-3">
//             <svg
//               className="w-6 h-6 text-yellow-600"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth="2"
//                 d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//               />
//             </svg>
//           </div>
//           <h3 className="text-gray-500 text-sm font-medium mb-1">
//             Total Revenue
//           </h3>
//           <p className="text-2xl font-bold text-gray-900">
//             ${platformStats.totalRevenue.toLocaleString()}
//           </p>
//           <p className="text-xs text-gray-400">Platform-wide earnings</p>
//         </div>
//       </div>

//       {/* Analytics Charts */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
//         {/* Organizer Performance */}
//         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//           <h3 className="text-gray-500 text-sm font-medium mb-3">
//             Organizer Revenue Performance
//           </h3>
//           <div className="h-64">
//             <Bar
//               data={organizerPerformanceData}
//               options={{
//                 indexAxis: "y",
//                 maintainAspectRatio: false,
//                 scales: { x: { beginAtZero: true } },
//               }}
//             />
//           </div>
//         </div>

//         {/* Status Distribution */}
//         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//           <h3 className="text-gray-500 text-sm font-medium mb-3">
//             Organizer Status Distribution
//           </h3>
//           <div className="h-64">
//             <Pie
//               data={statusDistributionData}
//               options={{
//                 maintainAspectRatio: false,
//                 plugins: { legend: { position: "bottom" } },
//               }}
//             />
//           </div>
//         </div>

//         {/* Events Timeline */}
//         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//           <h3 className="text-gray-500 text-sm font-medium mb-3">
//             Events Timeline
//           </h3>
//           <div className="h-64">
//             <Line
//               data={eventsTimelineData}
//               options={{
//                 maintainAspectRatio: false,
//                 scales: { y: { beginAtZero: true } },
//               }}
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SuperAdminReport;

// import React from 'react';
// import { Bar, Pie, Line } from 'react-chartjs-2';
// import { Chart, registerables } from 'chart.js';
// Chart.register(...registerables);

// const EventOrganizerPage = () => {
//   // Hardcoded organizer data
//   const organizer = {
//     id: 1,
//     name: "Suresh Kumar",
//     email: "suresh@events.com",
//     phone: "+91 98765 43210",
//     registrationDate: "2024-01-15",
//     totalEvents: 3,
//     totalAttendees: 725,
//     events: [
//       {
//         id: 1,
//         title: "Tech Conference 2025",
//         date: "2025-05-20",
//         status: "Upcoming",
//         attendees: 250,
//         capacity: 300,
//         revenue: 12500
//       },
//       {
//         id: 2,
//         title: "Startup Meetup",
//         date: "2025-03-10",
//         status: "Completed",
//         attendees: 180,
//         capacity: 200,
//         revenue: 9000
//       },
//       {
//         id: 3,
//         title: "AI Workshop",
//         date: "2025-04-18",
//         status: "Upcoming",
//         attendees: 95,
//         capacity: 120,
//         revenue: 4750
//       }
//     ]
//   };

//   // Calculate statistics
//   const stats = {
//     totalRevenue: organizer.events.reduce((sum, event) => sum + event.revenue, 0),
//     avgAttendance: Math.round(
//       organizer.events.reduce(
//         (sum, event) => sum + (event.attendees / event.capacity) * 100,
//         0
//       ) / organizer.events.length

//   )  };

//   // Chart data
//   const statusChartData = {
//     labels: ["Upcoming", "Completed", "Cancelled"],
//     datasets: [{
//       data: [
//         organizer.events.filter(e => e.status === 'Upcoming').length,
//         organizer.events.filter(e => e.status === 'Completed').length,
//         0 // Cancelled events
//       ],
//       backgroundColor: ["#0dcaf0", "#198754", "#dc3545"],
//     }]
//   };

//   const revenueChartData = {
//     labels: organizer.events.map(e => e.title),
//     datasets: [{
//       label: "Revenue ($)",
//       data: organizer.events.map(e => e.revenue),
//       backgroundColor: "rgba(75, 192, 192, 0.6)",
//     }]
//   };

//   return (
//     <div className="container mx-auto px-4 py-6">
//       {/* Organizer Header */}
//       <div className="bg-white rounded-lg shadow-sm p-6 mb-8 border border-gray-200">
//         <h1 className="text-2xl font-bold text-gray-900">{organizer.name}</h1>
//         <p className="text-gray-600 mt-1">{organizer.email}</p>
//         <p className="text-gray-600 text-sm">Phone: {organizer.phone}</p>
//       </div>

//       {/* Summary Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//         <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
//           <h3 className="text-gray-500 text-sm font-medium">Total Revenue</h3>
//           <p className="text-2xl font-bold text-gray-900">
//             ${stats.totalRevenue.toLocaleString()}
//           </p>
//         </div>

//         <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
//           <h3 className="text-gray-500 text-sm font-medium">Avg Attendance</h3>
//           <p className="text-2xl font-bold text-gray-900">{stats.avgAttendance}%</p>
//         </div>

//         <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
//           <h3 className="text-gray-500 text-sm font-medium">Total Events</h3>
//           <p className="text-2xl font-bold text-gray-900">{organizer.totalEvents}</p>
//         </div>
//       </div>

//       {/* Charts */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
//         <div className="bg-white p-6 rounded-lg border border-gray-200">
//           <h3 className="text-gray-500 text-sm font-medium mb-3">Event Status</h3>
//           <div className="h-64">
//             <Pie data={statusChartData} options={{ maintainAspectRatio: false }} />
//           </div>
//         </div>

//         <div className="bg-white p-6 rounded-lg border border-gray-200">
//           <h3 className="text-gray-500 text-sm font-medium mb-3">Event Revenue</h3>
//           <div className="h-64">
//             <Bar
//               data={revenueChartData}
//               options={{
//                 maintainAspectRatio: false,
//                 scales: { y: { beginAtZero: true } }
//               }}
//             />
//           </div>
//         </div>
//       </div>

//       {/* Events Table */}
//       <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
//         <table className="min-w-full">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Event</th>
//               <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Date</th>
//               <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Attendance</th>
//               <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Revenue</th>
//               <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Status</th>
//             </tr>
//           </thead>
//           <tbody>
//             {organizer.events.map(event => (
//               <tr key={event.id} className="border-t border-gray-200">
//                 <td className="px-6 py-4 font-medium text-gray-900">{event.title}</td>
//                 <td className="px-6 py-4 text-gray-500">
//                   {new Date(event.date).toLocaleDateString()}
//                 </td>
//                 <td className="px-6 py-4">
//                   {event.attendees}/{event.capacity}
//                 </td>
//                 <td className="px-6 py-4 font-bold text-green-600">
//                   ${event.revenue.toLocaleString()}
//                 </td>
//                 <td className="px-6 py-4">
//                   <span className={`px-2 py-1 rounded-md text-sm ${
//                     event.status === 'Upcoming' ? 'bg-blue-100 text-blue-800' :
//                     'bg-green-100 text-green-800'
//                   }`}>
//                     {event.status}
//                   </span>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default EventOrganizerPage;

// latest - total , events ,movies report

import React, { useRef, useState } from "react";
import { Bar, Pie, Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import { Link } from "react-router-dom";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

Chart.register(...registerables);

const SuperAdminReport = () => {
  const reportRef = useRef(null);
  const [activeTab, setActiveTab] = useState("total");
  const [pagination, setPagination] = useState({
    page: 1,
    size: 5,
  });
  // Mock data with separate event organizers and movie organizers
  const eventOrganizers = [
    {
      id: 1,
      name: "Irshad",
      email: "irshad@mail.com",
      events: 12,
      attendees: 4500,
      revenue: 125000,
      status: "Active",
      lastLogin: "2025-04-15",
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
    },
    {
      id: 4,
      name: "Jasim",
      email: "jasim@gmail.co",
      events: 5,
      attendees: 8000,
      revenue: 215000,
      status: "Inactive",
      lastLogin: "2025-04-10",
    },
  ];

  const movieOrganizers = [
    {
      id: 101,
      name: "Jasim",
      email: "jasim@mail.com",
      movies: 5,
      attendees: 3000,
      revenue: 75000,
      status: "Active",
      lastLogin: "2025-04-16",
    },
    {
      id: 102,
      name: "Ahmed",
      email: "ahmed@mail.com",
      movies: 7,
      attendees: 8500,
      revenue: 210000,
      status: "Active",
      lastLogin: "2025-04-13",
    },
    {
      id: 103,
      name: "Farhan",
      email: "farhan@gmail.com",
      movies: 3,
      attendees: 2000,
      revenue: 55000,
      status: "Inactive",
      lastLogin: "2025-04-11",
    },
    {
      id: 104,
      name: "Syed",
      email: "syed@mail.com",
      movies: 2,
      attendees: 800,
      revenue: 22000,
      status: "Inactive",
      lastLogin: "2025-04-09",
    },
  ];

  // Statistics calculations
  const platformStats = {
    totalEventOrganizers: eventOrganizers.length,
    activeEventOrganizers: eventOrganizers.filter((o) => o.status === "Active")
      .length,
    totalMovieOrganizers: movieOrganizers.length,
    activeMovieOrganizers: movieOrganizers.filter((o) => o.status === "Active")
      .length,
    totalOrganizers: eventOrganizers.length + movieOrganizers.length,
    activeOrganizers:
      eventOrganizers.filter((o) => o.status === "Active").length +
      movieOrganizers.filter((o) => o.status === "Active").length,

    totalEvents: eventOrganizers.reduce((sum, org) => sum + org.events, 0),
    totalMovies: movieOrganizers.reduce((sum, org) => sum + org.movies, 0),

    totalEventAttendees: eventOrganizers.reduce(
      (sum, org) => sum + org.attendees,
      0
    ),
    totalMovieAttendees: movieOrganizers.reduce(
      (sum, org) => sum + org.attendees,
      0
    ),
    totalAttendees:
      eventOrganizers.reduce((sum, org) => sum + org.attendees, 0) +
      movieOrganizers.reduce((sum, org) => sum + org.attendees, 0),

    totalEventRevenue: eventOrganizers.reduce(
      (sum, org) => sum + org.revenue,
      0
    ),
    totalMovieRevenue: movieOrganizers.reduce(
      (sum, org) => sum + org.revenue,
      0
    ),
    totalRevenue:
      eventOrganizers.reduce((sum, org) => sum + org.revenue, 0) +
      movieOrganizers.reduce((sum, org) => sum + org.revenue, 0),
  };

  const getStatusBadge = (status) => {
    const baseClasses = "px-3 py-1 rounded-md text-sm font-medium";
    switch (status) {
      case "Active":
        return (
          <span className={`${baseClasses} bg-green-100 text-green-800`}>
            Active
          </span>
        );
      case "Inactive":
        return (
          <span className={`${baseClasses} bg-red-100 text-red-800`}>
            Inactive
          </span>
        );
      default:
        return (
          <span className={`${baseClasses} bg-gray-100 text-gray-800`}>
            Unknown
          </span>
        );
    }
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

    const startIndex = (pagination.page - 1) * pagination.size;
    const endIndex = startIndex + pagination.size;

    return data.slice(startIndex, endIndex);
  };

  // Get tab title
  const getTabTitle = () => {
    switch (activeTab) {
      case "events":
        return "Events";
      case "movies":
        return "Movies";
      default:
        return "Total (Events + Movies)";
    }
  };
  const totalItems = (() => {
    switch (activeTab) {
      case "events":
        return eventOrganizers.length;
      case "movies":
        return movieOrganizers.length;
      default:
        return eventOrganizers.length + movieOrganizers.length;
    }
  })();

  // Chart data
  const organizerPerformanceData = {
    labels: getCurrentOrganizers().map((org) => org.name),
    datasets: [
      {
        label: `${getTabTitle()} Revenue Generated ($)`,
        data: getCurrentOrganizers().map((org) => org.revenue),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 2,
      },
    ],
  };

  const statusDistributionData = {
    labels: ["Active", "Inactive"],
    datasets: [
      {
        data: [
          activeTab === "events"
            ? platformStats.activeEventOrganizers
            : activeTab === "movies"
            ? platformStats.activeMovieOrganizers
            : platformStats.activeOrganizers,

          activeTab === "events"
            ? eventOrganizers.length - platformStats.activeEventOrganizers
            : activeTab === "movies"
            ? movieOrganizers.length - platformStats.activeMovieOrganizers
            : platformStats.totalOrganizers - platformStats.activeOrganizers,
        ],
        backgroundColor: ["#198754", "#dc3545"],
        borderWidth: 1,
      },
    ],
  };

  // Timeline data
  const timelineData = {
    events: [12, 19, 15, 25, 18, 22],
    movies: [5, 8, 6, 10, 7, 9],
    total: [17, 27, 21, 35, 25, 31], // Sum of events and movies
  };

  const handleExportPdf = async () => {
    const input = reportRef.current;
    const canvas = await html2canvas(input, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    pdf.save("report.pdf");
  };

  return (
    <div className="container mx-auto px-4 py-6" ref={reportRef}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-blue-600">Reports</h2>
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
      </div>

      {/* Report Type Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab("total")}
          className={`px-4 py-2 rounded-lg ${
            activeTab === "total"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Total
        </button>
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
              ? platformStats.totalEventOrganizers
              : activeTab === "movies"
              ? platformStats.totalMovieOrganizers
              : platformStats.totalOrganizers}
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
              ? platformStats.activeEventOrganizers
              : activeTab === "movies"
              ? platformStats.activeMovieOrganizers
              : platformStats.activeOrganizers}
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
              ? platformStats.totalEvents
              : activeTab === "movies"
              ? platformStats.totalMovies
              : platformStats.totalEvents + platformStats.totalMovies}
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
            $
            {activeTab === "events"
              ? platformStats.totalEventRevenue.toLocaleString()
              : activeTab === "movies"
              ? platformStats.totalMovieRevenue.toLocaleString()
              : platformStats.totalRevenue.toLocaleString()}
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {getCurrentOrganizers().map((organizer) => (
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

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-gray-500 text-sm font-medium mb-3">
            Organizer {getTabTitle()} Revenue
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
            {activeTab === "events"
              ? "Event"
              : activeTab === "movies"
              ? "Movie"
              : ""}{" "}
            Organizer Status Distribution
          </h3>
          <div className="h-64">
            <Pie
              data={statusDistributionData}
              options={{
                maintainAspectRatio: false,
                plugins: { legend: { position: "bottom" } },
              }}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-gray-500 text-sm font-medium mb-3">
            {getTabTitle()} Timeline
          </h3>
          <div className="h-64">
            {activeTab === "total" ? (
              <Line
                data={{
                  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
                  datasets: [
                    {
                      label: "Total Items",
                      data: timelineData.total,
                      borderColor: "#0d6efd",
                      backgroundColor: "rgba(13, 110, 253, 0.1)",
                      tension: 0.4,
                      fill: true,
                    },
                    {
                      label: "Events",
                      data: timelineData.events,
                      borderColor: "#198754",
                      tension: 0.4,
                      borderDash: [5, 5],
                      fill: false,
                    },
                    {
                      label: "Movies",
                      data: timelineData.movies,
                      borderColor: "#dc3545",
                      tension: 0.4,
                      borderDash: [5, 5],
                      fill: false,
                    },
                  ],
                }}
                options={{
                  maintainAspectRatio: false,
                  scales: { y: { beginAtZero: true } },
                }}
              />
            ) : (
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
                      borderColor:
                        activeTab === "events" ? "#198754" : "#dc3545",
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
            )}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-medium mb-4">Platform Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {activeTab === "total" && (
            <>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">
                  Event Organizers
                </h4>
                <p className="text-2xl font-bold">
                  {platformStats.totalEventOrganizers}
                </p>
                <p className="text-sm text-gray-500">
                  <span className="text-green-600 font-medium">
                    {platformStats.activeEventOrganizers}
                  </span>{" "}
                  active
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">
                  Movie Organizers
                </h4>
                <p className="text-2xl font-bold">
                  {platformStats.totalMovieOrganizers}
                </p>
                <p className="text-sm text-gray-500">
                  <span className="text-green-600 font-medium">
                    {platformStats.activeMovieOrganizers}
                  </span>{" "}
                  active
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">
                  Event Statistics
                </h4>
                <p className="text-lg font-bold">
                  {platformStats.totalEvents} events
                </p>
                <p className="text-sm text-gray-500">
                  {platformStats.totalEventAttendees.toLocaleString()} attendees
                </p>
                <p className="text-sm text-green-600 font-medium">
                  ${platformStats.totalEventRevenue.toLocaleString()} revenue
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">
                  Movie Statistics
                </h4>
                <p className="text-lg font-bold">
                  {platformStats.totalMovies} movies
                </p>
                <p className="text-sm text-gray-500">
                  {platformStats.totalMovieAttendees.toLocaleString()} attendees
                </p>
                <p className="text-sm text-green-600 font-medium">
                  ${platformStats.totalMovieRevenue.toLocaleString()} revenue
                </p>
              </div>
            </>
          )}

          {activeTab === "events" && (
            <>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">
                  Event Organizers
                </h4>
                <p className="text-2xl font-bold">
                  {platformStats.totalEventOrganizers}
                </p>
                <p className="text-sm text-gray-500">
                  <span className="text-green-600 font-medium">
                    {platformStats.activeEventOrganizers}
                  </span>{" "}
                  active
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">
                  Total Events
                </h4>
                <p className="text-2xl font-bold">
                  {platformStats.totalEvents}
                </p>
                <p className="text-sm text-gray-500">
                  {platformStats.totalEventAttendees.toLocaleString()} attendees
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">
                  Event Revenue
                </h4>
                <p className="text-2xl font-bold text-green-600">
                  ${platformStats.totalEventRevenue.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">
                  Average per organizer: $
                  {Math.round(
                    platformStats.totalEventRevenue /
                      platformStats.totalEventOrganizers
                  ).toLocaleString()}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">
                  Active Rate
                </h4>
                <p className="text-2xl font-bold">
                  {Math.round(
                    (platformStats.activeEventOrganizers /
                      platformStats.totalEventOrganizers) *
                      100
                  )}
                  %
                </p>
                <p className="text-sm text-gray-500">
                  {platformStats.activeEventOrganizers} active organizers
                </p>
              </div>
            </>
          )}

          {activeTab === "movies" && (
            <>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">
                  Movie Organizers
                </h4>
                <p className="text-2xl font-bold">
                  {platformStats.totalMovieOrganizers}
                </p>
                <p className="text-sm text-gray-500">
                  <span className="text-green-600 font-medium">
                    {platformStats.activeMovieOrganizers}
                  </span>{" "}
                  active
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">
                  Total Movies
                </h4>
                <p className="text-2xl font-bold">
                  {platformStats.totalMovies}
                </p>
                <p className="text-sm text-gray-500">
                  {platformStats.totalMovieAttendees.toLocaleString()} attendees
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">
                  Movie Revenue
                </h4>
                <p className="text-2xl font-bold text-green-600">
                  ${platformStats.totalMovieRevenue.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">
                  Average per organizer: $
                  {Math.round(
                    platformStats.totalMovieRevenue /
                      platformStats.totalMovieOrganizers
                  ).toLocaleString()}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">
                  Active Rate
                </h4>
                <p className="text-2xl font-bold">
                  {Math.round(
                    (platformStats.activeMovieOrganizers /
                      platformStats.totalMovieOrganizers) *
                      100
                  )}
                  %
                </p>
                <p className="text-sm text-gray-500">
                  {platformStats.activeMovieOrganizers} active organizers
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuperAdminReport;
