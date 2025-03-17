import React, { useState } from 'react';
import { Button, Card, Col, DatePicker, Form, Input, Row, Select, Upload, Tag, Divider, Tooltip, Switch } from 'antd';
import { SupportImageFormat } from 'constants/SupportFileConstants';
import {
    UploadOutlined,
    ClockCircleOutlined,
    UserOutlined,
    MailOutlined,
    TagOutlined,
    PictureOutlined,
    SendOutlined,
    SaveOutlined,
    EyeOutlined,
    BellOutlined
} from "@ant-design/icons";
import DiscardButton from 'components/shared-components/Buttons/DiscardButton';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const AddNewsLetterFormFields = ({ type = 'normal' }) => {
    const [form] = Form.useForm();
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [previewMode, setPreviewMode] = useState(false);
    const [audience, setAudience] = useState('all');
    const [scheduleEnabled, setScheduleEnabled] = useState(false);

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'align': [] }],
            ['link', 'image'],
            ['clean']
        ],
    };

    const rules = {
        subject: [{ required: true, message: "Please enter newsletter subject" }],
        message: [{ required: true, message: "Message content is required" }],
        thumbnail_image: [{ required: true, message: "Please choose a banner image" }],
        audience: [{ required: true, message: "Please select target audience" }],
    };

    const normFile = (e) => {
        if (Array.isArray(e)) {
            return e;
        }
        return e?.fileList;
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        setLoading(true);

        // Simulate API call
        setTimeout(() => {
            console.log("Newsletter Created!", {
                subject: form.getFieldValue("subject"),
                message,
                audience: form.getFieldValue("audience"),
                schedule: form.getFieldValue("schedule_time"),
                tags: form.getFieldValue("tags")
            });
            setLoading(false);
        }, 1000);
    };

    const audienceOptions = [
        { value: 'all', label: 'All Subscribers' },
        { value: 'premium', label: 'Premium Members' },
    ];

    const tagOptions = [
        { value: 'announcement', label: 'Announcement' },
        { value: 'update', label: 'Update' },
        { value: 'promotion', label: 'Promotion' },
        { value: 'event', label: 'Event' },
        { value: 'news', label: 'News' }
    ];

    return (
        <div className="newsletter-builder">
            <Card
                title={
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>{type === 'formatter' ? 'Advanced Newsletter Editor' : 'Create Newsletter'}</span>
                        <div>
                            <Tooltip title="Preview">
                                <Button
                                    icon={<EyeOutlined />}
                                    style={{ marginRight: 8 }}
                                    onClick={() => setPreviewMode(!previewMode)}
                                >
                                    Preview
                                </Button>
                            </Tooltip>
                            <Button
                                type="primary"
                                icon={<SendOutlined />}
                                onClick={handleSubmit}
                                loading={loading}
                            >
                                {scheduleEnabled ? 'Schedule' : 'Send Now'}
                            </Button>
                        </div>
                    </div>
                }
                bordered={false}
                className="newsletter-main-card"
            >
                <Form form={form} layout="vertical" initialValues={{ audience: 'all' }}>
                    <Row gutter={24}>
                        <Col xs={24} sm={24} md={16} lg={18}>
                            <Card
                                title="Newsletter Content"
                                className="content-card"
                                bordered={false}
                                style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
                            >
                                <Form.Item
                                    name="subject"
                                    label={
                                        <span>
                                            <MailOutlined style={{ marginRight: 8 }} />
                                            Subject Line
                                        </span>
                                    }
                                    rules={rules.subject}
                                >
                                    <Input
                                        placeholder="Enter compelling subject line"
                                        size="large"
                                        autoFocus
                                    />
                                </Form.Item>

                                <Form.Item
                                    label={
                                        <span>
                                            <EditOutlined style={{ marginRight: 8 }} />
                                            Newsletter Content
                                        </span>
                                    }
                                    name="content"
                                    rules={rules.message}
                                >
                                    {type === 'formatter' ? (
                                        <ReactQuill
                                            value={message}
                                            onChange={setMessage}
                                            modules={modules}
                                            theme="snow"
                                            style={{ height: '300px', marginBottom: '50px' }}
                                        />
                                    ) : (
                                        <Input.TextArea
                                            placeholder="Compose your newsletter message..."
                                            rows={10}
                                            onChange={(e) => setMessage(e.target.value)}
                                        />
                                    )}
                                </Form.Item>

                                <Form.Item
                                    name="media_path"
                                    label={
                                        <span>
                                            <PictureOutlined style={{ marginRight: 8 }} />
                                            Newsletter Banner Image
                                        </span>
                                    }
                                    valuePropName="fileList"
                                    getValueFromEvent={normFile}
                                    rules={rules.thumbnail_image}
                                >
                                    <Upload
                                        name="thumbnail_image"
                                        listType="picture-card"
                                        multiple={false}
                                        accept={`.${SupportImageFormat.join(",.")}`}
                                        maxCount={1}
                                    >
                                        <div>
                                            <PictureOutlined />
                                            <div style={{ marginTop: 8 }}>Upload</div>
                                        </div>
                                    </Upload>
                                </Form.Item>
                            </Card>
                        </Col>

                        <Col xs={24} sm={24} md={8} lg={6}>
                            <Card
                                title="Settings"
                                bordered={false}
                                style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
                            >
                                <Form.Item
                                    name="audience"
                                    label={
                                        <span>
                                            <UserOutlined style={{ marginRight: 8 }} />
                                            Target Audience
                                        </span>
                                    }
                                    rules={rules.audience}
                                >
                                    <Select
                                        placeholder="Select target audience"
                                        options={audienceOptions}
                                        onChange={(value) => setAudience(value)}
                                    />
                                </Form.Item>

                                <Divider />

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                    <span>
                                        <BellOutlined style={{ marginRight: 8 }} />
                                        Schedule for later
                                    </span>
                                    <Switch
                                        checked={scheduleEnabled}
                                        onChange={setScheduleEnabled}
                                    />
                                </div>

                                {scheduleEnabled && (
                                    <Form.Item
                                        name="schedule_time"
                                        rules={[{ required: scheduleEnabled, message: "Please select date and time" }]}
                                    >
                                        <DatePicker
                                            format="YYYY-MM-DD HH:mm"
                                            showTime={{ format: "HH:mm" }}
                                            style={{ width: "100%" }}
                                            placeholder="Select date and time"
                                            disabledDate={(current) => current && current < Date.now()}
                                        />
                                    </Form.Item>
                                )}

                                <Divider />

                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
                                    <DiscardButton form={form} />
                                </div>
                            </Card>
                        </Col>
                    </Row>
                </Form>
            </Card>

            {previewMode && (
                <Card
                    title="Newsletter Preview"
                    style={{ marginTop: 16 }}
                    extra={<Button icon={<EyeOutlined />} onClick={() => setPreviewMode(false)}>Close Preview</Button>}
                >
                    <div className="preview-container" style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', border: '1px solid #f0f0f0' }}>
                        <h2>{form.getFieldValue('subject') || 'Newsletter Subject'}</h2>
                        <div style={{ marginTop: '16px', marginBottom: '16px' }}>
                            {form.getFieldValue('media_path') && form.getFieldValue('media_path').length > 0 ? (
                                <div style={{ textAlign: 'center' }}>
                                    <img
                                        src="https://via.placeholder.com/600x300"
                                        alt="Newsletter banner"
                                        style={{ maxWidth: '100%', borderRadius: '4px' }}
                                    />
                                </div>
                            ) : null}
                        </div>
                        <div>
                            {type === 'formatter' ? (
                                <div dangerouslySetInnerHTML={{ __html: message }} />
                            ) : (
                                <p style={{ whiteSpace: 'pre-line' }}>{message}</p>
                            )}
                        </div>
                    </div>
                </Card>
            )}
        </div>
    )
}

// Make sure to import this icon
const EditOutlined = (props) => (
    <svg viewBox="64 64 896 896" focusable="false" data-icon="edit" width="1em" height="1em" fill="currentColor" aria-hidden="true" {...props}>
        <path d="M257.7 752c2 0 4-.2 6-.5L431.9 722c2-.4 3.9-1.3 5.3-2.8l423.9-423.9a9.96 9.96 0 000-14.1L694.9 114.9c-1.9-1.9-4.4-2.9-7.1-2.9s-5.2 1-7.1 2.9L256.8 538.8c-1.5 1.5-2.4 3.3-2.8 5.3l-29.5 168.2a33.5 33.5 0 009.4 29.8c6.6 6.4 14.9 9.9 23.8 9.9zm67.4-174.4L687.8 215l73.3 73.3-362.7 362.6-88.9 15.7 15.6-89zM880 836H144c-17.7 0-32 14.3-32 32v36c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-36c0-17.7-14.3-32-32-32z" />
    </svg>
);

export default AddNewsLetterFormFields;