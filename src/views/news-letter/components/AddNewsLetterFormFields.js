import React from 'react'
import { Button, Card, Col, Form, Input, Row, Select, Upload } from 'antd'
import { SupportImageFormat } from 'constants/SupportFileConstants';
import { UploadOutlined } from "@ant-design/icons";
import LoadingOverlay from 'components/util-components/Loader';

const AddNewsLetterFormFields = () => {
    const [form] = Form.useForm();
    const normFile = (e) => {
        if (Array.isArray(e)) {
            return e;
        }
        return e?.fileList;
    };
    return (
        <Row gutter={16}>
            <Col xs={24} sm={24} md={17}>
                <Card title="Basic Info">
                    <Form form={form} layout="vertical">
                        <Form.Item name="name" label="Subject">
                            <Input placeholder="subject" />
                        </Form.Item>
                        <Form.Item name="name" label="Message">
                            <Input.TextArea placeholder="Message" rows={4} />
                        </Form.Item>
                        <Form.Item
                            name="media_path"
                            label="News letter Banner Media"
                            valuePropName="fileList"
                            getValueFromEvent={normFile}
                            // rules={rules.thumbnail_image}
                            style={{ marginBottom: "0px", padding: "0px" }}
                        >
                            <Upload
                                name="thumbnail_image"
                                listType="picture"
                                multiple={true}
                                accept={`.${SupportImageFormat.join(",.")}`}
                            >
                                <Button icon={<UploadOutlined />}>Click to upload</Button>
                            </Upload>
                        </Form.Item>
                    </Form>
                </Card>
            </Col>
        </Row>
    )
}

export default AddNewsLetterFormFields