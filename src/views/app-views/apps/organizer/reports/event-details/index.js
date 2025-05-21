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
    </div>
  );
};

export default EventDetailReport;