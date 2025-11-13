import React from "react";
import {
  Card,
  Descriptions,
  Space,
  Empty,
  Tag,
  Table,
  Typography,
  Image,
} from "antd";
import Utils from "utils";
import dayjs from "dayjs";
const { Text, Title } = Typography;

const CouponDetailsTable = ({ coupon_schedule }) => {
  const couponColumns = [
    {
      title: "Coupon",
      dataIndex: ["coupons", "name"],
      key: "name",
      render: (text, record) => (
        <div className="flex items-center">
          {record.coupons?.thumbnail_image !== "images" &&
          record.coupons?.thumbnail_image ? (
            <Image
              src={record.coupons.thumbnail_image}
              width={40}
              height={40}
              className="rounded mr-2"
              preview={false}
            />
          ) : (
            <div
              style={{
                height: 100,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "#1890ff",
                fontSize: "24px",
              }}
            >
              🎟️
            </div>
          )}
          <Text strong>{text}</Text>
        </div>
      ),
    },
    {
      title: "Discount",
      dataIndex: ["coupons", "discount_percentage_amount"],
      key: "discount",
      render: (text, record) => (
        <Tag color="green">
          {text}
          {record.coupons?.is_percentage ? "%" : ""}
        </Tag>
      ),
    },
    {
      title: "Min Purchase",
      dataIndex: ["coupons", "min_purchase_amount"],
      key: "min_purchase",
      render: (amount) => <Text>₹{amount}</Text>,
    },
    {
      title: "Coupon Validity",
      dataIndex: ["coupons", "start_date"],
      key: "coupon_validity",
      render: (_, record) => (
        <Text>
          {record.coupons?.start_date
            ? Utils.formatDate(record.coupons.start_date)
            : "No start date"}{" "}
          -{" "}
          {record.coupons?.end_date
            ? Utils.formatDate(record.coupons.end_date)
            : "No end date"}
        </Text>
      ),
    },
    {
      title: "Event Validity",
      dataIndex: "valid_from",
      key: "event_validity",
      render: (_, record) => (
        <Text>
          {Utils.formatDate(record.valid_from)} -{" "}
          {Utils.formatDate(record.valid_to)}
        </Text>
      ),
    },
    {
      title: "Status",
      dataIndex: ["coupons", "status"],
      key: "status",
      render: (isActive) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? "Active" : "Inactive"}
        </Tag>
      ),
    },
  ];

  return (
    <div>
      <Card className="mt-4">
        {coupon_schedule?.length > 0 ? (
          <>
            <Table
              columns={couponColumns}
              dataSource={coupon_schedule}
              rowKey="id"
              pagination={false}
              expandable={{
                expandedRowRender: (record) => (
                  <div className="p-4 bg-gray-50 rounded">
                    <Descriptions bordered column={2}>
                      <Descriptions.Item label="Max Uses">
                        {record.coupons?.max_uses}
                      </Descriptions.Item>
                      <Descriptions.Item label="Used Count">
                        {record.coupons?.used_count}
                      </Descriptions.Item>
                      <Descriptions.Item label="Type">
                        {record.coupons?.is_single ? "Single Use" : "Multi Use"}{" "}
                        •{" "}
                        {record.coupons?.is_reusable ? "Reusable" : "One-time"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Date Required">
                        {record.coupons?.date_required ? "Yes" : "No"}
                      </Descriptions.Item>
                    </Descriptions>
                  </div>
                ),
                rowExpandable: (record) => true,
              }}
            />
            <div className="mt-4 text-sm text-gray-500">
              Showing {coupon_schedule.length} coupon(s)
            </div>
          </>
        ) : (
          <Empty description="No coupons available for this event" />
        )}
      </Card>
    </div>
  );
};

export default CouponDetailsTable;
