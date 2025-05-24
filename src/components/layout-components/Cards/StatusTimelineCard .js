import React from 'react';
import { Card, Timeline } from 'antd'; // Assuming you're using Ant Design

const StatusTimelineCard = ({
    title = "Timeline",
    className = "mt-6",
    bordered = false,
    createdAt,
    updatedAt,
    status,
    statusLabels = {
        "change request": "Change Requested",
        "approved": "Approved",
        "rejected": "Rejected",
        "pending": "Pending Approval"
    },
    statusColors = {
        "change request": "#FF8300",
        "pending": "gray",
        "approved": "green",
        "rejected": "red"
    }
}) => {
    return (
        <Card title={title} className={className} bordered={bordered}>
            <Timeline>
                <Timeline.Item color="blue">
                    Created on {new Date(createdAt).toLocaleString()}
                </Timeline.Item>
                <Timeline.Item color="orange">
                    Last updated on {new Date(updatedAt).toLocaleString()}
                </Timeline.Item>
                <Timeline.Item color={statusColors[status] || "gray"}>
                    {statusLabels[status] || status}
                </Timeline.Item>
            </Timeline>
        </Card>
    );
};

export default StatusTimelineCard;