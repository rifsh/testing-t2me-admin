import React, { useState } from 'react';
import {
    Card,
    Typography,
    Tag,
    Collapse,
    Row,
    Col,
    Badge,
    Space,
    Button,
} from 'antd';
import {
    ProjectOutlined,
    SoundOutlined,
    UserOutlined,
    ExpandAltOutlined,
    InfoCircleOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    ScheduleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { APP_PREFIX_PATH } from 'configs/AppConfig';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

const TheaterScreens = ({ screens }) => {
    const navigate = useNavigate();
    if (!screens || screens.length === 0) {
        return (
            <Card title="Theater Screens" className="shadow-md mb-6">
                <Text type="secondary">No screen information available</Text>
            </Card>
        );
    }

    const showScreenDetails = (screen) => {
        navigate(`${APP_PREFIX_PATH}/screen/detail/${screen.id}`)
    };

    return (
        <>
            <Card
                title={
                    <div className="flex items-center">
                        <ProjectOutlined className="mr-2 text-blue-500" />
                        <span>Theater Screens ({screens.length})</span>
                    </div>
                }
                className="shadow-md mb-6"
            >
                <Collapse accordion>
                    {screens.map((screen, index) => (
                        <Panel
                            key={screen.id}
                            header={
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center">
                                        <Badge status={screen.status ? "success" : "default"} />
                                        <Text strong className="ml-2">{screen.screen_name}</Text>
                                        <Text type="secondary" className="ml-2">({screen.screen_number})</Text>
                                    </div>
                                    <Space>
                                        <Tag color="blue">{screen.screen_type?.toUpperCase() || "STANDARD"}</Tag>
                                        <Tag color="green">{screen.capacity} Seats</Tag>
                                    </Space>
                                </div>
                            }
                        >
                            <Row gutter={[16, 16]}>
                                <Col span={24}>
                                    <div className="mb-4">
                                        <Title level={5} className="mb-2 flex items-center">
                                            <InfoCircleOutlined className="mr-2 text-blue-500" /> Description
                                        </Title>
                                        <div className="pl-6">
                                            <div dangerouslySetInnerHTML={{ __html: screen.description || 'No description available' }} />
                                        </div>
                                    </div>
                                </Col>

                                <Col xs={24} md={12}>
                                    <div className="mb-4">
                                        <Title level={5} className="mb-2 flex items-center">
                                            <SoundOutlined className="mr-2 text-blue-500" /> Audio Technology
                                        </Title>
                                        {screen.audio ? (
                                            <div className="pl-6">
                                                <Tag color="volcano">{screen.audio.name}</Tag>
                                                <Paragraph className="mt-2 text-gray-700">
                                                    {screen.audio.description}
                                                </Paragraph>
                                            </div>
                                        ) : (
                                            <div className="pl-6">
                                                <Text type="secondary">No audio technology information available</Text>
                                            </div>
                                        )}
                                    </div>
                                </Col>

                                <Col xs={24} md={12}>
                                    <div className="mb-4">
                                        <Title level={5} className="mb-2 flex items-center">
                                            <ProjectOutlined className="mr-2 text-blue-500" /> Screen Technology
                                        </Title>
                                        {screen.screen_technology ? (
                                            <div className="pl-6">
                                                <Tag color="cyan">{screen.screen_technology.name}</Tag>
                                                <Paragraph className="mt-2 text-gray-700">
                                                    {screen.screen_technology.description?.length > 100
                                                        ? `${screen.screen_technology.description.substring(0, 100)}...`
                                                        : screen.screen_technology.description}
                                                </Paragraph>
                                            </div>
                                        ) : (
                                            <div className="pl-6">
                                                <Text type="secondary">No screen technology information available</Text>
                                            </div>
                                        )}
                                    </div>
                                </Col>

                                <Col span={24}>
                                    <div className="mb-4">
                                        <Title level={5} className="mb-2 flex items-center">
                                            <UserOutlined className="mr-2 text-blue-500" /> Accessibility
                                        </Title>
                                        <div className="pl-6">
                                            {screen.accessibilty && screen.accessibilty.length > 0 ? (
                                                screen.accessibilty.map(item => (
                                                    <Tag color="purple" key={item.id} className="mb-2 mr-2">
                                                        {item.name}
                                                    </Tag>
                                                ))
                                            ) : (
                                                <Text type="secondary">No accessibility information available</Text>
                                            )}
                                        </div>
                                    </div>
                                </Col>

                                <Col span={24}>
                                    <div className="mb-4">
                                        <Title level={5} className="mb-2 flex items-center">
                                            <ScheduleOutlined className="mr-2 text-blue-500" /> Available Time Slots
                                        </Title>
                                        <div className="pl-6">
                                            {screen.time_slots && screen.time_slots.length > 0 ? (
                                                screen.time_slots.map((slot, i) => (
                                                    <Tag color="geekblue" key={i} className="mb-2 mr-2">
                                                        {slot}
                                                    </Tag>
                                                ))
                                            ) : (
                                                <Text type="secondary">No time slot information available</Text>
                                            )}
                                        </div>
                                    </div>
                                </Col>

                                <Col span={24}>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center">
                                            <Text className="mr-2">Reserved Seating:</Text>
                                            {screen.reserved_seating ? (
                                                <CheckCircleOutlined style={{ color: '#52c41a' }} />
                                            ) : (
                                                <CloseCircleOutlined style={{ color: '#f5222d' }} />
                                            )}
                                        </div>
                                        <Button
                                            type="primary"
                                            onClick={() => showScreenDetails(screen)}
                                            icon={<ExpandAltOutlined />}
                                        >
                                            View Full Details
                                        </Button>
                                    </div>
                                </Col>
                            </Row>
                        </Panel>
                    ))}
                </Collapse>
            </Card>
        </>
    );
};

export default TheaterScreens;