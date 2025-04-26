import React from "react";
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
} from "antd";
import dayjs from "dayjs";
import {
  FaCalendarAlt,
  FaClock,
  FaTicketAlt,
  FaTag,
  FaGift,
} from "react-icons/fa";
import { useSelector } from "react-redux";

const { Panel } = Collapse;
const { Text } = Typography;

const ConfirmationPage = () => {
  const { submitedData } = useSelector((state) => state.schedules) || {};

  const formatDateTime = (dateTimeStr) =>
    dateTimeStr ? dayjs(dateTimeStr).format("MMMM D, YYYY h:mm A") : "-";

  const formatDate = (dateStr) =>
    dateStr ? dayjs(dateStr).format("MMMM D, YYYY") : "-";

  const formatTime = (timeStr) =>
    timeStr ? dayjs(`2000-01-01T${timeStr}`).format("h:mm A") : "-";

  return (
    <Space direction="vertical" size="large" className="w-full">
      {/* Schedule & Event Details */}
      <Card
        title={
          <Space>
            <FaCalendarAlt />
            <span>Schedule & Event Details</span>
          </Space>
        }
        className="w-full"
      >
        <Descriptions
          title="Schedule Information"
          bordered
          column={{ xs: 1, sm: 2 }}
        >
          <Descriptions.Item label="Schedule Name" span={2}>
            {submitedData?.name || "Untitled Schedule"}
          </Descriptions.Item>
          <Descriptions.Item label="Event Date Range">
            <Space>
              <Text style={{ whiteSpace: "nowrap" }}>
                {formatDate(submitedData?.start_date)} -{" "}
                {formatDate(submitedData?.end_date)}
              </Text>
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="Event ID">
            {submitedData?.event_id || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Advertisement Start">
            {formatDateTime(submitedData?.ad_start_date_time)}
          </Descriptions.Item>
          <Descriptions.Item label="Booking Start">
            {formatDateTime(submitedData?.booking_start_date_time)}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Show Dates & Times */}
      <Card
        title={
          <Space>
            <FaClock />
            <span>Show Dates and Times</span>
          </Space>
        }
        className="w-full"
      >
        {submitedData?.show_dates?.length > 0 ? (
          <Collapse accordion>
            {submitedData.show_dates.map((showDate, index) => (
              <Panel
                key={`${showDate.start_date}-${index}`}
                header={
                  <Space>
                    <Text strong>{formatDate(showDate.start_date)}</Text>
                    {showDate.end_date && (
                      <Text type="secondary">
                        - {formatDate(showDate.end_date)}
                      </Text>
                    )}
                    <Text type="secondary">
                      ({showDate.show_times.length} time slot
                      {showDate.show_times.length !== 1 ? "s" : ""})
                    </Text>
                  </Space>
                }
              >
                <Row gutter={[16, 16]}>
                  {showDate.show_times.map((timeSlot, timeIndex) => (
                    <Col
                      xs={24}
                      md={12}
                      lg={8}
                      key={`${timeSlot.start_time}-${timeIndex}`}
                    >
                      <Card size="small" className="h-full">
                        <Space
                          direction="vertical"
                          size="small"
                          className="w-full"
                        >
                          <Text strong>
                            {formatTime(timeSlot.start_time)} -{" "}
                            {formatTime(timeSlot.end_time)}
                            {timeSlot.is_midnight === "true" && (
                              <Tooltip title="This event runs past midnight">
                                <Tag color="blue" className="ml-2">
                                  Overnight
                                </Tag>
                              </Tooltip>
                            )}
                          </Text>
                          <Space align="center">
                            <FaTicketAlt />
                            <Text type="secondary">
                              {timeSlot.ticket_set || "-"}
                            </Text>
                          </Space>
                          <Text type="secondary">
                            Ticket Structure ID: {timeSlot.ticket_structure_id}
                          </Text>
                        </Space>
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

      {/* Selected Offers */}
      {submitedData?.offer_ids?.length > 0 && (
        <Card
          title={
            <Space>
              <FaTag />
              <span>Selected Offers</span>
            </Space>
          }
          className="w-full"
        >
          <Row gutter={[16, 16]}>
            {submitedData.offer_ids.map((offer, index) => (
              <Col xs={24} md={12} lg={8} key={`${offer.offer_id}-${index}`}>
                <Card size="small" className="h-full">
                  <Space direction="vertical" size="small" className="w-full">
                    <Text strong>Offer ID: {offer.offer_id}</Text>
                    <Text type="secondary">Valid Period:</Text>
                    <Text>
                      {formatDate(offer.valid_from)} -{" "}
                      {formatDate(offer.valid_to)}
                    </Text>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      )}

      {/* Selected Coupons */}
      {submitedData?.coupon_ids?.length > 0 && (
        <Card
          title={
            <Space>
              <FaGift />
              <span>Selected Coupons</span>
            </Space>
          }
          className="w-full"
        >
          <Row gutter={[16, 16]}>
            {submitedData.coupon_ids.map((coupon, index) => (
              <Col xs={24} md={12} lg={8} key={`${coupon.coupon_id}-${index}`}>
                <Card size="small" className="h-full">
                  <Space direction="vertical" size="small" className="w-full">
                    <Text strong>Coupon ID: {coupon.coupon_id}</Text>
                    <Text type="secondary">Valid Period:</Text>
                    <Text>
                      {formatDate(coupon.valid_from)} -{" "}
                      {formatDate(coupon.valid_to)}
                    </Text>
                    {coupon.valid_from === "1970-01-01" && (
                      <Tag color="orange">Legacy Coupon</Tag>
                    )}
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      )}
    </Space>
  );
};

export default ConfirmationPage;
