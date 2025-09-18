import React from "react";
import * as antd from "antd";
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

const { TextArea } = antd.Input;
const { Text } = antd.Typography;

const EventDetailsField = ({ mode }) => {
  // FIXED: Create deep clones of file objects to make them extensible
  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e.map((file) => ({ ...file })); // Clone each file object
    }

    if (e?.fileList) {
      return e.fileList.map((file) => ({ ...file })); // Clone each file object
    }

    return [];
  };

  // Alternative normFile function that creates proper clones
  const safeNormFile = (e) => {
    let fileList = [];

    if (Array.isArray(e)) {
      fileList = e;
    } else if (e?.fileList) {
      fileList = e.fileList;
    }

    // Create deep clones to avoid "object is not extensible" error
    return fileList.map((file) => {
      // Handle both File objects and Ant Design file objects
      if (file.originFileObj) {
        return {
          ...file,
          uid: file.uid,
          name: file.name,
          status: file.status,
          url: file.url,
          thumbUrl: file.thumbUrl,
          originFileObj: file.originFileObj,
          response: file.response,
          error: file.error,
          linkProps: file.linkProps,
          xhr: file.xhr,
        };
      } else {
        return {
          ...file,
          uid: file.uid || Math.random().toString(36).substr(2, 9),
          name: file.name,
          status: file.status || "done",
        };
      }
    });
  };

  return (
    <antd.Row gutter={24}>
      {/* Left Column */}
      <antd.Col xs={24} lg={14}>
        <antd.Card title="Basic Information" bordered>
          <antd.Form.Item
            name="event_name"
            label="Event Name"
            rules={[
              { required: true, message: "Event name is required" },
              { min: 3, message: "Event name must be at least 3 characters" },
              { max: 100, message: "Event name cannot exceed 100 characters" },
            ]}
          >
            <antd.Input placeholder="Enter event name" size="large" />
          </antd.Form.Item>
          <antd.Form.Item
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
          </antd.Form.Item>
        </antd.Card>

        <antd.Card title="Media & Images" bordered style={{ marginTop: 16 }}>
          <antd.Row gutter={24}>
            <antd.Col span={12}>
              <antd.Form.Item
                name="thumbnail_image"
                label="Thumbnail"
                valuePropName="fileList"
                getValueFromEvent={safeNormFile}
              >
                <ResizedImgePicker
                  maxCount={1}
                  targetResolution={ThumbnailImageResolutions.EVENT}
                  beforeUpload={() => false} // Prevent auto upload
                />
              </antd.Form.Item>
              <Text type="secondary" style={{ fontSize: 11 }}>
                {SupportFormatContent.join(",")}:{" "}
                {SupportImageFormat.join(", ")}
                <br />
                {ResolutionByServices.place}px
              </Text>
            </antd.Col>
            <antd.Col span={12}>
              <antd.Form.Item
                name="banner_images"
                label="Banners"
                valuePropName="fileList"
                getValueFromEvent={safeNormFile}
              >
                <ResizedImgePicker
                  maxCount={20}
                  targetResolution={ThumbnailImageResolutions.EVENT_BANNER}
                  beforeUpload={() => false} // Prevent auto upload
                />
              </antd.Form.Item>
              <antd.Form.Item
                name="banner_image_url"
                label="Banner URL (Optional)"
                rules={[{ type: "url", message: "Please enter a valid URL" }]}
              >
                <antd.Input placeholder="https://example.com/banner.jpg" />
              </antd.Form.Item>
            </antd.Col>
          </antd.Row>
          <antd.Divider />
          <antd.Form.Item
            name="event_images"
            label="Additional Images"
            valuePropName="fileList"
            getValueFromEvent={safeNormFile}
          >
            <ResizedImgePicker
              maxCount={20}
              targetResolution={ThumbnailImageResolutions.EVENT}
              beforeUpload={() => false} // Prevent auto upload
            />
          </antd.Form.Item>
        </antd.Card>
      </antd.Col>

      {/* Right Column */}
      <antd.Col xs={24} lg={10}>
        <antd.Card
          title={
            <antd.Space>
              <SettingOutlined />
              Add-on Services
            </antd.Space>
          }
          bordered
          style={{ marginBottom: 16 }}
        >
          <antd.Form.List name="event_add_on_services">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...rest }) => (
                  <antd.Card
                    key={key}
                    size="small"
                    style={{
                      marginBottom: 12,
                      borderLeft: "3px solid #1890ff",
                    }}
                    bodyStyle={{ padding: 12 }}
                    extra={
                      <antd.Button
                        type="text"
                        danger
                        size="small"
                        onClick={() => remove(name)}
                        title="Remove service"
                      >
                        <DeleteOutlined />
                      </antd.Button>
                    }
                  >
                    <antd.Form.Item
                      {...rest}
                      name={[name, "title"]}
                      label="Service Name"
                      rules={[
                        { required: true, message: "Service name is required" },
                      ]}
                    >
                      <antd.Input
                        placeholder="e.g., Premium Support"
                        size="small"
                      />
                    </antd.Form.Item>
                    <antd.Form.List name={[name, "add"]}>
                      {(
                        priceFields,
                        { add: addPrice, remove: removePrice }
                      ) => (
                        <>
                          {priceFields.map(({ key: pk, name: pn, ...pr }) => (
                            <antd.Space
                              key={pk}
                              style={{ width: "100%", marginBottom: 8 }}
                              align="start"
                            >
                              <antd.Form.Item
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
                                <antd.Input
                                  placeholder="What's included?"
                                  size="small"
                                />
                              </antd.Form.Item>
                              <antd.Button
                                type="text"
                                danger
                                size="small"
                                onClick={() => removePrice(pn)}
                                title="Remove feature"
                              >
                                ×
                              </antd.Button>
                            </antd.Space>
                          ))}
                          <antd.Button
                            type="dashed"
                            onClick={() => addPrice("")}
                            size="small"
                            block
                            style={{ marginTop: 8 }}
                          >
                            + Add Feature
                          </antd.Button>
                        </>
                      )}
                    </antd.Form.List>
                  </antd.Card>
                ))}
                <antd.Button
                  type="dashed"
                  onClick={() => add({ title: "", add: [""] })}
                  block
                  icon={<PlusOutlined />}
                >
                  Add Service
                </antd.Button>
              </>
            )}
          </antd.Form.List>
        </antd.Card>

        <antd.Card
          title={
            <antd.Space>
              <QuestionCircleOutlined />
              Q&A Sections
            </antd.Space>
          }
          bordered
        >
          <antd.Form.List name="event_qna">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...rest }) => (
                  <antd.Card
                    key={key}
                    size="small"
                    style={{
                      marginBottom: 12,
                      borderLeft: "3px solid #52c41a",
                    }}
                    bodyStyle={{ padding: 12 }}
                    extra={
                      <antd.Button
                        type="text"
                        danger
                        size="small"
                        onClick={() => remove(name)}
                        title="Remove Q&A section"
                      >
                        <DeleteOutlined />
                      </antd.Button>
                    }
                  >
                    <antd.Form.Item
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
                      <antd.Input
                        placeholder="e.g., General Info"
                        size="small"
                      />
                    </antd.Form.Item>
                    <antd.Form.List name={[name, "qna"]}>
                      {(qnaFields, { add: addQ, remove: removeQ }) => (
                        <>
                          {qnaFields.map(({ key: qk, name: qn, ...qr }) => (
                            <antd.Space
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
                              <antd.Form.Item
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
                                <antd.Input
                                  placeholder="Enter your question here..."
                                  size="small"
                                />
                              </antd.Form.Item>
                              <antd.Form.Item
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
                                <antd.Input.TextArea
                                  placeholder="Provide a detailed answer..."
                                  size="small"
                                  rows={2}
                                />
                              </antd.Form.Item>
                              <antd.Button
                                type="text"
                                danger
                                size="small"
                                onClick={() => removeQ(qn)}
                                style={{ alignSelf: "flex-end" }}
                              >
                                Remove Q&A
                              </antd.Button>
                            </antd.Space>
                          ))}
                          <antd.Button
                            type="dashed"
                            onClick={() => addQ({ question: "", answer: "" })}
                            size="small"
                            block
                            style={{ marginTop: 8 }}
                          >
                            + Add Q&A
                          </antd.Button>
                        </>
                      )}
                    </antd.Form.List>
                  </antd.Card>
                ))}
                <antd.Button
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
                </antd.Button>
              </>
            )}
          </antd.Form.List>
        </antd.Card>
      </antd.Col>
    </antd.Row>
  );
};

export default EventDetailsField;
