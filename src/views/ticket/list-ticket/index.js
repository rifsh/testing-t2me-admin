import React, { useEffect, useState } from "react";
import {
  Card,
  Table,
  Input,
  Button,
  Collapse,
  Modal,
  Row,
  Col,
  Divider,
} from "antd";
import { PlusCircleOutlined, SearchOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import {
  editTicket,
  fetchAllTickets,
  filterTickets,
  resetTicketSets,
} from "store/slices/ticketSlice";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedItem } from "store/slices/modalSlice";
import Utils from "utils";
import UpdateStatusModal from "components/util-components/ModalItems/UpdateStatusModal";
const { Panel } = Collapse;

const TicketList = () => {
  const dispatch = useDispatch();
  const { filteredTickets,  searchTerm, message } = useSelector(
    (state) => state.tickets
  );

  useEffect(() => {
    dispatch(resetTicketSets());
    dispatch(fetchAllTickets());
  }, [dispatch]);

  const handleSearch = (e) => {
    dispatch(filterTickets({ searchTerm: e.target.value, status: null }));
  };

  const [selectedVenue, setSelectedVenue] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // const showDetails = (venue) => {
  //   setSelectedVenue(venue);
  //   setIsModalVisible(true);
  // };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const navigate = useNavigate();
  const handleUpdateStatus = (item) => {
    const newStatus = !item.status;
    const data = { status: newStatus, id: item.id };

    dispatch(setSelectedItem(data));
  };
  return (
    <Card style={{ padding: "20px" }}>
      <div
        className="header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <Input
          placeholder="Search Ticket Type"
          prefix={<SearchOutlined />}
          value={searchTerm}
          onChange={handleSearch}
          style={{ width: 250 }}
        />
        <Button
          type="primary"
          icon={<PlusCircleOutlined />}
          onClick={() => navigate(`${APP_PREFIX_PATH}/ticket/add`)}
        >
          Add Ticket
        </Button>
      </div>

      <Table
        rowKey="id"
        dataSource={filteredTickets}
        pagination={false}
        // onRow={(record) => ({
        //   onClick: () => showDetails(record),
        // })}
        columns={[
          {
            title: "Ticket types",
            dataIndex: "name",
            render: (venue) => <strong>{venue}</strong>,
          },
          {
            title: "Venue",
            dataIndex: "venue",
            render: (venue) => <strong>{venue?.name}</strong>,
          },
          {
            title: "Number of Tickets",
            dataIndex: "number_of_tickets",
          },
          {
            title: "Base Price",
            dataIndex: "base_price",
            render: (price) => `$${price}`,
          },
          {
            title: "Ticket Sub Types",
            dataIndex: "ticket_types",
            render: (_, record) => (
              <Collapse defaultActiveKey={[]} accordion>
                {record?.ticket_types && record.ticket_types?.length > 0 ? (
                  record.ticket_types.map((set, index) => (
                    <Panel
                      header={set.ticket_set}
                      key={index}
                      extra={<span>{set.tickets.length} Types</span>}
                    >
                      <ul style={{ paddingLeft: 20 }}>
                        {set.tickets.map((ticket, ticketIndex) => (
                          <li key={ticketIndex} style={{ padding: "10px 0" }}>
                            <div
                              style={{
                                // display: "flex",
                                justifyContent: "space-between",
                                // alignItems: "center",
                              }}
                            >
                              <Col>
                                <span style={{ fontWeight: "bold" }}>
                                  {ticket.name}
                                </span>
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                  }}
                                >
                                  <span
                                    style={{
                                      color: "lightblue",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    Tickets : {ticket.number_of_tickets}
                                  </span>{" "}
                                  <span
                                    style={{
                                      color: "lightgreen",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    Price : ${ticket.price}
                                  </span>
                                </div>
                              </Col>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </Panel>
                  ))
                ) : (
                  <span>No ticket types available</span>
                )}
              </Collapse>
            ),
          },
          Utils.statusColumnUtil(handleUpdateStatus),
        ]}
      />
      <UpdateStatusModal
        responseMessage={message}
        editFunction={editTicket}
        getAllFunction={fetchAllTickets}
      />
      <Modal
        title="Venue Details"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={700}
      >
        {selectedVenue && (
          <div>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <strong>Venue ID:</strong> {selectedVenue.venue.id}
              </Col>
              <Col span={12}>
                <strong>Base Price:</strong> ${selectedVenue.base_price}
              </Col>
            </Row>
            <Divider />

            {/* Dynamically Display Ticket Sections */}
            {selectedVenue.ticket_types.map((set, index) => (
              <div key={index}>
                <h4 style={{ fontSize: 16, fontWeight: 600 }}>
                  {set.ticket_set} Tickets
                </h4>
                <Row gutter={16}>
                  {set.tickets.map((ticket, ticketIndex) => (
                    <Col span={12} key={ticketIndex}>
                      <Card
                        title={ticket?.name}
                        bordered={false}
                        style={{
                          marginBottom: 16,
                          backgroundColor:
                            set.ticket_set === "Set1" ? "#f5f5f5" : "#e6f7ff",
                        }}
                      >
                        <p>
                          <strong>Price:</strong> ${ticket.price}
                        </p>
                        <p>
                          <strong>Available Tickets:</strong>{" "}
                          {ticket.number_of_tickets}
                        </p>
                      </Card>
                    </Col>
                  ))}
                </Row>
                <Divider />
              </div>
            ))}
          </div>
        )}
      </Modal>
    </Card>
  );
};

export default TicketList;
