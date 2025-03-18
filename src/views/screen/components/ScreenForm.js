import React, { useEffect, useState } from 'react';
import { Button, Card, Form, Input, Select, Switch, InputNumber, Typography, Row, Col } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { fetchAllTickets } from 'store/slices/ticketSlice';
import { screenOptions } from 'constants/ScreenConstants';
import TicketConfiguration from './TicketConfiguration';
import ScreenTechnology from './ScreenTechnology';

const { Option } = Select;
const { Title } = Typography;

const ScreenForm = ({ form, index, onRemove, isOnlyScreen, screenNumber, venue_id }) => {
    const [message, setMessage] = useState('');
    const dispatch = useDispatch();

    const rules = {
        subject: [{ required: true, message: 'Please enter screen name' }],
        screen_type: [{ required: true, message: 'Please select screen type' }],
        capacity: [{ required: true, message: 'Please enter screen capacity' }],
        thumbnail_image: [{ required: true, message: 'Please choose a screen image' }],
        ticket_structure: [{ required: true, message: 'Please select a ticket structure' }],
        ticket_sets: [{ required: true, message: 'Please select at least one ticket set' }],
    };

    useEffect(() => {
        if (venue_id) {
            dispatch(fetchAllTickets({ venue_id: venue_id }));
        }
    }, [venue_id, dispatch]);

    return (
        <div className="screen-form-container">
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

            <Row gutter={16}>
                <Col xs={24} md={12}>
                    <Form.Item name={['screens', index, 'screen_name']} label="Name" rules={rules.subject}>
                        <Input placeholder="Screen name" />
                    </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                    <Form.Item name={['screens', index, 'screen_type']} label="Screen Type" rules={rules.screen_type}>
                        <Select placeholder="Select screen type">
                            {screenOptions.screenTypes.map((screen) => (
                                <Option key={screen.value} value={screen.value}>{screen.label}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col xs={24} md={12}>
                    <Form.Item name={['screens', index, 'capacity']} label="Capacity" rules={rules.capacity}>
                        <InputNumber min={1} placeholder="Total seats" style={{ width: '100%' }} />
                    </Form.Item>
                </Col>
                {/* <Col xs={24} md={12}>
                    <Form.Item name={['screens', index, 'seat_structure_id']} label="Seat Structure">
                        <Select placeholder="Select seat structure">
                            {screenOptions.seatStructures.map(({ value, label }) => (
                                <Option key={value} value={value}>{label}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Col> */}
            </Row>

            <Form.Item name={['screens', index, 'description']} label="Description">
                <Input.TextArea rows={3} placeholder="Description" />
            </Form.Item>

            <Row gutter={16}>
                <Col xs={24} md={12}>
                    <Form.Item name={['screens', index, 'is_active']} label="Active Status" valuePropName="checked" initialValue={true}>
                        <Switch defaultChecked />
                    </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                    <Form.Item name={['screens', index, 'reserved_seating']} label="Reserved Seating" valuePropName="checked">
                        <Switch />
                    </Form.Item>
                </Col>
            </Row>

            <TicketConfiguration
                form={form}
                index={index}
                rules={rules} />

            <Form.Item name={['screens', index, 'available_times']} label="Available Times">
                <Select mode="multiple" placeholder="Select available time slots">
                    {screenOptions.availableTimes.map(({ value, label }) => (
                        <Option key={value} value={value}>{label}</Option>
                    ))}
                </Select>
            </Form.Item>

            <Card title="Additional Settings" style={{ marginBottom: '20px' }}>
                <Row gutter={16}>
                    <Col xs={24} md={12}>
                        <Form.Item name={['screens', index, 'accessibility']} label="Accessibility Features">
                            <Select mode="multiple" placeholder="Select features">
                                {screenOptions.accessibilityFeatures.map(({ value, label }) => (
                                    <Option key={value} value={value}>{label}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <ScreenTechnology form={form} index={index} />
                    </Col>
                </Row>

                <Form.Item name={['screens', index, 'audio_id']} label="Audio System">
                    <Select placeholder="Select audio system">
                        {screenOptions.audioSystems.map(({ value, label }) => (
                            <Option key={value} value={value}>{label}</Option>
                        ))}
                    </Select>
                </Form.Item>
            </Card>
        </div>
    );
};

export default ScreenForm;