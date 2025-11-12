import React, { useEffect, useState } from "react";
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
  InputNumber,
  Radio,
  Divider,
  Tag,
  Select,
} from "antd";
import {
  SearchOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  UserOutlined,
  DollarOutlined,
  TagsOutlined,
  SaveOutlined,
  CloseOutlined,
} from "@ant-design/icons";
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
import useS3ImageDelete from "utils/hooks/useS3ImageDelete";
import { fetchAllEvent } from "store/slices/eventSlice";
import { EVENT_TYPES } from "constants/PageConstants";

const { Text } = Typography;

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
  const form = Form.useFormInstance();
  const { isDateRequired, availableOfferDays } = useSelector(
    (state) => state.offers
  );
  const { handleDeleteImage, deletingImages } = useS3ImageDelete("offer");
  const {
    filteredEvents = [],
    loading = false,
    selectedEvent = null,
  } = useSelector((state) => state.event || {});
  // Local state to force re-renders
  const [selectedDays, setSelectedDays] = useState([]);

  useEffect(() => {
    dispatch(getAvailableOfferDays({}));
  }, [dispatch]);

  // Sync local state with form values
  useEffect(() => {
    const formDays = form.getFieldValue("applicable_days") || [];
    console.log("Form days changed:", formDays);
    setSelectedDays(formDays);
  }, [form]);

  // Watch for form field changes
  const watchedDays = Form.useWatch("applicable_days", form) || [];

  useEffect(() => {
    console.log("Watched days changed:", watchedDays);
    setSelectedDays(watchedDays);
  }, [watchedDays]);

  const handleRequiredChanges = (e) => {
    dispatch(setIsDateRequired(e.target.checked));
    if (!e.target.checked) {
      form.setFieldsValue({
        start_date: null,
        end_date: null,
      });
    }
  };

  const disablePastDates = (current) => {
    return current && current < moment().startOf("day");
  };

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

  // Day name mapping for better display
  const getDayDisplayInfo = (dayName) => {
    const dayColors = {
      MONDAY: "#1890ff",
      TUESDAY: "#52c41a",
      WEDNESDAY: "#faad14",
      THURSDAY: "#722ed1",
      FRIDAY: "#eb2f96",
      SATURDAY: "#13c2c2",
      SUNDAY: "#f5222d",
    };

    const dayIcons = {
      MONDAY: "M",
      TUESDAY: "T",
      WEDNESDAY: "W",
      THURSDAY: "T",
      FRIDAY: "F",
      SATURDAY: "S",
      SUNDAY: "S",
    };

    return {
      color: dayColors[dayName] || "#1890ff",
      icon: dayIcons[dayName] || dayName.charAt(0),
      displayName: dayName.charAt(0) + dayName.slice(1).toLowerCase(),
    };
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allDayNames = availableOfferDays.map((day) =>
        day.full_name.toUpperCase()
      );
      form.setFieldsValue({ applicable_days: allDayNames });
      setSelectedDays(allDayNames);
    } else {
      form.setFieldsValue({ applicable_days: [] });
      setSelectedDays([]);
    }
  };

  const handleDayClick = (dayName) => {
    const normalizedDayName = dayName.toUpperCase();
    const currentDays = form.getFieldValue("applicable_days") || [];
    const normalizedCurrentDays = currentDays.map((d) => d.toUpperCase());

    let newDays;
    if (normalizedCurrentDays.includes(normalizedDayName)) {
      newDays = currentDays.filter(
        (d) => d.toUpperCase() !== normalizedDayName
      );
    } else {
      newDays = [...currentDays, normalizedDayName];
    }

    form.setFieldsValue({ applicable_days: newDays });
    setSelectedDays(newDays);
  };
  useEffect(() => {
    if (type === EventType.EVENT) {
      dispatch(fetchAllEvent({ event_type: EVENT_TYPES.event }));
    }
  }, [dispatch, type]);
  const allSelected =
    availableOfferDays?.length > 0 &&
    selectedDays.length === availableOfferDays.length;

  return (
    <Row gutter={16}>
      {/* Left Column - Main Form */}
      <Col xs={24} sm={24} md={17}>
        <Card title="Offer Details" bordered={false}>
          {isOrganizer() && type === EventType.MOVIE ? (
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
          ) : isOrganizer() && type === EventType.EVENT ? (
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
          ) : (
            <></>
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

      {/* Right Column - Applicable Days & Keywords */}
      <Col xs={24} sm={24} md={7}>
        {/* Applicable Days Card */}
        <Card
          title={
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span>Applicable Days</span>
              {selectedDays.length > 0 && (
                <Tag color="blue" style={{ margin: 0 }}>
                  {selectedDays.length} selected
                </Tag>
              )}
            </div>
          }
          bordered={false}
          style={{ marginBottom: "16px" }}
        >
          <div
            style={{
              marginBottom: "16px",
              padding: "12px",
              background: "#f5f5f5",
              borderRadius: "8px",
            }}
          >
            <Checkbox
              checked={allSelected}
              indeterminate={selectedDays.length > 0 && !allSelected}
              onChange={handleSelectAll}
              style={{ fontSize: "14px", fontWeight: 500 }}
            >
              Select All Days
            </Checkbox>
          </div>

          <Form.Item name="applicable_days" noStyle>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "10px",
              }}
            >
              {availableOfferDays?.map((day) => {
                const dayName = day.full_name.toUpperCase();
                const normalizedSelectedDays = selectedDays.map((d) =>
                  d.toUpperCase()
                );
                const isSelected = normalizedSelectedDays.includes(dayName);
                const dayInfo = getDayDisplayInfo(dayName);

                return (
                  <div
                    key={day.id}
                    onClick={() => handleDayClick(dayName)}
                    style={{
                      padding: "12px",
                      borderRadius: "8px",
                      backgroundColor: isSelected
                        ? `${dayInfo.color}15`
                        : "#fafafa",
                      border: isSelected
                        ? `2px solid ${dayInfo.color}`
                        : "1px solid #e0e0e0",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      minHeight: "70px",
                      position: "relative",
                      boxShadow: isSelected
                        ? `0 2px 8px ${dayInfo.color}40`
                        : "0 1px 2px rgba(0,0,0,0.05)",
                      transform: isSelected ? "scale(1.02)" : "scale(1)",
                    }}
                  >
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        backgroundColor: isSelected ? dayInfo.color : "#e0e0e0",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "bold",
                        fontSize: "14px",
                        transition: "all 0.3s ease",
                      }}
                    >
                      {dayInfo.icon}
                    </div>
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: isSelected ? 600 : 400,
                        color: isSelected ? dayInfo.color : "#595959",
                        textAlign: "center",
                      }}
                    >
                      {dayInfo.displayName}
                    </span>
                    {isSelected && (
                      <div
                        style={{
                          position: "absolute",
                          top: "6px",
                          right: "6px",
                          width: "18px",
                          height: "18px",
                          borderRadius: "50%",
                          backgroundColor: dayInfo.color,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "10px",
                          color: "white",
                        }}
                      >
                        ✓
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Form.Item>
        </Card>

        {/* Keywords Card */}
        <Card title="Keywords" bordered={false}>
          <Form.List name="key_words">
            {(fields, { add, remove }) => (
              <>
                <div style={{ marginBottom: "12px" }}>
                  {fields.map(({ key, name, ...restField }) => (
                    <div
                      key={key}
                      style={{
                        display: "flex",
                        marginBottom: 12,
                        gap: "8px",
                        alignItems: "flex-start",
                      }}
                    >
                      <Form.Item
                        {...restField}
                        name={name}
                        rules={[
                          {
                            required: true,
                            message: "Enter keyword",
                          },
                        ]}
                        style={{ marginBottom: 0, flex: 1 }}
                      >
                        <Input placeholder="Enter keyword" size="large" />
                      </Form.Item>
                      <Button
                        type="text"
                        danger
                        size="large"
                        onClick={() => remove(name)}
                        style={{ padding: "4px 8px" }}
                      >
                        ✕
                      </Button>
                    </div>
                  ))}
                </div>
                <Button type="dashed" onClick={() => add()} block size="large">
                  + Add Keyword
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
