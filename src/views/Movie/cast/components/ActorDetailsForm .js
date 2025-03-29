import React, { useState } from 'react';
import {
    Form,
    Input,
    Select,
    DatePicker,
    Upload,
    Button,
    Card,
    Row,
    Col,
    Divider,
    Typography,
    message,
    Space
} from 'antd';
import {
    UserOutlined,
    IdcardOutlined,
    CalendarOutlined,
    UploadOutlined,
    SaveOutlined,
    TeamOutlined,
    TrophyOutlined,
    InfoCircleOutlined
} from '@ant-design/icons';
import DiscardButton from 'components/shared-components/Buttons/DiscardButton';
import TextEditor from 'components/util-components/FormItems/TextEditor';
import ResizedImgePicker from 'components/util-components/Image/ResizedImgePicker';
import { ThumbnailImageResolutions } from 'constants/SupportFileConstants';

const { TextArea } = Input;
const { Title } = Typography;
const { Option } = Select;

const ActorDetailsForm = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    // Handle form submission
    const handleSubmit = (values) => {
        setLoading(true);
        console.log('Form values:', values);

        // Simulate API call
        setTimeout(() => {
            message.success('Actor details saved successfully!');
            setLoading(false);
        }, 1500);
    };

    // Configuration for file upload
    const uploadProps = {
        name: 'profileImage',
        action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76', // Replace with your API endpoint
        headers: {
            authorization: 'authorization-text',
        },
        onChange(info) {
            if (info.file.status === 'done') {
                message.success(`${info.file.name} uploaded successfully`);
            } else if (info.file.status === 'error') {
                message.error(`${info.file.name} upload failed.`);
            }
        },
    };

    const normFile = (e) => {
        if (Array.isArray(e)) {
            return e;
        }
        return e?.fileList || [];
    };

    return (
        <Card className="actor-details-card">
            <Title level={2}>
                <UserOutlined /> Actor Details
            </Title>
            <Divider />

            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                scrollToFirstError
            >
                <Row gutter={24}>
                    {/* Personal Information Section */}
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
                                <Option value="non-binary">Non-Binary</Option>
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
                            name="occupation"
                            label="Occupation"
                            rules={[{ required: true, message: 'Please enter occupation' }]}
                        >
                            <Select
                                mode="tags"
                                placeholder="Select or enter occupations"
                                tokenSeparators={[',']}
                            >
                                <Option value="actor">Actor</Option>
                                <Option value="director">Director</Option>
                                <Option value="producer">Producer</Option>
                                <Option value="writer">Writer</Option>
                                <Option value="musician">Musician</Option>
                            </Select>
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
                            name="languages"
                            label="Languages Spoken"
                        >
                            <Select
                                mode="tags"
                                placeholder="Select or enter languages"
                                tokenSeparators={[',']}
                            >
                                <Option value="english">English</Option>
                                <Option value="spanish">Spanish</Option>
                                <Option value="french">French</Option>
                                <Option value="mandarin">Mandarin</Option>
                                <Option value="hindi">Hindi</Option>
                            </Select>
                        </Form.Item>
                    </Col>

                    {/* Career Information */}
                    <Col xs={24}>
                        <Divider />
                        <Title level={4}>
                            <TrophyOutlined /> Career Information
                        </Title>
                    </Col>

                    <Col xs={24} md={12}>
                        <Form.Item
                            name="debutYear"
                            label="Debut Year"
                        >
                            <DatePicker
                                picker="year"
                                style={{ width: '100%' }}
                                placeholder="Select debut year"
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                        <Form.Item
                            name="awards"
                            label="Notable Awards"
                        >
                            <Select
                                mode="tags"
                                placeholder="Enter notable awards"
                                tokenSeparators={[',']}
                            >
                                <Option value="oscar">Oscar</Option>
                                <Option value="golden_globe">Golden Globe</Option>
                                <Option value="emmy">Emmy</Option>
                                <Option value="bafta">BAFTA</Option>
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col xs={24}>
                        <Form.Item
                            name="notableWorks"
                            label="Notable Works"
                        >
                            <Select
                                mode="tags"
                                placeholder="Enter notable movies/shows"
                                tokenSeparators={[',']}
                            >
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
                <Row justify="end" style={{ marginTop: '20px' }}>
                    <Space>
                        <DiscardButton form={form} />
                        <Button
                            type="primary"
                            onClick={handleSubmit}
                        >
                            Submit
                        </Button>
                    </Space>
                </Row>
            </Form>
        </Card>
    );
};

export default ActorDetailsForm;