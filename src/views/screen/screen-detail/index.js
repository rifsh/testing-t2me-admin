import React, { useState, useEffect } from 'react';
import {
    Card,
    Col,
    Row,
    Typography,
    Tabs,
    Descriptions,
    Tag,
    Space,
    Button,
    Divider,
    Image,
    Empty
} from 'antd';
import {
    EditOutlined,
    DeleteOutlined,
    ArrowLeftOutlined,
    EnvironmentOutlined,
    ProjectOutlined,
    TeamOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const ScreenDetailsView = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { venueId } = useParams();
    const [loading, setLoading] = useState(true);
    const [venueDetails, setVenueDetails] = useState(null);
    const [screens, setScreens] = useState([]);
    const [activeTab, setActiveTab] = useState("0");

    // Simulating fetching venue and screen data
    useEffect(() => {
        // Replace with actual API call
        const fetchData = async () => {
            try {
                // Simulate API delay
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Sample data - replace with actual API response
                const mockVenueData = {
                    id: venueId,
                    name: "Cinema Palace",
                    place: "New York",
                    country: "United States",
                    address: "123 Movie Street, NY 10001"
                };

                const mockScreensData = [
                    {
                        id: "scr001",
                        name: "Screen 1",
                        capacity: 150,
                        screen_type: "2D",
                        facilities: ["Recliner Seats", "Dolby Sound"],
                        seating_layout: "/images/seating/screen1.jpg",
                        is_active: true,
                        description: "Our main screen with premium viewing experience"
                    },
                    {
                        id: "scr002",
                        name: "Screen 2",
                        capacity: 120,
                        screen_type: "3D",
                        facilities: ["Regular Seats", "Dolby Atmos"],
                        seating_layout: "/images/seating/screen2.jpg",
                        is_active: true,
                        description: "3D-enabled screen with stunning audio"
                    }
                ];

                setVenueDetails(mockVenueData);
                setScreens(mockScreensData);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching data:", error);
                setLoading(false);
            }
        };

        fetchData();
    }, [venueId]);

    const handleEditScreen = (screenId) => {
        navigate(`/venues/${venueId}/screens/${screenId}/edit`);
    };

    const handleDeleteScreen = (screenId) => {
        // Implement confirmation modal and delete logic
        console.log("Delete screen:", screenId);
    };

    const handleBackToList = () => {
        navigate('/venues');
    };

    const handleAddNewScreen = () => {
        navigate(`/venues/${venueId}/screens/add`);
    };

    const renderScreenContent = (screen, index) => {
        return (
            <div className="screen-details-container">
                <Row gutter={[16, 16]}>
                    <Col span={24}>
                        <Card>
                            <Row justify="space-between" align="middle">
                                <Col>
                                    <Title level={4}>{screen.name}</Title>
                                </Col>
                                <Col>
                                    <Space>
                                        <Button
                                            icon={<EditOutlined />}
                                            onClick={() => handleEditScreen(screen.id)}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            danger
                                            icon={<DeleteOutlined />}
                                            onClick={() => handleDeleteScreen(screen.id)}
                                        >
                                            Delete
                                        </Button>
                                    </Space>
                                </Col>
                            </Row>

                            <Divider />

                            <Descriptions bordered column={{ xxl: 3, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }}>
                                <Descriptions.Item label="Screen Type">
                                    <Tag color="blue">{screen.screen_type}</Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label="Capacity">
                                    <Tag icon={<TeamOutlined />}>{screen.capacity} seats</Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label="Status">
                                    {screen.is_active ?
                                        <Tag color="green">Active</Tag> :
                                        <Tag color="red">Inactive</Tag>
                                    }
                                </Descriptions.Item>
                                <Descriptions.Item label="Facilities" span={3}>
                                    {screen.facilities.map(facility => (
                                        <Tag key={facility} color="cyan" style={{ margin: '0 8px 8px 0' }}>
                                            {facility}
                                        </Tag>
                                    ))}
                                </Descriptions.Item>
                                <Descriptions.Item label="Description" span={3}>
                                    {screen.description}
                                </Descriptions.Item>
                            </Descriptions>

                            <Divider orientation="left">Seating Layout</Divider>

                            <div className="seating-layout-container">
                                {/* Placeholder for seating layout */}
                                <div className="layout-placeholder" style={{ textAlign: 'center' }}>
                                    <Image
                                        width={400}
                                        height={300}
                                        src="/api/placeholder/400/300"
                                        alt="Seating Layout"
                                        fallback="/api/placeholder/400/300"
                                    />
                                </div>
                            </div>
                        </Card>
                    </Col>
                </Row>
            </div>
        );
    };

    if (loading) {
        return (
            <Card loading={true}>
                <div style={{ height: 400 }}></div>
            </Card>
        );
    }

    if (!venueDetails) {
        return (
            <Card>
                <Empty
                    description="Venue not found"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
                <div style={{ textAlign: 'center', marginTop: 16 }}>
                    <Button type="primary" onClick={handleBackToList}>
                        Back to Venues
                    </Button>
                </div>
            </Card>
        );
    }

    return (
        <>
            <Row style={{ marginBottom: 16 }}>
                <Col>
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={handleBackToList}
                    >
                        Back to Venues
                    </Button>
                </Col>
            </Row>

            <Card
                title={
                    <Space>
                        <EnvironmentOutlined />
                        <span>{venueDetails.name}</span>
                    </Space>
                }
                extra={
                    <Button
                        type="primary"
                        icon={<ProjectOutlined />}
                        onClick={handleAddNewScreen}
                    >
                        Add New Screen
                    </Button>
                }
            >
                <Descriptions column={{ xxl: 3, xl: 3, lg: 2, md: 2, sm: 1, xs: 1 }} style={{ marginBottom: 16 }}>
                    <Descriptions.Item label="Place">{venueDetails.place}</Descriptions.Item>
                    <Descriptions.Item label="Country">{venueDetails.country}</Descriptions.Item>
                    <Descriptions.Item label="Address">{venueDetails.address}</Descriptions.Item>
                </Descriptions>
            </Card>

            <div style={{ marginTop: 16 }}>
                <Card
                    title="Screen Details"
                    className="screen-details-card"
                >
                    {screens.length > 0 ? (
                        <Tabs
                            activeKey={activeTab}
                            onChange={setActiveTab}
                            type="card"
                            items={screens.map((screen, index) => ({
                                label: screen.name,
                                key: String(index),
                                children: renderScreenContent(screen, index)
                            }))}
                        />
                    ) : (
                        <Empty description="No screens found for this venue">
                            <Button
                                type="primary"
                                onClick={handleAddNewScreen}
                            >
                                Add Screen
                            </Button>
                        </Empty>
                    )}
                </Card>
            </div>
        </>
    );
};

export default ScreenDetailsView;