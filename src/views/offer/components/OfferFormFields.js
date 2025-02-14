import React from "react";
import {
  Input,
  Row,
  Col,
  Card,
  Form,
  DatePicker,
  Checkbox,
  Button,
  Space,
  Upload,
  Typography,
  message,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import { setIsDateRequired } from "store/slices/offerSlice";
import moment from "moment";
import { UploadOutlined } from "@ant-design/icons";
import {
  SupportImageFormat,
  SupportFormatContent,
  ResolutionByServices,
} from "constants/SupportFileConstants";
import Utils from "utils/index";

const { Text } = Typography;
const rules = {
  name: [
    {
      required: true,
      message: "Please enter the offer name",
    },
  ],
  discountPercentage: [
    {
      required: true,
      message: "Please enter the discount percentage",
    },
  ],
  maxUsers: [
    {
      required: true,
      message: "Please enter the maximum number of users",
    },
  ],
  endDate: [
    {
      required: true,
      message: "Please select the end date",
    },
  ],
  startDate: [
    {
      required: true,
      message: "Please select the start date",
    },
  ],
};

function OfferFormFields() {
  const dispatch = useDispatch();
  const { isDateRequired } = useSelector((state) => state.offers);
  const [form] = Form.useForm();
  const startDate = Form.useWatch("start_date", form);

  const handleRequiredChanges = (e) => {
    dispatch(setIsDateRequired(e.target.checked));
    // Reset dates when toggling date requirement
    if (!e.target.checked) {
      form.setFieldsValue({
        start_date: null,
        end_date: null,
      });
    }
  };

  // Disallow selecting dates before today
  const disablePastDates = (current) => {
    const startDate = form.getFieldValue("start_date");
    return (
      current &&
      current < moment().startOf("day") &&
      !moment(current).isSame(startDate, "day")
    );
  };
  // Validate end date based on start date
  const disableEndDate = (current) => {
    if (!startDate) {
      return false;
    }
    return current && current < moment(startDate).startOf("day");
  };

  const handleStartDateChange = (date) => {
    // Reset end date when start date changes
    form.setFieldsValue({
      end_date: null,
    });
  };
  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };
  const handleBeforeUpload = Utils.handleBeforeUpload;

  return (
    <Row gutter={16}>
      <Col xs={24} sm={24} md={17}>
        <Card title="Offer Details">
          <Form.Item name="name" label="Offer Name" rules={rules.name}>
            <Input placeholder="Enter offer name" />
          </Form.Item>
          <Form.Item
            name="discount_percentage"
            label="Discount Percentage (%)"
            rules={rules.discountPercentage}
          >
            <Input placeholder="Enter discount percentage" />
          </Form.Item>
          <Form.Item
            name="max_uses"
            label="Maximum Users"
            rules={rules.maxUsers}
          >
            <Input
              type="number"
              placeholder="Enter maximum uses"
              onWheel={(e) => e.target.blur()}
            />
          </Form.Item>
          <Form.Item
            name="date_required"
            label="Is Date Required?"
            valuePropName="checked"
          >
            <Checkbox checked={isDateRequired} onChange={handleRequiredChanges}>
              Date Required
            </Checkbox>
          </Form.Item>

          {isDateRequired && (
            <>
              <Form.Item
                name="start_date"
                label="Start Date"
                rules={rules.startDate}
              >
                <DatePicker
                  className="w-100"
                  placeholder="Select start date"
                  format="YYYY-MM-DD"
                  disabledDate={disablePastDates}
                  onChange={handleStartDateChange}
                  showToday={false}
                />
              </Form.Item>
              <Form.Item
                name="end_date"
                label="End Date"
                rules={[
                  ...rules.endDate,
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const startDate = getFieldValue("start_date");
                      if (!startDate || !value) {
                        return Promise.resolve();
                      }
                      if (value.isBefore(startDate, "day")) {
                        return Promise.reject(
                          new Error("End date must be after start date")
                        );
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <DatePicker
                  className="w-100"
                  placeholder="Select end date"
                  format="YYYY-MM-DD"
                  disabledDate={disableEndDate}
                  showToday={false}
                />
              </Form.Item>
            </>
          )}

          <Form.Item
            name="thumbnail_image"
            label="Thumbnail Image"
            valuePropName="fileList"
            getValueFromEvent={normFile}
            rules={rules.thumbnail_image}
            style={{ marginBottom: "0px", padding: "0px" }}
          >
            <Upload
              name="thumbnail_image"
              listType="picture"
              maxCount={1}
              //beforeUpload={handleBeforeUpload}
              beforeUpload={(file) =>
                Utils.handleBeforeUpload(file, ResolutionByServices.place)
              }
              accept={`.${SupportImageFormat.join(",.")}`}
            >
              <Button icon={<UploadOutlined />}>Click to upload</Button>
            </Upload>
          </Form.Item>
          <div>
            <Text
              type="warning"
              style={{ padding: "00px 00px", fontSize: "11px" }}
            >
              {SupportFormatContent.join(",")}: {SupportImageFormat.join(", ")}{" "}
              &{" resolution "}
              {ResolutionByServices.place} pixels.{" "}
            </Text>
          </div>

          <Form.List name="key_words">
            {(fields, { add, remove }) => (
              <>
                <label>Key Words</label>
                {fields.map(({ key, name, fieldKey, ...restField }) => (
                  <Space
                    key={key}
                    style={{ display: "flex", marginBottom: 8 }}
                    align="baseline"
                  >
                    <Form.Item
                      {...restField}
                      name={name}
                      fieldKey={fieldKey}
                      rules={[
                        {
                          required: true,
                          message: "Please enter a keyword",
                        },
                      ]}
                    >
                      <Input placeholder="Enter keyword" />
                    </Form.Item>
                    <Button type="link" danger onClick={() => remove(name)}>
                      Remove
                    </Button>
                  </Space>
                ))}
                <Button type="dashed" onClick={() => add()} block>
                  Add Keyword
                </Button>
              </>
            )}
          </Form.List>
        </Card>
      </Col>
    </Row>
  );
}

export default OfferFormFields;
