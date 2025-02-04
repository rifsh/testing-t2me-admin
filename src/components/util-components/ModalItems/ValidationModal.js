import React, { useMemo } from "react";
import { Modal, Button, Typography, Table, Space } from "antd";

const { Title, Text } = Typography;

const ValidationModal = ({
  visible,
  data,
  onClose,
  statusMessage = "No message available",
}) => {
  const tableData = useMemo(() => {
    if (!data) return [];

    return Object.entries(data).map(([key, value], index) => ({
      key: index,
      columnKey: key,
      value: value !== null && value !== undefined ? String(value) : "N/A",
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
        <Table
          columns={columns}
          dataSource={tableData}
          pagination={false}
          size="small"
          bordered
        />
      </Space>
    </Modal>
  );
};

export default ValidationModal;
