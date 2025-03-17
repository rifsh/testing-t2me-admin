import React, { useState, useEffect } from 'react'
import { Button, Card, Col, Form, Row, Space, Tabs } from 'antd'
import { SupportImageFormat } from 'constants/SupportFileConstants';
import { UploadOutlined, PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import DiscardButton from 'components/shared-components/Buttons/DiscardButton';
import ReactQuill from 'react-quill';
import PlaceWithCountryForm from 'components/util-components/FormItems/PlaceWithCountryForm';
import VenueListForm from 'components/util-components/FormItems/VenueList';
import { useDispatch } from 'react-redux';
import { getVenues, setSelectedVenueList } from 'store/slices/locationSlice';
import { resetTicketSelection } from 'store/slices/ticketSlice';
import ScreenForm from './ScreenForm';
import { Collapse } from '@mui/material';

const AddScreenFormFields = () => {
    const dispatch = useDispatch();
    const [form] = Form.useForm();
    const [screens, setScreens] = useState([{ key: 0 }]);
    const [activeTab, setActiveTab] = useState("0");
    const rules = {
        place: [{ required: true, message: "Please select a place" }],
        venue: [{ required: true, message: "Please select a venue" }],
    };

    useEffect(() => {
        const currentValues = form.getFieldsValue();
        if (!currentValues.screens) {
            currentValues.screens = [];
        }

        screens.forEach((screen, index) => {
            if (!currentValues.screens[index]) {
                currentValues.screens[index] = {};
            }
            currentValues.screens[index].screen_number = index + 1;
        });

        form.setFieldsValue(currentValues);
    }, [screens, form]);

    const addScreen = () => {
        const newScreens = [...screens, { key: screens.length }];
        setScreens(newScreens);
        setActiveTab(String(screens.length));
    };

    const removeScreen = (index) => {
        if (screens.length > 1) {
            const newScreens = screens.filter((_, i) => i !== index);
            setScreens(newScreens);
            const values = form.getFieldsValue();
            const updatedScreens = values.screens.filter((_, i) => i !== index);
            form.setFieldsValue({ screens: updatedScreens });
            if (Number(activeTab) === index) {
                setActiveTab("0");
            } else if (Number(activeTab) > index) {
                setActiveTab(String(Number(activeTab) - 1));
            }
        }
    };

    const handlePlaceSelect = (id) => {
        dispatch(getVenues({ place_id: id, is_indoor: true }));
        form.resetFields([
            "venue_id",
            "screens",
        ]);

        dispatch(resetTicketSelection());
        dispatch(setSelectedVenueList("clear"));
        setScreens([{ key: 0 }]);
    }

    const handleVenueSelect = (venue) => {
        form.resetFields(["screens"]);
        setScreens([{ key: 0 }]);
        console.log(form.getFieldValue('venue_id'));
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        form.validateFields().then(values => {
            console.log("Form submitted:", values);
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
            </Row>

            <>
                <Collapse in={form.getFieldValue('venue_id')}>
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
                                            screenNumber={index + 1}
                                        />
                                    )
                                }))}
                            />
                        </Card>
                    </Col>

                    <Row justify="end" style={{ marginTop: '20px' }}>
                        <Space>
                            <DiscardButton form={form} />
                            <Button type="primary" onClick={handleSubmit}>
                                Submit
                            </Button>
                        </Space>
                    </Row>
                </Collapse>
            </>
        </Form>
    )
}

export default AddScreenFormFields