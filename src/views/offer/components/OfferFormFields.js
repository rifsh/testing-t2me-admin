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
  Divider,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import {
  getAvailableOfferDays,
  setIsDateRequired,
} from "store/slices/offerSlice";
import moment from "moment";
import {
  SupportImageFormat,
  SupportFormatContent,
  ResolutionByServices,
  ThumbnailImageResolutions,
} from "constants/SupportFileConstants";
import ResizedImgePicker from "components/util-components/Image/ResizedImgePicker";
import { EventType } from "constants/AppConstants";
import TheaterListForm from "components/util-components/FormItems/TheaterListForm";
import { isOrganizer } from "configs/UserAccessConfig";

const { Text, Title } = Typography;
const { Option } = Select;

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
  const { isDateRequired, availableOfferDays } = useSelector(
    (state) => state.offers
  );
  const [form] = Form.useForm();
  const [isAllDaysSelected, setIsAllDaysSelected] = React.useState(false);
  const [applicableDays, setApplicableDays] = React.useState([]);

  const handleRequiredChanges = (e) => {
    dispatch(setIsDateRequired(e.target.checked));
    if (!e.target.checked) {
      form.setFieldsValue({
        start_date: null,
        end_date: null,
      });
    }
  };
  useEffect(() => {
    dispatch(getAvailableOfferDays({}));
  }, [dispatch]);
  const disablePastDates = (current) => {
    return current && current < moment().startOf("day");
  };
  useEffect(() => {
    setApplicableDays(form.getFieldValue("applicable_days") || []);
  }, []);

  const disableEndDate = (current) => {
    const startDateValue = form.getFieldValue("start_date");
    if (!startDateValue) {
      return disablePastDates(current);
    }
    return current && current < moment(startDateValue).startOf("day");
  };

  const handleStartDateChange = (date) => {
    form.setFieldsValue({
      end_date: null,
    });
  };

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList || [];
  };

  const handleAllDaysChange = (e) => {
    const checked = e.target.checked;
    const allDayValues = availableOfferDays.map((day) => day.code);

    if (checked) {
      setApplicableDays(allDayValues);
      form.setFieldsValue({ applicable_days: allDayValues });
    } else {
      setApplicableDays([]);
      form.setFieldsValue({ applicable_days: [] });
    }

    setIsAllDaysSelected(checked);
  };

  const handleDaySelectionChange = (checkedValues) => {
    setApplicableDays(checkedValues);
    form.setFieldsValue({ applicable_days: checkedValues });
    setIsAllDaysSelected(checkedValues.length === availableOfferDays.length);
  };

  return (
    <Row gutter={16}>
      <Col xs={24} sm={24} md={17}>
        <Card title="Offer Details" bordered={false}>
          {type === EventType.MOVIE && isOrganizer() && (
            <>
              <TheaterListForm
                rules={[{ required: true }]}
                form={form}
                mode="multiple"
                name="theatre_ids"
                apiParams={{
                  organizer: true,
                }}
              />
              <Divider style={{ margin: "16px 0" }} />
            </>
          )}

          <Row gutter={16}>
            <Col xs={24} sm={24}>
              <Form.Item name="name" label="Offer Name" rules={rules.name}>
                <Input placeholder="Enter offer name" size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="is_percentage"
                label="Discount Type"
                initialValue={true}
              >
                <Radio.Group size="large">
                  <Radio value={true}>Percentage</Radio>
                  <Radio value={false}>Amount</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
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
                      label="Discount Value"
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
                        placeholder="Enter percentage"
                        min={0}
                        max={100}
                        size="large"
                        style={{ width: "100%" }}
                        suffix="%"
                      />
                    </Form.Item>
                  ) : (
                    <Form.Item
                      name="discount_percentage_amount"
                      label="Discount Value"
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
                        placeholder="Enter amount"
                        min={0}
                        size="large"
                        style={{ width: "100%" }}
                        prefix="₹"
                      />
                    </Form.Item>
                  )
                }
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="max_uses"
                label="Maximum Uses"
                rules={rules.maxUsers}
              >
                <Input
                  type="number"
                  placeholder="Enter maximum uses"
                  size="large"
                  onWheel={(e) => e.target.blur()}
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider style={{ margin: "24px 0" }} />

          <Row gutter={16}>
            <Col xs={24}>
              <label
                style={{
                  fontSize: "14px",
                  fontWeight: 500,
                  display: "block",
                  marginBottom: "8px",
                }}
              >
                Applicable Days
              </label>
              <div
                style={{
                  border: "1px solid #d9d9d9",
                  borderRadius: "8px",
                  padding: "16px",
                  backgroundColor: "#fafafa",
                  marginBottom: "24px",
                }}
              >
                <Checkbox
                  checked={isAllDaysSelected}
                  onChange={handleAllDaysChange}
                  style={{
                    marginBottom: 12,
                    fontSize: "15px",
                    fontWeight: 500,
                  }}
                >
                  <span style={{ color: "#1890ff" }}>Select All Days</span>
                </Checkbox>

                <Form.Item name="applicable_days" style={{ marginBottom: 0 }}>
                  <Checkbox.Group
                    onChange={handleDaySelectionChange}
                    style={{ width: "100%" }}
                  >
                    <Row gutter={[12, 12]}>
                      {availableOfferDays.map((day) => (
                        <Col xs={12} sm={12} md={8} key={day.code}>
                          <div
                            style={{
                              padding: "8px 12px",
                              borderRadius: "6px",
                              backgroundColor: "#fff",
                              border: "1px solid #e8e8e8",
                              transition: "all 0.3s",
                            }}
                          >
                            <Checkbox value={day.code}>
                              {day.full_name}
                            </Checkbox>
                          </div>
                        </Col>
                      ))}
                    </Row>
                  </Checkbox.Group>
                </Form.Item>
              </div>
            </Col>
          </Row>

          <Divider style={{ margin: "24px 0" }} />

          <Row gutter={16}>
            <Col xs={24}>
              <Form.Item
                name="date_required"
                label="Date Range"
                valuePropName="checked"
              >
                <Checkbox
                  checked={isDateRequired}
                  onChange={handleRequiredChanges}
                  style={{ fontSize: "14px" }}
                >
                  Enable specific date range for this offer
                </Checkbox>
              </Form.Item>
            </Col>
          </Row>

          {isDateRequired && (
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="start_date"
                  label="Start Date"
                  rules={rules.startDate}
                >
                  <DatePicker
                    className="w-100"
                    placeholder="Select start date"
                    format="YYYY-MM-DD"
                    size="large"
                    disabledDate={disablePastDates}
                    onChange={handleStartDateChange}
                    showToday={false}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
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
                    size="large"
                    disabledDate={disableEndDate}
                    showToday={false}
                  />
                </Form.Item>
              </Col>
            </Row>
          )}

          <Divider style={{ margin: "24px 0" }} />

          <Row gutter={16}>
            <Col xs={24}>
              <Form.Item
                name="thumbnail_image"
                label={
                  <span style={{ fontSize: "14px", fontWeight: 500 }}>
                    Thumbnail Image
                  </span>
                }
                valuePropName="value"
                getValueFromEvent={normFile}
                style={{ marginBottom: "8px" }}
              >
                <ResizedImgePicker
                  maxCount={1}
                  targetResolution={ThumbnailImageResolutions.OFFER}
                  form={form}
                />
              </Form.Item>
              <Text
                type="secondary"
                style={{ fontSize: "12px", display: "block" }}
              >
                {SupportFormatContent.join(", ")}:{" "}
                {SupportImageFormat.join(", ")} | Resolution:{" "}
                {ResolutionByServices.place} pixels
              </Text>
            </Col>
          </Row>

          <Divider style={{ margin: "24px 0" }} />

          <Row gutter={16}>
            <Col xs={24}>
              <Form.List name="key_words">
                {(fields, { add, remove }) => (
                  <>
                    <label
                      style={{
                        fontSize: "14px",
                        fontWeight: 500,
                        marginBottom: "12px",
                        display: "block",
                      }}
                    >
                      Keywords
                    </label>
                    <div style={{ marginBottom: "12px" }}>
                      {fields.map(({ key, name, fieldKey, ...restField }) => (
                        <Space
                          key={key}
                          style={{
                            display: "flex",
                            marginBottom: 12,
                            alignItems: "flex-start",
                          }}
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
                            style={{ marginBottom: 0, flex: 1 }}
                          >
                            <Input
                              placeholder="Enter keyword"
                              size="large"
                              style={{ minWidth: "300px" }}
                            />
                          </Form.Item>
                          <Button
                            type="text"
                            danger
                            size="large"
                            onClick={() => remove(name)}
                          >
                            Remove
                          </Button>
                        </Space>
                      ))}
                    </div>
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      block
                      size="large"
                      style={{ marginTop: "8px" }}
                    >
                      + Add Keyword
                    </Button>
                  </>
                )}
              </Form.List>
            </Col>
          </Row>
        </Card>
      </Col>
    </Row>
  );
}

export default OfferFormFields;
