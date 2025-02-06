import React, { useMemo } from "react";
import { Modal, Button, Typography, Table, Space, Divider } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const ValidationModal = ({
  visible,
  data,
  onClose,
  statusMessage = "No message available",
}) => {
  console.log(data, "DATA IN MODAL");

  const formattedErrors = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];

    return data.map((error, index) => ({
      key: index,
      message: error.message,
      tableData: Object.entries(error.item || {}).map(([key, value], idx) => ({
        key: `${index}-${idx}`, // Unique key for each row
        columnKey: key,
        value: value !== null && value !== undefined ? String(value) : "N/A",
      })),
    }));
  }, [data]);

  const columns = [
    {
      title: "Key",
      dataIndex: "columnKey",
      key: "columnKey",
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Value",
      dataIndex: "value",
      key: "value",
      render: (text) => <Text>{text}</Text>,
    },
  ];

  return (
    <Modal
      open={visible}
      width={600}
      title="Validation Information"
      onCancel={onClose}
      footer={[
        <Button key="back" onClick={onClose}>
          Back
        </Button>,
      ]}
    >
      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        <Text strong type="danger">
          {statusMessage}
        </Text>

        {formattedErrors.length > 0 ? (
          formattedErrors.map(({ key, message, tableData }) => (
            <div key={key}>
              <Space>
                <ExclamationCircleOutlined style={{ color: "orange" }} />
                <Text strong type="warning">
                  {message}
                </Text>
              </Space>
              <Table
                columns={columns}
                dataSource={tableData}
                pagination={false}
                size="small"
                bordered
                style={{ marginTop: 8 }}
              />
              <Divider />
            </div>
          ))
        ) : (
          <Text>No validation errors found.</Text>
        )}
      </Space>
    </Modal>
  );
};

export default ValidationModal;
