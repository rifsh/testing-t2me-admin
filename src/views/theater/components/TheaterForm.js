import React, { useEffect, useState } from 'react';
import { Form, Typography, Input, Button, Card, Row, Col, Divider, Space, message, Select, Avatar } from 'antd';
import {
    PhoneOutlined,
    GlobalOutlined,
} from '@ant-design/icons';
import { MODE } from 'constants/TextConstant';
import PlaceWithCountryForm from 'components/util-components/FormItems/PlaceWithCountryForm';
import VenueListForm from 'components/util-components/FormItems/VenueList';
import { getSingleVenues, getVenues, setLocationDialogVisible, setLocationModalLoading, setPlaceValidationDialogVisible, setSelectedPlace, setSelectedVenue, setSelectedVenueList, validatePlace, validateVenue } from 'store/slices/locationSlice';
import { resetTicketSelection } from 'store/slices/ticketSlice';
import { useDispatch, useSelector } from 'react-redux';
import VenueTechnology from 'views/locations/venue/components/VenueTechnology';
import DiscardButton from 'components/shared-components/Buttons/DiscardButton';
import TextEditor from 'components/util-components/FormItems/TextEditor';
import ResizedImgePicker from 'components/util-components/Image/ResizedImgePicker';
import { ThumbnailImageResolutions } from 'constants/SupportFileConstants';
import { setSelectedSubmitItem } from 'store/slices/modalSlice';
import { SubmitAndConfirmModal } from 'components/util-components/ModalItems/SubmitConfirmModal';
import { createTheater, editTheater, fetchTheaterByid, setActiveTab, setTheaterEditData } from 'store/slices/theaterSlice';
import { APP_PREFIX_PATH } from 'configs/AppConfig';
import LoadingOverlay from 'components/util-components/Loader';
import { ActionType } from 'utils/api/warning-submit-util';
import { setScreenEditData } from 'store/slices/screenSlice';
import WarningModal from 'components/util-components/ModalItems/WarningModal';
import { fetchTheaterCompanies } from 'store/slices/theaterCompanySlice';
import { Option } from 'antd/es/mentions';
import TheaterCompanyList from 'components/util-components/FormItems/TheaterCompanyList';

const { Title } = Typography;

const TheaterForm = ({ mode = MODE.ADD, theaterEditId }) => {
    const dispatch = useDispatch();
    const [form] = Form.useForm();
    const { response, loading, submitMessage, singleResponse, message: theaterMessages, editData } = useSelector((state) => state.theater);
    const { selectedPlace, selectedVenue, dialogVisible } = useSelector((state) => state.locations);
    const { response: theaterCompany, loading: companyLoading } = useSelector((state) => state.theaterCompany);

    const rules = {
        place: [{ required: true, message: "Please select a place" }],
        venue: [{ required: true, message: "Please select a venue" }],
    };

    useEffect(() => {
        dispatch(fetchTheaterCompanies({}))
        if (mode === MODE.EDIT) {
            dispatch(fetchTheaterByid({ theatre_id: theaterEditId }))
        }
        return () => {
            dispatch(setActiveTab('theater'));
        };
    }, [dispatch, mode, theaterEditId]);

    useEffect(() => {
        if (mode === MODE.EDIT && singleResponse) {
            console.log("singleResponse", singleResponse);
            dispatch(setSelectedPlace(singleResponse?.place.id));
            dispatch(setSelectedVenue(singleResponse?.venue.id))
            form.setFieldsValue({
                place: singleResponse?.place?.name && singleResponse?.place?.country?.name
                    ? `${singleResponse.place.name}, ${singleResponse.place.country.name}`
                    : undefined,
                venue_id: singleResponse?.venue?.name || undefined,
                name: singleResponse?.name || undefined,
                phone_number: singleResponse?.phone_number || undefined,
                website: singleResponse.website || undefined,
                number_of_screens: singleResponse?.number_of_screens || undefined,
                capacity: singleResponse?.capacity || undefined,
                description: singleResponse?.description || undefined,
                screen_tech: singleResponse.screen_tech || [],
                audios: singleResponse.audio || [],
                accessbility_feature: singleResponse.accessibility || [],
                thumbnail_image:
                    singleResponse.thumbnail_image && singleResponse.thumbnail_image !== "images"
                        ? [
                            {
                                uid: "-1",
                                name: singleResponse.thumbnail_image.split("/").pop(),
                                status: "done",
                                url: singleResponse.thumbnail_image,
                            },
                        ]
                        : [],
            })
        }

    }, [singleResponse])

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const values = await form.validateFields();
            console.log(values)
            const formattedData = {
                ...values,
                place_id: selectedPlace,
            }
            if (mode === MODE.ADD) {
                const resultAction = await dispatch(validateVenue(values.venue_id));
                if (validateVenue.fulfilled.match(resultAction)) {
                    const response = resultAction.payload;
                    if (response.message === "warning") {
                        dispatch(setPlaceValidationDialogVisible(true));
                    } else if (response.data && response.data[0]?.validation_status) {
                        dispatch(setSelectedSubmitItem(formattedData));
                    }
                } else if (validatePlace.rejected.match(resultAction)) {
                    const error = resultAction.error;
                    if (error.message) {
                        message.error(error.message);
                    }
                }
            } else if (mode === MODE.EDIT) {
                const editFormattedData = {
                    ...values,
                    id: theaterEditId,
                    place_id: selectedPlace,
                    venue_id: selectedVenue,
                }
                dispatch(setTheaterEditData(editFormattedData));
                const resultAction = await dispatch(validateVenue(selectedVenue));
                if (validateVenue.fulfilled.match(resultAction)) {
                    const response = resultAction.payload;
                    if (response.message === "warning") {
                        dispatch(setPlaceValidationDialogVisible(true));
                    } else if (response.data && response.data[0]?.validation_status) {
                        const editResult = await dispatch(editTheater({ data: editFormattedData, action: ActionType.WARNING }))
                        if (editTheater.fulfilled.match(editResult)) {
                            dispatch(setScreenEditData(editFormattedData));
                            dispatch(setLocationDialogVisible(true));
                        } else if (editTheater.rejected.match(editResult)) {
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

    const handleCelebritySelect = (value, option) => {
        console.log(value)
    };


    const normFile = (e) => {
        if (Array.isArray(e)) {
            return e;
        }
        return e?.fileList;
    };

    const handlePlaceSelect = (id) => {
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

    const handleModalSubmit = async () => {
        dispatch(setLocationModalLoading(true));
        const resultAction = await dispatch(
            editTheater({ data: editData, action: ActionType.SUBMIT })
        );
        dispatch(setLocationModalLoading(false));
        dispatch(setLocationDialogVisible(false));
        if (editTheater.fulfilled?.match(resultAction)) {
            dispatch(setSelectedSubmitItem(editData));
        }
    };

    const handleModalCancel = () => {
        dispatch(setLocationDialogVisible(false));
    };

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
                    place_id: 58,
                    venue_id: 56,
                    name: "Test Theater",
                    phone_number: "9074144485",
                    website: "https://testtheater.com",
                    number_of_screens: 4,
                    capacity: 300,
                    screen_tech: [
                        { name: "IMAX", description: "High wide screen" }
                    ],
                    audios: [
                        { name: "Dolby atmos", description: "Surrounded quality" }
                    ],
                    accessbility_feature: [
                        { name: "Slider", description: "For disable people" }
                    ],
                    description: "<p>This is a sample description for test theater.</p>",
                    thumbnail_image: [
                        {
                            uid: '-1',
                            name: 'sample.jpg',
                            status: 'done',
                            url: 'https://via.placeholder.com/150', // Simulating a binary image
                        }
                    ]
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
                                    name="company"
                                    label="Theater Company"
                                    rules={[{ required: true, message: 'Please select a company' }]}
                                >
                                    <TheaterCompanyList
                                        // value={editingMember.actorId}
                                        onChange={handleCelebritySelect}
                                    />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item
                                    label="Theater Name"
                                    name="name"
                                    rules={[{ required: true, message: 'Please input theater name!' }]}
                                >
                                    <Input
                                        placeholder="Enter theater name"
                                        size="large"
                                    />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={24}>
                            <Col xs={24} md={12}>
                                <Form.Item
                                    label="Phone Number"
                                    name="phone_number"
                                    rules={[{ required: true, message: 'Please input phone number!' }]}
                                >
                                    <Input
                                        prefix={<PhoneOutlined />}
                                        placeholder="Enter phone number"
                                        size="large"
                                    />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
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
                                    name="number_of_screens"
                                    rules={[{ required: true, message: 'Please input number of screens!' }]}
                                >
                                    <Input
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
                            loading={loading}
                        >
                            Submit
                        </Button>
                    </Space>
                </Row>
            </Form>

            <LoadingOverlay loading={loading} />
            <WarningModal
                visible={dialogVisible}
                title="Confirm Action"
                details={theaterMessages}
                responseData={response}
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
                addFunction={mode === MODE.ADD ? createTheater : editTheater}
                navigationPath={`${APP_PREFIX_PATH}/movie-theater/list`}
                responseMessage={submitMessage}
            />
        </div>
    );
};

export default TheaterForm;