import React, { useState } from 'react';
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
import { createPersonality } from 'store/slices/castSlice';
import { APP_PREFIX_PATH } from 'configs/AppConfig';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedSubmitItem } from 'store/slices/modalSlice';
import { ActionType } from 'utils/api/warning-submit-util';

const { Title } = Typography;

const AddPage = ({ mode = 'ADD' }) => {
    const dispatch = useDispatch();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const { response } = useSelector((state => state.cast));

    const handleSubmit = async () => {
        setLoading(true);

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
                            loading={loading}
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
                        // loading={loading}
                        >
                            Submit
                        </Button>
                    </Space>
                </Row>
            </Form>

            <SubmitAndConfirmModal
                responseData={response}
                addFunction={mode === 'ADD' ? createPersonality : createPersonality}
                navigationPath={`${APP_PREFIX_PATH}/cast/list`}
            // responseMessage={screenMessage}
            />
        </div>
    );
};

export default AddPage;