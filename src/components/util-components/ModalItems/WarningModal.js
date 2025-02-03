import React, { useMemo } from "react";
import { Modal, Button, Typography, Table, Space } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const WarningModal = ({
  visible,
  title = "Warning",
  details = "",
  warningMessage = "Are you sure you want to proceed?",
  onSubmit,
  onCancel,
  confirmText = "Submit",
  cancelText = "Cancel",
  loading = false,
  responseData = null,
  tableConfig = {
    title: "Submission Details",
    dataKey: "",
  }
}) => {
  const { columns, data, noSchedulesImpacted } = useMemo(() => {
    if (!responseData || !tableConfig.dataKey || !responseData[tableConfig.dataKey]) {
      return { columns: [], data: [], noSchedulesImpacted: true };
    }

    const items = responseData[tableConfig.dataKey];

    if (!Array.isArray(items) || items.length === 0) {
      return { columns: [], data: [], noSchedulesImpacted: true };
    }

    const columns = Object.keys(items[0]).map(key => {
      // Special handling for the event column
      if (key === 'event') {
        return {
          title: 'Event Name',
          dataIndex: 'event',
          key: 'event',
          render: (event) => (
            <Text style={{ whiteSpace: "pre-wrap" }} ellipsis={{ tooltip: event?.event_name }}>
              {event?.event_name ?? "N/A"}
            </Text>
          ),
        };
      }

      return {
        title: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
        dataIndex: key,
        key: key,
        render: (text) => (
          <Text style={{ whiteSpace: "pre-wrap" }} ellipsis={{ tooltip: text }}>
            {text?.toString() ?? "N/A"}
          </Text>
        ),
      };
    });

    const data = items.map((item, index) => ({
      key: index,
      ...item
    }));

    return { columns, data, noSchedulesImpacted: false };
  }, [responseData, tableConfig.dataKey]);

  return (
    <Modal
      open={visible}
      width={800} // Increased width to accommodate horizontal data
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
        {noSchedulesImpacted && (
          <Title level={4} >
            No Schedules impacted, Please confirm before you proceed.
          </Title>
        )}
        {details && (
          <Text type="secondary" style={{ whiteSpace: "pre-wrap" }}>
            {details}
          </Text>
        )}
        {responseData && columns.length > 0 && (
          <div>
            <Title level={5} style={{ marginBottom: 16 }}>
              {tableConfig.title}
            </Title>
            <Table
              columns={columns}
              dataSource={data}
              pagination={false}
              size="small"
              bordered
              scroll={{ x: 'max-content' }}
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

export default WarningModal;