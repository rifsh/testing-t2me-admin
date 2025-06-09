import React, { useEffect } from "react";
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
  List
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
  FaRupeeSign
} from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { fetchSingleSchedules } from "store/slices/scheduleSlice";
import { useParams } from "react-router-dom";
import Loading from "components/shared-components/Loading";
import ShowTimesDetails from "../components/ShowTimesDetails";
import OfferDetailsTable from "../components/OfferDetailsTable";

const { Panel } = Collapse;
const { TabPane } = Tabs;
const { Text, Title } = Typography;

const ScheduleDetails = () => {
  const { scheduleId } = useParams();
  const dispatch = useDispatch();
  const { scheduleDetails, loading } = useSelector((state) => state.schedules);

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
    venue_id
  } = processedScheduleDetails;

  // Group show times by date for better organization
  const groupedShows = show_seat_details?.reduce((acc, show) => {
    const date = show.start_date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(show);
    return acc;
  }, {});

  // Columns for offers table
  const offerColumns = [
    {
      title: 'Offer',
      dataIndex: ['offer', 'name'],
      key: 'name',
      render: (text, record) => (
        <div className="flex items-center">
          {record.offer.thumbnail_image && (
            <Image
              src={record.offer.thumbnail_image}
              width={40}
              height={40}
              className="rounded mr-2"
              preview={false}
            />
          )}
          <Text strong>{text}</Text>
        </div>
      )
    },
    {
      title: 'Discount',
      dataIndex: ['offer', 'discount_percentage_amount'],
      key: 'discount',
      render: (text, record) => (
        <Tag color="green" >
          {text}{record.offer.is_percentage ? '%' : ''}
        </Tag>
      )
    },
    {
      title: 'Validity',
      dataIndex: 'valid_from',
      key: 'validity',
      render: (_, record) => (
        <Text>
          {formatDate(record.valid_from)} - {formatDate(record.valid_to)}
        </Text>
      )
    },
    {
      title: 'Status',
      dataIndex: ['offer', 'status'],
      key: 'status',
      render: (status, record) => (
        <Tag color={status ? 'green' : 'red'}>
          {status ? 'Active' : 'Inactive'}
        </Tag>
      )
    }
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
          <Tag className="flex items-center justify-center" color={is_multi_date ? "green" : "orange"} icon={<FaCalendarDay className="me-1" />}>
            {is_multi_date ? "Multi-date Event" : "Single Date Event"}
          </Tag>
          <Tag className="flex items-center justify-center" color="purple" icon={<FaTicketAlt className="me-1" />}>
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
                  <Descriptions.Item label="Event Name">
                    <Text strong>{event?.event_name || "N/A"}</Text>
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
                    <div className="flex mb-4">
                      {venue.place?.thumbnail_image && (
                        <Image
                          src={venue.place.thumbnail_image}
                          alt={venue.name}
                          width={120}
                          className="rounded-lg"
                          preview={false}
                        />
                      )}
                      <div className="ms-4">
                        <Title level={5} className="mb-1">{venue.name}</Title>
                        <Text className="block text-gray-600">
                          {venue.place?.name}, {venue.place?.country?.name}
                        </Text>
                        <Text className="block text-gray-500">
                          {venue.place?.country?.currency_code} • {venue.place?.country?.time_zone}
                        </Text>
                      </div>
                    </div>
                    <div
                      className="prose max-w-none text-gray-700"
                      dangerouslySetInnerHTML={{ __html: venue.description }}
                    />
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
          <OfferDetailsTable offerColumns={offerColumns} offer_schedule={offer_schedule} />
        </TabPane>

        {/* Coupons Tab */}
        <TabPane tab="Coupons" key="4">
          <Card className="mt-4">
            {coupon_schedule?.length > 0 ? (
              <List
                grid={{ gutter: 16, xs: 1, sm: 2, md: 3 }}
                dataSource={coupon_schedule}
                renderItem={(coupon) => (
                  <List.Item>
                    <Card
                      title={coupon.coupon?.name || "Coupon"}
                      extra={
                        <Tag color={coupon.coupon?.status ? "green" : "red"}>
                          {coupon.coupon?.status ? "Active" : "Inactive"}
                        </Tag>
                      }
                    >
                      <div className="mb-2">
                        <Text type="secondary">Valid for event:</Text>
                        <Text strong block>
                          {formatDate(coupon.valid_from)} - {formatDate(coupon.valid_to)}
                        </Text>
                      </div>
                      {coupon.coupon?.valid_from === "1970-01-01" && (
                        <Tag color="orange">Legacy Coupon</Tag>
                      )}
                    </Card>
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="No coupons available for this event" />
            )}
          </Card>
        </TabPane>
      </Tabs>

      {/* Quick Stats Footer */}
      <div className="mt-6 p-4 bg-gray-100 rounded-lg">
        <Row className="flex items-center justify-center">
          <Col xs={24} sm={12} md={6}>
            <div className="text-center">
              <Text strong className="block text-gray-600">Total Shows</Text>
              <Title level={3} className="m-0">{show_seat_details?.length || 0}</Title>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div className="text-center">
              <Text strong className="block text-gray-600">Event Days</Text>
              <Title level={3} className="m-0">
                {dayjs(end_date).diff(dayjs(start_date), 'day') + 1}
              </Title>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div className="text-center">
              <Text strong className="block text-gray-600">Available Offers</Text>
              <Title level={3} className="m-0">{offer_schedule?.length || 0}</Title>
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div className="text-center">
              <Text strong className="block text-gray-600">Available Coupons</Text>
              <Title level={3} className="m-0">{coupon_schedule?.length || 0}</Title>
            </div>
          </Col>
          {/* <Col xs={24} sm={12} md={6}>
            <div className="text-center">
              <Text strong className="block text-gray-600">Venue Capacity</Text>
              <Title level={3} className="m-0">
                {show_seat_details[0]?.event_seats?.event_seatstructures?.total_seats || "N/A"}
              </Title>
            </div>
          </Col> */}
        </Row>
      </div>
    </div>
  );
};

export default ScheduleDetails;