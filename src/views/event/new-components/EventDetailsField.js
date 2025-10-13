import React from "react";
import {
  PlusOutlined,
  DeleteOutlined,
  QuestionCircleOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import ResizedImgePicker from "components/util-components/Image/ResizedImgePicker";
import {
  SupportImageFormat,
  SupportFormatContent,
  ResolutionByServices,
  ThumbnailImageResolutions,
} from "constants/SupportFileConstants";
import {
  Row,
  Col,
  Input,
  Typography,
  Button,
  Card,
  Form,
  Space,
  Divider,
} from "antd";

const { TextArea } = Input;
const { Text } = Typography;

const EventDetailsField = ({ mode }) => {
  const normFile = (e) => {
    console.warn("eeeeeeeeeeeeeeeeeeeee", e);
    if (Array.isArray(e)) {
      // Filter out empty strings and invalid entries, keep only valid file objects
      return e
        .filter(
          (file) =>
            file &&
            typeof file === "object" &&
            file !== null &&
            (file.originFileObject || file.name || file.uid)
        )
        .map((file) => ({ ...file }));
    }

    const fileList = e?.fileList || [];
    // Filter out empty strings and invalid entries, keep only valid file objects
    return fileList
      .filter(
        (file) =>
          file &&
          typeof file === "object" &&
          file !== null &&
          (file.originFileObject || file.name || file.uid)
      )
      .map((file) => ({ ...file }));
  };

  return (
    <Row gutter={24}>
      {/* Left Column */}
      <Col xs={24} lg={14}>
        <Card title="Basic Information" bordered>
          <Form.Item
            name="event_name"
            label="Event Name"
            rules={[
              { required: true, message: "Event name is required" },
              { min: 3, message: "Event name must be at least 3 characters" },
              { max: 100, message: "Event name cannot exceed 100 characters" },
            ]}
          >
            <Input placeholder="Enter event name" size="large" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Event Description"
            rules={[
              { required: true, message: "Event description is required" },
              {
                min: 10,
                message: "Description must be at least 10 characters",
              },
              {
                max: 1000,
                message: "Description cannot exceed 1000 characters",
              },
            ]}
          >
            <TextArea rows={5} placeholder="Describe your event in detail..." />
          </Form.Item>
        </Card>

        <Card title="Media & Images" bordered style={{ marginTop: 16 }}>
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                name="thumbnail_image"
                label="Thumbnail"
                required={true}
                valuePropName="fileList"
                getValueFromEvent={normFile}
              >
                <ResizedImgePicker
                  maxCount={1}
                  targetResolution={ThumbnailImageResolutions.EVENT}
                  beforeUpload={() => false} // Prevent auto upload
                />
              </Form.Item>
              <Text type="secondary" style={{ fontSize: 11 }}>
                {SupportFormatContent.join(",")}:{" "}
                {SupportImageFormat.join(", ")}
                <br />
                {ResolutionByServices.place}px
              </Text>
            </Col>
            <Col span={12}>
              <Form.Item
                name="banner_images"
                label="Banners"
                valuePropName="fileList"
                getValueFromEvent={normFile}
              >
                <ResizedImgePicker
                  maxCount={20}
                  targetResolution={ThumbnailImageResolutions.EVENT_BANNER}
                  beforeUpload={() => false} // Prevent auto upload
                />
              </Form.Item>
              <Form.Item
                name="banner_image_url"
                label="Banner URL (Optional)"
                rules={[{ type: "url", message: "Please enter a valid URL" }]}
              >
                <Input placeholder="https://example.com/banner.jpg" />
              </Form.Item>
            </Col>
          </Row>
          <Divider />
          <Form.Item
            name="event_images"
            label="Additional Images"
            valuePropName="fileList"
            getValueFromEvent={normFile}
          >
            <ResizedImgePicker
              maxCount={20}
              targetResolution={ThumbnailImageResolutions.EVENT}
              beforeUpload={() => false} // Prevent auto upload
            />
          </Form.Item>
        </Card>
      </Col>

      {/* Right Column */}
      <Col xs={24} lg={10}>
        <Card
          title={
            <Space>
              <SettingOutlined />
              Add-on Services
            </Space>
          }
          bordered
          style={{ marginBottom: 16 }}
        >
          <Form.List name="event_add_on_services">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...rest }) => (
                  <Card
                    key={key}
                    size="small"
                    style={{
                      marginBottom: 12,
                      borderLeft: "3px solid #1890ff",
                    }}
                    bodyStyle={{ padding: 12 }}
                    extra={
                      <Button
                        type="text"
                        danger
                        size="small"
                        onClick={() => remove(name)}
                        title="Remove service"
                      >
                        <DeleteOutlined />
                      </Button>
                    }
                  >
                    <Form.Item
                      {...rest}
                      name={[name, "title"]}
                      label="Service Name"
                      rules={[
                        { required: true, message: "Service name is required" },
                      ]}
                    >
                      <Input placeholder="e.g., Premium Support" size="small" />
                    </Form.Item>
                    <Form.List name={[name, "add"]}>
                      {(
                        priceFields,
                        { add: addPrice, remove: removePrice }
                      ) => (
                        <>
                          {priceFields.map(({ key: pk, name: pn, ...pr }) => (
                            <Space
                              key={pk}
                              style={{ width: "100%", marginBottom: 8 }}
                              align="start"
                            >
                              <Form.Item
                                {...pr}
                                name={[pn]}
                                style={{ flex: 1, margin: 0 }}
                                rules={[
                                  {
                                    required: true,
                                    message: "Feature description is required",
                                  },
                                ]}
                              >
                                <Input
                                  placeholder="What's included?"
                                  size="small"
                                />
                              </Form.Item>
                              <Button
                                type="text"
                                danger
                                size="small"
                                onClick={() => removePrice(pn)}
                                title="Remove feature"
                              >
                                ×
                              </Button>
                            </Space>
                          ))}
                          <Button
                            type="dashed"
                            onClick={() => addPrice("")}
                            size="small"
                            block
                            style={{ marginTop: 8 }}
                          >
                            + Add Feature
                          </Button>
                        </>
                      )}
                    </Form.List>
                  </Card>
                ))}
                <Button
                  type="dashed"
                  onClick={() => add({ title: "", add: [""] })}
                  block
                  icon={<PlusOutlined />}
                >
                  Add Service
                </Button>
              </>
            )}
          </Form.List>
        </Card>

        <Card
          title={
            <Space>
              <QuestionCircleOutlined />
              Q&A Sections
            </Space>
          }
          bordered
        >
          <Form.List name="event_qna">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...rest }) => (
                  <Card
                    key={key}
                    size="small"
                    style={{
                      marginBottom: 12,
                      borderLeft: "3px solid #52c41a",
                    }}
                    bodyStyle={{ padding: 12 }}
                    extra={
                      <Button
                        type="text"
                        danger
                        size="small"
                        onClick={() => remove(name)}
                        title="Remove Q&A section"
                      >
                        <DeleteOutlined />
                      </Button>
                    }
                  >
                    <Form.Item
                      {...rest}
                      name={[name, "title"]}
                      label="Section Title"
                      rules={[
                        {
                          required: true,
                          message: "Section title is required",
                        },
                      ]}
                    >
                      <Input placeholder="e.g., General Info" size="small" />
                    </Form.Item>
                    <Form.List name={[name, "qna"]}>
                      {(qnaFields, { add: addQ, remove: removeQ }) => (
                        <>
                          {qnaFields.map(({ key: qk, name: qn, ...qr }) => (
                            <Space
                              key={qk}
                              direction="vertical"
                              style={{
                                width: "100%",
                                padding: 8,
                                background: "#fafafa",
                                borderRadius: 4,
                                marginBottom: 8,
                                position: "relative",
                              }}
                            >
                              <Form.Item
                                {...qr}
                                name={[qn, "question"]}
                                label="Question"
                                style={{ marginBottom: 8 }}
                                rules={[
                                  {
                                    required: true,
                                    message: "Question is required",
                                  },
                                ]}
                              >
                                <Input
                                  placeholder="Enter your question here..."
                                  size="small"
                                />
                              </Form.Item>
                              <Form.Item
                                {...qr}
                                name={[qn, "answer"]}
                                label="Answer"
                                style={{ marginBottom: 8 }}
                                rules={[
                                  {
                                    required: true,
                                    message: "Answer is required",
                                  },
                                ]}
                              >
                                <Input.TextArea
                                  placeholder="Provide a detailed answer..."
                                  size="small"
                                  rows={2}
                                />
                              </Form.Item>
                              <Button
                                type="text"
                                danger
                                size="small"
                                onClick={() => removeQ(qn)}
                                style={{ alignSelf: "flex-end" }}
                              >
                                Remove Q&A
                              </Button>
                            </Space>
                          ))}
                          <Button
                            type="dashed"
                            onClick={() => addQ({ question: "", answer: "" })}
                            size="small"
                            block
                            style={{ marginTop: 8 }}
                          >
                            + Add Q&A
                          </Button>
                        </>
                      )}
                    </Form.List>
                  </Card>
                ))}
                <Button
                  type="dashed"
                  onClick={() =>
                    add({
                      title: "",
                      qna: [{ question: "", answer: "" }],
                    })
                  }
                  block
                  icon={<PlusOutlined />}
                >
                  Add Q&A Section
                </Button>
              </>
            )}
          </Form.List>
        </Card>
      </Col>
    </Row>
  );
};

export default EventDetailsField;
