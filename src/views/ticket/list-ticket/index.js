import React, { useEffect, useState } from 'react';
import { Card, Table, Input, Button, Collapse, Modal, Row, Col, Divider } from 'antd';
import { PlusCircleOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from "react-router-dom";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import { fetchAllTickets, filterTickets } from 'store/slices/ticketSlice';
import { useDispatch, useSelector } from 'react-redux';
const { Panel } = Collapse;

const TicketList = () => {
  
  const dispatch = useDispatch();
  const { filteredTickets, loading,searchTerm } = useSelector((state) => state.tickets);

  useEffect(() => {
    dispatch(fetchAllTickets());
  }, [dispatch]);

  const handleSearch = (e) => {
    dispatch(filterTickets({ searchTerm: e.target.value, status: null }));
  };

  // const handleShowStatus = (status) => {
  //   dispatch(filterOffers({ searchTerm: null, status }));
  // };

  // const [list, setList] = useState(seatData);
  // const [searchTerm, setSearchTerm] = useState('');
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);


  const showDetails = (venue) => {
    setSelectedVenue(venue);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const navigate = useNavigate();


  return (
    <Card style={{ padding: '20px' }}>
      <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
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
        onRow={(record) => ({
          onClick: () => showDetails(record),
        })}
        columns={[
          {
            title: 'Venue ID',
            dataIndex: 'venue_id',
            render: (venue_id) => <strong>{venue_id}</strong>,
          },
          {
            title: 'Number of Tickets',
            dataIndex: 'number_of_tickets',
          },
          {
            title: 'Base Price',
            dataIndex: 'base_price',
            render: (price) => `$${price}`,
          },
          {
            title: 'Ticket Types',
            dataIndex: 'ticket_types',
            render: (_, record) => (
              <Collapse defaultActiveKey={[]} accordion>
                {Object.keys(record.ticket_types).map(set => (
                  <Panel header={set} key={set} extra={<span>+{record.ticket_types[set].length} types</span>}>
                    <ul style={{ paddingLeft: 20 }}>
                      {record.ticket_types[set].map(ticket => (
                        <li key={ticket.name}>
                          <strong>{ticket.name}</strong>: ${ticket.price} for {ticket.number_of_tickets} tickets
                        </li>
                      ))}
                    </ul>
                  </Panel>
                ))}
              </Collapse>
            ),
          },
        ]}
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
              <Col span={12}><strong>Venue ID:</strong> {selectedVenue.venue_id}</Col>
              <Col span={12}><strong>Base Price:</strong> ${selectedVenue.base_price}</Col>
            </Row>
            <Divider />

            {/* Dynamically Display Ticket Sections */}
            {Object.keys(selectedVenue.ticket_types).map(set => (
              <div key={set}>
                <h4 style={{ fontSize: 16, fontWeight: 600 }}>{set} Tickets</h4>
                <Row gutter={16}>
                  {selectedVenue.ticket_types[set].map(ticket => (
                    <Col span={12} key={ticket.name}>
                      <Card
                        title={ticket.name}
                        bordered={false}
                        style={{ marginBottom: 16, backgroundColor: set === 'set1' ? '#f5f5f5' : '#e6f7ff' }}
                      >
                        <p><strong>Price:</strong> ${ticket.price}</p>
                        <p><strong>Available Tickets:</strong> {ticket.number_of_tickets}</p>
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
