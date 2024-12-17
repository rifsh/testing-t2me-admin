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
  jsonData = null, // JSON data to display
}) => {
  // Generate table data dynamically from jsonData
  const tableData = useMemo(() => {
    if (!jsonData) return [];
    return Object.entries(jsonData).map(([key, value], index) => ({
      key: index,
      columnKey: key,
      value: Array.isArray(value) ? value.join(", ") : value ?? "N/A",
    }));
  }, [jsonData]);

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
      render: (text) => (
        <Text ellipsis={{ tooltip: text }}>
          {text}
        </Text>
      ),
    },
  ];

  return (
    <Modal
      open={visible}
      width={600}
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
