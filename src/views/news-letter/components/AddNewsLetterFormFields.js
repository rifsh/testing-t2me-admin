import React, { useState } from 'react'
import { Button, Card, Col, DatePicker, Form, Input, Row, Select, Upload } from 'antd'
import { SupportImageFormat } from 'constants/SupportFileConstants';
import { UploadOutlined } from "@ant-design/icons";
import DiscardButton from 'components/shared-components/Buttons/DiscardButton';
import ReactQuill from 'react-quill';

const AddNewsLetterFormFields = ({ type }) => {
    const [form] = Form.useForm();
    const [message, setMessage] = useState("");
    const rules = {
        subject: [{ required: true, message: "Please enter category name" }],
        message: [{ required: true, message: "Please choose country" }],
        thumbnail_image: [
            { required: true, message: "Please choose a banner image" },
        ],
    };

    const normFile = (e) => {
        if (Array.isArray(e)) {
            return e;
        }
        return e?.fileList;
    };



    const handleSubmit = (event) => {
        event.preventDefault();
        console.log("Newsletter Sent!", { subject: form.getFieldValue("subject"), message });
    };

    return (
        <Row gutter={16} align="top">
            {type === 'normal' && <>
                <Col xs={24} sm={24} md={17}>
                    <Card title="Basic Info">
                        <Form form={form} layout="vertical">

                            <Form.Item name="subject" label="Subject" rules={rules.subject}>
                                <Input placeholder="subject" />
                            </Form.Item>

                            <Form.Item name="message" label="Message" rules={rules.message}>
                                <Input.TextArea placeholder="Message" rows={4} />
                            </Form.Item>

                            <Form.Item
                                name="media_path"
                                label="Newsletter Banner Media"
                                valuePropName="fileList"
                                getValueFromEvent={normFile}
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
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "flex-end",
                                    marginTop: 20,
                                    gap: 10,
                                }}
                            >
                                <DiscardButton form={form} />
                                <Button
                                    type="primary"
                                    loading={false}
                                    htmlType='submit'
                                    onClick={handleSubmit}
                                >
                                    Submit
                                </Button>
                            </div>
                        </Form>
                    </Card>
                </Col>

                <Col xs={24} sm={24} md={7}>
                    <Card title="Schedule">
                        <Form.Item
                            name="ad_start_date_time"
                            label="Start Date & Time"
                            rules={[{ required: true, message: "Ad start time is required" }]}
                        >
                            <DatePicker
                                format="YYYY-MM-DD HH:mm"
                                showTime={{ format: "HH:mm" }}
                                style={{ width: "100%" }}
                                showNow={false}
                                placeholder="Select ad start time"
                            />
                        </Form.Item>
                    </Card>
                </Col>
            </>}

            {type === 'formatter' && <>
                <Form form={form} layout="vertical">
                    <Form.Item name="subject" label="Subject" rules={[{ required: true }]}>
                        <Input placeholder="Enter newsletter subject" />
                    </Form.Item>

                    <Form.Item label="Message">
                        <ReactQuill value={message} onChange={setMessage} />
                    </Form.Item>

                    <Button onClick={handleSubmit} type="primary" htmlType="submit">Send Newsletter</Button>
                </Form>
            </>}
        </Row >

    )
}

export default AddNewsLetterFormFields