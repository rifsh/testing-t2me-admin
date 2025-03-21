import React, { useState, useEffect } from 'react';
import {
    Card,
    Col,
    Row,
    Typography,
    Descriptions,
    Tag,
    Space,
    Divider,
    Image,
    Empty,
} from 'antd';
import {
    EnvironmentOutlined,
    TeamOutlined,
    SoundOutlined,
    VideoCameraOutlined,
    CalendarOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { fetchScreenById } from 'store/slices/screenSlice';
import Flex from 'components/shared-components/Flex';
import LoadingOverlay from 'components/util-components/Loader';
import BackPageButoon from 'components/Buttons/BackPageButoon';
import { mockTimeSlots } from 'constants/TimeSlots';

const { Title, Text, Paragraph } = Typography;

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
            <BackPageButoon
                path='/screen/list'
            />

            <Card>
                <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
                    <Col>
                        <Title level={3}>
                            <Space>
                                <VideoCameraOutlined />
                                {singleResponse?.screen_name}
                                <Text type="secondary" style={{ fontSize: '16px' }}>({singleResponse?.screen_number})</Text>
                            </Space>
                        </Title>
                    </Col>
                </Row>

                <Divider orientation="left" >Screen Information</Divider>

                <Row gutter={[24, 24]}>
                    <Col xs={24} lg={16}>
                        <Descriptions
                            bordered
                            column={{ xxl: 2, xl: 2, lg: 2, md: 2, sm: 1, xs: 1 }}
                            size="middle"
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
                            <Descriptions.Item label="Technology">
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
                            <Descriptions.Item label="Description" span={2}>
                                {/* {singleResponse?.description || 'No description available'} */}
                                <div dangerouslySetInnerHTML={{ __html: singleResponse?.description || 'No description available' }} />
                            </Descriptions.Item>
                        </Descriptions>
                    </Col>

                    <Col xs={24} lg={8}>
                        <Card title="Technology Overview" bordered={false} className="h-100">
                            <Flex flexDirection="column" justifyContent="space-between" className="h-100">
                                <div>
                                    <Paragraph>
                                        <Space direction="vertical" style={{ width: '100%' }}>
                                            <Flex justifyContent="space-between">
                                                <Text strong>Screen Type:</Text>
                                                {getScreenTypeTag(singleResponse?.screen_technology)}
                                            </Flex>
                                            <Flex justifyContent="space-between">
                                                <Text strong>Audio System:</Text>
                                                {getAudioTag(singleResponse?.audio)}
                                            </Flex>
                                            <Flex justifyContent="space-between">
                                                <Text strong>Seating:</Text>
                                                {getSeatingLabel(singleResponse?.reserved_seating)}
                                            </Flex>
                                        </Space>
                                    </Paragraph>

                                    {singleResponse?.screen_technology?.description && (
                                        <>
                                            <Divider />
                                            <Title level={5}>Technology Details</Title>
                                            <Paragraph>
                                                {singleResponse?.screen_technology.description}
                                            </Paragraph>
                                        </>
                                    )}

                                    {singleResponse?.audio?.description && (
                                        <>
                                            <Divider />
                                            <Title level={5}>Audio System Details</Title>
                                            <Paragraph>
                                                {singleResponse?.audio.description}
                                            </Paragraph>
                                        </>
                                    )}
                                </div>
                            </Flex>
                        </Card>
                    </Col>
                </Row>

                <Divider orientation="left">Seating Layout</Divider>

                {singleResponse?.seat_structure_id ? (
                    <div className="seating-layout-container">
                        {/* Real seating layout would be integrated here */}
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                            <Image
                                width={600}
                                src="/api/placeholder/600/400"
                                alt="Seating Layout"
                                fallback="/api/placeholder/600/400"
                            />
                        </div>
                    </div>
                ) : (
                    <Empty
                        description="No seating layout available"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                )}

                {singleResponse?.time_slots && singleResponse.time_slots.length > 0 && (
                    <>
                        <Divider orientation="left">
                            <Space>
                                <CalendarOutlined />
                                Available Time Slots
                            </Space>
                        </Divider>

                        {singleResponse.time_slots.map((slotType, typeIndex) => (
                            <React.Fragment key={typeIndex}>
                                <Title level={5} style={{ marginTop: typeIndex > 0 ? 16 : 0 }}>
                                    {slotType}
                                </Title>
                                <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                                    {mockTimeSlots[slotType]?.map((timeRange, timeIndex) => (
                                        <Col key={`${typeIndex}-${timeIndex}`} xs={24} sm={12} md={8} lg={6}>
                                            <Card
                                                size="small"
                                                style={{ textAlign: 'center' }}
                                            >
                                                <Text>{timeRange}</Text>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>
                            </React.Fragment>
                        ))}
                    </>
                )}

                {/* {screenDetail.screen_ticket_structure && screenDetail.screen_ticket_structure.length > 0 && (
                    <>
                        <Divider orientation="left">
                            <Space>
                                <SettingOutlined />
                                Ticket Structure
                            </Space>
                        </Divider>

                        <Row gutter={[16, 16]}>
                            {screenDetail.screen_ticket_structure.map((ticket, index) => (
                                <Col key={index} xs={24} sm={12} md={8} lg={6}>
                                    <Card size="small">
                                        <Text>{ticket}</Text>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </>
                )} */}
            </Card>

        </>
    );
};

export default ScreenDetailView;