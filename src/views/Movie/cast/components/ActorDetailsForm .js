// ActorDetails.js
import React, { useEffect } from 'react';
import {
    Form,
    Input,
    Select,
    DatePicker,
    Card,
    Row,
    Col,
    Divider,
    Typography,
    Space
} from 'antd';
import {
    UserOutlined,
    IdcardOutlined,
    CalendarOutlined,
    TeamOutlined,
    InfoCircleOutlined
} from '@ant-design/icons';
import TextEditor from 'components/util-components/FormItems/TextEditor';
import ResizedImgePicker from 'components/util-components/Image/ResizedImgePicker';
import { ThumbnailImageResolutions } from 'constants/SupportFileConstants';
import { OCCUPATIONS } from 'mock/data/CastData';
import moment from 'moment'; // Make sure moment is imported

const { Title } = Typography;
const { Option } = Select;

const ActorDetails = ({ form, onSubmit, loading }) => {

    const normFile = (e) => {
        if (Array.isArray(e)) {
            return e;
        }
        return e?.fileList || [];
    };

    const calculateAge = (date) => {
        if (!date) {
            form.setFieldsValue({ age: '' });
            return;
        }

        const today = new Date();
        let age = today.getFullYear() - date.$y;

        const monthDiff = today.getMonth() - date.$M + 1;
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.$D)) {
            age--;
        }

        form.setFieldsValue({ age });
    };

    const handleBirthDateChange = (date) => {
        calculateAge(date);
    };

    useEffect(() => {
        const birthDate = form.getFieldValue('birthDate');
        if (birthDate) {
            const age = calculateAge(birthDate);
            form.setFieldsValue({ age });
        }
    }, [form]);

    return (
        <Card className="actor-details-card">
            <Form
                form={form}
                layout="vertical"
                onFinish={onSubmit}
                scrollToFirstError
            >
                <Row gutter={24}>

                    <Col xs={24} md={12}>
                        <Form.Item
                            name="name"
                            label="Full Name"
                            rules={[{ required: true, message: 'Please enter actor name' }]}
                        >
                            <Input placeholder="Enter actor's full name" prefix={<UserOutlined />} />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                        <Form.Item
                            name="also_known_as"
                            label="Also Known As"
                            rules={[{ required: true, message: 'Please enter actor another name' }]}

                        >
                            <Input placeholder="Enter nicknames or stage names" />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                        <Form.Item
                            name="spouse_name"
                            label="Spouse/Partner Name"
                        >
                            <Input placeholder="Enter spouse or partner name" prefix={<TeamOutlined />} />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                        <Form.Item
                            name="gender"
                            label="Gender"
                            rules={[{ required: true, message: 'Please select gender' }]}
                        >
                            <Select placeholder="Select gender">
                                <Option value="male">Male</Option>
                                <Option value="female">Female</Option>
                                <Option value="other">Other</Option>
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                        <Form.Item
                            name="birthDate"
                            label="Date of Birth"
                            rules={[{ required: true, message: 'Please select birth date' }]}
                        >
                            <DatePicker
                                style={{ width: '100%' }}
                                placeholder="Select birth date"
                                disabledDate={(current) => current && current > new Date()}
                                format="YYYY-MM-DD"
                                prefix={<CalendarOutlined />}
                                onChange={handleBirthDateChange}
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                        <Form.Item
                            name="age"
                            label="Age"
                            rules={[{ required: true, message: 'Age is required' }]}
                        >
                            <Input
                                placeholder="Calculated from birth date"
                                disabled
                                suffix="years"
                                style={{ color: '#000' }}
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item
                            name="nationality"
                            label="Nationality"
                            rules={[{ required: true, message: 'Please enter nationality' }]}
                        >
                            <Input placeholder="Enter nationality" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item
                            name="birth_place"
                            label="Birth place"
                        >
                            <Input placeholder="Enter birth place" />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                        <Form.Item
                            name="occupation"
                            label="Occupation"
                            rules={[{ required: true, message: 'Please add occupation' }]}
                        >
                            <Select
                                mode="tags"
                                placeholder="Select or enter occupations"
                                tokenSeparators={[',']}
                            >
                                {OCCUPATIONS.map(occ => (
                                    <Option key={occ.value} value={occ.value}>
                                        {occ.label}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col xs={24}>
                        <Divider />
                        <Title level={4}>
                            <InfoCircleOutlined /> About Section
                        </Title>
                    </Col>

                    <Col xs={24}>
                        <Form.Item
                            name="biography"
                            label="Biography"
                            rules={[{ required: true, message: 'Please enter biography' }]}
                        >
                            <TextEditor />
                        </Form.Item>
                    </Col>

                    <Col xs={24}>
                        <Form.Item
                            name="funFacts"
                            label="Fun Facts"
                        >
                            <TextEditor />
                        </Form.Item>
                    </Col>

                    {/* Profile Image */}
                    <Col xs={24}>
                        <Form.Item
                            name="thumbnail_image"
                            label="Upload Profile Image"
                            rules={[{ required: true, message: 'Please add a profile image' }]}
                            valuePropName="value"
                            getValueFromEvent={normFile}
                            style={{ marginBottom: "0px", padding: "0px" }}
                        >
                            <ResizedImgePicker
                                maxCount={1}
                                targetResolution={ThumbnailImageResolutions.EVENT}
                            />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Card>
    );
};

export default ActorDetails;