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
} from "antd";
import dayjs from "dayjs";
import { FaCalendarAlt, FaClock, FaTag, FaGift } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { fetchSingleSchedules } from "store/slices/scheduleSlice";
import { useParams } from "react-router-dom";
import Loading from "components/shared-components/Loading";

const { Panel } = Collapse;
const { Text } = Typography;

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

  if (loading) {
    return <Loading />;
  }

  const processedScheduleDetails =
    scheduleDetails?.data?.[0] || scheduleDetails;

  if (!processedScheduleDetails) {
    return <Empty description="No schedule data found" />;
  }

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <Card
        title={
          <Space>
            <FaCalendarAlt />
            <span>Schedule & Event Details</span>
          </Space>
        }
        style={{ width: "100%" }}
      >
        <Row gutter={[24, 24]}>
          <Col span={12}>
            <Descriptions bordered column={1} layout="vertical">
              <Descriptions.Item label="Schedule Name">
                {processedScheduleDetails.name || "Untitled Schedule"}
              </Descriptions.Item>
              <Descriptions.Item label="Event Date Range">
                <Text>
                  {formatDate(processedScheduleDetails.start_date)} -{" "}
                  {formatDate(processedScheduleDetails.end_date)}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Schedule ID">
                {processedScheduleDetails.id || "N/A"}
              </Descriptions.Item>
            </Descriptions>
          </Col>

          <Col span={12}>
            <Descriptions bordered column={1} layout="vertical">
              <Descriptions.Item label="Event Name">
                {processedScheduleDetails.event?.event_name || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Event ID">
                {processedScheduleDetails.event?.id || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Venues">
                {processedScheduleDetails.event?.venues?.length > 0 ? (
                  <Collapse>
                    <Panel
                      header={`${processedScheduleDetails.event.venues.length} Venue(s) Available`}
                      key="venues"
                    >
                      <Row gutter={[16, 16]}>
                        {processedScheduleDetails.event.venues.map((venue) => (
                          <Col span={12} key={venue.id}>
                            {/* <Card size="small"> */}
                            <Text strong>{venue.name}, </Text>
                            <Text type="secondary">
                              {venue.place?.name || "N/A"},{" "}
                              {venue.place?.country?.name || "N/A"}
                            </Text>
                            {/* </Card> */}
                          </Col>
                        ))}
                      </Row>
                    </Panel>
                  </Collapse>
                ) : (
                  <Text>No venues available</Text>
                )}
              </Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>
      </Card>

      <Card
        title={
          <Space>
            <FaClock />
            <span>Show Dates and Times</span>
          </Space>
        }
        style={{ width: "100%" }}
      >
        {processedScheduleDetails.show_dates?.length > 0 ? (
          <Collapse accordion>
            {processedScheduleDetails.show_dates.map((showDate, index) => (
              <Panel
                key={showDate.id || index}
                header={
                  <Space>
                    <Badge color="blue" />
                    <Text strong>{formatDate(showDate.start_date)}</Text>
                  </Space>
                }
              >
                <Row gutter={[16, 16]}>
                  {showDate.show_times.map((timeSlot, timeIndex) => (
                    <Col span={8} key={timeSlot.id || timeIndex}>
                      <Card size="small">
                        <Text strong>
                          {timeSlot.start_time} - {timeSlot.end_time}
                        </Text>
                        {timeSlot.is_midnight && (
                          <Tooltip title="Runs past midnight">
                            <Tag color="blue">Overnight</Tag>
                          </Tooltip>
                        )}
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Panel>
            ))}
          </Collapse>
        ) : (
          <Empty description="No show dates available" />
        )}
      </Card>

      {processedScheduleDetails.offer_ids?.length > 0 && (
        <Card
          title={
            <Space>
              <FaTag />
              <span>Selected Offers</span>
            </Space>
          }
          style={{ width: "100%" }}
        >
          <Row gutter={[16, 16]}>
            {processedScheduleDetails.offer_ids.map((offer, index) => (
              <Col span={8} key={offer.id || index}>
                <Card size="small">
                  <Text strong>Offer ID: {offer.id}</Text>
                  <Text>
                    Valid: {formatDate(offer.valid_from)} -{" "}
                    {formatDate(offer.valid_to)}
                  </Text>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      )}

      {processedScheduleDetails.coupon_ids?.length > 0 && (
        <Card
          title={
            <Space>
              <FaGift />
              <span>Selected Coupons</span>
            </Space>
          }
          style={{ width: "100%" }}
        >
          <Row gutter={[16, 16]}>
            {processedScheduleDetails.coupon_ids.map((coupon, index) => (
              <Col span={8} key={coupon.id || index}>
                <Card size="small">
                  <Text strong>Coupon ID: {coupon.id}</Text>
                  <Text>
                    Valid: {formatDate(coupon.valid_from)} -{" "}
                    {formatDate(coupon.valid_to)}
                  </Text>
                  {coupon.valid_from === "1970-01-01" && (
                    <Tag color="orange">Legacy Coupon</Tag>
                  )}
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      )}
    </Space>
  );
};

export default ScheduleDetails;
