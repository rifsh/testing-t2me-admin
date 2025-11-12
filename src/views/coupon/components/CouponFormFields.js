import React, { useState, useEffect } from "react";
import {
  Input,
  Row,
  Col,
  Card,
  Form,
  DatePicker,
  Checkbox,
  Button,
  Typography,
  Radio,
  Alert,
  InputNumber,
  Select,
  Divider,
} from "antd";
import moment from "moment";
import { useDispatch, useSelector } from "react-redux";
import {
  PlusOutlined,
  DeleteOutlined,
  SearchOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { setIsDateRequired } from "store/slices/couponSlice";
import {
  SupportImageFormat,
  SupportFormatContent,
  ResolutionByServices,
  ThumbnailImageResolutions,
} from "constants/SupportFileConstants";
import ResizedImgePicker from "components/util-components/Image/ResizedImgePicker";
import { fetchAllEvent } from "store/slices/eventSlice";
import { EVENT_TYPES, DEFAULT_PAGE_SIZE } from "constants/PageConstants";
import TheaterListForm from "components/util-components/FormItems/TheaterListForm";
import { EventType } from "constants/AppConstants";
import { isOrganizer } from "configs/UserAccessConfig";
import useS3ImageDelete from "utils/hooks/useS3ImageDelete";

const { Text } = Typography;
const { Group: RadioGroup } = Radio;
const { Option } = Select;

function CouponFormFields({ form, type }) {
  const dispatch = useDispatch();
  const startDate = Form.useWatch("start_date", form);
  const { isDateRequired } = useSelector((state) => state.coupons);
  const { handleDeleteImage, deletingImages } = useS3ImageDelete("coupon");
  
  const {
    filteredEvents = [],
    loading = false,
  } = useSelector((state) => state.event || {});

  const [couponType, setCouponType] = useState(true);
  const [couponCodeType, setCouponCodeType] = useState(false);

  // ✅ Check if user is organizer
  const userIsOrganizer = isOrganizer();

  // Each row can have up to MAX_FIELDS_PER_ROW fields
  const MAX_FIELDS_PER_ROW = 3;

  // Store the coupon code fields as a flat array
  const [couponFields, setCouponFields] = useState([{ id: 1 }]);

  // ✅ Fetch events only if type is EVENT and user is organizer
  useEffect(() => {
    if (type === EventType.EVENT && userIsOrganizer) {
      dispatch(fetchAllEvent({ 
        event_type: EVENT_TYPES.event,
        organizer: true 
      }));
    }
  }, [dispatch, type, userIsOrganizer]);

  // Add a new coupon field
  const addCouponField = () => {
    const newId =
      couponFields.length > 0
        ? Math.max(...couponFields.map((field) => field.id)) + 1
        : 1;

    setCouponFields([...couponFields, { id: newId }]);
  };

  // Delete a coupon field
  const deleteCouponField = (idToDelete) => {
    // Only allow deletion if there's more than one field
    if (couponFields.length > 1) {
      const updatedFields = couponFields.filter(
        (field) => field.id !== idToDelete
      );
      setCouponFields(updatedFields);

      // Clear the form value for the deleted field
      const currentValues = form.getFieldValue("key_words") || {};
      const newValues = { ...currentValues };
      delete newValues[idToDelete];
      form.setFieldsValue({ key_words: newValues });
    }
  };

  // Calculate rows based on coupon fields
  const getRows = () => {
    const rows = [];
    let currentRow = [];

    couponFields.forEach((field) => {
      currentRow.push(field);

      if (currentRow.length === MAX_FIELDS_PER_ROW) {
        rows.push([...currentRow]);
        currentRow = [];
      }
    });

    if (currentRow.length > 0) {
      rows.push(currentRow);
    }

    return rows;
  };

  // Initialize the form with existing values if editing
  useEffect(() => {
    const existingKeyWords = form.getFieldValue("key_words");
    if (existingKeyWords && typeof existingKeyWords === "object") {
      const ids = Object.keys(existingKeyWords).map((id) => parseInt(id));
      if (ids.length > 0) {
        const maxId = Math.max(...ids);
        const fields = ids.map((id) => ({ id: parseInt(id) }));
        setCouponFields(fields);
      }
    }
  }, [form]);

  // Ensure isDateRequired is synchronized with form values
  useEffect(() => {
    // When form loads with dates, make sure isDateRequired is set correctly
    const startDateValue = form.getFieldValue("start_date");
    const endDateValue = form.getFieldValue("end_date");
    if (startDateValue || endDateValue) {
      dispatch(setIsDateRequired(true));
    }
  }, [form, dispatch]);

  const handleDateRequiredChange = (e) => {
    const isChecked = e.target.checked;
    dispatch(setIsDateRequired(isChecked));

    // When unchecking, clear dates
    if (!isChecked) {
      form.setFieldsValue({
        start_date: null,
        end_date: null,
      });
    }
  };

  const handleCouponTypeChange = (e) => {
    setCouponType(e.target.value);
  };

  const handleCouponCodeTypeChange = (e) => {
    setCouponCodeType(e.target.value);
  };

  const disablePastDates = (current) => {
    return current && current < moment().startOf("day");
  };

  const disableEndDate = (current) => {
    if (!startDate) {
      return false;
    }
    // Handle both moment and dayjs instances
    const start = moment.isDayjs
      ? startDate.startOf("day")
      : moment(startDate).startOf("day");
    return current && current < start;
  };

  const handleStartDateChange = () => {
    form.setFieldValue("end_date", null);
  };

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList || [];
  };

  // Get rows for rendering
  const rows = getRows();

  return (
    <Row gutter={16}>
      <Col xs={24} sm={24} md={17}>
        <Card title="Coupon Details" bordered={false}>
          {/* ✅ Conditional rendering based on organizer status AND type */}
          {userIsOrganizer && type === EventType.MOVIE ? (
            <>
              <TheaterListForm
                rules={[{ required: true }]}
                form={form}
                mode="multiple"
                name="theatre_ids"
                label="Theaters"
                apiParams={{
                  organizer: true,
                }}
              />
              <Divider style={{ margin: "16px 0" }} />
            </>
          ) : userIsOrganizer && type === EventType.EVENT ? (
            <>
              <Form.Item
                name="event_ids"
                label="Events"
                rules={[
                  {
                    required: true,
                    message: "Please select at least one event!",
                  },
                ]}
              >
                <Select
                  showSearch
                  placeholder="Search and select events"
                  mode="multiple"
                  allowClear
                  suffixIcon={<SearchOutlined />}
                  loading={loading}
                  filterOption={(input, option) =>
                    option.children.props.children[1]
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  size="large"
                >
                  {filteredEvents?.map((event) => (
                    <Option key={event.id} value={event.id}>
                      <div className="font-medium text-gray-900 flex items-center">
                        <CalendarOutlined className="mr-2 text-blue-500" />
                        {event.event_name}
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Divider style={{ margin: "16px 0" }} />
            </>
          ) : null}

          <Form.Item
            name="name"
            label="Coupon Name"
            rules={[{ required: true, message: "Please enter coupon name" }]}
          >
            <Input placeholder="Enter Coupon Name" size="large" />
          </Form.Item>

          <Form.Item
            name="is_single"
            label="Coupon Type"
            rules={[{ required: true, message: "Please select coupon type" }]}
            initialValue={true}
          >
            <RadioGroup onChange={handleCouponTypeChange} value={couponType}>
              <Radio value={true}>Single Use (One-time use per user)</Radio>
              <Radio value={false}>
                Multiple Use (Can be used multiple times by same user)
              </Radio>
            </RadioGroup>
          </Form.Item>

          <Form.Item
            name="is_reusable"
            label="How Can This Coupon Be Used"
            rules={[
              {
                required: true,
                message: "Please select how this coupon can be used",
              },
            ]}
            initialValue={false}
          >
            <RadioGroup
              onChange={handleCouponCodeTypeChange}
              value={couponCodeType}
            >
              <Radio value={false}>
                One-Time Only (Can be used just once by anyone)
              </Radio>
              <Radio value={true}>
                Limited Uses (Can be used by multiple people, up to a limit)
              </Radio>
            </RadioGroup>
          </Form.Item>

          {couponCodeType === true && (
            <Form.Item
              name="max_uses"
              label="Maximum Number of Uses"
              rules={[
                {
                  required: true,
                  message:
                    "Please enter how many times this coupon can be used",
                },
                {
                  type: "number",
                  transform: (value) => Number(value),
                  min: 1,
                  message: "Total uses must be at least 1",
                },
              ]}
            >
              <Input
                type="number"
                placeholder="How many times can this coupon be used?"
                size="large"
                onWheel={(e) => e.target.blur()}
              />
            </Form.Item>
          )}

          <Form.Item label="Coupon Codes">
            <div>
              {rows.map((row, rowIndex) => (
                <Row
                  gutter={8}
                  key={`row-${rowIndex}`}
                  style={{ marginBottom: "8px" }}
                >
                  {row.map((field) => (
                    <Col
                      key={`field-${field.id}`}
                      xs={24}
                      sm={8}
                      style={{ marginBottom: "8px" }}
                    >
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <Form.Item
                          name={["key_words", `${field.id}`]}
                          rules={[
                            {
                              required: true,
                              message: `Please enter coupon code`,
                            },
                          ]}
                          style={{ marginBottom: 0, flex: 1 }}
                        >
                          <Input placeholder="Coupon code" size="large" />
                        </Form.Item>

                        {/* Only show delete button when there's more than one coupon field */}
                        {couponFields.length > 1 && (
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => deleteCouponField(field.id)}
                            style={{ marginLeft: "8px" }}
                          />
                        )}
                      </div>
                    </Col>
                  ))}

                  {row.length < MAX_FIELDS_PER_ROW &&
                    rowIndex === rows.length - 1 && (
                      <Col xs={24} sm={8}>
                        <Button
                          type="dashed"
                          icon={<PlusOutlined />}
                          onClick={addCouponField}
                          size="large"
                        >
                          Add Coupon Code
                        </Button>
                      </Col>
                    )}
                </Row>
              ))}

              {rows.length > 0 &&
                rows[rows.length - 1].length === MAX_FIELDS_PER_ROW && (
                  <Row>
                    <Col>
                      <Button
                        type="dashed"
                        icon={<PlusOutlined />}
                        onClick={addCouponField}
                        size="large"
                        style={{ marginTop: "4px" }}
                      >
                        Add Coupon Code
                      </Button>
                    </Col>
                  </Row>
                )}
            </div>
          </Form.Item>

          <Divider style={{ margin: "24px 0" }} />

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="is_percentage"
                label="Discount Type"
                initialValue={false}
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
                        formatter={(value) => `${value}`}
                        parser={(value) => value.replace("", "")}
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
                        formatter={(value) => `${value}`}
                        parser={(value) => value.replace("", "")}
                      />
                    </Form.Item>
                  )
                }
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="min_purchase_amount"
            label="Minimum Purchase Amount"
            rules={[
              {
                required: true,
                message: "Please enter minimum purchase amount",
              },
              {
                type: "number",
                transform: (value) => Number(value),
                min: 0,
                message: "Minimum purchase amount cannot be negative",
              },
            ]}
          >
            <Input
              type="number"
              placeholder="Enter minimum purchase amount"
              size="large"
              onWheel={(e) => e.target.blur()}
            />
          </Form.Item>

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
                  onChange={handleDateRequiredChange}
                  style={{ fontSize: "14px" }}
                >
                  Enable specific date range for this coupon
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
                  rules={[
                    { required: true, message: "Please select the start date" },
                  ]}
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
                    { required: true, message: "Please select the end date" },
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

          <Form.Item name="is_offline" label="Coupon Type" initialValue={true}>
            <Radio.Group size="large">
              <Radio value={true}>Offline</Radio>
              <Radio value={false}>Online</Radio>
            </Radio.Group>
          </Form.Item>

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
                  targetResolution={ThumbnailImageResolutions.COUPON}
                  form={form}
                  onDelete={handleDeleteImage}
                  deletingImages={deletingImages}
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
        </Card>
      </Col>

      <Col xs={24} sm={24} md={7}>
        <Card title="Coupon Information" bordered={false}>
          <Alert
            message="Important Note"
            description="Expired coupons cannot be edited."
            type="warning"
            showIcon
            className="mb-4"
          />

          <Alert
            message="User-Specific Single Use"
            description="Each user can use this coupon once. Example: 'WELCOME10' can be used once by each customer."
            type="info"
            showIcon
            className="mb-2"
          />
          <Alert
            message="User-Specific Multiple Use"
            description="Each user can use this coupon multiple times. Example: 'LOYALTY20' can be used repeatedly by the same customer."
            type="info"
            showIcon
            className="mb-2"
          />
          <Alert
            message="One-Time Only"
            description="Can only be used once by the first customer who applies it. Example: 'FLASH50' works only for the first person who uses it."
            type="info"
            showIcon
            className="mb-2"
          />

          <Alert
            message="Limited Uses"
            description="Can be used by multiple people until it reaches its limit. Example: 'SUMMER2025' is available for all customers until it's been used the maximum number of times."
            type="info"
            showIcon
          />
        </Card>
      </Col>
    </Row>
  );
}

export default CouponFormFields;
