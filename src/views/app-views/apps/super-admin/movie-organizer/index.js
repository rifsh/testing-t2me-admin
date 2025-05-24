import React, { useRef, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Bar, Pie } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import { exportToPdf, exportToExcel } from "utils/exportUtils";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCountryList,
  fetchMovieUserDetails,
  fetchUserTheaters,
  setSelectedCountry,
} from "store/slices/reportSlice";
import { Spin, Alert, message, Select, Table } from "antd";
import usePaginationHook from "utils/hooks/usePaginationHandler";
import { DEFAULT_PAGE_SIZE } from "constants/PageConstants";

Chart.register(...registerables);
const { Option } = Select;

const MovieOrganizerDetail = () => {
  const reportRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState(true);

  const {
    data: movieUserData,
    loading,
    error,
    pagination: moviePagination,
  } = useSelector((state) => state.report.movieUserDetails);

  const { data: userTheaters } = useSelector(
    (state) => state.report.userTheaters
  );

  console.log(userTheaters, "theaters");

  const { pagination } = useSelector((state) => state.report.userTheaters);

  const handlePagination = usePaginationHook(fetchMovieUserDetails);
  const { organizerId } = useParams();
  const {
    data: countryData,
    loading: countryLoading,
    error: countryError,
  } = useSelector((state) => state.report.countryList);
  console.log(countryData, "countryList");
  const selectedCountry = useSelector((state) => state.report.selectedCountry);
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
    dispatch(fetchCountryList({ active: activeFilter, search: searchTerm }));
  }, [dispatch, activeFilter, searchTerm]);
  useEffect(() => {
    const fetchData = async () => {
      if (organizerId && selectedCountry) {
        try {
          await dispatch(
            fetchMovieUserDetails({
              pageData: DEFAULT_PAGE_SIZE,
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
            fetchUserTheaters({
              pageData: DEFAULT_PAGE_SIZE,
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <Alert message="Error" description={error} type="error" showIcon />
      </div>
    );
  }


  const organizer = movieUserData;
  const theaters = userTheaters?.items;
  // Transform API data to match your component structure
  const organizerData = {
    username: organizer?.username || "N/A",
    email: organizer?.email || "N/A",
    is_active: organizer?.is_active || false,
    total_theaters: organizer?.total_theaters || 0,
    total_movies: organizer?.total_movies || 0,
    total_revenue: organizer?.total_revenue || 0,
    theaters:
      theaters?.map((theater) => ({
        id: theater?.theater_id,
        name: theater?.theater_name,
        company_name: theater?.company_name,
        screen_count: theater?.screens_count,
        movies_count: theater?.movies_count,
        is_active: theater?.is_active,
      })) || [],
  };

  // Bar chart data - Screens per Theater
  const theatersChartData = {
    labels: organizerData?.theaters.map((theater) => theater?.name),
    datasets: [
      {
        label: "Screen Count",
        data: organizerData?.theaters?.map((theater) => theater?.screen_count),
        backgroundColor: "rgba(79, 70, 229, 0.6)",
        borderColor: "rgba(79, 70, 229, 1)",
        borderWidth: 2,
      },
    ],
  };

  const statusData = {
    labels: ["Active", "Inactive"],
    datasets: [
      {
        data: [
          organizerData.theaters.filter((t) => t.is_active).length,
          organizerData.theaters.filter((t) => !t.is_active).length,
        ],
        backgroundColor: ["#3B82F6", "#9CA3AF"],
      },
    ],
  };

  // Bar chart data - Movies per Theater
  const moviesChartData = {
    labels: organizerData.theaters.map((theater) => theater.name),
    datasets: [
      {
        label: "Movies Count",
        data: organizerData.theaters.map((theater) => theater.movies_count),
        backgroundColor: "rgba(34, 197, 94, 0.6)",
        borderColor: "rgba(34, 197, 94, 1)",
        borderWidth: 2,
      },
    ],
  };

  const handleExportPdf = () => {
    exportToPdf(reportRef, "MovieOrganizerTheaters.pdf");
  };

  const handleExportCsv = () => {
    exportToExcel(reportRef, "MovieOrganizerTheaters.xlsx");
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const theaterColumns = [
    {
      title: "Theater Name",
      dataIndex: "name",
      key: "name",
      fixed: "left",
      width: 150,
      render: (text, record) => (
        <Link
          to={`${APP_PREFIX_PATH}/super-admin/movie-organizer/theater-details/${record.id}`}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          {text}
        </Link>
      ),
    },
    {
      title: "Company",
      dataIndex: "company_name",
      key: "company",
      width: 200,
      render: (text) => <span className="text-gray-500">{text}</span>,
    },
    {
      title: "Screens",
      dataIndex: "screen_count",
      key: "screens",
      width: 120,
    },
    {
      title: "Movies",
      dataIndex: "movies_count",
      key: "movies",
      width: 120,
    },
  ];

  return (
    <div className="p-8" ref={reportRef}>
      <div className="flex items-center">
        <button
          onClick={handleGoBack}
          className="text-gray-500 hover:text-gray-700 text-sm"
        >
          &larr; Back
        </button>
      </div>
      {/* Header with Export Buttons */}
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">{organizerData.username}</h1>

        <div className="flex gap-4">
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
            {countryData?.[0]?.items?.map((country) => (
              <Option key={country.id} value={country.id}>
                {country.name}
              </Option>
            ))}
          </Select>
          <div className="hidden sm:flex flex-col sm:flex-row gap-2 sm:gap-4">
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

      {/* Organizer Info */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h3 className="text-gray-500 text-sm font-medium">Email</h3>
            <p>{organizerData?.email}</p>
          </div>
          <div>
            <h3 className="text-gray-500 text-sm font-medium">Status</h3>
            <span
              className={`px-3 py-1 rounded-md text-sm ${
                organizerData?.is_active
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {organizerData.is_active ? "Active" : "Inactive"}
            </span>
          </div>
          <div>
            <h3 className="text-gray-500 text-sm font-medium">Total Revenue</h3>
            <p>${organizerData?.total_revenue || 0}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="text-gray-500 text-sm font-medium mb-2">
            Total Theaters
          </h3>
          <p className="text-2xl font-bold">{organizerData?.total_theaters}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="text-gray-500 text-sm font-medium mb-2">
            Total Movies
          </h3>
          <p className="text-2xl font-bold">{organizerData?.total_movies}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="text-gray-500 text-sm font-medium mb-2">
            Active Theaters
          </h3>
          <p className="text-2xl font-bold text-green-600">
            {organizerData?.theaters.filter((t) => t.is_active).length}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
        <div className="p-4 bg-gray-50">
          <h3 className="text-gray-700 font-medium">Theaters List</h3>
        </div>
        <div className="overflow-x-auto">
          <Table
            columns={theaterColumns}
            dataSource={organizerData?.theaters}
            rowKey="id"
            pagination={{
              current: pagination?.current,
              pageSize: pagination?.pageSize,
              total: pagination?.total,
              onChange: (page, pageSize) => handlePagination(page, pageSize),
            }}
            scroll={{ x: 800 }}
            className="force-visible-columns"
            style={{ minWidth: "800px" }}
          />
        </div>
      </div>

      {/* Charts - 3 columns for better layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-gray-500 text-sm font-medium mb-4">
            Screens per Theater
          </h3>
          <div className="h-64">
            <Bar
              data={theatersChartData}
              options={{
                maintainAspectRatio: false,
                scales: { y: { beginAtZero: true } },
              }}
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-gray-500 text-sm font-medium mb-4">
            Movies per Theater
          </h3>
          <div className="h-64">
            <Bar
              data={moviesChartData}
              options={{
                maintainAspectRatio: false,
                scales: { y: { beginAtZero: true } },
              }}
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-gray-500 text-sm font-medium mb-4">
            Theater Status
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
    </div>
  );
};

export default MovieOrganizerDetail;
