import React, { useEffect } from "react";
import {
  Card,
  Descriptions,
  Typography,
  Space,
  Table,
  Collapse,
  Timeline,
  Spin,
  Empty,
  Row,
  Col,
} from "antd";
import { Calendar, Clock, MapPin } from "lucide-react";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import { fetchSingleSchedules } from "store/slices/scheduleSlice";
import { useParams } from "react-router-dom";
import Loading from "components/shared-components/Loading";

const { Panel } = Collapse;

const ScheduleDetails = () => {
  const { scheduleId } = useParams();
  const dispatch = useDispatch();
  const { scheduleDetails, loading } = useSelector((state) => state.schedules);

  useEffect(() => {
    if (scheduleId) {
      dispatch(fetchSingleSchedules({ id: scheduleId }));
    }
  }, [dispatch, scheduleId]);

  const formatDateTime = (dateTimeStr) =>
    dateTimeStr ? dayjs(dateTimeStr).format("MMMM D, YYYY h:mm A") : "-";

  const formatDate = (dateStr) =>
    dateStr ? dayjs(dateStr).format("MMMM D, YYYY") : "-";

  const formatTime = (timeStr) =>
    timeStr ? dayjs(`2000-01-01T${timeStr}`).format("h:mm A") : "-";

  if (loading) {
    return <Loading />;
  }

  if (!scheduleDetails) {
    return <Empty description="No schedule data found" image={Empty.PRESENTED_IMAGE_SIMPLE} />;
  }

  return (
    <Space direction="vertical" size="large" className="w-full">
      {/* Schedule & Event Details */}
      <Card title="Schedule & Event Details">
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Descriptions title="Schedule Details" bordered column={1}>
              <Descriptions.Item label="Schedule Name">
                {scheduleDetails.name || "Untitled Schedule"}
              </Descriptions.Item>
              <Descriptions.Item label={<Space><Calendar /> Event Date Range</Space>}>
                {formatDate(scheduleDetails.start_date)} - {formatDate(scheduleDetails.end_date)}
              </Descriptions.Item>
              <Descriptions.Item label={<Space><Clock /> Advertisement Start</Space>}>
                {formatDateTime(scheduleDetails.ad_start_date_time)}
              </Descriptions.Item>
              <Descriptions.Item label={<Space><Clock /> Booking Start</Space>}>
                {formatDateTime(scheduleDetails.booking_start_date_time)}
              </Descriptions.Item>
            </Descriptions>
          </Col>

          <Col xs={24} md={12}>
            <Descriptions title="Event Details" bordered column={1}>
              <Descriptions.Item label="Event Name">
                {scheduleDetails.event?.event_name || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label={<Space><MapPin /> Venue</Space>}>
                <Typography.Text strong>
                  {scheduleDetails.event?.venue?.name || "N/A"}
                </Typography.Text>
                <br />
                <Typography.Text>
                  {scheduleDetails.event?.venue?.place?.name || "N/A"},
                  {scheduleDetails.event?.venue?.place?.country?.name || "N/A"}
                </Typography.Text>
              </Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>
      </Card>

      {/* Show Dates and Times with Timeline */}
      <Card title="Show Dates and Times" className="w-full">
        {scheduleDetails.show_dates?.length > 0 ? (
          <Collapse accordion>
            {scheduleDetails.show_dates.map((showDate) => (
              <Panel key={showDate.id} header={formatDate(showDate.date)}>
                <Timeline mode="left">
                  {showDate.show_times.map((timeSlot) => (
                    <Timeline.Item key={timeSlot.id} color="blue">
                      <Typography.Text strong>
                        {formatTime(timeSlot.start_time)} - {formatTime(timeSlot.end_time)}
                      </Typography.Text>
                    </Timeline.Item>
                  ))}
                </Timeline>
              </Panel>
            ))}
          </Collapse>
        ) : (
          <Empty description="No show dates available" />
        )}
      </Card>
    </Space>
  );
};

export default ScheduleDetails;
