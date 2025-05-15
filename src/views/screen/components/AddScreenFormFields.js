import React, { useState, useEffect } from 'react'
import { Button, Card, Col, Form, Row, Space, Tabs, Alert, Typography, message } from 'antd'
import { PlusOutlined, InfoCircleOutlined } from "@ant-design/icons";
import DiscardButton from 'components/shared-components/Buttons/DiscardButton';
import PlaceWithCountryForm from 'components/util-components/FormItems/PlaceWithCountryForm';
import VenueListForm from 'components/util-components/FormItems/VenueList';
import { useDispatch, useSelector } from 'react-redux';
import { getSingleVenues, getVenues, setLocationDialogVisible, setLocationModalLoading, setPlaceValidationDialogVisible, setSelectedPlace, setSelectedVenue, setSelectedVenueList, validatePlace, validateVenue } from 'store/slices/locationSlice';
import { resetTicketSelection } from 'store/slices/ticketSlice';
import { Collapse } from '@mui/material';
import ScreenForm from './ScreenForm';
import { createScreen, editScreen, fetchScreenById, setScreenEditData } from 'store/slices/screenSlice';
import { setSelectedSubmitItem } from 'store/slices/modalSlice';
import { SubmitAndConfirmModal } from 'components/util-components/ModalItems/SubmitConfirmModal';
import { APP_PREFIX_PATH } from 'configs/AppConfig';
import LoadingOverlay from 'components/util-components/Loader';
import WarningModal from 'components/util-components/ModalItems/WarningModal';
import { ActionType } from 'utils/api/warning-submit-util';
import TheaterListForm from 'components/util-components/FormItems/TheaterListForm';
import { setCleraAllData, setScreenCapacity, setSeectedTheater } from 'store/slices/theaterSlice';

const { Title, Text } = Typography;

const AddScreenFormFields = ({ mode, screenId }) => {
    const dispatch = useDispatch();
    const [form] = Form.useForm();
    const [screens, setScreens] = useState([{ key: 0 }]);
    const [activeTab, setActiveTab] = useState("0");
    const [isLoading, setIsLoading] = useState(false);
    const [venueSelected, setVenueSelected] = useState(false);
    const [placeSelected, setPlaceSelected] = useState(false);
    const [venueId, setVenueId] = useState(null);
    const [capacity, setCapacity] = useState(null);

    const { response, singleResponse, message: screenMessage, loading, editResponse, editBodyData } = useSelector((state) => state.screen);
    const { dialogVisible, selectedVenue } = useSelector((state) => state.locations);
    const { selectedTheaterId, singleResponse: singleTheaterResponse, selectedTheaterScreenCapacity } = useSelector((state) => state.theater);

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
        if (mode === 'EDIT') {
            dispatch(fetchScreenById({ screen_id: screenId }));
        }
    }, [screens, form, dispatch, response, mode, screenId]);

    useEffect(() => {
        if (singleResponse) {
            setSelectedVenue(true);
            if (mode === 'EDIT') {
                dispatch(getVenues({ place_id: singleResponse?.theatre?.place?.id }))
                dispatch(setSelectedVenue(singleResponse?.theatre?.venue?.id))
                dispatch(setSeectedTheater(singleResponse?.theatre?.id))
                const formValues = {
                    place: singleResponse.theatre.place.name || undefined,
                    place_id: singleResponse.theatre.place.id || undefined,
                    venue_id: singleResponse?.theatre?.venue.id || undefined,
                    theatre_id: singleResponse?.theatre?.name || undefined,
                    screens: [{
                        screen_name: singleResponse?.screen_name || '',
                        screen_number: singleResponse?.screen_number || '',
                        screen_type: singleResponse?.screen_type || '',
                        capacity: singleResponse?.capacity || '',
                        description: singleResponse?.description || '',
                        reserved_seating: singleResponse?.reserved_seating,
                        time_slots: singleResponse?.time_slots || [],
                        accessibility: singleResponse.accessibilty.map((values) => values.id) || [],
                        screen_technology_id: singleResponse?.screen_technology?.id,
                        audio_id: singleResponse?.audio.id,
                    }]
                };

                form.setFieldsValue(formValues);

                setTimeout(() => {
                    form.validateFields(['place', 'venue_id']);
                }, 0);
            }
        }
        return () => {
            dispatch(setCleraAllData())
        }
    }, [singleResponse, form, placeSelected === false]);

    useEffect(() => {
        if (singleTheaterResponse) {
            setCapacity(singleTheaterResponse?.capacity);
            dispatch(setScreenCapacity(singleTheaterResponse?.number_of_screens));
        }
    }, [singleTheaterResponse])

    const addScreen = () => {
        console.log('singlesss', screens.length + 1);
        if (screens.length + 1 > selectedTheaterScreenCapacity) {
            return message.info('Maximum screen capacity exceeded');
        }
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
            "theatre_id",
            "screens",
        ]);
        setPlaceSelected(true);
        dispatch(setCleraAllData());
        dispatch(resetTicketSelection());
        dispatch(setSelectedPlace(id));
        dispatch(setSelectedVenueList("clear"));
        setScreens([{ key: 0 }]);
        setVenueSelected(false);
        setIsLoading(false);
    }

    const handleVenueSelect = (venue) => {
        form.setFieldValue("theatre_id", undefined);
        setIsLoading(true);
        setVenueSelected(!!venue);
        setVenueId(venue);
        dispatch(setSelectedVenue(venue))
        dispatch(getSingleVenues(venue))
        dispatch(setCleraAllData())
        setIsLoading(false);
    }

    const handleTheaterSelect = (theater) => {
        setScreens([{ key: 0 }]);
        setActiveTab("0");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const values = await form.validateFields();
            if (mode === "ADD") {
                const data = {
                    ...values,
                    theatre_id: selectedTheaterId
                }
                const resultAction = await dispatch(validateVenue(values.venue_id));
                if (validateVenue.fulfilled.match(resultAction)) {
                    const response = resultAction.payload;
                    if (response.message === "warning") {
                        dispatch(setPlaceValidationDialogVisible(true));
                    } else if (response.data && response.data[0]?.validation_status) {
                        dispatch(setSelectedSubmitItem(data));
                    }
                } else if (validatePlace.rejected.match(resultAction)) {
                    const error = resultAction.error;
                    if (error.message) {
                        message.error(error.message);
                    }
                }
            } else {
                const data = {
                    ...values,
                    id: singleResponse?.id,
                    venue_id: selectedVenue
                }
                const [screens] = data.screens
                const updatedScreen = {
                    ...screens,
                    venue_id: selectedVenue,
                    id: singleResponse?.id,
                    theatre_id: selectedTheaterId?.value,
                };
                dispatch(setScreenEditData(updatedScreen))
                const resultAction = await dispatch(validateVenue(selectedVenue));
                if (validateVenue.fulfilled.match(resultAction)) {
                    const response = resultAction.payload;
                    if (response.message === "warning") {
                        dispatch(setPlaceValidationDialogVisible(true));
                    } else if (response.data && response.data[0]?.validation_status) {
                        const editResult = await dispatch(editScreen({ data: updatedScreen, action: ActionType.WARNING }))

                        if (editScreen.fulfilled.match(editResult)) {
                            dispatch(setScreenEditData(updatedScreen));
                            dispatch(setLocationDialogVisible(true));
                        } else if (editScreen.rejected.match(editResult)) {
                            const error = editResult.error;
                            if (error.message) {
                                message.error(error.message);
                            }
                        }
                    }
                } else if (validatePlace.rejected.match(resultAction)) {
                    const error = resultAction.error;
                    if (error.message) {
                        message.error(error.message);
                    }
                }
            }

        } catch (errorInfo) {
            if (errorInfo.errorFields) {
                message.error("Please fill all the required fields.");
                errorInfo.errorFields.forEach((field) => {
                    console.log(`Field Error: ${field.name.join(".")} - ${field.errors.join(", ")}`);
                });
            } else {
                message.error("An unexpected error occurred. Please try again.");
            }
        }
    };

    const handleModalSubmit = async () => {
        dispatch(setLocationModalLoading(true));
        const resultAction = await dispatch(
            editScreen({ data: editBodyData, action: ActionType.SUBMIT })
        );
        dispatch(setLocationModalLoading(false));
        dispatch(setLocationDialogVisible(false));
        if (editScreen.fulfilled?.match(resultAction)) {
            dispatch(setSelectedSubmitItem(editBodyData));
        }
    };

    const handleModalCancel = () => {
        dispatch(setLocationDialogVisible(false));
    };

    return (
        <Form form={form} layout="vertical">
            <Row gutter={16} align="top">
                <Col xs={24} sm={24} md={24}>
                    <Card
                        title={
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                {mode === "ADD" ? (
                                    <span>Venue Selection</span>
                                ) : (
                                    <span>Selected loaction</span>
                                )}
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
                            <Col span={24}>
                                <TheaterListForm
                                    disabled={!venueSelected}
                                    form={form}
                                    onSelect={handleTheaterSelect}
                                />
                                {/* {theaterResponse && <GenericDropdown
                                    name="theater_id"
                                    label="Theater"
                                    mode="single"
                                    rules={[{ required: true, message: 'Please select languages!' }]}
                                    fetchOptions={fetchDropdownTheaters}
                                    optionsData={theaterResponse?.items}
                                    loading={theatterLoading}
                                    optionLabelKey="name"
                                    optionExtraLabel=""
                                    optionValueKey="id"
                                    searchParamKey="search"
                                    form={form}
                                />} */}
                            </Col>
                        </Row>
                    </Card>
                </Col>
            </Row>

            <>
                {!selectedTheaterId && mode === 'ADD' &&
                    < Alert
                        message="Theater Required"
                        description="Please select a theater to configure screens."
                        type="info"
                        showIcon
                    />}
            </>

            <div style={{ marginTop: 16 }}>
                <Collapse in={!!selectedTheaterId}>
                    <div>
                        <div style={{ textAlign: 'center', padding: '20px' }}>
                        </div>
                        <>

                            <Col xs={24} sm={24} md={24}>
                                <Card
                                    title={
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Title level={4}>
                                                Screen Information{" "}
                                                <Text type="secondary" strong>
                                                    (Maximum <Text type="danger">{`${selectedTheaterScreenCapacity} Screens`}</Text>)
                                                </Text>
                                            </Title>
                                            {mode === 'ADD' && < Button
                                                type="primary"
                                                icon={<PlusOutlined />}
                                                onClick={addScreen}
                                                disabled={!venueSelected}
                                            >
                                                Add Screen
                                            </Button>}
                                        </div>
                                    }
                                    bordered
                                    className="screen-information-card"
                                >
                                    {!selectedTheaterId && mode === 'ADD' ? (
                                        <Alert
                                            message="Theater Required"
                                            description="Please select a theater to configure screens."
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
                                                        capacity={capacity ? capacity : 30}
                                                        index={index}
                                                        onRemove={removeScreen}
                                                        isOnlyScreen={screens.length === 1}
                                                        screenNumber={index + 1}
                                                        venue_id={mode === 'ADD' ? form.getFieldValue('venue_id') : venueId}
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
                                        disabled={!form.getFieldValue('venue_id') || isLoading}
                                        loading={isLoading}
                                    >
                                        Submit
                                    </Button>
                                </Space>
                            </Row>
                        </>
                    </div>
                </Collapse>
            </div >

            <LoadingOverlay loading={loading} />
            <WarningModal
                visible={dialogVisible}
                title="Confirm Action"
                details={screenMessage}
                responseData={editResponse}
                warningMessage="Do you want to continue?"
                onSubmit={handleModalSubmit}
                onCancel={handleModalCancel}
                confirmText="Proceed"
                cancelText="Back"
                loading={loading}
                tableConfig={{
                    title: "Active Schedules",
                    dataKey: "items",
                }}
            // editable_status={editable_status}
            // pagination={warningPagination}
            // onPaginationChange={handleWarningPagination}
            />
            <SubmitAndConfirmModal
                responseData={response}
                addFunction={mode === 'ADD' ? createScreen : editScreen}
                navigationPath={`${APP_PREFIX_PATH}/screen/list`}
                responseMessage={screenMessage}
            />
        </Form >
    )
}

export default AddScreenFormFields;