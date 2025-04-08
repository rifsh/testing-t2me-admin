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
    Space,
    Modal
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
    StarOutlined,
    ZoomInOutlined
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
    const [previewVisible, setPreviewVisible] = useState(false);

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

    const showImagePreview = () => {
        setPreviewVisible(true);
    };

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
        <div className="p-6">
            <Card className="shadow-md rounded-lg overflow-hidden">
                <Row>
                    <Col xs={24} sm={24} md={8} className="p-6 text-center">
                        <div className="relative inline-block group cursor-pointer" onClick={showImagePreview}>
                            <Avatar
                                src={response?.thumbnail_image}
                                size={200}
                                icon={<UserOutlined />}
                                className="border-4 border-blue-500 transition-all duration-300 hover:opacity-90"
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="bg-black bg-opacity-50 rounded-full p-2">
                                    <ZoomInOutlined className="text-white text-2xl" />
                                </div>
                            </div>
                        </div>

                        <Title level={2} className="mt-4 mb-0">
                            {response?.name || 'User Name'}
                        </Title>

                        {response?.also_known_as && (
                            <Text type="secondary" className="block text-base">
                                AKA: {response.also_known_as}
                            </Text>
                        )}

                        <div className="my-3">
                            {response?.occupation?.map(occ => (
                                <Tag color="blue" key={occ} className="m-1">
                                    {occ}
                                </Tag>
                            ))}
                        </div>
                    </Col>

                    <Col xs={24} sm={24} md={16} className="p-6">
                        <div>
                            <Title level={4}><UserOutlined /> Personal Details</Title>
                            <Divider className="mt-3 mb-4" />
                            <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }} className="bg-white">
                                <Descriptions.Item label="Full Name">{response?.name || 'N/A'}</Descriptions.Item>
                                <Descriptions.Item label="Also Known As">{response?.also_known_as || 'N/A'}</Descriptions.Item>
                                <Descriptions.Item label="Gender">
                                    {response?.gender ? response.gender.charAt(0).toUpperCase() + response.gender.slice(1) : 'N/A'}
                                </Descriptions.Item>
                                <Descriptions.Item label="Age">{response?.age ? response.age : calculateAge(response?.birthDate)}</Descriptions.Item>
                                <Descriptions.Item label="Birth Date">
                                    <CalendarOutlined /> {response?.birthDate || 'N/A'}
                                </Descriptions.Item>
                                <Descriptions.Item label="Birth Place">
                                    <EnvironmentOutlined /> {response?.birth_place || 'N/A'}
                                </Descriptions.Item>
                                <Descriptions.Item label="Nationality">
                                    <GlobalOutlined /> {response?.nationality || 'N/A'}
                                </Descriptions.Item>
                                <Descriptions.Item label="Spouse">
                                    <TeamOutlined /> {response?.spouse_name || 'Not specified'}
                                </Descriptions.Item>
                            </Descriptions>
                        </div>

                        <div className="mt-6 mb-5">
                            <Title level={4}><InfoCircleOutlined /> Biography</Title>
                            <Divider className="mt-3 mb-4" />
                            <Paragraph className="text-base leading-relaxed whitespace-pre-line">
                                <div dangerouslySetInnerHTML={{ __html: response?.biography || 'No biography available' }} />
                            </Paragraph>
                        </div>
                    </Col>
                </Row>
            </Card>

            <Modal
                visible={previewVisible}
                footer={null}
                onCancel={() => setPreviewVisible(false)}
                centered
                width={650}
                style={{
                    padding: 0
                }}
            >
                <img
                    alt={response?.name || 'Profile Image'}
                    src={response?.thumbnail_image}
                    style={{ width: '100%', height: 'auto' }}
                />
            </Modal>
        </div>
    );
};

export default ActorProfile;