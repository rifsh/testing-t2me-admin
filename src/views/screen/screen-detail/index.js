import React, { useState, useEffect } from 'react';
import {
    Card, Row, Col, Typography, Space, Divider, Descriptions,
    Tag, Empty, Image, Badge, Tabs, Statistic, Avatar,
    List
} from 'antd';
import {
    VideoCameraOutlined, EnvironmentOutlined, TeamOutlined,
    CalendarOutlined, CheckCircleOutlined, RocketOutlined,
    SoundOutlined, SettingOutlined, InfoCircleOutlined,
    CloseCircleOutlined,
    AppstoreOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { fetchScreenById } from 'store/slices/screenSlice';
import Flex from 'components/shared-components/Flex';
import LoadingOverlay from 'components/util-components/Loader';
import BackPageButoon from 'components/Buttons/BackPageButoon';
import { mockTimeSlots } from 'constants/TimeSlots';
import Meta from 'antd/es/card/Meta';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const ScreenDetailView = () => {
    const dispatch = useDispatch();
    const { screenId } = useParams();
    const { singleResponse, loading: screenLoading } = useSelector((state) => state.screen);

    useEffect(() => {
        dispatch(fetchScreenById({ screen_id: screenId }));
    }, [screenId, dispatch]);


    const getAccessibilityTags = (accessibilityList) => {
        if (!accessibilityList || accessibilityList.length === 0) {
            return <Tag color="default">None</Tag>;
        }

        return accessibilityList.map(item => (
            <Tag key={item.id} color="purple">{item.name}</Tag>
        ));
    };

    const getScreenTypeTag = (technology) => {
        if (!technology) return <Tag color="default">Standard</Tag>;

        const typeColors = {
            '4k': 'magenta',
            '8k': 'magenta',
            'standard': 'blue',
            'imax': 'purple',
            'vip': 'gold',
            '4dx': 'green',
            '3d': 'cyan'
        };

        return (
            <Tag color={typeColors[technology.name.toLowerCase()] || 'blue'}>
                {technology.name.toUpperCase()}
            </Tag>
        );
    };

    const getAudioTag = (audio) => {
        if (!audio) return <Tag color="default">Standard</Tag>;

        const audioColors = {
            'dolby': 'orange',
            'dolby atmos': 'volcano',
            'dts': 'gold',
            'thx': 'lime'
        };

        return (
            <Tag icon={<SoundOutlined />} color={audioColors[audio.name.toLowerCase()] || 'orange'}>
                {audio.name.toUpperCase()}
            </Tag>
        );
    };

    const getSeatingLabel = (isReserved) => {
        return isReserved ?
            <Tag icon={<CheckCircleOutlined />} color="green">Reserved Seating</Tag> :
            <Tag icon={<CloseCircleOutlined />} color="orange">Open Seating</Tag>;
    };

    if (screenLoading) {
        return (
            <LoadingOverlay loading={true} />

        );
    }

    return (
        <>
            {/* <BackPageButoon path='/screen/list' /> */}
            <Card
                className="screen-detail-card"
                style={{
                    borderRadius: '8px',
                }}
            >
                <Row
                    justify="space-between"
                    align="middle"
                    style={{
                        marginBottom: 24,
                        padding: '16px',
                        borderRadius: '6px',
                        color: 'gray'
                    }}
                >
                    <Col>
                        <Space align="center">
                            <Avatar
                                size={64}
                                icon={<VideoCameraOutlined />}
                                style={{
                                    backgroundColor: '#1890ff',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}
                            />
                            <div>
                                <Title
                                    level={3}
                                    style={{
                                        margin: 0,
                                        color: 'GrayText'
                                    }}
                                >
                                    {singleResponse?.screen_name || 'Screen Details'}
                                </Title>
                                <Text style={{ color: 'rgba(0, 0, 0, 0.85)' }}>
                                    {singleResponse?.screen_number}
                                </Text>
                            </div>
                        </Space>
                    </Col>
                    <Col>
                        <Badge
                            status={singleResponse?.status ? "success" : "error"}
                            text={<Text style={{ color: 'black' }}>{singleResponse?.status ? "Active" : "Inactive"}</Text>}
                        />
                    </Col>
                </Row>

                <Tabs defaultActiveKey="details" type="card" className="custom-tabs">
                    <TabPane
                        tab={<span><InfoCircleOutlined /> Screen Details</span>}
                        key="details"
                    >
                        <Row gutter={[24, 24]}>
                            <Col xs={24} lg={16}>
                                <Card
                                    title={
                                        <Space>
                                            <EnvironmentOutlined />
                                            Location Information
                                        </Space>
                                    }
                                    bordered
                                    className="inner-card"
                                    style={{ height: '100%' }}
                                >
                                    <Descriptions
                                        bordered
                                        column={{ xxl: 2, xl: 2, lg: 2, md: 2, sm: 1, xs: 1 }}
                                        size="middle"
                                        labelStyle={{ fontWeight: 'bold' }}
                                    >
                                        <Descriptions.Item label="Venue" span={2}>
                                            <Space>
                                                <EnvironmentOutlined />
                                                <Text strong>{singleResponse?.venue?.name || 'N/A'}</Text>
                                            </Space>
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Location">
                                            {singleResponse?.venue?.place?.name || 'N/A'}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Country">
                                            {singleResponse?.venue?.place?.country?.name || 'N/A'}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Screen Technology">
                                            {getScreenTypeTag(singleResponse?.screen_technology)}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Audio System">
                                            {getAudioTag(singleResponse?.audio)}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Capacity">
                                            <Tag icon={<TeamOutlined />} color="blue">
                                                {singleResponse?.capacity} seats
                                            </Tag>
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Seating Type">
                                            {getSeatingLabel(singleResponse?.reserved_seating)}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Accessibility Features" span={2}>
                                            {getAccessibilityTags(singleResponse?.accessibilty)}
                                        </Descriptions.Item>
                                    </Descriptions>
                                </Card>
                            </Col>

                            <Col xs={24} lg={8}>
                                <Card
                                    title={
                                        <Space>
                                            <RocketOutlined />
                                            Technology Overview
                                        </Space>
                                    }
                                    bordered
                                    className="inner-card tech-card"
                                    style={{
                                        height: '100%',
                                        background: 'linear-gradient(to bottom, #f6f8fa, #ffffff)'
                                    }}
                                >
                                    <Space direction="vertical" style={{ width: '100%' }} size="large">
                                        <Row>
                                            <Col span={24}>
                                                <Statistic
                                                    title="Capacity"
                                                    value={singleResponse?.capacity || 0}
                                                    suffix="seats"
                                                    valueStyle={{ color: '#1890ff' }}
                                                />
                                            </Col>
                                        </Row>

                                        <Divider style={{ margin: '12px 0' }} />

                                        <Row gutter={[16, 16]}>
                                            <Col span={12}>
                                                <div className="tech-item">
                                                    <Text strong>Screen Type:</Text>
                                                    <div>{singleResponse?.screen_type || 'Not added'}</div>
                                                </div>
                                            </Col>
                                            <Col span={12}>
                                                <div className="tech-item">
                                                    <Text strong>Audio:</Text>
                                                    <div>{getAudioTag(singleResponse?.audio)}</div>
                                                </div>
                                            </Col>
                                        </Row>

                                        {singleResponse?.screen_technology?.description && (
                                            <div className="tech-description">
                                                <Title level={5}>Technology Details</Title>
                                                <Paragraph style={{ textAlign: 'justify' }}>
                                                    {singleResponse?.screen_technology.description}
                                                </Paragraph>
                                            </div>
                                        )}

                                        {singleResponse?.audio?.description && (
                                            <div className="tech-description">
                                                <Title level={5}>Audio System</Title>
                                                <Paragraph style={{ textAlign: 'justify' }}>
                                                    {singleResponse?.audio.description}
                                                </Paragraph>
                                            </div>
                                        )}
                                    </Space>
                                </Card>
                            </Col>
                        </Row>

                        <Divider />

                        <Card
                            title={<span><AppstoreOutlined /> Accessibility Features</span>}
                            className="accessibility-card"
                            style={{ marginTop: 24 }}
                        >
                            {singleResponse?.accessibilty && singleResponse.accessibilty.length > 0 ? (
                                <List
                                    grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 3, xxl: 3 }}
                                    dataSource={singleResponse.accessibilty}
                                    renderItem={item => (
                                        <List.Item>
                                            <Card className="feature-card">
                                                <Meta
                                                    title={item.name}
                                                    description={item.description || 'No description available'}
                                                />
                                            </Card>
                                        </List.Item>
                                    )}
                                />
                            ) : (
                                <Empty description="No accessibility features available" />
                            )}
                        </Card>

                        <Divider />

                        <Card
                            title={
                                <Space>
                                    <InfoCircleOutlined />
                                    Description
                                </Space>
                            }
                            bordered
                            style={{ marginBottom: 24 }}
                        >
                            <div
                                className="screen-description"
                                dangerouslySetInnerHTML={{ __html: singleResponse?.description || 'No description available' }}
                            />
                        </Card>
                    </TabPane>

                    <TabPane
                        tab={<span><SettingOutlined /> Seating & Scheduling</span>}
                        key="seating"
                    >
                        <Row gutter={[24, 24]}>
                            <Col xs={24} lg={16}>
                                <Card
                                    title={
                                        <Space>
                                            <TeamOutlined />
                                            Seating Layout
                                        </Space>
                                    }
                                    bordered
                                >
                                    {singleResponse?.seat_structure_id ? (
                                        <div className="seating-layout-container" style={{ textAlign: 'center' }}>
                                            <Image
                                                width="100%"
                                                height={400}
                                                style={{ maxWidth: 700, borderRadius: 8 }}
                                                src="/api/placeholder/600/400"
                                                alt="Seating Layout"
                                                fallback="/api/placeholder/600/400"
                                            />
                                        </div>
                                    ) : (
                                        <Empty
                                            description="No seating layout available"
                                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                                        />
                                    )}
                                </Card>
                            </Col>

                            <Col xs={24} lg={8}>
                                <Card
                                    title={
                                        <Space>
                                            <CalendarOutlined />
                                            Time Slots
                                        </Space>
                                    }
                                    bordered
                                    className="timeslots-card"
                                    style={{ height: '100%' }}
                                >
                                    {singleResponse?.time_slots && singleResponse.time_slots.length > 0 ? (
                                        <div className="time-slots-container">
                                            {singleResponse.time_slots.map((slotType, typeIndex) => (
                                                <React.Fragment key={typeIndex}>
                                                    <Title level={5} style={{ marginTop: typeIndex > 0 ? 16 : 0 }}>
                                                        <Badge status="processing" text={slotType} />
                                                    </Title>
                                                    <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
                                                        {mockTimeSlots[slotType]?.map((timeRange, timeIndex) => (
                                                            <Col key={`${typeIndex}-${timeIndex}`} xs={24} sm={12}>
                                                                <Card
                                                                    size="small"
                                                                    style={{
                                                                        textAlign: 'center',
                                                                        borderLeft: '3px solid #1890ff',
                                                                        borderRadius: '4px'
                                                                    }}
                                                                    hoverable
                                                                >
                                                                    <Text>{timeRange}</Text>
                                                                </Card>
                                                            </Col>
                                                        ))}
                                                    </Row>
                                                </React.Fragment>
                                            ))}
                                        </div>
                                    ) : (
                                        <Empty description="No time slots available" />
                                    )}
                                </Card>
                            </Col>
                        </Row>
                    </TabPane>
                </Tabs>
            </Card>
        </>
    );
};

export default ScreenDetailView;