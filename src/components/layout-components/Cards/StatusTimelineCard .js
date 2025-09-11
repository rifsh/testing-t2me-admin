import React from "react";
import { Card, Timeline } from "antd"; // Ant Design

const StatusTimelineCard = ({
    title = "Timeline",
    className = "mt-6",
    bordered = false,
    createdAt,
    updatedAt,
    status,
    statusLabels = {
        "change request": "Change Requested",
        approved: "Approved",
        rejected: "Rejected",
        pending: "Pending Approval",
    },
    statusColors = {
        "change request": "#FF8300",
        pending: "gray",
        approved: "green",
        rejected: "red",
    },
}) => {
    const timelineItems = [];

    if (createdAt) {
        timelineItems.push({
            color: "blue",
            label: `Created on ${new Date(createdAt).toLocaleString()}`,
        });
    }

    if (updatedAt) {
        timelineItems.push({
            color: "orange",
            label: `Last updated on ${new Date(updatedAt).toLocaleString()}`,
        });
    }

    if (status) {
        timelineItems.push({
            color: statusColors[status] || "gray",
            label: statusLabels[status] || status,
        });
    }

    if (timelineItems.length === 0) {
        return null; // nothing to show
    }

    return (
        <Card title={title} className={className} bordered={bordered}>
            <Timeline>
                {timelineItems.map((item, index) => (
                    <Timeline.Item key={index} color={item.color}>
                        {item.label}
                    </Timeline.Item>
                ))}
            </Timeline>
        </Card>
    );
};

export default StatusTimelineCard;
