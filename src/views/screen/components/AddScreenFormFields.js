import React, { useState, useEffect } from 'react'
import { Button, Card, Col, DatePicker, Form, Input, Row, Select, Upload, Switch, InputNumber, Space, Divider, Typography, Tabs } from 'antd'
import { SupportImageFormat } from 'constants/SupportFileConstants';
import { UploadOutlined, PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import DiscardButton from 'components/shared-components/Buttons/DiscardButton';
import ReactQuill from 'react-quill';
import PlaceWithCountryForm from 'components/util-components/FormItems/PlaceWithCountryForm';
import VenueListForm from 'components/util-components/FormItems/VenueList';
import { useDispatch } from 'react-redux';
import { getVenues, setSelectedVenueList } from 'store/slices/locationSlice';
import { resetTicketSelection } from 'store/slices/ticketSlice';

const { Option } = Select;
const { Title } = Typography;
const { TabPane } = Tabs;

const ScreenForm = ({ form, index, onRemove, isOnlyScreen }) => {
    const [message, setMessage] = useState("");
    const rules = {
        subject: [{ required: true, message: "Please enter screen name" }],
        screen_type: [{ required: true, message: "Please select screen type" }],
        capacity: [{ required: true, message: "Please enter screen capacity" }],
        thumbnail_image: [{ required: true, message: "Please choose a screen image" }],
    };

    const normFile = (e) => {
        if (Array.isArray(e)) {
            return e;
        }
        return e?.fileList;
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <Title level={5}>Screen {index + 1}</Title>
                {!isOnlyScreen && (
                    <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => onRemove(index)}
                    >
                        Remove
                    </Button>
                )}
            </div>

            <Form.Item name={['screens', index, 'screen_name']} label="Name" rules={rules.subject}>
                <Input placeholder="Screen name" />
            </Form.Item>

            <Form.Item name={['screens', index, 'screen_type']} label="Screen Type" rules={rules.screen_type}>
                <Select placeholder="Select screen type">
                    <Option value="standard">Standard</Option>
                    <Option value="imax">IMAX</Option>
                    <Option value="vip">VIP</Option>
                    <Option value="4dx">4DX</Option>
                    <Option value="3d">3D</Option>
                </Select>
            </Form.Item>

            <Form.Item name={['screens', index, 'capacity']} label="Capacity" rules={rules.capacity}>
                <InputNumber min={1} placeholder="Total seats" style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item name={['screens', index, 'description']} label="Description">
                <ReactQuill
                    theme="snow"
                    onChange={(value) => {
                        const values = form.getFieldsValue();
                        const screens = values.screens || [];
                        screens[index] = { ...screens[index], description: value };
                        form.setFieldsValue({ screens });
                    }}
                />
            </Form.Item>

            <Form.Item name={['screens', index, 'is_active']} label="Active Status" valuePropName="checked" initialValue={true}>
                <Switch defaultChecked />
            </Form.Item>

            <Form.Item
                name={['screens', index, 'thumbnail_image']}
                label="Screen Image"
                valuePropName="fileList"
                getValueFromEvent={normFile}
                rules={rules.thumbnail_image}
            >
                <Upload
                    accept={SupportImageFormat}
                    listType="picture-card"
                    beforeUpload={() => false}
                    maxCount={1}
                >
                    <div>
                        <UploadOutlined />
                        <div style={{ marginTop: 8 }}>Upload</div>
                    </div>
                </Upload>
            </Form.Item>

            <Form.Item name={['screens', index, 'seat_structure_id']} label="Seat Structure">
                <Select placeholder="Select seat structure">
                    <Option value="1">Default Structure</Option>
                    <Option value="2">Custom Structure 1</Option>
                    <Option value="3">Custom Structure 2</Option>
                </Select>
            </Form.Item>

            <Form.Item name={['screens', index, 'ticket_structure_id']} label="Ticket Structure">
                <Select placeholder="Select ticket structure">
                    <Option value="1">Default Pricing</Option>
                    <Option value="2">Weekend Pricing</Option>
                    <Option value="3">Holiday Pricing</Option>
                </Select>
            </Form.Item>

            <Form.Item name={['screens', index, 'available_times']} label="Available Times">
                <Select mode="multiple" placeholder="Select available time slots">
                    <Option value="morning">Morning</Option>
                    <Option value="afternoon">Afternoon</Option>
                    <Option value="evening">Evening</Option>
                    <Option value="night">Night</Option>
                </Select>
            </Form.Item>

            <Card title="Additional Settings">
                <Form.Item name={['screens', index, 'has_reserved_seating']} label="Reserved Seating" valuePropName="checked">
                    <Switch />
                </Form.Item>

                <Form.Item name={['screens', index, 'accessibility_features']} label="Accessibility Features">
                    <Select mode="multiple" placeholder="Select features">
                        <Option value="wheelchair">Wheelchair Access</Option>
                        <Option value="hearing_loop">Hearing Loop</Option>
                        <Option value="audio_description">Audio Description</Option>
                    </Select>
                </Form.Item>

                <Form.Item name={['screens', index, 'screen_technology']} label="Screen Technology">
                    <Select placeholder="Select technology">
                        <Option value="digital">Digital</Option>
                        <Option value="laser">Laser Projection</Option>
                        <Option value="dolby">Dolby Vision</Option>
                    </Select>
                </Form.Item>

                <Form.Item name={['screens', index, 'audio_system']} label="Audio System">
                    <Select placeholder="Select audio system">
                        <Option value="standard">Standard</Option>
                        <Option value="dolby_atmos">Dolby Atmos</Option>
                        <Option value="dts">DTS-X</Option>
                    </Select>
                </Form.Item>

                <Form.Item name={['screens', index, 'maintenance_schedule']} label="Maintenance Schedule">
                    <DatePicker.RangePicker style={{ width: '100%' }} />
                </Form.Item>
            </Card>

            <Divider />
        </div>
    );
};

const AddScreenFormFields = () => {
    const dispatch = useDispatch();
    const [form] = Form.useForm();
    const [screens, setScreens] = useState([{ key: 0 }]);
    const [activeTab, setActiveTab] = useState("0");
    const rules = {
        place: [{ required: true, message: "Please select a place" }],
        venue: [{ required: true, message: "Please select a venue" }],
    };

    const addScreen = () => {
        const newScreens = [...screens, { key: screens.length }];
        setScreens(newScreens);
        setActiveTab(String(screens.length));
    };

    const removeScreen = (index) => {
        if (screens.length > 1) {
            const newScreens = screens.filter((_, i) => i !== index);
            setScreens(newScreens);

            // Update form values to remove the deleted screen
            const values = form.getFieldsValue();
            const updatedScreens = values.screens.filter((_, i) => i !== index);
            form.setFieldsValue({ screens: updatedScreens });

            // Set active tab to the first one if the active tab is removed
            if (Number(activeTab) === index) {
                setActiveTab("0");
            } else if (Number(activeTab) > index) {
                setActiveTab(String(Number(activeTab) - 1));
            }
        }
    };

    const handlePlaceSelect = (id) => {
        dispatch(getVenues({ place_id: id }));
        form.resetFields([
            "venue_id",
            "screens",
        ]);

        dispatch(resetTicketSelection());
        dispatch(setSelectedVenueList("clear"));
        setScreens([{ key: 0 }]);
    }

    const handleVenueSelect = (venue) => {
        // Reset screens when venue changes
        form.resetFields(["screens"]);
        setScreens([{ key: 0 }]);
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        form.validateFields().then(values => {
            console.log("Form submitted:", values);
            // Handle form submission
        }).catch(errorInfo => {
            console.log("Validation failed:", errorInfo);
        });
    };

    return (
        <Form form={form} layout="vertical">
            <Row gutter={16} align="top">
                <Col xs={24} sm={24} md={24}>
                    <Card title="Venue Selection">
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
                </Col>

                <Col xs={24} sm={24} md={24} style={{ marginTop: 16 }}>
                    <Card
                        title="Screen Information"
                        extra={
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={addScreen}
                            >
                                Add Screen
                            </Button>
                        }
                    >
                        <Tabs
                            activeKey={activeTab}
                            onChange={setActiveTab}
                            type="card"
                            items={screens.map((screen, index) => ({
                                label: `Screen ${index + 1}`,
                                key: String(index),
                                children: (
                                    <ScreenForm
                                        form={form}
                                        index={index}
                                        onRemove={removeScreen}
                                        isOnlyScreen={screens.length === 1}
                                    />
                                )
                            }))}
                        />
                    </Card>
                </Col>
            </Row>

            <Row justify="end" style={{ marginTop: '20px' }}>
                <Space>
                    <DiscardButton form={form} />
                    <Button type="primary" onClick={handleSubmit}>
                        Submit
                    </Button>
                </Space>
            </Row>
        </Form>
    )
}

export default AddScreenFormFields