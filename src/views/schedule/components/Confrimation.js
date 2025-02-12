import React from "react";
import {
  Card,
  Descriptions,
  Typography,
  Space,
  Collapse,
  Timeline,
  Empty,
  Row,
  Col,
} from "antd";
import dayjs from "dayjs";
import { FaCalendarAlt, FaClock } from "react-icons/fa";
import { useSelector } from "react-redux";

const { Panel } = Collapse;

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
      <Card title="Schedule & Event Details" className="w-full">
        <Row>
          <Col>
            <Descriptions title="Schedule Details" bordered column={2}>
              <Descriptions.Item label="Schedule Name">
                {submitedData?.name || "Untitled Schedule"}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <Space>
                    <FaCalendarAlt /> Event Date Range
                  </Space>
                }
              >
                <Typography.Text style={{ whiteSpace: "nowrap" }}>
                  {`${submitedData?.start_date || "-"} - ${
                    submitedData?.end_date || "-"
                  }`}
                </Typography.Text>
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  <Space>
                    <FaClock /> Advertisement Start
                  </Space>
                }
              >
                {formatDateTime(submitedData?.ad_start_date_time)}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <Space>
                    <FaClock /> Booking Start
                  </Space>
                }
              >
                {formatDateTime(submitedData?.booking_start_date_time)}
              </Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>
      </Card>

      {/* Show Dates & Times */}
      <Card title="Show Dates and Times" className="w-full">
        {submitedData?.show_dates?.length > 0 ? (
          <Collapse accordion>
            {submitedData.show_dates.map((showDate) => (
              <Panel key={showDate.date} header={formatDate(showDate.date)}>
                <Row gutter={[16, 16]}>
                  {showDate.show_times.map((timeSlot) => (
                    <Col xs={24} md={12} key={timeSlot.id}>
                      <Card>
                        <Typography.Text strong>
                          {formatTime(timeSlot.start_time)} -{" "}
                          {formatTime(timeSlot.end_time)}
                        </Typography.Text>
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
        <Card title="Selected Offers" className="w-full">
          <Row gutter={[16, 16]}>
            {submitedData.offer_ids.map((offer) => (
              <Col xs={24} md={12} key={offer.offer_id}>
                <Card>
                  <Typography.Text strong>
                    Offer ID: {offer.offer_id}
                  </Typography.Text>
                  <br />
                  <Typography.Text type="secondary">
                    Valid: {formatDate(offer.valid_from)} -{" "}
                    {formatDate(offer.valid_to)}
                  </Typography.Text>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      )}

      {/* Selected Coupons */}
      {submitedData?.coupon_ids?.length > 0 && (
        <Card title="Selected Coupons" className="w-full">
          <Row gutter={[16, 16]}>
            {submitedData.coupon_ids.map((coupon) => (
              <Col xs={24} md={12} key={coupon.coupon_id}>
                <Card>
                  <Typography.Text strong>
                    Coupon ID: {coupon.coupon_id}
                  </Typography.Text>
                  <br />
                  <Typography.Text type="secondary">
                    Valid: {formatDate(coupon.valid_from)} -{" "}
                    {formatDate(coupon.valid_to)}
                  </Typography.Text>
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
