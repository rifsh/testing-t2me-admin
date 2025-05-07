import React, { useEffect } from "react";
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
  Typography,
  InputNumber,
  Radio,
  Select,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import { setIsDateRequired } from "store/slices/offerSlice";
import moment from "moment";
import {
  SupportImageFormat,
  SupportFormatContent,
  ResolutionByServices,
  ThumbnailImageResolutions,
} from "constants/SupportFileConstants";
import ResizedImgePicker from "components/util-components/Image/ResizedImgePicker";
import { fetchMoviesData } from "store/slices/movieSlice";
import { fetchAllEvent } from "store/slices/eventSlice";
import { DEFAULT_PAGE_SIZE } from "constants/PageConstants";
import { fetchTheaterByid, fetchTheaters } from "store/slices/theaterSlice";
import { EventType } from "constants/AppConstants";

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
  thumbnail_image: [
    {
      required: true,
      message: "Please upload a thumbnail image",
    },
  ],
};

function OfferFormFields({ type }) {
  const dispatch = useDispatch();
  const { isDateRequired } = useSelector((state) => state.offers);
  const [form] = Form.useForm();
  const { response } = useSelector((state) => state.movie);
  useEffect(() => {
    if (type === EventType.MOVIE) {
      dispatch(fetchTheaters(DEFAULT_PAGE_SIZE));
    }
  }, [dispatch]);
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

  // Fixed disablePastDates function to properly prevent selecting past dates
  const disablePastDates = (current) => {
    // Disable all dates before today
    return current && current < moment().startOf("day");
  };

  // Validate end date based on start date
  const disableEndDate = (current) => {
    const startDateValue = form.getFieldValue("start_date");
    if (!startDateValue) {
      return disablePastDates(current); // Also apply past date restriction to end date
    }
    return current && current < moment(startDateValue).startOf("day");
  };

  const handleStartDateChange = (date) => {
    // Reset end date when start date changes
    form.setFieldsValue({
      end_date: null,
    });
  };

  // Normalize file list to ensure it's always an array
  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList || [];
  };
  const { Option } = Select;

  return (
    <Row gutter={16}>
      <Col xs={24} sm={24} md={17}>
        <Card title="Offer Details">
          {type === EventType.MOVIE && (
            <Form.Item
              name="theatre_ids"
              label="Theatre"
              rules={[{ required: true, message: "Please select a theatre" }]}
            >
              <Select placeholder="Select offer type" mode="multiple">
                {response?.items?.map((movie) => (
                  <Option key={movie.id} value={movie.id}>
                    {movie.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}

          <Form.Item name="name" label="Offer Name" rules={rules.name}>
            <Input placeholder="Enter offer name" />
          </Form.Item>

          <Form.Item
            name="is_percentage"
            label="Discount Type"
            initialValue={true}
          >
            <Radio.Group>
              <Radio value={true}>Percentage</Radio>
              <Radio value={false}>Amount</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.is_percentage !== currentValues.is_percentage
            }
          >
            {({ getFieldValue }) =>
              getFieldValue("is_percentage") === true ? (
                <Form.Item
                  name="discount_percentage_amount"
                  label="Discount Percentage"
                  rules={[
                    {
                      required: true,
                      message: "Please enter discount percentage",
                    },
                    {
                      type: "number",
                      min: 0,
                      max: 100,
                      message: "Discount must be between 0 and 100",
                    },
                  ]}
                >
                  <InputNumber
                    placeholder="Enter discount percentage"
                    min={0}
                    style={{ width: "100%" }}
                    max={100}
                    formatter={(value) => `${value}`}
                    parser={(value) => value.replace("", "")}
                  />
                </Form.Item>
              ) : (
                <Form.Item
                  style={{ width: "100%" }}
                  name="discount_percentage_amount"
                  label="Discount Amount"
                  rules={[
                    {
                      required: true,
                      message: "Please enter discount amount",
                    },
                    {
                      type: "number",
                      min: 0,
                      message:
                        "Discount amount must be greater than or equal to 0",
                    },
                  ]}
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    placeholder="Enter discount amount"
                    min={0}
                    formatter={(value) => `${value}`}
                    parser={(value) => value.replace("", "")}
                  />
                </Form.Item>
              )
            }
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
            valuePropName="value"
            getValueFromEvent={normFile}
            style={{ marginBottom: "0px", padding: "0px" }}
          >
            <ResizedImgePicker
              maxCount={1}
              targetResolution={ThumbnailImageResolutions.OFFER}
              form={form}
            />
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

      {/* Image Cropper Modal */}
    </Row>
  );
}

export default OfferFormFields;
