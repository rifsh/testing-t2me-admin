import { Card, Col, Form, Input, Space, Button, Typography, Row, } from "antd";
import React from "react";
import { PlusOutlined, MinusCircleOutlined, } from "@ant-design/icons";
import { SupportImageFormat, SupportFormatContent, ResolutionByServices,ThumbnailImageResolutions, } from "constants/SupportFileConstants";
import Utils from "utils/index";
import ResizedImgePicker from "components/util-components/Image/ResizedImgePicker";

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
    return e?.fileList || [];
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
        </Card>
        <Card>
          <Form.Item
            name="thumbnail_image"
            label="Thumbnail Image"
            valuePropName="value"
            getValueFromEvent={normFile}
            style={{ marginBottom: "0px", padding: "0px" }}
          >
            <ResizedImgePicker
              maxCount={1}
              targetResolution={ThumbnailImageResolutions.EVENT}
            />
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
            valuePropName="value"
            getValueFromEvent={normFile}
            style={{ marginBottom: "0px", padding: "0px" }}
          >
            <ResizedImgePicker
              maxCount={20}
              targetResolution={ThumbnailImageResolutions.EVENT_BANNER}
            />
          </Form.Item>

          <Form.Item
            name="banner_image_url"
            label="Banner Images Url"
            rules={rules.banner_url}
            style={{ marginTop: "10px", padding: "0px" }}
          >
            <Input placeholder="Banner Images Url" />
          </Form.Item>

          <Form.Item
            name="event_images"
            label="Event Images"
            valuePropName="fileList"
            getValueFromEvent={normFile}
            style={{ marginBottom: "0px", padding: "0px" }}
          >
            <ResizedImgePicker
              maxCount={20}
              targetResolution={ThumbnailImageResolutions.EVENT}
            />
          </Form.Item>
        </Card>
        <Card>
          <Form.Item name="event_add_on_services" label="Add on Services">
            <Form.List name="event_add_on_services">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <div key={key}>
                      <Form.Item
                        {...restField}
                        name={[name, "title"]}
                        label="Title"
                        rules={[
                          { required: true, message: "Title is required" },
                        ]}
                      >
                        <Input placeholder="Enter title" />
                      </Form.Item>

                      <Form.List name={[name, "priceIncludes"]}>
                        {(
                          priceFields,
                          { add: addPrice, remove: removePrice }
                        ) => (
                          <>
                            <Row gutter={16}>
                              {priceFields.map(
                                ({
                                  key: priceKey,
                                  name: priceName,
                                  ...priceRestField
                                }) => (
                                  <Col span={12} key={priceKey}>
                                    <Space
                                      style={{
                                        display: "flex",
                                        marginBottom: 8,
                                      }}
                                      align="baseline"
                                    >
                                      <Form.Item
                                        {...priceRestField}
                                        name={[priceName, "priceInclude"]}
                                        rules={[
                                          {
                                            required: true,
                                            message:
                                              "Price include is required",
                                          },
                                        ]}
                                        style={{ width: "100%" }}
                                      >
                                        <Input placeholder="Price Included" />
                                      </Form.Item>
                                      <MinusCircleOutlined
                                        onClick={() => removePrice(priceName)}
                                      />
                                    </Space>
                                  </Col>
                                )
                              )}
                            </Row>
                            <Row gutter={16}>
                              <Col span={12}>

                              <Button
                                type="dashed"
                                onClick={() => addPrice()}
                                block
                                icon={<PlusOutlined />}
                              >
                                Add Price Included
                              </Button>
                       </Col>
                        <Col span={12}>
                        <Button
                        type="dashed"
                        danger
                        onClick={() => remove(name)}
                        block
                        icon={<MinusCircleOutlined />}
                      >
                        Remove Title Section
                      </Button>
                        </Col>
                        </Row>
                        </>
                        )}
                      </Form.List> 
                    </div>
                  ))}
                  <Form.Item style={{ marginTop: "16px" }}>
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      block
                      icon={<PlusOutlined />}
                    >
                      Add Title Section
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </Form.Item>
        </Card>

        <Card>
          <Form.Item name="event_qna" label="Questions and Answers">
            <Form.List name="event_qna">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <div key={key} className="mb-10">
                      {/* Title Field for Question Section */}
                      <Form.Item
                        {...restField}
                        name={[name, "title"]}
                        label="Question Title"
                        rules={[
                          {
                            required: false,
                            message: "Question title is required",
                          },
                        ]}
                      >
                        <Input placeholder="Enter question title" />
                      </Form.Item>

                      {/* Nested Form.List for QA (Question and Answer) */}
                      <Form.List name={[name, "qna"]}>
                        {(
                          qaFields,
                          { add: addQA, remove: removeQA }
                        ) => (
                          <>
                            <Row gutter={16}>
                              {qaFields.map(
                                ({
                                  key: qaKey,
                                  name: qaName,
                                  ...qaRestField
                                }) => (
                                  <Col span={24} key={qaKey}>
                                    <Space
                                      style={{
                                        display: "flex",
                                        marginBottom: 8,
                                      }}
                                      align="baseline"
                                    >
                                      {/* Question Field */}
                                      <Form.Item
                                        {...qaRestField}
                                        name={[qaName, "question"]}
                                        rules={[
                                          {
                                            required: false,
                                            message: "Question is required",
                                          },
                                        ]}
                                      >
                                        <Input placeholder="Enter question" />
                                      </Form.Item>

                                      <Form.Item
                                        {...qaRestField}
                                        name={[qaName, "answer"]}
                                        rules={[
                                          {
                                            required: false,
                                            message: "Answer is required",
                                          },
                                        ]}
                                      >
                                        <Input placeholder="Enter answer" />
                                      </Form.Item>

                                      {/* Remove QA Button */}
                                      <MinusCircleOutlined
                                        onClick={() => removeQA(qaName)}
                                      />
                                    </Space>
                                  </Col>
                                )
                              )}
                            </Row>

                            {/* Add QA and Remove Question Section Buttons in the same row */}
                            <Row gutter={16}>
                              <Col span={12}>
                                <Button
                                  type="default"
                                  onClick={() => addQA({ question: "", answer: "" })}
                                  block
                                  icon={<PlusOutlined />}
                                >
                                  Add Question and Answer
                                </Button>
                              </Col>
                              <Col span={12}>
                                <Button
                                  type="dashed"
                                  danger
                                  onClick={() => remove(name)}
                                  block
                                  icon={<MinusCircleOutlined />}
                                >
                                  Remove Question Section
                                </Button>
                              </Col>
                            </Row>
                          </>
                        )}
                      </Form.List>
                    </div>
                  ))}
         
                    <Form.Item style={{ marginTop: "16px" }}>
                      <Button
                        type="default"
                        onClick={() => {
                          add({
                            title: "",
                            qa: [{ question: "", answer: "" }],
                          });
                        }}
                        block
                        icon={<PlusOutlined />}
                      >
                        Add Question Section
                      </Button>
                    </Form.Item>

                </>
              )}
            </Form.List>
          </Form.Item>
        </Card>
      </Col>
    </div>
  );
};

export default EventDetailsField;
