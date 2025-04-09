import React, { useState } from 'react';
import { Form, Typography, Input, Button, Card, Row, Col, Divider,Space } from 'antd';
import {
    HomeOutlined,
    LayoutOutlined,
    TeamOutlined,
    PhoneOutlined,
    GlobalOutlined,
} from '@ant-design/icons';
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

const TheaterForm = ({ mode = MODE.ADD }) => {
    const dispatch = useDispatch();
    const [form] = Form.useForm();
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

    return (
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
    );
};

export default TheaterForm;