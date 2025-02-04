import React, { useMemo } from "react";
import { Modal, Button, Typography, Table, Space } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const ResponseShowModal = ({
  visible,
  title = "Confirmation Details",
  details = "",
  warningMessage = "Please review the details before proceeding",
  onSubmit,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
  loading = false,
  jsonData = null,
}) => {
  const formatValue = (value) => {
    if (value === null || value === undefined) return "N/A";
    if (Array.isArray(value)) {
      if (value.length === 0) return "[]";
      if (typeof value[0] === 'object') {
        // For arrays of objects, show a summary
        return `${value.length} items: ${JSON.stringify(value)}`;
      }
      return value.join(", ");
    }
    if (typeof value === 'object' && value !== null) {
      // For objects, convert to string representation
      return JSON.stringify(value);
    }
    return String(value);
  };

  const tableData = useMemo(() => {
    if (!jsonData) return [];
    return Object.entries(jsonData).map(([key, value], index) => ({
      key: index,
      columnKey: key,
      value: formatValue(value),
    }));
  }, [jsonData]);

  const columns = [
    {
      title: "Key",
      dataIndex: "columnKey",
      key: "columnKey",
      width: 150,
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Value",
      dataIndex: "value",
      key: "value",
      render: (text) => (
        <Text style={{ whiteSpace: 'pre-wrap' }}>
          {text}
        </Text>
      ),
    },
  ];

  return (
    <Modal
      open={visible}
      width={800}
      title={
        <Space align="center">
          <ExclamationCircleOutlined style={{ color: "#faad14" }} />
          <span>{title}</span>
        </Space>
      }
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          {cancelText}
        </Button>,
        <Button
          key="submit"
          type="primary"
          danger
          loading={loading}
          onClick={onSubmit}
        >
          {confirmText}
        </Button>,
      ]}
    >
      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        {details && (
          <Text type="secondary" style={{ whiteSpace: "pre-wrap" }}>
            {details}
          </Text>
        )}
        {jsonData && (
          <div>
            <Title level={5} style={{ marginBottom: 16 }}>
              Submission Details
            </Title>
            <Table 
              columns={columns}
              dataSource={tableData}
              pagination={false}
              size="small"
              bordered
            />
          </div>
        )}
        <Text strong style={{ color: "#fa541c", display: "block", marginTop: 16 }}>
          {warningMessage}
        </Text>
      </Space>
    </Modal>
  );
};

export default ResponseShowModal;