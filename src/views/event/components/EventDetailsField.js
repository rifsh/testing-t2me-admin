import {
  Card,
  Col,
  Form,
  Input,
  Space,
  Button,
  Upload,
  Typography,
  Row,
  message,
} from "antd";
import React from "react";
import {
  PlusOutlined,
  UploadOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons";
import {
  SupportImageFormat,
  SupportFormatContent,
  ResolutionByServices,
  ThumbnailImageResolutions,
} from "constants/SupportFileConstants";
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
              form={form}
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
            name=""
            label="Banner Images Url"
            rules={rules.banner_url}
            style={{ marginTop: "10px", padding: "0px" }}
          >
            <Input placeholder="Banner Images Url" />
          </Form.Item>

          <Form.Item
            name=""
            label="Event Images"
            valuePropName="fileList"
            getValueFromEvent={normFile}
            // rules={rules.banner_images}

            style={{ marginBottom: "0px", padding: "0px" }}
          >
             <ResizedImgePicker
              maxCount={20}
              targetResolution={ThumbnailImageResolutions.EVENT}
            />
          </Form.Item>
        </Card>
        <Card>
          <Form.Item name="includedPrice" label="Included In the Price">
            <Form.List name="includedPrice">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <div key={key}>
                      {/* Title Field */}
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

                      {/* Nested Form.List for Price Included Fields */}
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
                            <Form.Item>
                              <Button
                                type="dashed"
                                onClick={() => addPrice()}
                                block
                                icon={<PlusOutlined />}
                              >
                                Add Price Included
                              </Button>
                            </Form.Item>
                          </>
                        )}
                      </Form.List>

                      {/* Remove Title Section */}
                      <Button
                        type="dashed"
                        danger
                        onClick={() => remove(name)}
                        block
                        icon={<MinusCircleOutlined />}
                      >
                        Remove Title Section
                      </Button>
                    </div>
                  ))}
                  <Form.Item>
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
          <Form.Item name="questionsAndAnswers" label="Questions and Answers">
            <Form.List name="questionsAndAnswers">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <div key={key}>
                      {/* Title Field for Question Section */}
                      <Form.Item
                        {...restField}
                        name={[name, "questionTitle"]}
                        label="Question Title"
                        rules={[
                          {
                            required: true,
                            message: "Question title is required",
                          },
                        ]}
                      >
                        <Input placeholder="Enter question title" />
                      </Form.Item>

                      {/* Nested Form.List for Answers */}
                      <Form.List name={[name, "answers"]}>
                        {(
                          answerFields,
                          { add: addAnswer, remove: removeAnswer }
                        ) => (
                          <>
                            <Row gutter={16}>
                              {answerFields.map(
                                ({
                                  key: answerKey,
                                  name: answerName,
                                  ...answerRestField
                                }) => (
                                  <Col span={12} key={answerKey}>
                                    <Space
                                      style={{
                                        display: "flex",
                                        marginBottom: 8,
                                      }}
                                      align="baseline"
                                    >
                                      <Form.Item
                                        {...answerRestField}
                                        name={[answerName, "answer"]}
                                        rules={[
                                          {
                                            required: true,
                                            message: "Answer is required",
                                          },
                                        ]}
                                        style={{ width: "100%" }}
                                      >
                                        <Input placeholder="Enter answer" />
                                      </Form.Item>
                                      <MinusCircleOutlined
                                        onClick={() => removeAnswer(answerName)}
                                      />
                                    </Space>
                                  </Col>
                                )
                              )}
                            </Row>

                            {/* Row-Wise Buttons for Add Answer and Remove Question Section */}
                            <Row gutter={16} style={{ marginBottom: 16 }}>
                              <Col span={12}>
                                <Button
                                  type="dashed"
                                  onClick={() => addAnswer()}
                                  block
                                  icon={<PlusOutlined />}
                                >
                                  Add Answer
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

                  {/* Add Question Section Button */}
                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() => {
                        // Add a new question with an initial answer
                        add({
                          questionTitle: "", // Initialize question title
                          answers: [{ answer: "" }], // Initialize with one answer
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
