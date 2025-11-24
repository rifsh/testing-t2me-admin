import React from 'react'
import { Card, Row, Col, Image, Carousel, Badge, Typography, Collapse, Tag } from "antd";
import { UserAddOutlined, CalendarOutlined, EnvironmentOutlined, TagOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { CDN_PATH } from 'configs/AppConfig';
import CDNImage from 'components/layout-components/Image/CDNImage';
const { Title, Text } = Typography;
const { Panel } = Collapse;

const EventOverviewTab = ({ mediaImages, eventDetails, isNoImage }) => {

    const renderVenueDetails = () => {
        return eventDetails.venue_events?.map((venueEvent, index) => (
            <Card key={index} className="mb-4">
                <Title level={4} className="flex items-center">
                    <EnvironmentOutlined className="mr-2" /> {venueEvent.venue.name}
                </Title>
                <div
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: venueEvent.venue.description }}
                />

                {venueEvent.event_seatstructures && (
                    <div className="mt-4">
                        <Title level={5}>Seat Structure</Title>
                        <Row gutter={16}>
                            <Col span={8}>
                                <Text strong>Name:</Text> {venueEvent.event_seatstructures.name}
                            </Col>
                            <Col span={8}>
                                <Text strong>Total Rows:</Text> {venueEvent.event_seatstructures.total_row}
                            </Col>
                            <Col span={8}>
                                <Text strong>Total Columns:</Text> {venueEvent.event_seatstructures.total_column}
                            </Col>
                            <Col span={8}>
                                <Text strong>Total Seats:</Text> {venueEvent.event_seatstructures.total_seats}
                            </Col>
                        </Row>
                    </div>
                )}
            </Card>
        ));
    };

    const renderTicketStructures = () => {
        return eventDetails.venue_ticket_structures?.map((structure, index) => (
            <Card key={index} className="mb-4" >
                <Title level={4} className="flex items-center" >
                    <TagOutlined className="mr-2" /> {structure.venue.name} - Ticket Structures
                </Title>

                {
                    structure.ticket_structures.map((ticket, idx) => (
                        <div key={idx} className="mb-4" >
                            <Text strong > {ticket.ticket_structure_name} </Text>
                            < div className="mt-2" >
                                {
                                    ticket.ticket_sets.map((set, i) => (
                                        <Tag key={i} color="blue" className="m-1" >
                                            {set}
                                        </Tag>
                                    ))
                                }
                            </div>
                        </div>
                    ))
                }
            </Card>
        ));
    };

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
                                    label: "Category",
                                    value: eventDetails.category?.name ?? "N/A",
                                    icon: "📂"
                                },
                                {
                                    label: "Sub Category",
                                    value: eventDetails.sub_category?.name ?? "N/A",
                                    icon: "🔖"
                                },
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
                                {/* <Image
                                    alt={`media image`}
                                    src={`${CDN_PATH}/${eventDetails.thumbnail_image}`}
                                    height={250}
                                    style={{ width: "100%", objectFit: "cover" }}
                                /> */}
                                <CDNImage
                                    src={eventDetails.thumbnail_image}
                                    alt={eventDetails?.name || `media image`}
                                    height={200}
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
                                    src={`${CDN_PATH}/${eventDetails.event_images[0].image}`}
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
                <Collapse defaultActiveKey={['1', '2', '3']} ghost>
                    <Panel header="Venue Details" key="1" >
                        {renderVenueDetails()}
                    </Panel>
                    < Panel header="Ticket Structures" key="2" >
                        {renderTicketStructures()}
                    </Panel>
                </Collapse>
            </Row>
        </div>
    )
}

export default EventOverviewTab