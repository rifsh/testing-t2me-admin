import React from "react";
import {
  Card,
  Collapse,
  Empty,
  Tag,
  Tooltip,
  Badge,
  List,
  Typography,
  Descriptions,
  Divider,
} from "antd";
import { FaChair, FaTicketAlt, FaClock, FaCalendarAlt } from "react-icons/fa";
import dayjs from "dayjs";

const { Panel } = Collapse;
const { Text, Title } = Typography;

const ShowTimesDetails = ({ groupedShows, scheduleDetails }) => {
  // Helper function to format date
  const formatDate = (dateStr) => {
    return dateStr ? dayjs(dateStr).format("MMMM D, YYYY") : "-";
  };

  // Determine event type from schedule details
  const availableTypes = scheduleDetails?.available_types;
  const isSeatBased = availableTypes === "seat_structure";
  const isTicketBased = availableTypes === "ticket_structure";

  // Process shows based on type
  const processedGroupedShows = {};

  if (isSeatBased && scheduleDetails?.show_seat_details) {
    // Handle seat-based events
    scheduleDetails.show_seat_details.forEach((show) => {
      const date = show.start_date;
      if (!processedGroupedShows[date]) {
        processedGroupedShows[date] = [];
      }
      processedGroupedShows[date].push({
        ...show,
        type: "seat",
      });
    });
  } else if (isTicketBased && scheduleDetails?.show_dates) {
    // Handle ticket-based events
    scheduleDetails.show_dates.forEach((showDate) => {
      const date = showDate.start_date;
      if (!processedGroupedShows[date]) {
        processedGroupedShows[date] = [];
      }

      if (showDate.show_times && showDate.show_times.length > 0) {
        showDate.show_times.forEach((showTime) => {
          processedGroupedShows[date].push({
            ...showTime,
            start_date: date,
            end_date: showDate.end_date,
            type: "ticket",
            ticket_structure: showTime.event_ticket_structures,
            ticket_types: showTime.show_time_ticket_types,
          });
        });
      }
    });
  }

  // Use processed data or fallback to passed groupedShows
  const finalGroupedShows =
    Object.keys(processedGroupedShows).length > 0
      ? processedGroupedShows
      : groupedShows;

  const renderSeatBasedShow = (show) => (
    <Card
      title={
        <div className="flex items-center justify-between">
          <span className="flex items-center">
            <FaClock className="mr-2" />
            {show.start_time} - {show.end_time}
          </span>
          {show.is_midnight && (
            <Tooltip title="Runs past midnight">
              <Tag color="blue">Overnight</Tag>
            </Tooltip>
          )}
        </div>
      }
      className="shadow-sm"
    >
      <div className="space-y-3">
        <div className="flex items-center">
          <FaChair className="mr-2 text-blue-500" />
          <Text strong>
            {show.event_seats?.event_seatstructures?.name || "Seat Structure"}
          </Text>
        </div>

        <Descriptions size="small" column={1}>
          <Descriptions.Item label="Total Seats">
            <Text strong className="text-lg text-blue-600">
              {show.event_seats?.event_seatstructures?.total_seats || "N/A"}
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="Layout">
            <Text strong>
              {show.event_seats?.event_seatstructures?.total_row || "N/A"} ×{" "}
              {show.event_seats?.event_seatstructures?.total_column || "N/A"}
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="Structure ID">
            <Tag color="blue">
              {show.event_seats?.event_seatstructures?.id || "N/A"}
            </Tag>
          </Descriptions.Item>
        </Descriptions>
      </div>
    </Card>
  );

  const renderTicketBasedShow = (show) => (
    <Card
      title={
        <div className="flex items-center justify-between">
          <span className="flex items-center">
            <FaClock className="mr-2" />
            {show.start_time} - {show.end_time}
          </span>
          {show.is_midnight && (
            <Tooltip title="Runs past midnight">
              <Tag color="orange">Overnight</Tag>
            </Tooltip>
          )}
        </div>
      }
      className="shadow-sm"
    >
      <div className="space-y-3">
        <div className="flex items-center">
          <FaTicketAlt className="mr-2 text-green-500" />
          <Text strong>
            {show.ticket_structure?.ticket_structure?.name ||
              "Ticket Structure"}
          </Text>
        </div>

        <Descriptions size="small" column={1}>
          <Descriptions.Item label="Ticket Set">
            <Tag color="green">
              {show.ticket_structure?.ticket_set || "Standard"}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Structure ID">
            <Tag color="green">
              {show.ticket_structure?.ticket_structure?.id || "N/A"}
            </Tag>
          </Descriptions.Item>
        </Descriptions>

        {show.ticket_types && show.ticket_types.length > 0 && (
          <>
            <Divider />
            <div>
              <Text type="secondary" className="block mb-2">
                Ticket Usage
              </Text>
              <div className="space-y-2">
                {show.ticket_types.map((ticket, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-2 bg-gray-50 rounded"
                  >
                    <Text>Type ID: {ticket.ticket_type_id}</Text>
                    <Badge
                      count={ticket.ticket_used_count}
                      style={{ backgroundColor: "#52c41a" }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </Card>
  );

  return (
    <div>
      {/* Event Type Indicator */}
      {scheduleDetails && (
        <Card className="mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FaCalendarAlt className="mr-2 text-gray-500" />
              <Text strong>Event Configuration</Text>
            </div>
            <div className="flex items-center gap-2">
              <Tag
                color={
                  isSeatBased ? "blue" : isTicketBased ? "green" : "default"
                }
              >
                {isSeatBased
                  ? "Seat-based Event"
                  : isTicketBased
                  ? "Ticket-based Event"
                  : "Unknown Type"}
              </Tag>
              <Tag color="purple">
                Max {scheduleDetails.max_ticket_per_booking || 1}{" "}
                tickets/booking
              </Tag>
            </div>
          </div>
        </Card>
      )}

      <Card>
        <Title level={5} className="mb-4">
          <FaCalendarAlt className="mr-2" />
          Show Schedule
        </Title>

        {Object.keys(finalGroupedShows || {}).length > 0 ? (
          <Collapse accordion className="schedule-collapse">
            {Object.entries(finalGroupedShows).map(([date, shows]) => (
              <Panel
                key={date}
                header={
                  <div className="flex items-center">
                    <Badge color={isSeatBased ? "blue" : "green"} />
                    <Text strong className="ml-2">
                      {formatDate(date)}
                    </Text>
                    <Tag className="ml-4">{shows.length} show(s)</Tag>
                  </div>
                }
              >
                <List
                  grid={{
                    gutter: 16,
                    xs: 1,
                    sm: 1,
                    md: 2,
                    lg: 2,
                    xl: 3,
                  }}
                  dataSource={shows}
                  renderItem={(show) => (
                    <List.Item>
                      {show.type === "seat" || show.event_seats
                        ? renderSeatBasedShow(show)
                        : renderTicketBasedShow(show)}
                    </List.Item>
                  )}
                />
              </Panel>
            ))}
          </Collapse>
        ) : (
          <Empty
            description={
              <div className="text-center">
                <p>No show times scheduled yet</p>
                <Text type="secondary">
                  {isSeatBased &&
                    "This seat-based event has no scheduled shows"}
                  {isTicketBased &&
                    "This ticket-based event has no scheduled shows"}
                  {!isSeatBased && !isTicketBased && "No show data available"}
                </Text>
              </div>
            }
          />
        )}
      </Card>
    </div>
  );
};

export default ShowTimesDetails;
