import React from 'react'
import { Card, Row, Col, Image, Carousel, Badge } from "antd";

const EventOverviewTab = ({ mediaImages, eventDetails, isNoImage }) => {

    return (
        <div style={{ padding: "24px" }}>
            <Row gutter={[24, 24]}>
                <Col xs={24} md={12}>
                    <Card
                        title="Event Information"
                        bordered={false}
                        style={{
                            height: "100%",
                            borderRadius: "12px",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
                        }}
                        headStyle={{
                            fontWeight: "600",
                            fontSize: "16px",
                            color: "#1890ff"
                        }}
                    >
                        <Row gutter={[16, 24]}>
                            {[
                                {
                                    label: "Venue",
                                    value:
                                        eventDetails.venue_events?.map((venueEvent, index) => (
                                            <span key={index}>
                                                {venueEvent.venue.name}
                                                {index < eventDetails.venue_events.length - 1 ? ", " : ""}
                                            </span>
                                        )) || "N/A",
                                    icon: "📍"
                                },
                                {
                                    label: "Available Tickets",
                                    value:
                                        eventDetails?.schedules && eventDetails.schedules.length > 0
                                            ? eventDetails.schedules[0].max_ticket_per_booking ?? "N/A"
                                            : "N/A",
                                    icon: "🎟️"
                                },
                                {
                                    label: "Category",
                                    value: eventDetails.category?.name ?? "N/A",
                                    icon: "📂"
                                },
                                {
                                    label: "Sub Category",
                                    value: eventDetails.sub_category?.name ?? "N/A",
                                    icon: "🔖"
                                },
                                {
                                    label: "Multiple Dates Available",
                                    value: (
                                        eventDetails?.schedules?.[0]?.is_multi_date === true ? (
                                            <Badge status="success" text="Yes" />
                                        ) : eventDetails?.schedules?.[0]?.is_multi_date === false ? (
                                            <Badge status="default" text="No" />
                                        ) : (
                                            <Badge status="warning" text="N/A" />
                                        )
                                    ),
                                    icon: "📅"
                                }


                            ].map((item, index) => (
                                <Col xs={24} sm={12} key={index}>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <div
                                            style={{
                                                backgroundColor: "#e6f7ff",
                                                borderRadius: "50%",
                                                width: "36px",
                                                height: "36px",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                marginRight: "12px",
                                                color: "#1890ff"
                                            }}
                                        >
                                            <span role="img" aria-label={item.label}>
                                                {item.icon}
                                            </span>
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600, marginBottom: "4px", color: "#666" }}>
                                                {item.label}
                                            </div>
                                            <div>{item.value}</div>
                                        </div>
                                    </div>
                                </Col>
                            ))}
                        </Row>
                    </Card>
                </Col>

                <Col xs={24} md={12}>
                    {!isNoImage ? (
                        <Card
                            title="Media Gallery"
                            bordered={false}
                            style={{
                                height: "100%",
                                borderRadius: "12px",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
                            }}
                            headStyle={{
                                fontWeight: "600",
                                fontSize: "16px",
                                color: "#1890ff"
                            }}
                        >
                            <div style={{ borderRadius: "8px", overflow: "hidden" }}>
                                <Image
                                    alt={`media image`}
                                    src={eventDetails.thumbnail_image}
                                    height={250}
                                    style={{ width: "100%", objectFit: "cover" }}
                                />
                            </div>
                        </Card>
                    ) : (
                        <Card
                            title="Event Image"
                            bordered={false}
                            style={{
                                height: "100%",
                                borderRadius: "12px",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
                            }}
                            headStyle={{
                                fontWeight: "600",
                                fontSize: "16px",
                                color: "#1890ff"
                            }}
                        >
                            {eventDetails.event_images?.length > 0 ? (
                                <Image
                                    alt="event image"
                                    src={eventDetails.event_images[0].image}
                                    style={{
                                        objectFit: "cover",
                                        width: "100%",
                                        borderRadius: "8px"
                                    }}
                                />
                            ) : (
                                <div
                                    style={{
                                        height: 250,
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        backgroundColor: "#f5f5f5",
                                        color: "#888",
                                        borderRadius: "8px"
                                    }}
                                >
                                    <div style={{ textAlign: "center" }}>
                                        <div style={{ fontSize: "18px", marginBottom: "8px" }}>No Image Available</div>
                                    </div>
                                </div>
                            )}
                        </Card>
                    )}
                </Col>
            </Row>
        </div>
    )
}

export default EventOverviewTab