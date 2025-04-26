import React, { useEffect, useState } from 'react';
import { Card, Avatar, List, Typography, Tabs, Badge, Tag, Tooltip, Divider, Empty, Skeleton } from 'antd';
import { UserOutlined, TeamOutlined, VideoCameraOutlined, InfoCircleOutlined, CalendarOutlined, GlobalOutlined, TrophyOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { APP_PREFIX_PATH } from 'configs/AppConfig';

const { Title, Text, Paragraph } = Typography;

const CastAndCrewComponent = ({ cast = [], crew = [], fallbackCast = [], fallbackCrew = [], loading = false }) => {
    const navigate = useNavigate();
    const castData = cast.length > 0 ? cast : fallbackCast;
    const crewData = crew.length > 0 ? crew : fallbackCrew;

    const [activeTab, setActiveTab] = useState('cast');

    // Function to truncate and sanitize HTML content
    const sanitizeHtml = (html) => {
        if (!html) return '';
        // Create a temporary div to handle HTML content
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        const text = tempDiv.textContent || tempDiv.innerText || '';
        return text.length > 100 ? `${text.substring(0, 100)}...` : text;
    };

    // Calculate age from birthDate
    const calculateAge = (birthDate) => {
        if (!birthDate) return null;
        const today = new Date();
        const birthDateObj = new Date(birthDate);
        let age = today.getFullYear() - birthDateObj.getFullYear();
        const monthDiff = today.getMonth() - birthDateObj.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
            age--;
        }
        return age;
    };

    const renderPersonalityCard = (item, isCast = true) => {
        const personality = item.personality || {};
        const age = calculateAge(personality.birthDate);
        const bioSummary = sanitizeHtml(personality.biography);

        return (
            <Card
                hoverable
                className="personality-card"
                onClick={() => navigate(`${APP_PREFIX_PATH}/personality/details/${personality.id}`)}
                style={{
                    height: '100%',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    transition: 'all 0.3s'
                }}
                cover={
                    <div className="personality-image-container" style={{
                        height: '200px',
                        position: 'relative',
                        overflow: 'hidden',
                        background: '#f5f5f5'
                    }}>
                        {personality.thumbnail_image ? (
                            <img
                                src={personality.thumbnail_image}
                                alt={personality.name}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    objectPosition: 'top'
                                }}
                            />
                        ) : (
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                height: '100%'
                            }}>
                                <Avatar
                                    size={120}
                                    icon={isCast ? <UserOutlined /> : <TeamOutlined />}
                                />
                            </div>
                        )}
                        <Badge
                            count={isCast ? 'CAST' : 'CREW'}
                            style={{
                                position: 'absolute',
                                top: '10px',
                                right: '10px',
                                background: isCast ? '#1890ff' : '#52c41a'
                            }}
                        />
                    </div>
                }
                bodyStyle={{ padding: '16px' }}
            >
                <Title level={5} ellipsis style={{ marginBottom: '8px', marginTop: 0 }}>
                    {personality.name}
                </Title>

                <Text type="secondary" style={{ fontSize: '13px', display: 'block', marginBottom: '8px' }}>
                    {isCast ? item.character_name : ''}
                    {isCast && item.character_name && item.role ? ' • ' : ''}
                    <Text strong type={isCast ? "default" : "success"}>
                        {item.role || item.job}
                    </Text>
                </Text>

                <Divider style={{ margin: '10px 0' }} />

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                    {personality.gender && (
                        <Tag color="blue">{personality.gender === 'male' ? 'Male' : 'Female'}</Tag>
                    )}
                    {personality.nationality && (
                        <Tooltip title="Nationality">
                            <Tag icon={<GlobalOutlined />} color="purple">
                                {personality.nationality}
                            </Tag>
                        </Tooltip>
                    )}
                    {age && (
                        <Tooltip title="Age">
                            <Tag icon={<CalendarOutlined />} color="cyan">
                                {age} yrs
                            </Tag>
                        </Tooltip>
                    )}
                    {personality.occupation && personality.occupation.length > 0 && (
                        <Tooltip title="Occupation">
                            <Tag icon={<TrophyOutlined />} color="gold">
                                {personality.occupation[0]}
                            </Tag>
                        </Tooltip>
                    )}
                </div>

                {bioSummary && (
                    <Tooltip title="View full bio">
                        <Paragraph
                            type="secondary"
                            ellipsis={{ rows: 2, expandable: false }}
                            style={{ fontSize: '12px', marginBottom: 0, cursor: 'pointer' }}
                        >
                            <InfoCircleOutlined style={{ marginRight: '4px' }} />
                            {bioSummary}
                        </Paragraph>
                    </Tooltip>
                )}
            </Card>
        );
    };

    useEffect(() => {
        console.log("movieSingleResponse", cast)

    }, [])

    const renderEmptyState = () => (
        <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
                <span>
                    No {activeTab === 'cast' ? 'cast' : 'crew'} members available
                </span>
            }
            style={{ margin: '40px 0' }}
        />
    );

    const renderSkeleton = () => (
        <List
            grid={{
                gutter: 24,
                xs: 1,
                sm: 2,
                md: 3,
                lg: 4,
                xl: 4,
                xxl: 6,
            }}
            dataSource={Array(8).fill(null)}
            renderItem={() => (
                <List.Item>
                    <Card style={{ height: '100%', borderRadius: '10px' }}>
                        <Skeleton.Image style={{ width: '100%', height: '200px' }} active />
                        <Skeleton active paragraph={{ rows: 3 }} />
                    </Card>
                </List.Item>
            )}
        />
    );

    const renderCastMembers = () => {
        if (loading) return renderSkeleton();
        if (!castData || castData.length === 0) return renderEmptyState();

        return (
            <List
                grid={{
                    gutter: 24,
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
                        {renderPersonalityCard(item, true)}
                    </List.Item>
                )}
            />
        );
    };

    const renderCrewMembers = () => {
        if (loading) return renderSkeleton();
        if (!crewData || crewData.length === 0) return renderEmptyState();

        return (
            <List
                grid={{
                    gutter: 24,
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
                        {renderPersonalityCard(item, false)}
                    </List.Item>
                )}
            />
        );
    };

    return (
        <Card
            className="cast-crew-container"
            style={{
                marginTop: '24px',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
            }}
        >
            <Tabs
                defaultActiveKey="cast"
                centered
                onChange={setActiveTab}
                tabBarStyle={{ marginBottom: '16px', borderBottom: '1px solid #f0f0f0' }}
                items={[
                    {
                        key: 'cast',
                        label: (
                            <span className="tab-label">
                                <UserOutlined />
                                <span style={{ marginLeft: 8 }}>Cast ({castData.length})</span>
                            </span>
                        ),
                        children: (
                            <div style={{ padding: '8px 0' }}>
                                <Title
                                    level={4}
                                    style={{
                                        textAlign: 'center',
                                        marginBottom: '32px',
                                        color: '#1890ff',
                                        fontWeight: 500
                                    }}
                                >
                                    Cast Members
                                </Title>
                                {renderCastMembers()}
                            </div>
                        )
                    },
                    {
                        key: 'crew',
                        label: (
                            <span className="tab-label">
                                <VideoCameraOutlined />
                                <span style={{ marginLeft: 8 }}>Crew ({crewData.length})</span>
                            </span>
                        ),
                        children: (
                            <div style={{ padding: '8px 0' }}>
                                <Title
                                    level={4}
                                    style={{
                                        textAlign: 'center',
                                        marginBottom: '32px',
                                        color: '#52c41a',
                                        fontWeight: 500
                                    }}
                                >
                                    Production Team
                                </Title>
                                {renderCrewMembers()}
                            </div>
                        )
                    }
                ]}
            />
        </Card>
    );
};

export default CastAndCrewComponent;