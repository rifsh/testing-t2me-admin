// ActorDetails.js
import React from 'react';
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
import DiscardButton from 'components/shared-components/Buttons/DiscardButton';
import TextEditor from 'components/util-components/FormItems/TextEditor';
import ResizedImgePicker from 'components/util-components/Image/ResizedImgePicker';
import { ThumbnailImageResolutions } from 'constants/SupportFileConstants';
import { OCCUPATIONS } from 'mock/data/CastDara';

const { Title } = Typography;
const { Option } = Select;

const ActorDetails = ({ form, onSubmit, loading }) => {
    const normFile = (e) => {
        if (Array.isArray(e)) {
            return e;
        }
        return e?.fileList || [];
    };

    return (
        <Card className="actor-details-card">
            <Form
                form={form}
                layout="vertical"
                onFinish={onSubmit}
                scrollToFirstError
            >
                <Row gutter={24}>
                    <Col xs={24}>
                        <Title level={4}>
                            <IdcardOutlined /> Personal Information
                        </Title>
                    </Col>

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
                            name="alsoKnownAs"
                            label="Also Known As"
                        >
                            <Input placeholder="Enter nicknames or stage names" />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                        <Form.Item
                            name="spouseName"
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
                                format="YYYY-MM-DD"
                                prefix={<CalendarOutlined />}
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                        <Form.Item
                            name="nationality"
                            label="Nationality"
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
                            rules={[{ required: true, message: 'Please enter occupation' }]}
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

                    {/* About Section */}
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
                            name="profileImage"
                            label="Upload Profile Image"
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