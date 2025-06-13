import React from "react";
import {
    Card,
    Descriptions,
    Space,
    Empty,
    Tag,
    Table,
} from "antd";
import dayjs from "dayjs";

const OfferDetailsTable = ({ offer_schedule, offerColumns }) => {
    return (
        <div>
            <Card className="mt-4">
                {offer_schedule?.length > 0 ? (
                    <>
                        <Table
                            columns={offerColumns}
                            dataSource={offer_schedule}
                            rowKey="id"
                            pagination={false}
                            expandable={{
                                expandedRowRender: (record) => (
                                    <div className="p-4 bg-gray-50 rounded">
                                        <Descriptions bordered column={2}>
                                            <Descriptions.Item label="Max Uses">{record.offer.max_uses}</Descriptions.Item>
                                            <Descriptions.Item label="Used Count">{record.offer.used_count}</Descriptions.Item>
                                            {/* <Descriptions.Item label="Created At">
                                                {dayjs(record.offer.created_at).format("MMMM D, YYYY h:mm A")}
                                            </Descriptions.Item>
                                            <Descriptions.Item label="Updated At">
                                                {dayjs(record.offer.updated_at).format("MMMM D, YYYY h:mm A")}
                                            </Descriptions.Item>
                                            <Descriptions.Item label="Keywords" span={2}>
                                                <Space size={[0, 8]} wrap>
                                                    {record.offer.key_words?.map((word, i) => (
                                                        <Tag key={i}>{word}</Tag>
                                                    ))}
                                                </Space>
                                            </Descriptions.Item> */}
                                        </Descriptions>
                                    </div>
                                ),
                                rowExpandable: (record) => true,
                            }}
                        />
                        <div className="mt-4 text-sm text-gray-500">
                            Showing {offer_schedule.length} offer(s)
                        </div>
                    </>
                ) : (
                    <Empty description="No offers available for this event" />
                )}
            </Card>
        </div>
    )
}

export default OfferDetailsTable