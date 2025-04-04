import React, { useEffect, useState } from 'react';
import {
    Form,
    Button,
    Row,
    Typography,
    message,
    Space,
    Tabs
} from 'antd';
import {
    UserOutlined,
} from '@ant-design/icons';
import DiscardButton from 'components/shared-components/Buttons/DiscardButton';
import ActorDetails from './ActorDetailsForm ';
import { SubmitAndConfirmModal } from 'components/util-components/ModalItems/SubmitConfirmModal';
import { createPersonality, fetchPersonalitiesById } from 'store/slices/castSlice';
import { APP_PREFIX_PATH } from 'configs/AppConfig';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedSubmitItem } from 'store/slices/modalSlice';
import { ActionType } from 'utils/api/warning-submit-util';
import { MODE } from 'constants/TextConstant';
import { useParams } from 'react-router-dom';
import dayjs from "dayjs";
import LoadingOverlay from 'components/util-components/Loader';

const { Title } = Typography;

const AddPage = ({ mode = 'ADD' }) => {
    const { id } = useParams()
    const dispatch = useDispatch();
    const [form] = Form.useForm();
    const { response, loading, submitMessage } = useSelector((state => state.cast));

    useEffect(() => {
        if (mode === MODE.EDIT) {
            dispatch(fetchPersonalitiesById({ person_id: id }))
        }
    }, [id])

    useEffect(() => {
        if (response) {
            console.log("oned", response.birthDate)
            form.setFieldsValue({
                name: response.name,
                also_known_as: response.also_known_as,
                spouse_name: response.spouse_name,
                gender: response.gender,
                birthDate: response.birthDate ? dayjs(response.birthDate, "YYYY-MM-DD") : undefined,
                age: response.age,
                nationality: response.nationality,
                birth_place: response.birth_place,
                occupation: response.occupation,
                biography: response.biography,
                thumbnail_image:
                    response.thumbnail_image && response.thumbnail_image !== "images"
                        ? [
                            {
                                uid: "-1",
                                name: response.thumbnail_image.split("/").pop(),
                                status: "done",
                                url: response.thumbnail_image,
                            },
                        ]
                        : [],
            })
        }
    }, [response])

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            if (mode === 'ADD') {
                const formattedData = {
                    ...values,
                    birthDate: values.birthDate.format("YYYY-MM-DD")
                }
                console.log(formattedData);
                dispatch(createPersonality({ data: formattedData, action: ActionType.SUBMIT }))
                dispatch(setSelectedSubmitItem(formattedData));

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

    return (
        <div>
            <div style={{ marginBottom: 24 }}>
                <Title level={3} style={{ marginBottom: 0 }}>
                    <UserOutlined style={{ marginRight: 8 }} />
                    Celebrity Management
                </Title>
            </div>
            <Form
                layout="vertical"
                name="celebrity-form"
                form={form}
                className="ant-advanced-search-form"
                onFinish={handleSubmit}
            >
                <Tabs defaultActiveKey="1">
                    <Tabs.TabPane
                        tab={<span>Actor Details</span>}
                        key="1"
                    >
                        <ActorDetails
                            form={form}
                        />
                    </Tabs.TabPane>
                </Tabs>
                <Row justify="end" style={{ marginTop: '20px' }}>
                    <Space>
                        <DiscardButton form={form} />
                        <Button
                            type="primary"
                            htmlType="submit"
                            onClick={handleSubmit}
                            loading={loading}
                        >
                            Submit
                        </Button>
                    </Space>
                </Row>
            </Form>
            <LoadingOverlay loading={loading} />
            <SubmitAndConfirmModal
                responseData={response}
                addFunction={mode === 'ADD' ? createPersonality : createPersonality}
                navigationPath={`${APP_PREFIX_PATH}/cast/list`}
                responseMessage={submitMessage}
            />
        </div>
    );
};

export default AddPage;