import React, { useEffect, useState } from 'react';
import { Form, Typography, Input, Button, Card, Row, Col, Divider, Space, message } from 'antd';
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
import { createTheater, editTheater, fetchTheaterByid, setTheaterEditData } from 'store/slices/theaterSlice';
import { APP_PREFIX_PATH } from 'configs/AppConfig';
import LoadingOverlay from 'components/util-components/Loader';
import { ActionType } from 'utils/api/warning-submit-util';
import { setScreenEditData } from 'store/slices/screenSlice';
import WarningModal from 'components/util-components/ModalItems/WarningModal';
import { createTheaterCompany, editTheaterCompany, fetchTheaterCompanyByid, setTheaterCompanyEditData } from 'store/slices/theaterCompanySlice';
import { setPersonalityEditData } from 'store/slices/castSlice';

const { Title } = Typography;

const CompanyForm = ({ mode, CompanyEditId }) => {
    const dispatch = useDispatch();
    const [form] = Form.useForm();
    const { response, loading, submitMessage, singleResponse, message: theaterCompanyMessages, editData } = useSelector((state) => state.theaterCompany);
    const { selectedPlace, selectedVenue, dialogVisible } = useSelector((state) => state.locations);
    const rules = {
        place: [{ required: true, message: "Please select a place" }],
        venue: [{ required: true, message: "Please select a venue" }],
    };

    useEffect(() => {
        if (mode === MODE.EDIT) {
            dispatch(fetchTheaterCompanyByid({ company_id: CompanyEditId }))
        }
        return () => {

        };
    }, [dispatch, mode, CompanyEditId]);

    useEffect(() => {
        if (mode === MODE.EDIT && singleResponse) {

            form.setFieldsValue({
                name: singleResponse?.name || undefined,
                phone_number: singleResponse?.phone_number || undefined,
                email: singleResponse?.email || undefined,
                website_url: singleResponse.website_url || undefined,
                description: singleResponse.description || undefined,
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
            // const formattedData = {
            //     ...values,
            //     place_id: selectedPlace,
            // }
            if (mode === MODE.ADD) {
                dispatch(setSelectedSubmitItem(values));
            } else if (mode === MODE.EDIT) {
                const editFormattedData = {
                    ...values,
                    id: CompanyEditId,
                }
                editTheaterCompany({ data: editFormattedData, action: ActionType.WARNING })
                dispatch(setTheaterCompanyEditData(editFormattedData));
                dispatch(setLocationDialogVisible(true));
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

    const normFile = (e) => {
        if (Array.isArray(e)) {
            return e;
        }
        return e?.fileList;
    };

    const handleModalSubmit = async () => {
        dispatch(setLocationModalLoading(true));
        const resultAction = await dispatch(
            editTheaterCompany({ data: editData, action: ActionType.SUBMIT })
        );
        dispatch(setLocationModalLoading(false));
        dispatch(setLocationDialogVisible(false));
        if (editTheaterCompany.fulfilled?.match(resultAction)) {
            dispatch(setSelectedSubmitItem(editData));
        }
    };

    const handleModalCancel = () => {
        dispatch(setLocationDialogVisible(false));
    };

    return (
        <div style={{ padding: '0 12px' }}>
            < Title level={3}>
                {mode === MODE.ADD ? "Add New Company" : "Edit Company Details"}
            </Title>

            <Form
                layout="vertical"
                form={form}
                name="theaterForm"
            >
                <Card>
                    <>
                        <Row gutter={24}>
                            <Col xs={24} md={12}>
                                <Form.Item
                                    label="Company Name"
                                    name="name"
                                    rules={[{ required: true, message: 'Please input company name!' }]}
                                >
                                    <Input
                                        placeholder="Enter company name"
                                        size="large"
                                    />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item
                                    label="Website"
                                    name="website_url"
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
                                    label="Company mail"
                                    name="email"
                                    rules={[{ required: true, message: 'Please input company valid mail!' }]}
                                >
                                    <Input
                                        placeholder="Enter company mail"
                                        size="large"
                                    />
                                </Form.Item>
                            </Col>
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
                details={theaterCompanyMessages}
                responseData={response}
                warningMessage="Do you want to continue?"
                onSubmit={handleModalSubmit}
                onCancel={handleModalCancel}
                confirmText="Proceed"
                cancelText="Back"
                loading={loading}
            // editable_status={editable_status}
            // pagination={warningPagination}
            // onPaginationChange={handleWarningPagination}
            />
            <SubmitAndConfirmModal
                responseData={response}
                addFunction={mode === MODE.ADD ? createTheaterCompany : editTheaterCompany}
                navigationPath={`${APP_PREFIX_PATH}/movie-theater-company/list`}
                responseMessage={submitMessage}
            />
        </div>
    );
}

export default CompanyForm