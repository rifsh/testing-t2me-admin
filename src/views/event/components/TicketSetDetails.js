import React from "react";
import { Card, Typography, Collapse, Col, Button, Space, Empty } from "antd";
import { useDispatch, useSelector } from "react-redux";
import {
  removeSpecificTicketSet,
  removeTicketType
} from "store/slices/ticketSlice";
import { DeleteOutlined, CloseCircleOutlined } from "@ant-design/icons";

const { Text } = Typography;
const { Panel } = Collapse;

export const TicketSetDetails = () => {
  const dispatch = useDispatch();
  const { ticketTypes } = useSelector((state) => state.tickets);

  const handleRemoveTicketSet = (typeIndex, ticketSetId, e) => {
    e.stopPropagation();
    dispatch(removeSpecificTicketSet({ typeIndex, ticketSetId }));
  };

  const handleRemoveTicketType = (typeIndex) => {
    dispatch(removeTicketType(typeIndex));
  };

  const renderTicketTypeDetails = () => {
    if (!ticketTypes || ticketTypes.length === 0) {
      return (
        <Card>
          <Empty description="No ticket types added" />
        </Card>
      );
    }

    return ticketTypes.map((ticketType, typeIndex) => {
      const ticketSets = ticketType.ticket_types || [];

      return (
        <Card
          key={typeIndex}
          title={
            <Space>
              <Text strong>{ticketType.name || "Ticket Type"}</Text>
              <Text type="secondary">({ticketSets.length} sets)</Text>
            </Space>
          }
          extra={
            <Button
              type="text"
              icon={<DeleteOutlined />}
              onClick={() => handleRemoveTicketType(typeIndex)}
              danger
            />
          }
          className="mb-4"
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <div className="mb-4">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Space>
                  <Text strong>Venue ID:</Text>
                  <Text>{ticketType.venue_id}</Text>
                </Space>
                <Space>
                  <Text strong>Total Tickets:</Text>
                  <Text>{ticketType.number_of_tickets || 0}</Text>
                </Space>
                <Space>
                  <Text strong>Base Price:</Text>
                  <Text>${ticketType.base_price?.toFixed(2) || "0.00"}</Text>
                </Space>
              </Space>
            </div>

            {ticketSets.length > 0 ? (
              <Collapse>
                {ticketSets.map((ticketSet, setIndex) => (
                  <Panel
                    key={`${typeIndex}-${setIndex}`}
                    header={
                      <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                        <Text>{ticketSet.ticket_set}</Text>
                        <Button
                          type="text"
                          size="small"
                          icon={<CloseCircleOutlined />}
                          onClick={(e) => handleRemoveTicketSet(typeIndex, ticketSet.id, e)}
                          danger
                        />
                      </Space>
                    }
                  >
                    {ticketSet.tickets && ticketSet.tickets.map((ticket, ticketIndex) => (
                      <div
                        key={`${typeIndex}-${setIndex}-${ticketIndex}`}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '8px 0',
                          borderBottom: ticketIndex < ticketSet.tickets.length - 1 ? '1px solid #f0f0f0' : 'none'
                        }}
                      >
                        <Text strong>{ticket.name}</Text>
                        <Space>
                          <Text type="secondary">{ticket.number_of_tickets || 0} Tickets</Text>
                          <Text strong style={{ color: '#2ecc71' }}>
                            ${ticket.price?.toFixed(2) || "0.00"}
                          </Text>
                        </Space>
                      </div>
                    ))}
                  </Panel>
                ))}
              </Collapse>
            ) : (
              <Empty description="No ticket sets added" />
            )}
          </Space>
        </Card>
      );
    });
  };

  return (
    <Col xs={24} sm={24} md={7}>
      {renderTicketTypeDetails()}
    </Col>
  );
};

export default TicketSetDetails;