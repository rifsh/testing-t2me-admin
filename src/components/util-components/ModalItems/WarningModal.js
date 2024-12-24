import React from "react";
import { Modal, Button, Typography, Space } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const WarningModal = ({
  visible,
  title = "Warning",
  details = "",
  editable_status=true,
  warningMessage = "Are you sure you want to proceed?",
  onSubmit,
  onCancel,
  confirmText = "Submit",
  cancelText = "Cancel",
  loading = false,
}) => {
  return (
    <Modal
      open={visible}
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
          disabled={!editable_status}
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
        <Text strong style={{ color: "#fa541c" }}>
          {warningMessage}
        </Text>
      </Space>
    </Modal>
  );
};

export default WarningModal;
