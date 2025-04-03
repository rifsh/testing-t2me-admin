import React, { useState, useEffect } from 'react';
import {
    Row,
    Col,
    Card,
    Avatar,
    Typography,
    Descriptions,
    Divider,
    Button,
    Breadcrumb,
    Spin,
    Alert,
    List,
    Tag,
    Space
} from 'antd';
import {
    UserOutlined,
    CalendarOutlined,
    EnvironmentOutlined,
    TeamOutlined,
    GlobalOutlined,
    LeftOutlined,
    EditOutlined,
    InfoCircleOutlined,
    StarOutlined
} from '@ant-design/icons';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPersonalitiesById } from 'store/slices/castSlice';
import { APP_PREFIX_PATH } from 'configs/AppConfig';

const { Title, Text, Paragraph } = Typography;

const ActorProfile = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const { response, loading } = useSelector((state => state.cast));

    useEffect(() => {
        dispatch(fetchPersonalitiesById({ person_id: id }))
    }, [dispatch, id]);

    useEffect(() => {
        if (response) {
            console.log("fetching", response);

        }
    }, [id, response]);

    const calculateAge = (birthDate) => {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }

        return age;
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '100px' }}>
                <Spin size="large" />
                <div style={{ marginTop: '20px' }}>Loading actor profile...</div>
            </div>
        );
    }

    if (!response || loading) {
        return (
            <Alert
                message="Actor Not Found"
                description="The actor you're looking for doesn't exist or has been removed."
                type="error"
                showIcon
                action={
                    <Link to={`${APP_PREFIX_PATH}/cast/list`}>
                        <Button size="small" type="primary">
                            Return to Actor List
                        </Button>
                    </Link>
                }
            />
        );
    }

    return (
        <div style={{ padding: '24px' }}>
            <Card bodyStyle={{ padding: 0 }}>
                <Row>
                    <Col xs={24} sm={24} md={8} style={{ padding: '24px', textAlign: 'center' }}>
                        <Avatar
                            src={response?.thumbnail_image}
                            size={200}
                            icon={<UserOutlined />}
                            style={{ border: '4px solid #1890ff' }}
                        />
                        <Title level={2} style={{ marginTop: '16px', marginBottom: '0' }}>
                            {response?.name}
                        </Title>
                        {response?.also_known_as && (
                            <Text type="secondary" style={{ display: 'block', fontSize: '16px' }}>
                                AKA: {response?.also_known_as}
                            </Text>
                        )}
                        <div style={{ margin: '12px 0' }}>
                            {response?.occupation?.map(occ => (
                                <Tag color="blue" key={occ} style={{ margin: '4px' }}>
                                    {occ}
                                </Tag>
                            ))}
                        </div>
                    </Col>

                    <Col xs={24} sm={24} md={16} style={{ padding: '24px' }}>
                        <div>
                            <Title level={4}><UserOutlined /> Personal Details</Title>
                            <Divider style={{ marginTop: '12px' }} />
                            <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}>
                                <Descriptions.Item label="Full Name">{response?.name}</Descriptions.Item>
                                <Descriptions.Item label="Also Known As">{response?.also_known_as || 'N/A'}</Descriptions.Item>
                                <Descriptions.Item label="Gender">
                                    {response?.gender?.charAt(0).toUpperCase() + response?.gender?.slice(1)}
                                </Descriptions.Item>
                                <Descriptions.Item label="Age">{response.age ? response.age : calculateAge(response?.birthDate)}</Descriptions.Item>
                                <Descriptions.Item label="Birth Date">
                                    <CalendarOutlined /> {response?.birthDate}
                                </Descriptions.Item>
                                <Descriptions.Item label="Birth Place">
                                    <EnvironmentOutlined /> {response?.birth_place}
                                </Descriptions.Item>
                                <Descriptions.Item label="Nationality">
                                    <GlobalOutlined /> {response?.nationality}
                                </Descriptions.Item>
                                <Descriptions.Item label="Spouse" span={2}>
                                    <TeamOutlined /> {response?.spouse_name || 'Not specified'}
                                </Descriptions.Item>
                            </Descriptions>
                        </div>
                        <div style={{ marginBottom: '32px' }}>
                            <Title level={4}><InfoCircleOutlined /> Biography</Title>
                            <Divider style={{ marginTop: '12px' }} />
                            <Paragraph style={{ fontSize: '16px', lineHeight: '1.8', whiteSpace: 'pre-line' }}>
                                <div
                                    dangerouslySetInnerHTML={{ __html: response?.biography || 'No biography available' }}
                                />
                            </Paragraph>

                            {response?.funFacts &&
                                <>
                                    <Divider orientation="left">Fun Facts</Divider>
                                    {/* <List
                                        itemLayout="horizontal"
                                        dataSource={actor.funFacts}
                                        renderItem={item => (
                                            <List.Item>
                                                <List.Item.Meta
                                                    avatar={<StarOutlined style={{ color: '#faad14', fontSize: '20px' }} />}
                                                    title={item}
                                                />
                                            </List.Item>
                                        )}
                                    /> */}
                                </>
                            }
                        </div>
                    </Col>
                </Row>
            </Card>
        </div>
    );
};

export default ActorProfile;