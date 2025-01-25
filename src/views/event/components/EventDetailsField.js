import { Card, Col, Form, Input,Button, Upload, Typography, message } from "antd";
import React from "react";
import { UploadOutlined } from "@ant-design/icons";
import { SupportImageFormat, SupportFormatContent } from "constants/SupportFileConstants";

const { Text } = Typography;

const EventDetailsField = () => {
  const rules = {
    name: [{ required: true, message: "Please enter event name" }],
    description: [
      {
        required: true,
        message: "Please enter event description",
      },
    ],
  };
  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };
  const validateFileFormat = (file) => {
    const fileExtension = file.name.split(".").pop().toUpperCase();
    return SupportImageFormat.includes(fileExtension);
  };

  const handleBeforeUpload = (file) => {
    if (!validateFileFormat(file)) {
      message.error(
        `Only ${SupportImageFormat.join(", ")} files are allowed! 
        Uploaded file "${file.name}" is not a supported format.`
      );
      return Upload.LIST_IGNORE; // Prevent upload
    }
    return false;
  };

  return (
    <div>
      <Col xs={24} sm={24} md={17}>
        <Card title="Event Info">
          <Form.Item name="event_name" label="Event name" rules={rules.name}>
            <Input placeholder="Event Name" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={rules.description}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item
            name="thumbnail_image"
            label="Thumbnail Image"
            valuePropName="fileList"
            getValueFromEvent={normFile}
            rules={rules.thumbnail_image}
          >
            <Upload name="thumbnail_image" listType="picture" maxCount={1} beforeUpload={handleBeforeUpload}
              accept={`.${SupportImageFormat.join(',.')}`}
            >
              <Button icon={<UploadOutlined />}>Click to upload</Button>
            </Upload>
            <Text
              type="warning"
              style={{ padding: "00px 00px", fontSize: "11px" }}
            >
              {SupportFormatContent.join(",")}:{" "}
              {SupportImageFormat.join(", ")}.
              {" "}
            </Text>
          </Form.Item>
          <Form.Item
            name="banner_images"
            label="Banner Images"
            valuePropName="fileList"
            getValueFromEvent={normFile}
            rules={rules.banner_images}
          >
            <Upload name="banner_images" listType="picture" beforeUpload={handleBeforeUpload}
              accept={`.${SupportImageFormat.join(',.')}`}
            >
              <Button icon={<UploadOutlined />}>Click to upload banners</Button>
            </Upload>
            <Text
              type="warning"
              style={{ padding: "00px 00px", fontSize: "11px" }}
            >
              {SupportFormatContent.join(",")}:{" "}
              {SupportImageFormat.join(", ")}.
              {" "}
            </Text>
          </Form.Item>
        </Card>
      </Col>
    </div>
  );
};

export default EventDetailsField;
