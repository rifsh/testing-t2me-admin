import React, { useState } from 'react'
import { Button, Card, DatePicker, Form, Input, Select, Upload, Switch, InputNumber, Divider, Typography, Tabs } from 'antd'
import { SupportImageFormat } from 'constants/SupportFileConstants';
import { UploadOutlined, DeleteOutlined } from "@ant-design/icons";
import ReactQuill from 'react-quill';
import { screenOptions } from 'constants/ScreenConstants';

const { Option } = Select;
const { Title } = Typography;
const { TabPane } = Tabs;

const ScreenForm = ({ form, index, onRemove, isOnlyScreen, screenNumber  }) => {
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

            <Form.Item
                name={['screens', index, 'screen_number']}
                hidden
                initialValue={screenNumber}
            >
                <Input />
            </Form.Item>

            <Form.Item name={['screens', index, 'screen_name']} label="Name" rules={rules.subject}>
                <Input placeholder="Screen name" />
            </Form.Item>

            <Form.Item name={['screens', index, 'screen_type']} label="Screen Type" rules={rules.screen_type}>
                <Select placeholder="Select screen type">
                    {screenOptions.screenTypes.map(screen => (
                        <Option key={screen.value} value={screen.value}>{screen.label}</Option>
                    ))}
                </Select>
            </Form.Item>
            <Form.Item name={['screens', index, 'capacity']} label="Capacity" rules={rules.capacity}>
                <InputNumber min={1} placeholder="Total seats" style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item name={['screens', index, 'description']} label="Description">
                <Input placeholder="Description" />
            </Form.Item>

            <Form.Item name={['screens', index, 'is_active']} label="Active Status" valuePropName="checked" initialValue={true}>
                <Switch defaultChecked />
            </Form.Item>

            <Form.Item name={['screens', index, 'seat_structure_id']} label="Seat Structure">
                <Select placeholder="Select seat structure">
                    {screenOptions.seatStructures.map(({ value, label }) => (
                        <Option key={value} value={value}>{label}</Option>
                    ))}
                </Select>
            </Form.Item>

            <Form.Item name={['screens', index, 'ticket_structure_id']} label="Ticket Structure">
                <Select placeholder="Select ticket structure">
                    {screenOptions.ticketStructures.map(({ value, label }) => (
                        <Option key={value} value={value}>{label}</Option>
                    ))}
                </Select>
            </Form.Item>

            <Form.Item name={['screens', index, 'available_times']} label="Available Times">
                <Select mode="multiple" placeholder="Select available time slots">
                    {screenOptions.availableTimes.map(({ value, label }) => (
                        <Option key={value} value={value}>{label}</Option>
                    ))}
                </Select>
            </Form.Item>

            <Card title="Additional Settings">
                <Form.Item name={['screens', index, 'has_reserved_seating']} label="Reserved Seating" valuePropName="checked">
                    <Switch />
                </Form.Item>

                <Form.Item name={['screens', index, 'accessibility_features']} label="Accessibility Features">
                    <Select mode="multiple" placeholder="Select features">
                        {screenOptions.accessibilityFeatures.map(({ value, label }) => (
                            <Option key={value} value={value}>{label}</Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item name={['screens', index, 'screen_technology']} label="Screen Technology">
                    <Select placeholder="Select technology">
                        {screenOptions.screenTechnologies.map(({ value, label }) => (
                            <Option key={value} value={value}>{label}</Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item name={['screens', index, 'audio_system']} label="Audio System">
                    <Select placeholder="Select audio system">
                        {screenOptions.audioSystems.map(({ value, label }) => (
                            <Option key={value} value={value}>{label}</Option>
                        ))}
                    </Select>
                </Form.Item>
            </Card>

            <Divider />
        </div>
    );
};

export default ScreenForm
