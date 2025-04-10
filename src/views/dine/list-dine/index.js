import React, { useState } from "react";
import { Table, Space, Button, Dropdown, Menu, Modal, message } from "antd";
import { PlusOutlined, MoreOutlined } from "@ant-design/icons";
import { data } from "../../../mock/data/DinesList";
import { useNavigate } from "react-router-dom";
import { APP_PREFIX_PATH } from "configs/AppConfig";

const Index = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    status: "all",
    dateRange: null,
  });

  const showDetailsModal = (record) => {
    Modal.info({
      title: `${record.name} Details`,
      content: (
        <div>
          <p>
            <strong>ID:</strong> {record.id}
          </p>
          <p>
            <strong>Location:</strong> {record.location}
          </p>
          <p>
            <strong>Cuisine:</strong> {record.cuisine}
          </p>
          <p>
            <strong>Capacity:</strong> {record.capacity} seats
          </p>
          <p>
            <strong>Price Range:</strong> {record.priceRange}
          </p>
          <p>
            <strong>Opening Hours:</strong> {record.openingHours}
          </p>
          <p>
            <strong>Tables:</strong> {record.availableTables} available of{" "}
            {record.totalTables} total
          </p>
          <p>
            <strong>Reservations Today:</strong> {record.reservationsToday}
          </p>
        </div>
      ),
      width: 500,
    });
  };

  const columns = [
    {
      title: "Table Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text, record) => (
        <a onClick={() => showDetailsModal(record)}>{text}</a>
      ),
    },

    {
      title: "Table type",
      dataIndex: "tableType",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text, record) => (
        <a onClick={() => showDetailsModal(record)}>{text}</a>
      ),
    },

    {
      title: "Seats",
      key: "seats",

      render: (_, record) => <span>{record.seats}</span>,
    },

    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Dropdown
            overlay={
              <Menu>
                <Menu.Item
                  key="1"
                  onClick={() => message.info(`View tables for ${record.name}`)}
                >
                  View Details
                </Menu.Item>
                <Menu.Item
                  key="2"
                  onClick={() =>
                    message.info(`View reservations for ${record.name}`)
                  }
                >
                  Edit
                </Menu.Item>
              </Menu>
            }
          >
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      ),
    },
  ];

  const filteredData = data.filter((item) => {
    const matchSearch =
      item.name.toLowerCase().includes(searchText.toLowerCase()) ||
      item.location.toLowerCase().includes(searchText.toLowerCase()) ||
      item.id.toLowerCase().includes(searchText.toLowerCase());

    const matchStatus =
      filterOptions.status === "all" || item.status === filterOptions.status;

    return matchSearch && matchStatus;
  });

  return (
    <div style={{ padding: "20px" }}>
      <div
        style={{
          marginBottom: "16px",
          display: "flex",
          justifyContent: "flex-end", // changed here
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate(`${APP_PREFIX_PATH}/dine/add`)}
          >
            Add Table
          </Button>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={filteredData}
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `Total ${total} items`,
        }}
        size="middle"
      />
    </div>
  );
};

export default Index;
