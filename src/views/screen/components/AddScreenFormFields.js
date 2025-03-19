import React, { useState, useEffect } from 'react'
import { Button, Card, Col, Form, Row, Space, Tabs, Alert, Spin, Typography } from 'antd'
import { UploadOutlined, PlusOutlined, DeleteOutlined, InfoCircleOutlined } from "@ant-design/icons";
import DiscardButton from 'components/shared-components/Buttons/DiscardButton';
import PlaceWithCountryForm from 'components/util-components/FormItems/PlaceWithCountryForm';
import VenueListForm from 'components/util-components/FormItems/VenueList';
import { useDispatch, useSelector } from 'react-redux';
import { getVenues, setPlaceValidationDialogVisible, setSelectedVenueList, validateVenue } from 'store/slices/locationSlice';
import { resetTicketSelection } from 'store/slices/ticketSlice';
import { Collapse } from '@mui/material';
import ScreenForm from './ScreenForm';
import { createScreen } from 'store/slices/screenSlice';
import { ActionType } from 'utils/api/warning-submit-util';
import { setSelectedSubmitItem } from 'store/slices/modalSlice';
import { SubmitAndConfirmModal } from 'components/util-components/ModalItems/SubmitConfirmModal';
import { APP_PREFIX_PATH } from 'configs/AppConfig';

const { Title, Text } = Typography;

const AddScreenFormFields = () => {
    const dispatch = useDispatch();
    const [form] = Form.useForm();
    const [screens, setScreens] = useState([{ key: 0 }]);
    const [activeTab, setActiveTab] = useState("0");
    const [isLoading, setIsLoading] = useState(false);
    const [venueSelected, setVenueSelected] = useState(false);

    const { response, loading, error, message, screens: screenResponse } = useSelector((state) => state.screen);
    const { filteredTickets, loading: ticketsLoading } = useSelector((state) => state.tickets);

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
            currentValues.screens[index].screen_number = `screen ${index + 1}`;
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
        setIsLoading(true);
        dispatch(getVenues({ place_id: id, is_indoor: true }));
        form.resetFields([
            "venue_id",
            "screens",
        ]);

        dispatch(resetTicketSelection());
        dispatch(setSelectedVenueList("clear"));
        setScreens([{ key: 0 }]);
        setVenueSelected(false);
        setIsLoading(false);
    }

    const handleVenueSelect = (venue) => {
        setIsLoading(true);
        form.resetFields(["screens"]);
        setScreens([{ key: 0 }]);
        setVenueSelected(!!venue);
        setIsLoading(false);
    }

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            form.validateFields().then(values => {
                const response = dispatch(createScreen({ data: values, action: ActionType.SUBMIT }))
                dispatch(setSelectedSubmitItem(values));
                console.log("Form submitted:", values);
            }).catch(errorInfo => {
                console.log("Validation failed:", errorInfo);
            });
            // const resultAction = dispatch(validateVenue(values.venue_id));

            // if (validateVenue.fulfilled.match(resultAction)) {
            //     const response = resultAction.payload;
            //     if (response.message === "warning") {
            //         dispatch(setPlaceValidationDialogVisible(true));
            //     } else if (response.data && response.data[0]?.validation_status) {
            //         dispatch(setSelectedSubmitItem(values));
            //     }
            // }

        } catch (error) {

        }
    };

    return (
        <Form form={form} layout="vertical">
            <Row gutter={16} align="top">
                <Col xs={24} sm={24} md={24}>
                    <Card
                        title={
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <span>Venue Selection</span>
                                <InfoCircleOutlined style={{ marginLeft: '8px', color: '#8c8c8c' }} />
                            </div>
                        }
                        bordered
                        className="venue-selection-card"
                    >
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

            <div style={{ marginTop: 16 }}>
                <Collapse in={!!form.getFieldValue('venue_id')}>
                    <div>
                        <div style={{ textAlign: 'center', padding: '20px' }}>
                        </div>
                        <>
                            {filteredTickets && filteredTickets.length === 0 && venueSelected && (
                                <Alert
                                    message="No Ticket Structures Available"
                                    description="There are no ticket structures available for this venue. Please configure ticket structures before adding screens."
                                    type="warning"
                                    showIcon
                                    style={{ marginBottom: '16px' }}
                                />
                            )}

                            <Col xs={24} sm={24} md={24}>
                                <Card
                                    title={
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Title level={4}>Screen Information</Title>
                                            <Button
                                                type="primary"
                                                icon={<PlusOutlined />}
                                                onClick={addScreen}
                                                disabled={!venueSelected}
                                            >
                                                Add Screen
                                            </Button>
                                        </div>
                                    }
                                    bordered
                                    className="screen-information-card"
                                >
                                    {!venueSelected ? (
                                        <Alert
                                            message="Venue Required"
                                            description="Please select a venue to configure screens."
                                            type="info"
                                            showIcon
                                        />
                                    ) : (
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
                                                        venue_id={form.getFieldValue('venue_id')}
                                                    />
                                                )
                                            }))}
                                        />
                                    )}
                                </Card>
                            </Col>

                            <Row justify="end" style={{ marginTop: '20px' }}>
                                <Space>
                                    <DiscardButton form={form} />
                                    <Button
                                        type="primary"
                                        onClick={handleSubmit}
                                        disabled={!venueSelected || isLoading}
                                        loading={isLoading}
                                    >
                                        Submit
                                    </Button>
                                </Space>
                            </Row>
                        </>
                    </div>
                </Collapse>
            </div>

            <SubmitAndConfirmModal 
                responseData={screenResponse}
                addFunction={createScreen}
                navigationPath={`${APP_PREFIX_PATH}/screen/list`}
                responseMessage={message}
            />
        </Form>
    )
}

export default AddScreenFormFields;