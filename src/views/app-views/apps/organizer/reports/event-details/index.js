// import React from "react";
// import { Link } from "react-router-dom";
// import { Bar, Pie } from "react-chartjs-2";
// import { Chart, registerables } from "chart.js";
// import { APP_PREFIX_PATH } from "configs/AppConfig";
// import { eventDetail } from "mock/data/reportData";

// Chart.register(...registerables);

// const EventDetail = () => {
//   const getStatusBadge = (status) => {
//     const baseClasses = "px-3 py-1 rounded-md text-sm font-medium";
//     switch (status) {
//       case "Upcoming":
//         return (
//           <span className={`${baseClasses} bg-blue-100 text-blue-800`}>
//             Upcoming
//           </span>
//         );
//       case "Completed":
//         return (
//           <span className={`${baseClasses} bg-green-100 text-green-800`}>
//             Completed
//           </span>
//         );
//       case "Cancelled":
//         return (
//           <span className={`${baseClasses} bg-red-100 text-red-800`}>
//             Cancelled
//           </span>
//         );
//       default:
//         return (
//           <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>
//             Unknown
//           </span>
//         );
//     }
//   };

//   const formatDate = (dateString) => {
//     const options = { year: "numeric", month: "long", day: "numeric" };
//     return new Date(dateString).toLocaleDateString(undefined, options);
//   };

//   // Chart data
//   const ticketSalesData = {
//     labels: eventDetail.ticketTypes.map((t) => t.name),
//     datasets: [
//       {
//         data: eventDetail.ticketTypes.map((t) => t.sold),
//         backgroundColor: ["#0dcaf0", "#198754", "#dc3545"],
//         borderWidth: 1,
//       },
//     ],
//   };

//   const revenueData = {
//     labels: eventDetail.ticketTypes.map((t) => t.name),
//     datasets: [
//       {
//         label: "Revenue ($)",
//         data: eventDetail.ticketTypes.map((t) => t.price * t.sold),
//         backgroundColor: "rgba(75, 192, 192, 0.6)",
//         borderColor: "rgba(75, 192, 192, 1)",
//         borderWidth: 2,
//       },
//     ],
//   };

//   return (
//     <div className="container mx-auto px-4 py-6">
//       <div className="mb-6">
//         <Link
//           to={`${APP_PREFIX_PATH}/organizer/reports`}
//           className="text-blue-600 hover:text-blue-800 text-sm font-medium"
//         >
//           &larr; Back to Events
//         </Link>
//       </div>

//       <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
//         {/* Event Header */}
//         <div className="flex flex-col md:flex-row gap-6 mb-8">
//           <img
//             src={eventDetail.image}
//             alt={eventDetail.title}
//             className="w-full md:w-2/5 h-64 object-cover rounded-lg"
//           />
//           <div className="flex-1">
//             <h1 className="text-2xl font-bold text-gray-900 mb-2">
//               {eventDetail.title}
//             </h1>
//             <p className="text-gray-600 mb-4">{eventDetail.description}</p>

//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <div className="text-sm text-gray-500">Organizer</div>
//                 <div className="font-medium">{eventDetail.organizer}</div>
//               </div>
//               <div>
//                 <div className="text-sm text-gray-500">Status</div>
//                 <div>{getStatusBadge(eventDetail.status)}</div>
//               </div>
//               <div>
//                 <div className="text-sm text-gray-500">Dates</div>
//                 <div className="font-medium">
//                   {formatDate(eventDetail.startDate)} -{" "}
//                   {formatDate(eventDetail.endDate)}
//                 </div>
//               </div>
//               <div>
//                 <div className="text-sm text-gray-500">Location</div>
//                 <div className="font-medium">{eventDetail.location}</div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Stats Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//           <div className="bg-blue-50 p-4 rounded-lg">
//             <div className="text-sm text-gray-600 mb-1">Attendance</div>
//             <div className="text-2xl font-bold">
//               {eventDetail.attendees}/{eventDetail.capacity}
//             </div>
//             <div className="text-sm text-gray-600">
//               (
//               {Math.round((eventDetail.attendees / eventDetail.capacity) * 100)}
//               % filled)
//             </div>
//           </div>

//           <div className="bg-green-50 p-4 rounded-lg">
//             <div className="text-sm text-gray-600 mb-1">Total Revenue</div>
//             <div className="text-2xl font-bold text-green-600">
//               ${eventDetail.revenue.toLocaleString()}
//             </div>
//           </div>

//           <div className="bg-purple-50 p-4 rounded-lg">
//             <div className="text-sm text-gray-600 mb-1">Ticket Types</div>
//             <div className="text-2xl font-bold">
//               {eventDetail.ticketTypes.length}
//             </div>
//           </div>
//         </div>

//         {/* Charts */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
//           <div className="bg-white p-4 rounded-lg border border-gray-200">
//             <h3 className="text-lg font-medium mb-4">
//               Ticket Sales Distribution
//             </h3>
//             <div className="h-64">
//               <Pie
//                 data={ticketSalesData}
//                 options={{
//                   maintainAspectRatio: false,
//                   plugins: { legend: { position: "bottom" } },
//                 }}
//               />
//             </div>
//           </div>

//           <div className="bg-white p-4 rounded-lg border border-gray-200">
//             <h3 className="text-lg font-medium mb-4">Revenue by Ticket Type</h3>
//             <div className="h-64">
//               <Bar
//                 data={revenueData}
//                 options={{
//                   maintainAspectRatio: false,
//                   scales: { y: { beginAtZero: true } },
//                 }}
//               />
//             </div>
//           </div>
//         </div>

//         {/* Schedule */}
//         <div className="bg-white p-4 rounded-lg border border-gray-200">
//           <h3 className="text-lg font-medium mb-4">Event Schedule</h3>
//           <div className="space-y-4">
//             {eventDetail.schedule.map((item, index) => (
//               <div
//                 key={index}
//                 className="flex items-center p-3 bg-gray-50 rounded-lg"
//               >
//                 <div className="w-20">
//                   <div className="text-sm font-medium">
//                     {new Date(item.date).toLocaleDateString("en-US", {
//                       month: "short",
//                       day: "numeric",
//                     })}
//                   </div>
//                   <div className="text-sm text-gray-500">{item.time}</div>
//                 </div>
//                 <div className="ml-4 flex-1">
//                   <div className="font-medium">{item.title}</div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default EventDetail;



// import React, { useEffect, useRef } from "react";
// import { Pie, Bar } from "react-chartjs-2";
// import { Chart, registerables } from "chart.js";
// import { useNavigate, useParams } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchEventDetails } from "store/slices/reportSlice";
// Chart.register(...registerables);

// const EventDetailReport = () => {
//   const { eventId } = useParams();
//   const navigate = useNavigate();
//   const reportRef = useRef(null);
//   const dispatch = useDispatch();

//   // Get event details from Redux store
//   const {
//     data: event,
//     loading,
//     error,
//   } = useSelector((state) => state.report.eventDetails);
//   const eventData = event?.[0];
//   useEffect(() => {
//     if (eventId) {
//       dispatch(fetchEventDetails(eventId));
//     }
//   }, [dispatch, eventId]);

//   if (!eventData)
//     return <div className="p-4 text-gray-500">No event data available</div>;

//   // Chart data preparation
//   const ticketRevenueData = {
//     labels:
//       eventData.revenue_by_ticket_type?.map((t) => t.ticket_type_name) || [],
//     datasets: [
//       {
//         data: eventData.revenue_by_ticket_type?.map((t) => t.revenue) || [],
//         backgroundColor: [
//           "#FF6384",
//           "#36A2EB",
//           "#FFCE56",
//           "#4BC0C0",
//           "#9966FF",
//         ],
//       },
//     ],
//   };

//   const countryRevenueData = {
//     labels: eventData.revenue_by_country?.map((c) => c.country_name) || [],
//     datasets: [
//       {
//         label: "Revenue",
//         data: eventData.revenue_by_country?.map((c) => c.revenue) || [],
//         backgroundColor: "#4BC0C0",
//       },
//     ],
//   };
//  const handleGoBack = () => {
//   navigate(-1);
// };
//   return (
//     <div className=" mx-auto p-4 space-y-6">
//  <div>
//         <button
//           onClick={handleGoBack}
//           className="text-gray-500 hover:text-gray-700 text-sm mb-2 inline-block"
//         >
//           &larr; Back
//         </button>
//       </div>
//             <div className="bg-white rounded-lg shadow p-6">
//         <h2 className="text-2xl font-bold text-gray-800 border-b pb-2 mb-4">
//           {eventData.event_name}
//         </h2>

//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//           <div className="bg-gray-50 p-4 rounded">
//             <p className="text-sm text-gray-500">Category</p>
//             <p className="font-medium">{eventData.category_name}</p>
//           </div>

//           <div className="bg-gray-50 p-4 rounded">
//             <p className="text-sm text-gray-500">Dates</p>
//             <p className="font-medium">
//               {new Date(eventData.earliest_start_date).toLocaleDateString()} -{" "}
//               {new Date(eventData.latest_end_date).toLocaleDateString()}
//             </p>
//           </div>

//           <div className="bg-gray-50 p-4 rounded">
//             <p className="text-sm text-gray-500">Total Revenue</p>
//             <p className="text-xl font-bold text-blue-600">
//               {eventData.total_revenue}{" "}
//               {eventData.revenue_by_country?.[0]?.currency_code || ""}
//             </p>
//           </div>

//           <div className="bg-gray-50 p-4 rounded">
//             <p className="text-sm text-gray-500">Total Attendees</p>
//             <p className="text-xl font-bold text-green-600">
//               {eventData.total_attendees}
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Charts Section */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         <div className="bg-white rounded-lg shadow p-4">
//           <h3 className="text-lg font-semibold text-center mb-4">
//             Revenue by Ticket Type
//           </h3>
//           <div className="h-64 flex items-center justify-center">
//             {ticketRevenueData.labels.length > 0 ? (
//               <Pie
//                 data={ticketRevenueData}
//                 options={{
//                   maintainAspectRatio: false,
//                   plugins: {
//                     tooltip: {
//                       callbacks: {
//                         label: (context) => {
//                           const value = context.raw;
//                           const total = context.dataset.data.reduce(
//                             (a, b) => a + b,
//                             0
//                           );
//                           const percentage = Math.round((value / total) * 100);
//                           return `${context.label}: ${value} (${percentage}%)`;
//                         },
//                       },
//                     },
//                   },
//                 }}
//               />
//             ) : (
//               <div className="text-center p-4 text-gray-500">
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   className="h-12 w-12 mx-auto text-gray-400"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                   stroke="currentColor"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={1}
//                     d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//                   />
//                 </svg>
//                 <p className="mt-2">No revenue data available by ticket type</p>
//               </div>
//             )}
//           </div>
//         </div>

//         <div className="bg-white rounded-lg shadow p-4">
//           <h3 className="text-lg font-semibold text-center mb-4">
//             Revenue by Country
//           </h3>
//           <div className="h-64">
//             <Bar
//               data={countryRevenueData}
//               options={{
//                 maintainAspectRatio: false,
//                 scales: {
//                   y: {
//                     beginAtZero: true,
//                     title: {
//                       display: true,
//                       text: "Revenue",
//                     },
//                   },
//                 },
//               }}
//             />
//           </div>
//         </div>
//       </div>

//       {/* Schedule Details */}
//       <div className="bg-white rounded-lg shadow overflow-hidden">
//         <div className="p-4 border-b">
//           <h3 className="text-lg font-semibold">Schedule Details</h3>
//         </div>
//         <div className="overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Schedule
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Dates
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Venue
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Attendees
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Revenue
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {eventData.schedule_revenue_details?.map((schedule, index) => (
//                 <tr key={index}>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
//                     {schedule.schedule_name}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                     {new Date(schedule.start_date).toLocaleDateString()} -{" "}
//                     {new Date(schedule.end_date).toLocaleDateString()}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                     {schedule.venue_name}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                     {schedule.total_attendees}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
//                     {schedule.total_revenue ||0}{" "}
//                     {eventData.revenue_by_country?.[0]?.currency_code || ""}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default EventDetailReport;

// import React, { useEffect } from "react";
// import { Pie, Bar } from "react-chartjs-2";
// import { Chart, registerables } from "chart.js";
// import { useNavigate, useParams } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchEventDetails } from "store/slices/reportSlice";
// Chart.register(...registerables);

// const EventDetailReport = () => {
//   const { eventId } = useParams();
//   const navigate = useNavigate();
//   const dispatch = useDispatch();

//   const {
//     data: event,
//     loading,
//     error,
//   } = useSelector((state) => state.report.eventDetails);
//   const eventData = event?.[0];
//   console.log(eventData, "eventData");

//   useEffect(() => {
//     if (eventId) {
//       dispatch(fetchEventDetails(eventId));
//     }
//   }, [dispatch, eventId]);

//   const handleGoBack = () => navigate(-1);

//   if (!eventData)
//     return <div className="p-4 text-gray-500">No event data available</div>;

//   // Chart data configurations
//   const ticketRevenueData = {
//     labels:
//       eventData.revenue_by_ticket_type?.map((t) => t.ticket_type_name) || [],
//     datasets: [
//       {
//         data: eventData.revenue_by_ticket_type?.map((t) => t.revenue) || [],
//         backgroundColor: [
//           "#FF6384",
//           "#36A2EB",
//           "#FFCE56",
//           "#4BC0C0",
//           "#9966FF",
//         ],
//       },
//     ],
//   };

//   const countryRevenueData = {
//     labels: eventData.revenue_by_country?.map((c) => c.country_name) || [],
//     datasets: [
//       {
//         label: "Revenue",
//         data: eventData.revenue_by_country?.map((c) => c.revenue) || [],
//         backgroundColor: "#4BC0C0",
//       },
//     ],
//   };

//   const currencyCode = eventData.revenue_by_country?.[0]?.currency_code || "";

//   return (
//     <div className="mx-auto p-4 space-y-6">
//       {/* Back Button */}
//       <div>
//         <button
//           onClick={handleGoBack}
//           className="text-gray-500 hover:text-gray-700 text-sm mb-2 inline-block"
//         >
//           &larr; Back
//         </button>
//       </div>

//       {/* Event Header */}
//       <div className="bg-white rounded-lg shadow p-6">
//         <h2 className="text-2xl font-bold text-gray-800 border-b pb-2 mb-4">
//           {eventData.event_name}
//         </h2>

//         {/* Stats Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//           <div className="bg-gray-50 p-4 rounded">
//             <p className="text-sm text-gray-500">Category</p>
//             <p className="font-medium">{eventData.category_name}</p>
//           </div>
//           <div className="bg-gray-50 p-4 rounded">
//             <p className="text-sm text-gray-500">Dates</p>
//             <p className="font-medium">
//               {new Date(eventData.earliest_start_date).toLocaleDateString()} -{" "}
//               {new Date(eventData.latest_end_date).toLocaleDateString()}
//             </p>
//           </div>
//           <div className="bg-gray-50 p-4 rounded">
//             <p className="text-sm text-gray-500">Total Revenue</p>
//             <p className="text-xl font-bold text-blue-600">
//               {eventData.total_revenue} {currencyCode}
//             </p>
//           </div>
//           <div className="bg-gray-50 p-4 rounded">
//             <p className="text-sm text-gray-500">Total Attendees</p>
//             <p className="text-xl font-bold text-green-600">
//               {eventData.total_attendees}
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Charts Section */}

//       {/* Schedule Details */}
//       <div className="bg-white rounded-lg shadow overflow-hidden">
//         <div className="p-4 border-b">
//           <h3 className="text-lg font-semibold">Schedule Details</h3>
//         </div>
//         <div className="overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Schedule
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Dates
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Venue
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Attendees
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Revenue
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {eventData.schedule_revenue_details?.map((schedule, index) => (
//                 <tr key={index}>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
//                     {schedule.schedule_name}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                     {new Date(schedule.start_date).toLocaleDateString()} -{" "}
//                     {new Date(schedule.end_date).toLocaleDateString()}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                     {schedule.venue_name}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                     {schedule.total_attendees}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
//                     {schedule.total_revenue || 0} {currencyCode}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Ticket Type Details */}
//       <div className="bg-white rounded-lg shadow overflow-hidden">
//         <div className="p-4 border-b">
//           <h3 className="text-lg font-semibold">Ticket Type status</h3>
//         </div>
//         {eventData.revenue_by_ticket_type?.length > 0 ? (
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Ticket Type
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Price
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Tickets Sold
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Revenue
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {eventData.revenue_by_ticket_type.map((ticket, index) => (
//                   <tr key={index}>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                       {ticket.ticket_type_name}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                       {ticket.ticket_price} {currencyCode}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                       {ticket.tickets_sold}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
//                       {ticket.revenue} {currencyCode}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         ) : (
//           <div className="p-4 text-center text-gray-500">
//             No ticket type data available
//           </div>
//         )}
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         <div className="bg-white rounded-lg shadow p-4">
//           <h3 className="text-lg font-semibold text-center mb-4">
//             Revenue by Ticket Type
//           </h3>
//           <div className="h-64 flex items-center justify-center">
//             {ticketRevenueData.labels.length > 0 ? (
//               <Pie
//                 data={ticketRevenueData}
//                 options={{
//                   maintainAspectRatio: false,
//                   plugins: {
//                     tooltip: {
//                       callbacks: {
//                         label: (context) => {
//                           const value = context.raw;
//                           const total = context.dataset.data.reduce(
//                             (a, b) => a + b,
//                             0
//                           );
//                           const percentage = Math.round((value / total) * 100);
//                           return `${context.label}: ${value} (${percentage}%)`;
//                         },
//                       },
//                     },
//                   },
//                 }}
//               />
//             ) : (
//               <div className="text-center p-4 text-gray-500">
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   className="h-12 w-12 mx-auto text-gray-400"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                   stroke="currentColor"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={1}
//                     d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//                   />
//                 </svg>
//                 <p className="mt-2">No revenue data available by ticket type</p>
//               </div>
//             )}
//           </div>
//         </div>

//         <div className="bg-white rounded-lg shadow p-4">
//           <h3 className="text-lg font-semibold text-center mb-4">
//             Revenue by Country
//           </h3>
//           <div className="h-64">
//             <Bar
//               data={countryRevenueData}
//               options={{
//                 maintainAspectRatio: false,
//                 scales: {
//                   y: {
//                     beginAtZero: true,
//                     title: { display: true, text: "Revenue" },
//                   },
//                 },
//               }}
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default EventDetailReport;




import React, { useEffect } from "react";
import { Pie, Bar } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchEventDetails, setSelectedCountry } from "store/slices/reportSlice";
import { 
  FiArrowLeft, 
  FiDollarSign, 
  FiUsers, 
  FiCalendar, 
  FiTag,
  FiMapPin,
  FiPieChart,
  FiGlobe
} from "react-icons/fi";
import { Card, Statistic, Divider, Table, Tag, Empty, Spin, message, Select } from "antd";
Chart.register(...registerables);
const { Option } = Select;

const EventDetailReport = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
console.log(eventId,'eventId');

  const { data: event, loading, error } = useSelector(
    (state) => state.report.eventDetails
  );
  const eventData = event?.[0];
 const selectedCountry = useSelector((state) => state.report.selectedCountry);
  const { data } = useSelector((state) => state.report.countryList);
console.log(data, 'data');

  const handleChange = (value) => {
    dispatch(setSelectedCountry(value));
  };
  // useEffect(() => {
  //   if (eventId) {
  //     dispatch(fetchEventDetails(eventId));
  //   }
  // }, [dispatch, eventId]);




 useEffect(() => {
    const fetchData = async () => {
      if (eventId ) {
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

  if (loading) return <div className="p-8 text-center"><Spin size="large" /></div>;
  if (error) return <div className="p-8 text-center text-red-500">Error loading event data</div>;
  if (!eventData) return <div className="p-8 text-center text-gray-500">No event data available</div>;

  // Format currency
  // const currencyCode = eventData?.revenue_by_country?.[0]?.currency_code || "";
  // const formatCurrency = (value) => 
  //   new Intl.NumberFormat('en-US', { 
  //     style: 'currency', 
  //     currency: currencyCode 
  //   })?.format(value || 0);

  // Chart data configurations
  const ticketRevenueData = {
    labels: eventData.revenue_by_ticket_type?.map((t) => t.ticket_type_name) || [],
    datasets: [{
      data: eventData.revenue_by_ticket_type?.map((t) => t.revenue) || [],
      backgroundColor: ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
      borderWidth: 0
    }]
  };

  const countryRevenueData = {
    labels: eventData.revenue_by_country?.map((c) => c.country_name) || [],
    datasets: [{
      label: 'Revenue',
      data: eventData.revenue_by_country?.map((c) => c.revenue) || [],
      backgroundColor: '#3B82F6',
      borderRadius: 6
    }]
  };

  // Enhanced table columns
  const scheduleColumns = [
    {
      title: 'Schedule',
      dataIndex: 'schedule_name',
      key: 'schedule',
      render: (text) => <span className="font-medium">{text}</span>
    },
    {
      title: 'Dates',
      dataIndex: 'dates',
      key: 'dates',
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <FiCalendar className="text-gray-400" />
          <span>
            {new Date(record.start_date).toLocaleDateString()} - {' '}
            {new Date(record.end_date).toLocaleDateString()}
          </span>
        </div>
      )
    },
    {
      title: 'Venue',
      dataIndex: 'venue_name',
      key: 'venue',
      render: (text) => (
        <div className="flex items-center gap-2">
          <FiMapPin className="text-gray-400" />
          <span>{text}</span>
        </div>
      )
    },
    {
      title: 'Attendees',
      dataIndex: 'total_attendees',
      key: 'attendees',
      render: (text) => (
        <div className="flex items-center gap-2">
          <FiUsers className="text-gray-400" />
          <span>{text}</span>
        </div>
      )
    },
    {
      title: 'Revenue',
      dataIndex: 'total_revenue',
      key: 'revenue',
      render: (text) => (
        <div className="flex items-center gap-2">
          <FiDollarSign className="text-gray-400" />
          <span className="font-medium text-blue-600">
            {/* {formatCurrency(text)} */}
          </span>
        </div>
      )
    }
  ];

  const ticketColumns = [
    {
      title: 'Ticket Type',
      dataIndex: 'ticket_type_name',
      key: 'type',
      render: (text) => (
        <div className="flex items-center gap-2">
          <FiTag className="text-gray-400" />
          <span>{text}</span>
        </div>
      )
    },
    {
      title: 'Price',
      dataIndex: 'ticket_price',
      key: 'price',
      // render: (text) => formatCurrency(text)
    },
    {
      title: 'Sold',
      dataIndex: 'tickets_sold',
      key: 'sold',
      render: (text) => (
        <Tag color={text > 0 ? 'green' : 'red'}>
          {text} tickets
        </Tag>
      )
    },
    {
      title: 'Revenue',
      dataIndex: 'revenue',
      key: 'revenue',
      render: (text) => (
        <span className="font-medium text-blue-600">
          {/* {formatCurrency(text)} */}
        </span>
      )
    }
  ];

  return (
    <div className="mx-auto p-4  space-y-6">
      <button
        onClick={handleGoBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
      >
        <FiArrowLeft className="w-5 h-5" />
        <span className="font-medium">Back to Reports</span>
      </button>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {eventData.event_name}
          <p className="text-sm font-normal text-gray-500 mt-1">
            {eventData.category_name}
          </p>
        </h1>

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

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <Statistic
            title="Total Revenue"
            value={eventData.total_revenue}
            precision={2}
            // prefix={currencyCode}
            valueStyle={{ color: '#3B82F6' }}
          />
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <Statistic
            title="Total Attendees"
            value={eventData.total_attendees}
            valueStyle={{ color: '#10B981' }}
          />
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <Statistic
            title="Event Duration"
            value={`${Math.ceil(
              (new Date(eventData.latest_end_date) - new Date(eventData.earliest_start_date)) / 
              (1000 * 60 * 60 * 24)
            )} days`}
          />
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <Statistic
            title="Ticket Types"
            value={eventData.revenue_by_ticket_type?.length || 0}
          />
        </Card>
      </div>

      {/* Data Visualization Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Ticket Type */}
        <Card 
          title={
            <div className="flex items-center gap-2">
              <FiPieChart className="text-purple-500" />
              <span>Revenue by Ticket Type</span>
            </div>
          }
          className="hover:shadow-md transition-shadow"
        >
          {ticketRevenueData.labels.length > 0 ? (
            <div className="h-64">
              <Pie
                data={ticketRevenueData}
                options={{
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'right' },
                    tooltip: {
                      callbacks: {
                        label: (context) => {
                          const total = context.dataset.data.reduce((a, b) => a + b, 0);
                          const percentage = Math.round((context.raw / total) * 100);
                          // return `${context.label}: ${formatCurrency(context.raw)} (${percentage}%)`;
                        }
                      }
                    }
                  }
                }}
              />
            </div>
          ) : (
            <Empty description="No ticket revenue data available" />
          )}
        </Card>

        {/* Revenue by Country */}
        <Card 
          title={
            <div className="flex items-center gap-2">
              <FiGlobe className="text-blue-500" />
              <span>Revenue by Country</span>
            </div>
          }
          className="hover:shadow-md transition-shadow"
        >
          {countryRevenueData.labels.length > 0 ? (
            <div className="h-64">
              <Bar
                data={countryRevenueData}
                options={{
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      callbacks: {
                        // label: (context) => formatCurrency(context.raw)
                      }
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        // callback: (value) => formatCurrency(value)
                      }
                    }
                  }
                }}
              />
            </div>
          ) : (
            <Empty description="No country revenue data available" />
          )}
        </Card>
      </div>

      {/* Schedule Details */}
      <Card
        title="Schedule Details"
        className="hover:shadow-md transition-shadow"
      >
        <Table
          columns={scheduleColumns}
          dataSource={eventData.schedule_revenue_details || []}
          rowKey="schedule_name"
          pagination={false}
          locale={{
            emptyText: <Empty description="No schedule data available" />
          }}
        />
      </Card>

      {/* Ticket Type Details */}
      <Card
        title="Ticket Type Status"
        className="hover:shadow-md transition-shadow"
      >
        <Table
          columns={ticketColumns}
          dataSource={eventData.revenue_by_ticket_type || []}
          rowKey="ticket_type_name"
          pagination={false}
          locale={{
            emptyText: <Empty description="No ticket type data available" />
          }}
        />
      </Card>
    </div>
  );
};

export default EventDetailReport;