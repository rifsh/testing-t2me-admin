import React, { useState } from 'react';
import { Form, Typography, Input, Button, Card, Row, Col, Divider, Upload, message, Select, Space } from 'antd';
import {
    HomeOutlined,
    MailOutlined,
    EnvironmentOutlined,
    LayoutOutlined,
    TeamOutlined,
    InboxOutlined,
    PhoneOutlined,
    GlobalOutlined,
    ClockCircleOutlined
} from '@ant-design/icons';
import VenuePlaceSelection from './VenuePlaceSelection';
import { MODE } from 'constants/TextConstant';
import PlaceWithCountryForm from 'components/util-components/FormItems/PlaceWithCountryForm';
import VenueListForm from 'components/util-components/FormItems/VenueList';
import { getSingleVenues, getVenues, setSelectedPlace, setSelectedVenue, setSelectedVenueList } from 'store/slices/locationSlice';
import { resetTicketSelection } from 'store/slices/ticketSlice';
import { useDispatch } from 'react-redux';
import VenueTechnology from 'views/locations/venue/components/VenueTechnology';
import DiscardButton from 'components/shared-components/Buttons/DiscardButton';
import TextEditor from 'components/util-components/FormItems/TextEditor';
import ResizedImgePicker from 'components/util-components/Image/ResizedImgePicker';
import { ThumbnailImageResolutions } from 'constants/SupportFileConstants';

const { Title } = Typography;
const { TextArea } = Input;

const TheaterForm = ({ mode = MODE.ADD }) => {
    const dispatch = useDispatch();
    const [form] = Form.useForm();
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const rules = {
        place: [{ required: true, message: "Please select a place" }],
        venue: [{ required: true, message: "Please select a venue" }],
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const values = await form.validateFields();
            console.log(values)
        } catch (error) {
            console.log(error)
        }
    };

    const normFile = (e) => {
        if (Array.isArray(e)) {
            return e;
        }
        return e?.fileList;
    };

    const handlePlaceSelect = (id) => {
        console.log('place', id);
        dispatch(getVenues({ place_id: id, is_indoor: true }));
        form.resetFields([
            "venue_id",
            "screens",
        ]);
        dispatch(resetTicketSelection());
        dispatch(setSelectedPlace(id));
        dispatch(setSelectedVenueList("clear"));
    }
    const handleVenueSelect = (venue) => {
        dispatch(setSelectedVenue(venue))
        dispatch(getSingleVenues(venue))
    }

    const steps = [
        {
            title: 'Basic Information',
            content: (
                <>
                    <Row gutter={24}>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label="Theater Name"
                                name="name"
                                rules={[{ required: true, message: 'Please input theater name!' }]}
                            >
                                <Input
                                    prefix={<HomeOutlined />}
                                    placeholder="Enter theater name"
                                    size="large"
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label="Theater Type"
                                name="type"
                                rules={[{ required: true, message: 'Please select theater type!' }]}
                            >
                                <Select
                                    placeholder="Select theater type"
                                    size="large"
                                    options={[
                                        { value: 'multiplex', label: 'Multiplex' },
                                        { value: 'imax', label: 'IMAX' },
                                        { value: 'driveIn', label: 'Drive-in' },
                                        { value: 'independent', label: 'Independent' }
                                    ]}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={24}>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label="Contact Email"
                                name="contact"
                                rules={[
                                    { required: true, message: 'Please input contact email!' },
                                    { type: 'email', message: 'Please enter a valid email!' }
                                ]}
                            >
                                <Input
                                    prefix={<MailOutlined />}
                                    placeholder="Enter contact email"
                                    size="large"
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label="Phone Number"
                                name="phone"
                                rules={[{ required: true, message: 'Please input phone number!' }]}
                            >
                                <Input
                                    prefix={<PhoneOutlined />}
                                    placeholder="Enter phone number"
                                    size="large"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        label="Description"
                        name="description"
                    >
                        <TextArea
                            placeholder="Enter theater description, amenities, etc."
                            rows={4}
                        />
                    </Form.Item>

                    <Form.Item
                        label="Website"
                        name="website"
                    >
                        <Input
                            prefix={<GlobalOutlined />}
                            placeholder="Enter theater website URL"
                            size="large"
                        />
                    </Form.Item>
                </>
            ),
        },
        {
            title: 'Location & Capacity',
            content: (
                <>
                    <Row gutter={24}>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label="Address Line 1"
                                name="addressLine1"
                                rules={[{ required: true, message: 'Please input address!' }]}
                            >
                                <Input
                                    prefix={<EnvironmentOutlined />}
                                    placeholder="Enter street address"
                                    size="large"
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label="Address Line 2"
                                name="addressLine2"
                            >
                                <Input
                                    placeholder="Apt, Suite, Building (optional)"
                                    size="large"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={24}>
                        <Col xs={24} md={8}>
                            <Form.Item
                                label="City"
                                name="city"
                                rules={[{ required: true, message: 'Please input city!' }]}
                            >
                                <Input placeholder="Enter city" size="large" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item
                                label="State/Province"
                                name="state"
                                rules={[{ required: true, message: 'Please input state!' }]}
                            >
                                <Input placeholder="Enter state" size="large" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item
                                label="Zip/Postal Code"
                                name="zipCode"
                                rules={[{ required: true, message: 'Please input zip code!' }]}
                            >
                                <Input placeholder="Enter zip code" size="large" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={24}>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label="Number of Screens"
                                name="screens"
                                rules={[{ required: true, message: 'Please input number of screens!' }]}
                            >
                                <Input
                                    prefix={<LayoutOutlined />}
                                    type="number"
                                    min={1}
                                    placeholder="Enter number of screens"
                                    size="large"
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label="Total Capacity"
                                name="capacity"
                                rules={[{ required: true, message: 'Please input total capacity!' }]}
                            >
                                <Input
                                    prefix={<TeamOutlined />}
                                    type="number"
                                    min={1}
                                    placeholder="Enter total capacity"
                                    size="large"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        label="Operating Hours"
                        name="hours"
                    >
                        <Input
                            prefix={<ClockCircleOutlined />}
                            placeholder="e.g., Mon-Fri: 10AM-10PM, Sat-Sun: 9AM-11PM"
                            size="large"
                        />
                    </Form.Item>
                </>
            ),
        },
        {
            title: 'Media & Map',
            content: (
                <>
                    <Form.Item
                        label="Theater Images"
                        name="images"
                        valuePropName="fileList"
                        getValueFromEvent={normFile}
                    >
                        <Upload.Dragger
                            name="files"
                            action="/upload.do"
                            listType="picture-card"
                            multiple
                            maxCount={5}
                            beforeUpload={() => false} // Prevent auto upload
                        >
                            <p className="ant-upload-drag-icon">
                                <InboxOutlined />
                            </p>
                            <p className="ant-upload-text">Click or drag images to this area to upload</p>
                            <p className="ant-upload-hint">
                                Support for jpeg, png, jpg up to 10MB each. Maximum 5 images.
                            </p>
                        </Upload.Dragger>
                    </Form.Item>

                    <Title level={4} style={{ marginTop: 24 }}>Theater Location</Title>
                    <Card
                        title="Select Theater Location"
                        style={{ marginBottom: 24 }}
                    >
                        <VenuePlaceSelection />
                    </Card>
                </>
            ),
        },
    ];

    return (
        <Card
            bordered={false}
            style={{
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
            }}
        >
            <div style={{ padding: '0 12px' }}>
                <Title level={3}>
                    {mode === MODE.ADD ? "Add New Theater" : "Edit Theater Details"}
                </Title>

                <Form
                    layout="vertical"
                    form={form}
                    name="theaterForm"
                    initialValues={{
                        screens: 1,
                        capacity: 100,
                    }}
                >

                    <Card>
                        <Row gutter={16}>
                            <Col xs={24} sm={12}>
                                <PlaceWithCountryForm
                                    form={form}
                                    label="Choose a Place"
                                    onSelect={handlePlaceSelect}
                                    rules={rules.place}
                                />
                            </Col>
                            <Col xs={24} sm={12}>
                                <VenueListForm
                                    form={form}
                                    mode={"single"}
                                    label="Venue"
                                    rules={rules.venue}
                                    onSelect={(value) => handleVenueSelect(value)}
                                />
                            </Col>
                        </Row>
                    </Card>

                    <Card>
                        <>
                            <Row gutter={24}>
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        label="Theater Name"
                                        name="name"
                                        rules={[{ required: true, message: 'Please input theater name!' }]}
                                    >
                                        <Input
                                            prefix={<HomeOutlined />}
                                            placeholder="Enter theater name"
                                            size="large"
                                        />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        label="Phone Number"
                                        name="phone_number "
                                        rules={[{ required: true, message: 'Please input phone number!' }]}
                                    >
                                        <Input
                                            prefix={<PhoneOutlined />}
                                            placeholder="Enter phone number"
                                            size="large"
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={24}>
                                <Col xs={24} md={24}>
                                    <Form.Item
                                        label="Website"
                                        name="website"
                                    >
                                        <Input
                                            prefix={<GlobalOutlined />}
                                            placeholder="Enter theater website URL"
                                            size="large"
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={24}>
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        label="Number of Screens"
                                        name="number_of_screens "
                                        rules={[{ required: true, message: 'Please input number of screens!' }]}
                                    >
                                        <Input
                                            prefix={<LayoutOutlined />}
                                            type="number"
                                            min={1}
                                            placeholder="Enter number of screens"
                                            size="large"
                                        />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        label="Total Capacity"
                                        name="capacity"
                                        rules={[{ required: true, message: 'Please input total capacity!' }]}
                                    >
                                        <Input
                                            prefix={<TeamOutlined />}
                                            type="number"
                                            min={1}
                                            placeholder="Enter total capacity"
                                            size="large"
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row>
                                <Col xs={24} md={24}>
                                    <Card>
                                        <h4>Theater Technology & Features</h4>
                                        <VenueTechnology
                                            form={form}
                                        />
                                    </Card>
                                </Col>
                            </Row>

                            <Form.Item
                                label="Description"
                                name="description"
                            >
                                <TextEditor />
                            </Form.Item>

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
                        </>
                    </Card>
                    <Divider />

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
            </div>
        </Card>
    );
};

export default TheaterForm;