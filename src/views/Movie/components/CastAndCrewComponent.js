import React from 'react';
import { Card, Avatar, List, Typography, Tabs } from 'antd';
import { UserOutlined, TeamOutlined, VideoCameraOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { APP_PREFIX_PATH } from 'configs/AppConfig';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const CastAndCrewComponent = ({ cast = [], crew = [], fallbackCast = [], fallbackCrew = [] }) => {
    const navigate = useNavigate();
    const castData = cast.length > 0 ? cast : fallbackCast;
    const crewData = crew.length > 0 ? crew : fallbackCrew;
    console.log('castsss', cast)
    const renderCastMembers = () => {
        return (
            <List
                grid={{
                    gutter: 16,
                    xs: 1,
                    sm: 2,
                    md: 3,
                    lg: 4,
                    xl: 4,
                    xxl: 6,
                }}
                dataSource={castData}
                renderItem={item => (
                    <List.Item>
                        <Card
                            role='button'
                            onClick={() => navigate(`${APP_PREFIX_PATH}/personality/details/${item.personality.id}`)}
                            style={{ height: '100%' }}
                            cover={
                                <div style={{ padding: '20px', display: 'flex', justifyContent: 'center' }}>
                                    <Avatar
                                        size={120}
                                        src={item.personality.thumbnail_image}
                                        icon={<UserOutlined />}
                                        style={{ border: '2px solid #f0f0f0' }}
                                    />
                                </div>
                            }
                        >
                            <Card.Meta
                                title={item.character_name}
                                description={
                                    <>
                                        <Text strong>{item.character || item.role}</Text>
                                        {item.description && (
                                            <Paragraph type="secondary" ellipsis={{ rows: 2 }}>
                                                {item.role}
                                            </Paragraph>
                                        )}
                                    </>
                                }
                            />
                        </Card>
                    </List.Item>
                )}
            />
        );
    };

    const renderCrewMembers = () => {
        return (
            <List
                grid={{
                    gutter: 16,
                    xs: 1,
                    sm: 2,
                    md: 3,
                    lg: 4,
                    xl: 4,
                    xxl: 6,
                }}
                dataSource={crewData}
                renderItem={item => (
                    <List.Item>
                        <Card
                            role='button'
                            onClick={() => navigate(`${APP_PREFIX_PATH}/personality/details/${item.personality.id}`)}
                            style={{ height: '100%' }}
                            cover={
                                <div style={{ padding: '20px', display: 'flex', justifyContent: 'center' }}>
                                    <Avatar
                                        size={120}
                                        src={item.personality.thumbnail_image}
                                        icon={<TeamOutlined />}
                                        style={{ border: '2px solid #f0f0f0' }}
                                    />
                                </div>
                            }
                        >
                            <Card.Meta
                                title={item.name}
                                description={
                                    <>
                                        <Text type="success" strong>{item.role || item.job}</Text>
                                        {item.description && (
                                            <Paragraph type="secondary" ellipsis={{ rows: 2 }}>
                                                {item.description}
                                            </Paragraph>
                                        )}
                                    </>
                                }
                            />
                        </Card>
                    </List.Item>
                )}
            />
        );
    };

    return (
        <Card style={{ marginTop: '24px' }}>
            <Tabs defaultActiveKey="cast" centered>
                <TabPane tab={<span><UserOutlined /> Cast</span>} key="cast">
                    <div style={{ padding: '20px 0' }}>
                        <Title level={4} style={{ textAlign: 'center', marginBottom: '24px' }}>
                            Cast Members
                        </Title>
                        {renderCastMembers()}
                    </div>
                </TabPane>
                <TabPane tab={<span><VideoCameraOutlined /> Crew</span>} key="crew">
                    <div style={{ padding: '20px 0' }}>
                        <Title level={4} style={{ textAlign: 'center', marginBottom: '24px' }}>
                            Production Team
                        </Title>
                        {renderCrewMembers()}
                    </div>
                </TabPane>
            </Tabs>
        </Card>
    );
};

export default CastAndCrewComponent;