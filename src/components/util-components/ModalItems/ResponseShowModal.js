import React, { useMemo } from "react";
import { Modal, Button, Typography, Table, Space, Row, Col } from "antd";
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
  console.log(jsonData, "JSONNNNNNNNNNNNNNNNNNNNN");
  console.log(warningMessage, "MESSAGEEEEEEEEEEE");
  const tableData = useMemo(() => {
    if (!jsonData) return [];

    let dataObject = jsonData?.data ?? jsonData;

    if (dataObject?.data) {
      dataObject = dataObject.data;
    }

    return Object.entries(dataObject).map(([key, value], index) => ({
      key: index,
      columnKey: key,
      value: Array.isArray(value) ? value.join(", ") : value ?? "N/A",
    }));
  }, [jsonData]);

  const scheduleData = useMemo(() => {
    if (!jsonData?.list_of_updated_Schedules) return [];
  
    const schedules = jsonData.list_of_updated_Schedules;
    
    // Check if the first schedule contains offer or coupon fields
    const isOffer = schedules.some(item => item.hasOwnProperty('revised_schedule_offer_start_date'));
    const isCoupon = schedules.some(item => item.hasOwnProperty('revised_schedule_coupon_start_date'));
  
    return schedules.map((item, index) => ({
      key: index,
      schedule_id: item.schedule_id,
      event_id: item.event_id,
      schedule_name: item.schedule_name,
      event_name: item.event_name,
      schedule_start: item.schedule_start,
      schedule_end: item.schedule_end,
      ...(isOffer
        ? {
            revised_schedule_offer_start_date: item.revised_schedule_offer_start_date,
            revised_schedule_offer_end_date: item.revised_schedule_offer_end_date,
          }
        : {}),
      ...(isCoupon
        ? {
            revised_schedule_coupon_start_date: item.revised_schedule_coupon_start_date,
            revised_schedule_coupon_end_date: item.revised_schedule_coupon_end_date,
          }
        : {}),
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
        <Text style={{ whiteSpace: "pre-wrap" }} ellipsis={{ tooltip: text }}>
          {text}
        </Text>
      ),
    },
  ];
  const scheduleColumns = useMemo(() => {
    if (!scheduleData.length) return [];
  
    const isOffer = scheduleData.some(item => item.revised_schedule_offer_start_date);
    const isCoupon = scheduleData.some(item => item.revised_schedule_coupon_start_date);
  
    const baseColumns = [
      { title: "Schedule ID", dataIndex: "schedule_id", key: "schedule_id" },
      { title: "Event ID", dataIndex: "event_id", key: "event_id" },
      { title: "Schedule Name", dataIndex: "schedule_name", key: "schedule_name" },
      { title: "Event Name", dataIndex: "event_name", key: "event_name" },
      { title: "Schedule Start", dataIndex: "schedule_start", key: "schedule_start" },
      { title: "Schedule End", dataIndex: "schedule_end", key: "schedule_end" },
    ];
  
    const dynamicColumns = isOffer
      ? [
          { title: "Revised Schedule Offer Start Date", dataIndex: "revised_schedule_offer_start_date", key: "revised_schedule_offer_start_date" },
          { title: "Revised Schedule Offer End Date", dataIndex: "revised_schedule_offer_end_date", key: "revised_schedule_offer_end_date" },
        ]
      : isCoupon
      ? [
          { title: "Revised Schedule Coupon Start Date", dataIndex: "revised_schedule_coupon_start_date", key: "revised_schedule_coupon_start_date" },
          { title: "Revised Schedule Coupon End Date", dataIndex: "revised_schedule_coupon_end_date", key: "revised_schedule_coupon_end_date" },
        ]
      : [];
  
    return [...baseColumns, ...dynamicColumns];
  }, [scheduleData]);

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
        {scheduleData.length > 0 && (
          <>
            <Title level={5} style={{ marginTop: 16 }}>
              Schedule Offers Removed
            </Title>
            <Table
              columns={scheduleColumns}
              dataSource={scheduleData}
              pagination={false}
              size="small"
              bordered
            />
          </>
        )}
        <Text
          strong
          style={{ color: "#fa541c", display: "block", marginTop: 16 }}
        >
          {warningMessage}
        </Text>
      </Space>
    </Modal>
  );
};

export default ResponseShowModal;
