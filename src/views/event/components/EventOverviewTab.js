import React from 'react'
import { Card, Row, Col, Image, Carousel } from "antd";

const EventOverviewTab = ({ mediaImages, eventDetails }) => {
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
                                    label: "Available Seats",
                                    value: eventDetails.max_tickets,
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
                    {mediaImages?.length > 0 ? (
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
                            <Carousel autoplay dots={{ className: "custom-carousel-dots" }}>
                                {mediaImages.map((url, index) => (
                                    <div key={index} style={{ borderRadius: "8px", overflow: "hidden" }}>
                                        <Image
                                            alt={`media image ${index + 1}`}
                                            src={url}
                                            height={250}
                                            style={{ width: "100%", objectFit: "cover" }}
                                        />
                                    </div>
                                ))}
                            </Carousel>
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