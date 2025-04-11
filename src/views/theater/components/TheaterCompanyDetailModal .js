import React from 'react';
import { Modal, Descriptions, Typography, Divider, Row, Col, Avatar, Space, Tag, Card, Spin } from 'antd';
import { GlobalOutlined, PhoneOutlined, MailOutlined, UserOutlined, EnvironmentOutlined, CalendarOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { setDetailModal } from 'store/slices/theaterCompanySlice';

const { Title, Text } = Typography;

const TheaterCompanyDetailModal = ({ visible, onClose, theaterCompany, loading }) => {
    const dispatch = useDispatch();

    const handleClose = () => {
        if (onClose) {
            onClose();
        } else {
            dispatch(setDetailModal(false));
        }
    };

    return (
        <Modal
            open={visible}
            title={
                <Title level={4} style={{ margin: 0 }}>
                    Theater Company Details
                </Title>
            }
            onCancel={handleClose}
            footer={null}
            width={700}
            bodyStyle={{ padding: '20px' }}
        >
            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <Spin size="large" />
                    <div style={{ marginTop: 16 }}>Loading company details...</div>
                </div>
            ) : !theaterCompany ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <Text type="secondary">No company data available</Text>
                </div>
            ) : (
                <Card bordered={false}>
                    <Row gutter={[24, 24]} align="middle">
                        <Col xs={24} sm={6}>
                            <Avatar
                                size={100}
                                src={theaterCompany.thumbnail_image || "https://via.placeholder.com/150"}
                                icon={<UserOutlined />}
                            />
                        </Col>
                        <Col xs={24} sm={18}>
                            <Title level={3} style={{ marginTop: 0, marginBottom: 8 }}>
                                {theaterCompany.name}
                            </Title>
                            <Space>
                                <Tag color={theaterCompany.status ? "success" : "error"}>
                                    {theaterCompany.status ? "Active" : "Inactive"}
                                </Tag>
                                {theaterCompany.verified && <Tag color="blue">Verified</Tag>}
                            </Space>
                        </Col>
                    </Row>

                    <Divider style={{ marginTop: 24, marginBottom: 24 }} />

                    <Descriptions layout="vertical" bordered column={{ xs: 1, sm: 2 }}>
                        <Descriptions.Item label={<Space><MailOutlined /> Email</Space>}>
                            <Text copyable>{theaterCompany.email}</Text>
                        </Descriptions.Item>
                        <Descriptions.Item label={<Space><PhoneOutlined /> Phone</Space>}>
                            <Text copyable>{theaterCompany.phone_number}</Text>
                        </Descriptions.Item>
                        <Descriptions.Item label={<Space><GlobalOutlined /> Website</Space>}>
                            <a href={theaterCompany.website_url} target="_blank" rel="noopener noreferrer">
                                {theaterCompany.website_url}
                            </a>
                        </Descriptions.Item>
                    </Descriptions>

                    {theaterCompany.description && (
                        <>
                            <Divider orientation="left">Description</Divider>
                            <div dangerouslySetInnerHTML={{ __html: theaterCompany.description }}></div>
                        </>
                    )}

                    {theaterCompany.createdAt && (
                        <Row style={{ marginTop: 24 }}>
                            <Col span={24}>
                                <Text type="secondary">
                                    <CalendarOutlined /> Created: {new Date(theaterCompany.createdAt).toLocaleDateString()}
                                </Text>
                            </Col>
                        </Row>
                    )}
                </Card>
            )}
        </Modal>
    );
};

export default TheaterCompanyDetailModal;