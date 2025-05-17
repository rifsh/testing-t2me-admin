import React, { useEffect, useRef, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Bar, Pie } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import { exportToPdf, exportToExcel } from "utils/exportUtils";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserDetails, setSelectedCountry } from "store/slices/reportSlice";
import { message, Select } from "antd";

Chart.register(...registerables);
const { Option } = Select;

const OrganizerDetail = () => {
  const dispatch = useDispatch();
  const { organizerId } = useParams();
  const reportRef = useRef(null);
  const navigate = useNavigate();

  const {
    data: organizer,
    loading,
    error,
  } = useSelector((state) => state.report.userDetails);
  const selectedCountry = useSelector((state) => state.report.selectedCountry);
  const { data } = useSelector((state) => state.report.countryList);

  const user = organizer?.[0];
useEffect(() => {
  console.log("User updated:", user);
}, [user]);
  // useEffect(() => {
  //   if (organizerId) {
  //     dispatch(fetchUserDetails(organizerId));
  //   }
  // }, [dispatch, organizerId]);

  const handleChange = (value) => {
    dispatch(setSelectedCountry(value));
  };

  useEffect(() => {
    const fetchData = async () => {
      if (organizerId && selectedCountry) {
        try {
          await dispatch(
            fetchUserDetails({
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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!user) return <div>Organizer not found</div>;

  // Chart data for events
  const eventsChartData = {
    labels: user?.events?.map((event) => event.event_name),
    datasets: [
      {
        label: "Event Revenue",
        data: user?.events?.map((event) => event.event_revenue),
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
        data: [user?.is_active ? 1 : 0, user?.is_active ? 0 : 1],
        backgroundColor: ["#198754", "#dc3545"],
      },
    ],
  };

  const handleExportPdf = async () => {
    exportToPdf(reportRef, "MyReport.pdf");
  };

  const handleExportCsv = () => {
    exportToExcel(reportRef, "MyReport.xlsx");
  };
  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="container mx-auto px-4 py-6" ref={reportRef}>
      <div>
        <button
          onClick={handleGoBack}
          className="text-gray-500 hover:text-gray-700 text-sm mb-2 inline-block"
        >
          &larr; Back
        </button>
      </div>
      <div className="mb-6">
        <div className="flex justify-end gap-4">
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
          <button
            onClick={handleExportCsv}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Export CSV
          </button>
          <button
            onClick={handleExportPdf}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Export PDF
          </button>
        </div>
      </div>

      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8 border border-gray-200">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {user?.username}
            </h1>
            <p className="text-gray-600 mt-2">{user?.email}</p>
            <p className="text-gray-600">
              Registered: {new Date(user?.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="text-right">
            <span
              className={`px-3 py-1 rounded-md text-sm ${
                user?.is_active
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {user?.is_active ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="text-gray-500 text-sm font-medium mb-2">
            Total Events
          </h3>
          <p className="text-2xl font-bold">{user?.total_events}</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-gray-500 text-sm font-medium mb-2">
                Total Revenue
              </h3>
                        <p className="text-2xl font-bold">{user?.total_events}</p>

            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="text-gray-500 text-sm font-medium mb-2">
            Total Attendees
          </h3>
          <p className="text-2xl font-bold">
            {user?.total_attendees?.toLocaleString()}
          </p>
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

      {/* Events Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 bg-gray-50">
          <h3 className="text-gray-700 font-medium">Events List</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                  Event Name
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
              {user?.events?.map((event) => (
                <tr key={event.id}>
                  <td className="px-6 py-4">
                    <Link
                      to={`${APP_PREFIX_PATH}/super-admin/organizer-details/event-details/${event.id}`}
                      className="text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      {event?.event_name}
                    </Link>
                  </td>

                  <td className="px-4 py-3">
                    {event?.attendees_count?.toLocaleString()}
                  </td>

                  <td className="px-4 py-3 text-green-600 text-sm space-y-1">
                    {event?.revenue_by_country?.map((item, index) => (
                      <div key={index}>
                        {item?.currency_code} {item?.revenue || 0}
                      </div>
                    ))}
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
