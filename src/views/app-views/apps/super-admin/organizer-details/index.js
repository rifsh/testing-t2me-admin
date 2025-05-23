import React, { useEffect, useRef, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Bar, Pie } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import { exportToPdf, exportToExcel } from "utils/exportUtils";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCountryList,
  fetchEventListing,
  fetchUserDetails,
  fetchUserReports,
  setSelectedCountry,
} from "store/slices/reportSlice";
import { message, Select, Spin, Table } from "antd";
import usePaginationHook from "utils/hooks/usePaginationHandler";
import { DEFAULT_PAGE_SIZE } from "constants/PageConstants";

Chart.register(...registerables);
const { Option } = Select;

const OrganizerDetail = () => {
  const dispatch = useDispatch();
  const { organizerId } = useParams();
  const reportRef = useRef(null);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState(true);
  const { pagination } = useSelector((state) => state.report.eventListing);

  const handlePagination = usePaginationHook(fetchUserReports);

  const { data: eventListing } = useSelector(
    (state) => state.report.eventListing
  );
  console.log(eventListing, "eventslisting");

  const {
    data: organizer,
    loading,
    error,
  } = useSelector((state) => state.report.userDetails);
  const selectedCountry = useSelector((state) => state.report.selectedCountry);
  const { data } = useSelector((state) => state.report.countryList);
  useEffect(() => {
    const storedCountry = localStorage.getItem("selectedCountry");
    if (storedCountry) {
      dispatch(setSelectedCountry(JSON.parse(storedCountry)));
    }
  }, [dispatch]);

  const user = organizer?.[0];

  const handleChange = (value) => {
    dispatch(setSelectedCountry(value));
    localStorage.setItem("selectedCountry", JSON.stringify(value)); // Save to localStorage
  };

  useEffect(() => {
    dispatch(fetchCountryList({ active: activeFilter, search: searchTerm }));
  }, [dispatch, activeFilter, searchTerm]);

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

  useEffect(() => {
    const fetchData = async () => {
      if (organizerId && selectedCountry) {
        try {
          await dispatch(
            fetchEventListing({
              user_id: organizerId,
              country_id: selectedCountry,
              size: DEFAULT_PAGE_SIZE.size, page:DEFAULT_PAGE_SIZE.page
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }
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

  const columns = [
    {
      title: "Event Name",
      dataIndex: "event_name",
      key: "event_name",
      fixed: "left",
      width: 200,
      render: (text, record) => (
        <Link
          to={`${APP_PREFIX_PATH}/super-admin/organizer-details/event-details/${record.id}`}
          className="text-blue-600 hover:text-blue-800 font-semibold"
        >
          {text}
        </Link>
      ),
      className: "px-6 py-4",
    },
    {
      title: "Attendees",
      dataIndex: "attendees_count",
      key: "attendees_count",
      width: 150,
      render: (text) => text?.toLocaleString(),
      className: "px-4 py-3",
    },
    {
      title: "Revenue",
      key: "revenue",
      width: 200,
      render: (_, record) => (
        <div className="text-green-600 text-sm space-y-1">
          {record?.revenue_by_country?.map((item, index) => (
            <div key={index}>
              {item?.currency_code} {item?.revenue || 0}
            </div>
          ))}
        </div>
      ),
      className: "px-4 py-3",
    },
  ];

  return (
    <Spin spinning={loading} tip="Loading organizer details..." delay={300}>
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
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 sm:justify-end">
            {/* Country Selector - Full width on mobile, fixed width on desktop */}
            <Select
              showSearch
              placeholder="Select Country"
              optionFilterProp="children"
              className="w-full sm:w-48"
              value={selectedCountry}
              onChange={handleChange}
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {data?.[0]?.items?.map((country) => (
                <Option key={country.id} value={country.id}>
                  <span className="text-xs sm:text-sm">{country.name}</span>
                </Option>
              ))}
            </Select>

            {/* Export Buttons - Stacked on mobile, inline on desktop */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <button
                onClick={handleExportCsv}
                className="px-3 py-2 sm:px-4 sm:py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center justify-center text-sm sm:text-base"
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2"
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
                <span className="hidden sm:inline">Export</span> CSV
              </button>

              <button
                onClick={handleExportPdf}
                className="px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center text-sm sm:text-base"
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2"
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
                <span className="hidden sm:inline">Export</span> PDF
              </button>
            </div>
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
                <p className="text-2xl font-bold">
                  {user?.total_revenue_by_country?.[0]?.currency_code}{" "}
                  {user?.total_revenue}
                </p>
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">

          <Table
          columns={columns}
          dataSource={eventListing?.items || []}
          rowKey="id"
          pagination={{
            current: pagination?.page,
            pageSize: pagination?.size,
            total: pagination?.total,
            // showSizeChanger: true,
            onChange: (page, pageSize) => handlePagination(page, pageSize),
          }}
          loading={loading}
          scroll={{ x: 800 }}
          className="force-visible-columns"
          style={{ minWidth: "800px" }}
        />
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

      
      </div>
    </Spin>
  );
};

export default OrganizerDetail;
