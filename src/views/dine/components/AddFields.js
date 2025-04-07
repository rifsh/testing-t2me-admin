import React, { useState } from 'react';
import {
    Form,
    Input,
    Button,
    Select,
    TimePicker,
    InputNumber,
    Upload,
    Switch,
    Card,
    Row,
    Col,
    Divider,
    message,
    Space,
    Typography,
    Tabs
} from 'antd';
import {
    PlusOutlined,
    SaveOutlined,
    RollbackOutlined,
    UploadOutlined,
    EnvironmentOutlined,
    PhoneOutlined,
    MailOutlined,
    TableOutlined,
    DollarOutlined,
    ShopOutlined,
    TeamOutlined
} from '@ant-design/icons';
import moment from 'moment';
import TextEditor from 'components/util-components/FormItems/TextEditor';
import DiscardButton from 'components/shared-components/Buttons/DiscardButton';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

const AddFields = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [previewVisible, setPreviewVisible] = useState(false);

    // Price range options
    const priceRangeOptions = [
        { label: 'Budget ($)', value: '$' },
        { label: 'Moderate ($$)', value: '$$' },
        { label: 'Expensive ($$$)', value: '$$$' },
        { label: 'Premium ($$$$)', value: '$$$$' },
    ];

    // Cuisine options
    const cuisineOptions = [
        'American', 'Italian', 'Chinese', 'Japanese', 'Indian',
        'Mexican', 'French', 'Thai', 'Mediterranean', 'Seafood',
        'Steakhouse', 'Vegetarian', 'Vegan', 'Fusion', 'International',
        'Dessert', 'Coffee & Tea', 'Fast Food', 'BBQ', 'Other'
    ];

    // Table types
    const tableTypes = [
        { label: 'Regular', value: 'regular' },
        { label: 'Booth', value: 'booth' },
        { label: 'High Top', value: 'highTop' },
        { label: 'Bar Seating', value: 'barSeating' },
        { label: 'Outdoor', value: 'outdoor' },
        { label: 'Private Room', value: 'privateRoom' },
    ];

    // Handle form submission
    const handleSubmit = async (values) => {
        setLoading(true);

        try {
            // Format opening hours
            const formattedValues = {
                ...values,
                openingHours: `${values.openingHours[0].format('HH:mm')} - ${values.openingHours[1].format('HH:mm')}`,
            };

            console.log('Form values:', formattedValues);

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            message.success('Dining venue added successfully!');
            form.resetFields();
        } catch (error) {
            message.error('Failed to add dining venue');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Handle image upload
    const handleImageUpload = ({ fileList }) => {
        // Handle file list here
        console.log(fileList);
    };

    // Preview image
    const handlePreview = async (file) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj);
        }

        setPreviewImage(file.url || file.preview);
        setPreviewVisible(true);
    };

    // Dummy function for image preview
    const getBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    };

    // Generate initial tables setup
    const initialTableSetup = () => {
        const tableSetup = [];
        tableTypes.forEach(type => {
            tableSetup.push({
                type: type.value,
                count: 0,
                capacity: type.value === 'booth' ? 4 :
                    type.value === 'highTop' ? 2 :
                        type.value === 'barSeating' ? 1 :
                            type.value === 'privateRoom' ? 8 : 4
            });
        });
        return tableSetup;
    };

    return (
        <div style={{ minHeight: '100vh' }}>
            <Card>
                <Title level={4}>Add New Dining Venue</Title>
                <Text type="secondary">Fill in the details below to add a new dining venue to your ticket booking system.</Text>

                <Divider />

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{
                        status: 'active',
                        reservationRequired: true,
                        allowsWalkin: true,
                        priceRange: '$$',
                        capacity: 50,
                        maximumPartySize: 8,
                        openingHours: [moment('11:00', 'HH:mm'), moment('22:00', 'HH:mm')],
                        tableSetup: initialTableSetup(),
                    }}
                >
                    <Tabs defaultActiveKey="basic">
                        <TabPane tab="Basic Information" key="basic">
                            <Row gutter={24}>
                                <Col xs={24} sm={24} md={16}>
                                    <Form.Item
                                        name="name"
                                        label="Venue Name"
                                        rules={[{ required: true, message: 'Please enter venue name' }]}
                                    >
                                        <Input prefix={<ShopOutlined />} placeholder="e.g. Ocean View Restaurant" />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} sm={12} md={8}>
                                    <Form.Item
                                        name="venueId"
                                        label="Venue ID"
                                        rules={[{ required: true, message: 'Please enter venue ID' }]}
                                    >
                                        <Input placeholder="e.g. RES-001" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={24}>
                                <Col xs={24} sm={12} md={8}>
                                    <Form.Item
                                        name="cuisine"
                                        label="Cuisine Type"
                                        rules={[{ required: true, message: 'Please select cuisine type' }]}
                                    >
                                        <Select placeholder="Select cuisine type">
                                            {cuisineOptions.map(cuisine => (
                                                <Option key={cuisine} value={cuisine}>{cuisine}</Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>

                                <Col xs={24} sm={12} md={8}>
                                    <Form.Item
                                        name="priceRange"
                                        label="Price Range"
                                        rules={[{ required: true, message: 'Please select price range' }]}
                                    >
                                        <Select placeholder="Select price range">
                                            {priceRangeOptions.map(option => (
                                                <Option key={option.value} value={option.value}>{option.label}</Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>

                                <Col xs={24} sm={12} md={8}>
                                    <Form.Item
                                        name="status"
                                        label="Status"
                                        rules={[{ required: true, message: 'Please select status' }]}
                                    >
                                        <Select placeholder="Select status">
                                            <Option value="active">Active</Option>
                                            <Option value="inactive">Inactive</Option>
                                            <Option value="maintenance">Maintenance</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={24}>
                                <Col xs={24}>
                                    <Form.Item
                                        name="description"
                                        label="Description"
                                    >
                                        <TextEditor />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={24}>
                                <Col xs={24} sm={12}>
                                    <Form.Item
                                        name="location"
                                        label="Location/Address"
                                        rules={[{ required: true, message: 'Please enter location' }]}
                                    >
                                        <Input
                                            prefix={<EnvironmentOutlined />}
                                            placeholder="e.g. Main Hall, Level 2"
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} sm={12}>
                                    <Form.Item
                                        name="openingHours"
                                        label="Operating Hours"
                                        rules={[{ required: true, message: 'Please select operating hours' }]}
                                    >
                                        <TimePicker.RangePicker
                                            format="HH:mm"
                                            style={{ width: '100%' }}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={24}>
                                <Col xs={24} sm={8}>
                                    <Form.Item
                                        name="phoneNumber"
                                        label="Contact Phone"
                                    >
                                        <Input prefix={<PhoneOutlined />} placeholder="e.g. +1 234 567 8900" />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} sm={8}>
                                    <Form.Item
                                        name="email"
                                        label="Contact Email"
                                        rules={[
                                            {
                                                type: 'email',
                                                message: 'Please enter a valid email',
                                            },
                                        ]}
                                    >
                                        <Input prefix={<MailOutlined />} placeholder="e.g. restaurant@example.com" />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} sm={8}>
                                    <Form.Item
                                        name="contactPerson"
                                        label="Contact Person"
                                    >
                                        <Input placeholder="e.g. John Smith" />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </TabPane>

                        {/* <TabPane tab="Capacity & Tables" key="capacity">
                            <Row gutter={24}>
                                <Col xs={24} sm={8}>
                                    <Form.Item
                                        name="capacity"
                                        label="Total Capacity (seats)"
                                        rules={[{ required: true, message: 'Please enter capacity' }]}
                                    >
                                        <InputNumber
                                            min={1}
                                            max={1000}
                                            style={{ width: '100%' }}
                                            prefix={<TeamOutlined />}
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} sm={8}>
                                    <Form.Item
                                        name="maximumPartySize"
                                        label="Maximum Party Size"
                                        rules={[{ required: true, message: 'Please enter maximum party size' }]}
                                    >
                                        <InputNumber
                                            min={1}
                                            max={100}
                                            style={{ width: '100%' }}
                                        />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} sm={8}>
                                    <Form.Item
                                        name="minimumPartySize"
                                        label="Minimum Party Size"
                                        initialValue={1}
                                    >
                                        <InputNumber
                                            min={1}
                                            max={10}
                                            style={{ width: '100%' }}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Divider orientation="left">Table Configuration</Divider>

                            <Row gutter={24}>
                                {tableTypes.map((tableType, index) => (
                                    <Col xs={24} sm={12} md={8} key={tableType.value}>
                                        <Card
                                            size="small"
                                            title={`${tableType.label} Tables`}
                                            style={{ marginBottom: 16 }}
                                        >
                                            <Form.Item
                                                name={['tableSetup', index, 'count']}
                                                label="Count"
                                                style={{ marginBottom: 8 }}
                                            >
                                                <InputNumber
                                                    min={0}
                                                    style={{ width: '100%' }}
                                                    addonAfter={<TableOutlined />}
                                                />
                                            </Form.Item>

                                            <Form.Item
                                                name={['tableSetup', index, 'capacity']}
                                                label="Seats per table"
                                            >
                                                <InputNumber
                                                    min={1}
                                                    style={{ width: '100%' }}
                                                    addonAfter={<TeamOutlined />}
                                                />
                                            </Form.Item>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        </TabPane> */}

                        <TabPane tab="Reservations & Settings" key="settings">
                            <Row gutter={24}>
                                <Col xs={24} sm={12} md={8}>
                                    <Form.Item
                                        name="reservationRequired"
                                        label="Reservation Required"
                                        valuePropName="checked"
                                    >
                                        <Switch />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} sm={12} md={8}>
                                    <Form.Item
                                        name="allowsWalkin"
                                        label="Allows Walk-ins"
                                        valuePropName="checked"
                                    >
                                        <Switch />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} sm={12} md={8}>
                                    <Form.Item
                                        name="autoConfirm"
                                        label="Auto-confirm Reservations"
                                        valuePropName="checked"
                                        initialValue={false}
                                    >
                                        <Switch />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={24}>
                                <Col xs={24} sm={8}>
                                    <Form.Item
                                        name="reservationTimeSlot"
                                        label="Default Reservation Duration (minutes)"
                                        initialValue={90}
                                    >
                                        <Select>
                                            <Option value={30}>30 minutes</Option>
                                            <Option value={60}>60 minutes</Option>
                                            <Option value={90}>90 minutes</Option>
                                            <Option value={120}>120 minutes</Option>
                                            <Option value={150}>150 minutes</Option>
                                            <Option value={180}>180 minutes</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>

                                <Col xs={24} sm={8}>
                                    <Form.Item
                                        name="minAdvanceReservation"
                                        label="Min. Advance Reservation (hours)"
                                        initialValue={2}
                                    >
                                        <InputNumber min={0} max={48} style={{ width: '100%' }} />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} sm={8}>
                                    <Form.Item
                                        name="maxAdvanceReservation"
                                        label="Max. Advance Reservation (days)"
                                        initialValue={30}
                                    >
                                        <InputNumber min={1} max={365} style={{ width: '100%' }} />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={24}>
                                <Col xs={24}>
                                    <Form.Item
                                        name="reservationNotes"
                                        label="Default Reservation Notes"
                                    >
                                        <TextArea rows={4} placeholder="Any standard notes for reservations..." />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </TabPane>

                        <TabPane tab="Images & Media" key="media">
                            <Form.Item
                                name="mainImage"
                                label="Main Image"
                                valuePropName="fileList"
                                getValueFromEvent={handleImageUpload}
                            >
                                <Upload
                                    listType="picture-card"
                                    maxCount={1}
                                    onPreview={handlePreview}
                                    beforeUpload={() => false}
                                    accept="image/*"
                                >
                                    <div>
                                        <PlusOutlined />
                                        <div style={{ marginTop: 8 }}>Upload</div>
                                    </div>
                                </Upload>
                            </Form.Item>

                            <Form.Item
                                name="galleryImages"
                                label="Gallery Images"
                                valuePropName="fileList"
                                getValueFromEvent={handleImageUpload}
                            >
                                <Upload
                                    listType="picture-card"
                                    maxCount={5}
                                    multiple
                                    onPreview={handlePreview}
                                    beforeUpload={() => false}
                                    accept="image/*"
                                >
                                    <div>
                                        <PlusOutlined />
                                        <div style={{ marginTop: 8 }}>Upload</div>
                                    </div>
                                </Upload>
                            </Form.Item>

                            <Form.Item
                                name="menuPDF"
                                label="Menu PDF (Optional)"
                                valuePropName="fileList"
                                getValueFromEvent={handleImageUpload}
                            >
                                <Upload
                                    maxCount={1}
                                    beforeUpload={() => false}
                                    accept=".pdf"
                                >
                                    <Button icon={<UploadOutlined />}>Upload Menu PDF</Button>
                                </Upload>
                            </Form.Item>
                        </TabPane>
                    </Tabs>

                    <Divider />

                    <Row justify="end" style={{ marginTop: '20px' }}>
                        <Space>
                            <DiscardButton form={form} />
                            <Button
                                type="primary"
                                onClick={handleSubmit}
                                disabled={!form.getFieldValue('venue_id')}
                            >
                                Submit
                            </Button>
                        </Space>
                    </Row>
                </Form>
            </Card>
        </div>
    );
};

export default AddFields;