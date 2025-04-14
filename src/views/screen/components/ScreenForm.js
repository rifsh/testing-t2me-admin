import React, { useEffect, useState } from 'react';
import { Button, Card, Form, Input, Select, Switch, InputNumber, Typography, Row, Col, Alert } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllTickets } from 'store/slices/ticketSlice';
import { screenOptions } from 'constants/ScreenConstants';
import { fetchScreenAudio, fetchScreenFeatures, fetchScreenTech, setAvailableSeat } from 'store/slices/screenSlice';
import TextEditor from 'components/util-components/FormItems/TextEditor';

const { Option } = Select;
const { Title } = Typography;

const ScreenForm = ({ form, index, onRemove, isOnlyScreen, screenNumber, venue_id, capacity }) => {
    const [message, setMessage] = useState('');
    const dispatch = useDispatch();
    const { screenTechnologies, screenAudioTechnologies, screenFeatures, techLoading, availableSeats } = useSelector((state) => state.screen);
    const { selectedTheaterId } = useSelector((state) => state.theater);

    const rules = {
        subject: [{ required: true, message: 'Please enter screen name' }],
        screen_type: [{ required: true, message: 'Please select screen type' }],
        capacity: [
            { required: true, message: 'Please enter screen capacity' },
            {
                validator: (_, value) => {
                    const currentScreens = form.getFieldValue('screens') || [];
                    const totalScreenCapacity = currentScreens.reduce((total, screen, screenIndex) => {
                        if (screenIndex === index) return total;

                        return total + (screen?.capacity || 0);
                    }, 0);
                    console.log('capacitylog', totalScreenCapacity)

                    const proposedTotalCapacity = totalScreenCapacity + (value || 0);

                    if (value && proposedTotalCapacity > availableSeats) {
                        return Promise.reject(`Total screen capacities (${proposedTotalCapacity}) cannot exceed venue capacity of ${availableSeats}`);
                    }

                    if (value && value > availableSeats) {
                        return Promise.reject(`Screen capacity cannot exceed venue capacity of ${availableSeats}`);
                    }

                    return Promise.resolve();
                }
            }
        ],
        thumbnail_image: [{ required: true, message: 'Please choose a screen image' }],
        ticket_structure: [{ required: true, message: 'Please select a ticket structure' }],
        ticket_sets: [{ required: true, message: 'Please select at least one ticket set' }],
        accessibility: [{ required: true, message: 'Please select at least one Accessibility feature' }],
        screen_technology_id: [{ required: true, message: 'Please select at least one Screen technology' }],
        audio_id: [{ required: true, message: 'Please select at least one Audio technology' }],
    };

    const [dataStatus, setDataStatus] = useState({
        technologiesEmpty: false,
        audioEmpty: false,
        featuresEmpty: false
    });

    useEffect(() => {
        if (selectedTheaterId) {
            dispatch(fetchAllTickets({ theatre_id: selectedTheaterId }));
            dispatch(fetchScreenTech({ theatre_id: selectedTheaterId }));
            dispatch(fetchScreenAudio({ theatre_id: selectedTheaterId }));
            dispatch(fetchScreenFeatures({ theatre_id: selectedTheaterId }));
            dispatch(setAvailableSeat(capacity));
        }
    }, [selectedTheaterId, dispatch, capacity]);

    useEffect(() => {
        setDataStatus({
            technologiesEmpty: !techLoading && (!screenTechnologies || screenTechnologies.length === 0),
            audioEmpty: !techLoading && (!screenAudioTechnologies || screenAudioTechnologies.length === 0),
            featuresEmpty: !techLoading && (!screenFeatures || screenFeatures.length === 0)
        });
    }, [screenTechnologies, screenAudioTechnologies, screenFeatures, techLoading]);

    const showAlert = dataStatus.technologiesEmpty || dataStatus.audioEmpty || dataStatus.featuresEmpty;
    const generateAlertMessage = () => {
        const missingData = [];
        if (dataStatus.technologiesEmpty) missingData.push('Screen Technologies');
        if (dataStatus.audioEmpty) missingData.push('Audio Technologies');
        if (dataStatus.featuresEmpty) missingData.push('Screen Features');

        return `No data available for: ${missingData.join(', ')}. Please add data before proceeding.`;
    };

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

            {showAlert && !techLoading && (
                <Alert
                    message="Missing Data"
                    description={generateAlertMessage()}
                    type="warning"
                    showIcon
                    style={{ marginBottom: '16px' }}
                />
            )}

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
                    <Form.Item
                        name={['screens', index, 'capacity']}
                        label="Capacity"
                        rules={rules.capacity}
                        tooltip={`Maximum available capacity: ${availableSeats}`}
                    >
                        <InputNumber
                            min={1}
                            max={availableSeats}
                            placeholder={`Total venue capacity: ${availableSeats}`}
                            style={{ width: '100%' }}
                        />
                    </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                    <Form.Item name={['screens', index, 'seat_structure_id']} label="Seat Structure">
                        <Select placeholder="Select seat structure">
                            {screenOptions.seatStructures.map(({ value, label }) => (
                                <Option key={value} value={value}>{label}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Col>
            </Row>

            <Form.Item
                name={['screens', index, 'description']}
                label="Description"
            >
                <TextEditor />
            </Form.Item>

            <Row gutter={16}>
                <Col xs={24} md={12}>
                    <Form.Item
                        name={['screens', index, 'reserved_seating']}
                        label="Reserved Seating"
                        valuePropName="checked"
                        initialValue={true}
                        normalize={(value) => value || false}
                    >
                        <Switch />
                    </Form.Item>
                </Col>
            </Row>

            {/* <TicketConfiguration
                form={form}
                index={index}
                rules={rules} /> */}

            <Form.Item name={['screens', index, 'time_slots']} label="Available Times">
                <Select mode="multiple" placeholder="Select available time slots">
                    {screenOptions.availableTimes.map(({ value, label }) => (
                        <Option key={value} value={label}>{label}</Option>
                    ))}
                </Select>
            </Form.Item>

            <Card title="Additional Settings" style={{ marginBottom: '20px' }}>
                <Row gutter={16}>
                    <Col xs={24} md={12}>
                        <Form.Item name={['screens', index, 'accessibility']} label="Accessibility Features" rules={rules.accessibility}>
                            <Select mode="multiple" placeholder="Select features">
                                {screenFeatures.map((value) => (
                                    <Option key={value.id} value={value.id}>{value.name}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item name={['screens', index, 'screen_technology_id']} label="Screen Technology" rules={rules.screen_technology_id}>
                            <Select placeholder="Select technology">
                                {screenTechnologies.map((value) => (
                                    <Option key={value?.id} value={value?.id}>{value?.name}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item name={['screens', index, 'audio_id']} label="Audio System" rules={rules.audio_id}>
                    <Select placeholder="Select audio system">
                        {screenAudioTechnologies.map((value) => (
                            <Option key={value.id} value={value.id}>{value.name}</Option>
                        ))}
                    </Select>
                </Form.Item>
            </Card>
        </div>
    );
};

export default ScreenForm;