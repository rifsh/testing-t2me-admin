import React, { useMemo } from "react";
import { Modal, Button, Typography, Table, Space } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const WarningModal = ({
  editable_status = true,
  mode = "responsemodal",
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

    const columnConfig = {
      name: {
        title: 'Schedule Name',
        dataIndex: 'name',
        key: 'name',
      },
      status: {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
      },
      is_scheduled: {
        title: 'Is Scheduled',
        dataIndex: 'is_scheduled',
        key: 'is_scheduled',
      },
      event: {
        title: 'Event Name',
        dataIndex: 'event',
        key: 'event',
        render: (event) => (
          <Text style={{ whiteSpace: "pre-wrap" }} ellipsis={{ tooltip: event?.event_name }}>
            {event?.event_name ?? "N/A"}
          </Text>
        ),
      },
      start_date: {
        title: 'Start Date',
        dataIndex: 'start_date',
        key: 'start_date',
      },
      end_date: {
        title: 'End Date',
        dataIndex: 'end_date',
        key: 'end_date',
      }
    };

    const columns = Object.keys(items[0])
      .filter(key => key !== 'id' && columnConfig[key]) // Exclude 'id' column
      .map(key => ({
        ...columnConfig[key],
        render: key === 'event' 
          ? columnConfig[key].render 
          : (text) => (
              <Text style={{ whiteSpace: "pre-wrap" }} ellipsis={{ tooltip: text?.toString() }}>
                {text?.toString() ?? "N/A"}
              </Text>
            ),
      }));

    const data = items.map((item, index) => ({
      key: index,
      ...item
    }));

    return { columns, data, noSchedulesImpacted: false };
  }, [responseData, tableConfig.dataKey]);

  const footerButtons = [
    <Button key="cancel" onClick={onCancel}>
      {cancelText}
    </Button>
  ];

  if (editable_status) {
    footerButtons.push(
      <Button
        key="submit"
        type="primary"
        danger
        loading={loading}
        onClick={onSubmit}
      >
        {confirmText}
      </Button>
    );
  }

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
      footer={footerButtons}
    >
      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        {mode === "responsemodal" && noSchedulesImpacted && (
          <Title level={4}>
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