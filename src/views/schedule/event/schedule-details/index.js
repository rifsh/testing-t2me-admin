import React, { useEffect, useState } from "react";
import {
  Card,
  Descriptions,
  Typography,
  Space,
  Collapse,
  Empty,
  Row,
  Col,
  Tag,
  Tooltip,
  Badge,
  Divider,
  Image,
  Tabs,
  Table,
  List,
} from "antd";
import dayjs from "dayjs";
import {
  FaCalendarAlt,
  FaClock,
  FaTag,
  FaGift,
  FaMapMarkerAlt,
  FaTicketAlt,
  FaInfoCircle,
  FaChair,
  FaCalendarDay,
  FaPercent,
  FaRupeeSign,
  FaUtensils,
  FaPuzzlePiece,
} from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { fetchSingleSchedules } from "store/slices/scheduleSlice";
import { useParams } from "react-router-dom";
import Loading from "components/shared-components/Loading";
import ShowTimesDetails from "../components/ShowTimesDetails";
import OfferDetailsTable from "../components/OfferDetailsTable";
import CouponDetailsTable from "../components/CouponDetailsTable";
import { CDN_PATH } from "configs/AppConfig";
import CDNImage from "components/layout-components/Image/CDNImage";
import Utils from "utils";

const { Panel } = Collapse;
const { TabPane } = Tabs;
const { Text, Title } = Typography;

const ScheduleDetails = () => {
  const { scheduleId } = useParams();
  const dispatch = useDispatch();
  const { scheduleDetails, loading } = useSelector((state) => state.schedules);
  const [rows, setRows] = useState(2);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (scheduleId) {
      dispatch(fetchSingleSchedules({ id: scheduleId }));
    }
  }, [dispatch, scheduleId]);

  const formatDate = (dateStr) =>
    dateStr ? dayjs(dateStr).format("MMMM D, YYYY") : "-";

  const formatTime = (timeStr) =>
    timeStr ? dayjs(`2000-01-01T${timeStr}`).format("h:mm A") : "-";

  const formatDateTime = (dateTimeStr) =>
    dateTimeStr ? dayjs(dateTimeStr).format("MMMM D, YYYY h:mm A") : "-";

  if (loading) {
    return <Loading />;
  }

  const processedScheduleDetails =
    scheduleDetails?.data?.[0] || scheduleDetails;

  if (!processedScheduleDetails) {
    return <Empty description="No schedule data found" />;
  }

  // Extract data for easier access
  const {
    id,
    name,
    start_date,
    end_date,
    venue,
    event,
    is_multi_date,
    max_ticket_per_booking,
    offer_schedule,
    coupon_schedule,
    show_seat_details,
    ad_start_date_time,
    booking_start_date_time,
    available_types,
    show_dates,
    venue_id,
  } = processedScheduleDetails;

  // Group show times by date for better organization
  const groupedShows = (() => {
    if (available_types === "seat_structure" && show_seat_details?.length > 0) {
      return show_seat_details.reduce((acc, show) => {
        const date = show.start_date;
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(show);
        return acc;
      }, {});
    } else if (
      available_types === "ticket_structure" &&
      show_dates?.length > 0
    ) {
      return show_dates.reduce((acc, showDate) => {
        const date = showDate.start_date;
        if (!acc[date]) {
          acc[date] = [];
        }
        if (showDate.show_times?.length > 0) {
          showDate.show_times.forEach((showTime) => {
            acc[date].push({
              ...showTime,
              start_date: date,
              end_date: showDate.end_date,
            });
          });
        }
        return acc;
      }, {});
    }
    return {};
  })();

  const offerColumns = [
    {
      title: "Offer",
      dataIndex: ["offer", "name"],
      key: "name",
      render: (text, record) => (
        <div className="flex items-center">
          {record.offer.thumbnail_image && (
            <CDNImage
              src={record.offer.thumbnail_image}
              alt={`Image Thumbnail`}
              height={50}
              width={80}
            />
          )}
          <div className="ml-2">
            <Text strong>{text}</Text>
            {record.offer.id && (
              <Text className="block text-gray-500 text-xs">
                ID: {record.offer.id}
              </Text>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Discount",
      dataIndex: ["offer", "discount_percentage_amount"],
      key: "discount",
      render: (text, record) => (
        <Tag color="green">
          {text}
          {record.offer.is_percentage ? "%" : ""}
        </Tag>
      ),
    },
    {
      title: "Validity",
      dataIndex: "valid_from",
      key: "validity",
      render: (_, record) => (
        <Text>
          {formatDate(record.valid_from)} - {formatDate(record.valid_to)}
        </Text>
      ),
    },
    {
      title: "Status",
      dataIndex: ["offer", "status"],
      key: "status",
      render: (status, record) => (
        <Tag color={status ? "green" : "red"}>
          {status ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Validity Status",
      dataIndex: "validity_status",
      render: (_, record) => {
        const status = Utils.getCouponPeriodStatus(record);
        const colorMap = {
          Upcoming: "gold",
          Running: "green",
          Expired: "red",
          "No Validity": "gray",
        };
        return (
          <span
            style={{
              color: colorMap[status],
              fontWeight: 600,
            }}
          >
            {status}
          </span>
        );
      },
    },
  ];

  // Add-ons table columns
  const addonsColumns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
      render: (text) => <Text code>{text || "N/A"}</Text>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status ? "green" : "red"}>
          {status ? "Active" : "Inactive"}
        </Tag>
      ),
    },
  ];

  // Food slots table columns
  const foodSlotsColumns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      render: (text) => <Text code>{text}</Text>,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Time Slot",
      key: "timeSlot",
      render: (_, record) => (
        <div className="flex items-center">
          <FaClock className="mr-2 text-blue-500" />
          <Text>
            {record.start_time} - {record.end_time}
          </Text>
        </div>
      ),
    },
    {
      title: "Number of Tickets",
      dataIndex: "num_of_tickets",
      key: "num_of_tickets",
      render: (text) => (
        <Tag color="blue" className="text-center">
          {text}
        </Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status ? "green" : "red"}>
          {status ? "Active" : "Inactive"}
        </Tag>
      ),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header Section */}
      <div className="mb-6">
        <Title level={2} className="flex items-center text-blue-600">
          <FaCalendarAlt className="mr-3" />
          {name || "Event Schedule Details"}
        </Title>
        <div className="flex items-center gap-4 mt-2">
          <Tag
            className="flex items-center justify-center"
            color={is_multi_date ? "green" : "orange"}
            icon={<FaCalendarDay className="me-1" />}
          >
            {is_multi_date ? "Multi-date Event" : "Single Date Event"}
          </Tag>
          <Tag
            className="flex items-center justify-center"
            color="purple"
            icon={<FaTicketAlt className="me-1" />}
          >
            Max {max_ticket_per_booking} tickets/booking
          </Tag>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs defaultActiveKey="1" className="custom-tabs">
        {/* Overview Tab */}
        <TabPane tab="Overview" key="1">
          <Row gutter={[24, 24]} className="mt-4">
            {/* Event Details */}
            <Col span={24} lg={12}>
              <Card
                title={
                  <span className="flex items-center">
                    <FaInfoCircle className="mr-2 text-blue-500" />
                    Event Information
                  </span>
                }
                className="h-full"
              >
                <Descriptions bordered column={1} size="middle">
                  <Descriptions.Item label="Schedule ID">
                    <Text code>{id || "N/A"}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Event Name">
                    <Text strong>{event?.event_name || "N/A"}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Event ID">
                    <Text code>{event?.id || "N/A"}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Schedule Dates">
                    <div className="flex items-center">
                      <FaCalendarAlt className="mr-2 text-blue-500" />
                      <Text>
                        {formatDate(start_date)} - {formatDate(end_date)}
                      </Text>
                    </div>
                  </Descriptions.Item>
                  <Descriptions.Item label="Booking Opens">
                    <div className="flex items-center">
                      <FaTicketAlt className="mr-2 text-green-500" />
                      <Text>{formatDateTime(booking_start_date_time)}</Text>
                    </div>
                  </Descriptions.Item>
                  <Descriptions.Item label="Ad Start Date">
                    <div className="flex items-center">
                      <FaInfoCircle className="mr-2 text-orange-500" />
                      <Text>{formatDateTime(ad_start_date_time)}</Text>
                    </div>
                  </Descriptions.Item>
                  <Descriptions.Item label="Available Types">
                    <Tag
                      color={
                        available_types === "seat_structure" ? "blue" : "cyan"
                      }
                    >
                      {available_types === "seat_structure"
                        ? "Seat Structure"
                        : "Ticket Structure"}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Status">
                    <Tag
                      color={processedScheduleDetails.status ? "green" : "red"}
                    >
                      {processedScheduleDetails.status ? "Active" : "Inactive"}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Payment Required">
                    <Tag
                      color={
                        processedScheduleDetails.payment_required
                          ? "orange"
                          : "default"
                      }
                    >
                      {processedScheduleDetails.payment_required ? "Yes" : "No"}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="User Booking Limit">
                    {processedScheduleDetails.booking_limit_per_user_toggle ? (
                      <Tag color="purple">
                        {processedScheduleDetails.booking_limit_per_user ||
                          "N/A"}{" "}
                        bookings per user
                      </Tag>
                    ) : (
                      <Tag color="default">No Limit</Tag>
                    )}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>

            {/* Venue Details */}
            <Col span={24} lg={12}>
              <Card
                title={
                  <span className="flex items-center">
                    <FaMapMarkerAlt className="mr-2 text-red-500" />
                    Venue Information
                  </span>
                }
                className="h-full"
              >
                {venue ? (
                  <>
                    <Descriptions
                      bordered
                      column={1}
                      size="middle"
                      className="mb-4"
                    >
                      <Descriptions.Item label="Venue ID">
                        <Text code>{venue.id}</Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="Venue Name">
                        <Text strong>{venue.name}</Text>
                      </Descriptions.Item>
                    </Descriptions>

                    <Divider orientation="left">Place Details</Divider>
                    <div className="flex mb-4">
                      {venue.place?.thumbnail_image && (
                        <CDNImage
                          src={venue.place.thumbnail_image}
                          alt={`Image Thumbnail`}
                          height={80}
                          width={80}
                          preview={true}
                        />
                      )}
                      <div className="ms-4 flex-1">
                        <Title level={5} className="mb-1">
                          {venue.place?.name}
                        </Title>
                        <Text className="block text-gray-600">
                          Place ID: <Text code>{venue.place?.id}</Text>
                        </Text>
                        <Text className="block text-gray-600">
                          Country: {venue.place?.country?.name}
                        </Text>
                        <Text className="block text-gray-500">
                          {venue.place?.country?.currency_code} •{" "}
                          {venue.place?.country?.time_zone}
                        </Text>
                        <Text className="block text-gray-500">
                          Country ID:{" "}
                          <Text code>{venue.place?.country?.id}</Text> • Schema:{" "}
                          <Text code className="text-xs">
                            {venue.place?.country?.schema_name}
                          </Text>
                        </Text>
                      </div>
                    </div>

                    <Divider orientation="left">Venue Description</Divider>
                    <div
                      className="prose max-w-none text-gray-700"
                      dangerouslySetInnerHTML={{ __html: venue.description }}
                    />

                    {venue.place?.description && (
                      <>
                        <Divider orientation="left">Place Description</Divider>
                        <div
                          className="prose max-w-none text-gray-700"
                          dangerouslySetInnerHTML={{
                            __html: venue.place.description,
                          }}
                        />
                      </>
                    )}
                  </>
                ) : (
                  <Empty description="No venue information available" />
                )}
              </Card>
            </Col>
          </Row>
        </TabPane>

        {/* Show Times Tab */}
        <TabPane tab="Show Times" key="2">
          <ShowTimesDetails groupedShows={groupedShows} />
        </TabPane>

        {/* Offers Tab */}
        <TabPane tab="Offers" key="3">
          <OfferDetailsTable
            offerColumns={offerColumns}
            offer_schedule={offer_schedule}
          />
        </TabPane>

        {/* Coupons Tab */}
        <TabPane tab="Coupons" key="4">
          <CouponDetailsTable coupon_schedule={coupon_schedule} />
        </TabPane>

        {/* Additional Info Tab */}
        <TabPane tab="Additional Info" key="5">
          <Row gutter={[24, 24]} className="mt-4">
            {/* Add-ons Section */}
            <Col span={24}>
              <Card
                title={
                  <span className="flex items-center">
                    <FaPuzzlePiece className="mr-2 text-purple-500" />
                    Add-ons Configuration
                  </span>
                }
              >
                {processedScheduleDetails.add_ons_slim?.length > 0 ? (
                  <Table
                    dataSource={processedScheduleDetails.add_ons_slim}
                    columns={addonsColumns}
                    pagination={false}
                    rowKey={(record) => record.name}
                    bordered
                  />
                ) : (
                  <Empty
                    description="No add-ons configured for this schedule"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                )}
              </Card>
            </Col>

            {/* Food Slots Section */}
            <Col span={24}>
              <Card
                title={
                  <span className="flex items-center">
                    <FaUtensils className="mr-2 text-orange-500" />
                    Food Slots Configuration
                  </span>
                }
              >
                {processedScheduleDetails.food_slots_slim?.length > 0 ? (
                  <Table
                    dataSource={processedScheduleDetails.food_slots_slim}
                    columns={foodSlotsColumns}
                    pagination={false}
                    rowKey={(record) => record.id}
                    bordered
                  />
                ) : (
                  <Empty
                    description="No food slots configured for this schedule"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                )}
              </Card>
            </Col>

            {/* Schedule Status Section */}
            <Col span={24}>
              <Card
                title={
                  <span className="flex items-center">
                    <FaInfoCircle className="mr-2 text-blue-500" />
                    Schedule Status Details
                  </span>
                }
              >
                {processedScheduleDetails.schedule_status ? (
                  <pre className="bg-gray-50 p-4 rounded-lg overflow-auto border border-gray-200">
                    <code className="text-sm">
                      {JSON.stringify(
                        processedScheduleDetails.schedule_status,
                        null,
                        2
                      )}
                    </code>
                  </pre>
                ) : (
                  <Empty
                    description="No schedule status information available"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                )}
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>

      {/* Quick Stats Footer */}
      <div className="mt-6 p-4 bg-gray-100 rounded-lg">
        <Row className="flex items-center justify-center">
          <Col xs={24} sm={12} md={6}>
            <div className="text-center">
              <Text strong className="block text-gray-600">
                Total Shows
              </Text>
              <Title level={3} className="m-0">
                {available_types === "seat_structure"
                  ? show_seat_details?.length || 0
                  : show_dates?.reduce(
                    (total, date) => total + (date.show_times?.length || 0),
                    0
                  ) || 0}
              </Title>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div className="text-center">
              <Text strong className="block text-gray-600">
                Event Days
              </Text>
              <Title level={3} className="m-0">
                {dayjs(end_date).diff(dayjs(start_date), "day") + 1}
              </Title>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div className="text-center">
              <Text strong className="block text-gray-600">
                Available Offers
              </Text>
              <Title level={3} className="m-0">
                {offer_schedule?.length || 0}
              </Title>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div className="text-center">
              <Text strong className="block text-gray-600">
                Available Coupons
              </Text>
              <Title level={3} className="m-0">
                {coupon_schedule?.length || 0}
              </Title>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default ScheduleDetails;
