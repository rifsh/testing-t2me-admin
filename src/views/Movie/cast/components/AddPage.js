import React, { useState } from 'react';
import {
    Form,
    Button,
    Row,
    Typography,
    message,
    Space,
    Tabs
} from 'antd';
import {
    UserOutlined,
} from '@ant-design/icons';
import DiscardButton from 'components/shared-components/Buttons/DiscardButton';
import ActorDetails from './ActorDetailsForm ';

const { Title } = Typography;

const AddPage = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [familyMembers, setFamilyMembers] = useState([]);

    const handleSubmit = () => {
        setLoading(true);

        form.validateFields().then(values => {
            const completeData = {
                ...values,
                familyMembers: familyMembers
            };

            console.log('Form submission data:', completeData);

            setTimeout(() => {
                message.success('Actor details saved successfully!');
                setLoading(false);
            }, 1500);
        }).catch(error => {
            console.error('Form validation failed:', error);
            setLoading(false);
            message.error('Please check the form for errors');
        });
    };

    return (
        <div>
            <div style={{ marginBottom: 24 }}>
                <Title level={3} style={{ marginBottom: 0 }}>
                    <UserOutlined style={{ marginRight: 8 }} />
                    Celebrity Management
                </Title>
            </div>
            <Form
                layout="vertical"
                name="celebrity-form"
                form={form}
                className="ant-advanced-search-form"
                onFinish={handleSubmit}
            >
                <Tabs defaultActiveKey="1">
                    <Tabs.TabPane
                        tab={<span><UserOutlined /> Actor Details</span>}
                        key="1"
                    >
                        <ActorDetails
                            form={form}
                            loading={loading}
                        />
                    </Tabs.TabPane>
                </Tabs>
                <Row justify="end" style={{ marginTop: '20px' }}>
                    <Space>
                        <DiscardButton form={form} />
                        <Button
                            type="primary"
                            htmlType="submit"
                            onClick={handleSubmit}
                            loading={loading}
                        >
                            Submit
                        </Button>
                    </Space>
                </Row>
            </Form>
        </div>
    );
};

export default AddPage;