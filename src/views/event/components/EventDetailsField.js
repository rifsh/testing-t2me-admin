import {
  Card,
  Col,
  Form,
  Input,
  Button,
  Upload,
  Typography,
  message,
} from "antd";
import React from "react";
import { UploadOutlined } from "@ant-design/icons";
import {
  SupportImageFormat,
  SupportFormatContent,
  ResolutionByServices,
} from "constants/SupportFileConstants";
import Utils from "utils/index";

const { Text } = Typography;

const EventDetailsField = () => {
  const rules = {
    name: [{ required: true, message: "Please enter event name" }],
    description: [
      { required: true, message: "Please enter event description" },
    ],
    thumbnail_image: [
      { required: true, message: "Please upload a thumbnail image" },
    ],
    banner_images: [
      { required: true, message: "Please upload at least one banner image" },
    ],
    banner_url: [{ required: false, message: "Please enter banner image URL" }],
  };

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };
  const handleBeforeUpload = Utils.handleBeforeUpload;

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
            style={{ marginBottom: "0px", padding: "0px" }}
            rules={rules.thumbnail_image}
          >
            <Upload
              name="thumbnail_image"
              listType="picture"
              maxCount={1}
              // beforeUpload={handleBeforeUpload}
              beforeUpload={(file) =>
                Utils.handleBeforeUpload(file, ResolutionByServices.place)
              }
              accept={`.${SupportImageFormat.join(",.")}`}
            >
              <Button icon={<UploadOutlined />}>Click to upload</Button>
            </Upload>
          </Form.Item>
          <Text
            type="warning"
            style={{ padding: "00px 00px", fontSize: "11px" }}
          >
            {SupportFormatContent.join(",")}: {SupportImageFormat.join(", ")} &
            {" resolution "}
            {ResolutionByServices.place} pixels.{" "}
          </Text>
          <Form.Item
            name="banner_images"
            label="Banner Images"
            valuePropName="fileList"
            getValueFromEvent={normFile}
            rules={rules.banner_images}
            style={{ marginBottom: "0px", padding: "0px" }}
          >
            <Upload
              name="banner_images"
              listType="picture"
              // beforeUpload={handleBeforeUpload}
              beforeUpload={(file) =>
                Utils.handleBeforeUpload(file, ResolutionByServices.place)
              }
              accept={`.${SupportImageFormat.join(",.")}`}
            >
              <Button icon={<UploadOutlined />}>Click to upload banners</Button>
            </Upload>
          </Form.Item>
          <Text
            type="warning"
            style={{ padding: "00px 00px", fontSize: "11px" }}
          >
            {SupportFormatContent.join(",")}: {SupportImageFormat.join(", ")} &
            {" resolution "}
            {ResolutionByServices.place} pixels.{" "}
          </Text>

          <Form.Item
            name=""
            label="Banner Images Url"
            rules={rules.banner_url}
            style={{ marginTop: "10px", padding: "0px" }}
          >
            <Input placeholder="Banner Images Url" />
          </Form.Item>
        </Card>
      </Col>
    </div>
  );
};

export default EventDetailsField;
