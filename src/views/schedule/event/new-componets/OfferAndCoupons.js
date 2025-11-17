import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Form,
  Select,
  Button,
  Tag,
  Table,
  DatePicker,
  Space,
  Alert,
  message,
} from "antd";
import {
  ClockCircleOutlined,
  CalendarOutlined,
  EditOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  SaveOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import CustomModal from "./CustomModal";
import {
  validateCompleteConfiguration,
  filterAvailableDates,
  getWeekdayMessage,
  getDisabledDate,
  validateOfferWithinSchedule,
} from "../utils/offerCouponValidation";
import { useSelector } from "react-redux";

const { Option } = Select;
const { RangePicker } = DatePicker;

// Weekday mapping
const WEEKDAY_MAP = {
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
  SUNDAY: 0,
};

// Helper functions
const extractAvailableDates = (showDates) => {
  if (!showDates || !Array.isArray(showDates)) return [];
  return showDates.map((sd) => sd.start_date || sd.startdate);
};

const extractAvailableTimeSlots = (showDates) => {
  if (!showDates || !Array.isArray(showDates)) return [];

  const timeSlotSet = new Set();
  const timeSlots = [];

  showDates.forEach((showDate) => {
    const showtimes = showDate.show_times || showDate.showtimes || [];
    showtimes.forEach((slot) => {
      const startTime = slot.start_time || slot.starttime;
      const endTime = slot.end_time || slot.endtime;
      const timeKey = `${startTime}-${endTime}`;

      if (!timeSlotSet.has(timeKey)) {
        timeSlotSet.add(timeKey);
        timeSlots.push({
          id: slot.show_time_id || slot.id || `slot-${timeSlots.length}`,
          label: `${startTime} - ${endTime}`,
          start_time: startTime,
          end_time: endTime,
        });
      }
    });
  });

  return timeSlots;
};

// Filter dates by weekday associations
const filterDatesByWeekdays = (dates, weekdayAssociations) => {
  if (!weekdayAssociations || weekdayAssociations.length === 0) {
    return dates;
  }

  const allowedWeekdays = weekdayAssociations.map(
    (w) => WEEKDAY_MAP[w.weekday]
  );

  return dates.filter((date) => {
    const dayOfWeek = dayjs(date).day();
    return allowedWeekdays.includes(dayOfWeek);
  });
};

// Filter time slots for a specific date based on weekday
const filterTimeSlotsForDate = (
  date,
  allTimeSlots,
  showDates,
  weekdayAssociations
) => {
  if (!weekdayAssociations || weekdayAssociations.length === 0) {
    return allTimeSlots;
  }

  const dayOfWeek = dayjs(date).day();
  const allowedWeekdays = weekdayAssociations.map(
    (w) => WEEKDAY_MAP[w.weekday]
  );

  if (!allowedWeekdays.includes(dayOfWeek)) {
    return [];
  }

  const showDate = showDates.find(
    (sd) => (sd.start_date || sd.startdate) === date
  );

  if (!showDate) {
    return allTimeSlots;
  }

  const showtimes = showDate.show_times || showDate.showtimes || [];
  return allTimeSlots.filter((slot) => {
    return showtimes.some((st) => {
      const startTime = st.start_time || st.starttime;
      const endTime = st.end_time || st.endtime;
      return slot.start_time === startTime && slot.end_time === endTime;
    });
  });
};

// Calculate the valid date range intersection
const getValidDateRangeIntersection = (
  offerStart,
  offerEnd,
  scheduleStart,
  scheduleEnd
) => {
  if (!offerStart || !offerEnd) return null;
  if (!scheduleStart || !scheduleEnd) {
    return [dayjs(offerStart), dayjs(offerEnd)];
  }

  const offerStartDate = dayjs(offerStart);
  const offerEndDate = dayjs(offerEnd);
  const scheduleStartDate = dayjs(scheduleStart);
  const scheduleEndDate = dayjs(scheduleEnd);

  const validStart = offerStartDate.isAfter(scheduleStartDate)
    ? offerStartDate
    : scheduleStartDate;

  const validEnd = offerEndDate.isBefore(scheduleEndDate)
    ? offerEndDate
    : scheduleEndDate;

  if (validStart.isAfter(validEnd)) {
    return null;
  }

  return [validStart, validEnd];
};

// Configuration Modal Component
const ConfigModal = ({
  isOpen,
  onClose,
  onSave,
  itemData,
  availableDates,
  availableTimeSlots,
  scheduleRange,
  showDates,
}) => {
  const [form] = Form.useForm();
  const [offerLevel, setOfferLevel] = useState(null);
  const [selectedDates, setSelectedDates] = useState([]);
  const [timeSlotsByDate, setTimeSlotsByDate] = useState({});

  const offerOrCoupon = itemData?.offer || itemData?.coupons || {};
  const startDate = offerOrCoupon.start_date;
  const endDate = offerOrCoupon.end_date;
  const weekdayAssociations = offerOrCoupon.weekday_associations || [];

  useEffect(() => {
    if (isOpen && itemData) {
      setOfferLevel(itemData.offerLevel || null);
      setSelectedDates(itemData.dates || []);
      setTimeSlotsByDate(itemData.timeSlotsByDate || {});

      const intersection = getValidDateRangeIntersection(
        startDate,
        endDate,
        scheduleRange?.start_date,
        scheduleRange?.end_date
      );

      if (intersection) {
        form.setFieldsValue({
          validityDates: intersection,
        });
      } else if (itemData.valid_from && itemData.valid_to) {
        form.setFieldsValue({
          validityDates: [dayjs(itemData.valid_from), dayjs(itemData.valid_to)],
        });
      }
    }
  }, [isOpen, itemData, form, scheduleRange, startDate, endDate]);

  const filteredDates = filterDatesByWeekdays(
    filterAvailableDates(
      availableDates,
      startDate,
      endDate,
      weekdayAssociations,
      scheduleRange?.start_date,
      scheduleRange?.end_date
    ),
    weekdayAssociations
  );

  const disabledDate = (current) => {
    return getDisabledDate(
      current,
      startDate,
      endDate,
      scheduleRange?.start_date,
      scheduleRange?.end_date
    );
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const [validFrom, validTo] = values.validityDates;

      const validation = validateCompleteConfiguration(
        {
          offerLevel,
          selectedDates,
          timeSlotsByDate,
          validFrom,
          validTo,
        },
        itemData,
        scheduleRange
      );

      if (!validation.isValid) {
        message.error(validation.message);
        return;
      }

      // Convert timeSlotsByDate to flat array of time slot IDs for API
      let selectedTimeSlots = [];
      if (offerLevel === "timeslot") {
        selectedTimeSlots = Object.values(timeSlotsByDate).flat();
      }

      onSave({
        offerLevel,
        dates: selectedDates,
        timeSlotsByDate,
        valid_from: validFrom.format("YYYY-MM-DD"),
        valid_to: validTo.format("YYYY-MM-DD"),
        selected_time_slots: selectedTimeSlots,
        selected_show_dates: offerLevel === "date" ? selectedDates : [],
      });

      setOfferLevel(null);
      setSelectedDates([]);
      setTimeSlotsByDate({});
      form.resetFields();
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const handleCancel = () => {
    setOfferLevel(null);
    setSelectedDates([]);
    setTimeSlotsByDate({});
    form.resetFields();
    onClose();
  };

  const toggleDate = (date) => {
    setSelectedDates((prev) =>
      prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date]
    );
  };

  const toggleTimeSlot = (date, slotId) => {
    setTimeSlotsByDate((prev) => {
      const current = prev[date] || [];
      const updated = current.includes(slotId)
        ? current.filter((id) => id !== slotId)
        : [...current, slotId];
      return { ...prev, [date]: updated };
    });
  };

  const footer = (
    <>
      <button
        onClick={handleCancel}
        className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
      >
        Cancel
      </button>
      <button
        onClick={handleSave}
        className="px-6 py-2 text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-sm"
      >
        Save Configuration
      </button>
    </>
  );

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={handleCancel}
      title={
        <div className="flex items-center gap-2">
          <EditOutlined className="text-blue-600" />
          <span>Configure: {itemData?.name || itemData?.code}</span>
        </div>
      }
      size="lg"
      footer={footer}
    >
      <Form form={form} layout="vertical" className="space-y-6">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
          <Form.Item
            label={
              <span className="font-semibold text-gray-700">
                Validity Period (Must be within{" "}
                {dayjs(startDate).format("MMM DD")} -{" "}
                {dayjs(endDate).format("MMM DD, YYYY")})
              </span>
            }
            name="validityDates"
            rules={[
              { required: true, message: "Please select validity dates" },
            ]}
            className="mb-0"
          >
            <RangePicker
              className="w-full"
              size="large"
              format="YYYY-MM-DD"
              placeholder={["Start Date", "End Date"]}
              disabledDate={disabledDate}
            />
          </Form.Item>
        </div>

        {scheduleRange && (
          <Alert
            message="Schedule Period"
            description={`All offers/coupons must be configured within the event schedule: ${dayjs(
              scheduleRange.start_date
            ).format("MMM DD, YYYY")} - ${dayjs(scheduleRange.end_date).format(
              "MMM DD, YYYY"
            )}`}
            type="info"
            showIcon
            icon={<InfoCircleOutlined />}
          />
        )}

        {offerLevel === "schedule" && weekdayAssociations.length > 0 && (
          <Alert
            message={getWeekdayMessage(weekdayAssociations)}
            type="warning"
            showIcon
          />
        )}

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Configuration Type
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              {
                value: "schedule",
                icon: CalendarOutlined,
                label: "Schedule Level",
                desc: "Apply to entire schedule",
              },
              {
                value: "date",
                icon: CalendarOutlined,
                label: "Date Based",
                desc: "Select specific dates",
              },
              {
                value: "timeslot",
                icon: ClockCircleOutlined,
                label: "Time Slot Level",
                desc: "Configure per time slot",
              },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setOfferLevel(option.value)}
                className={`p-3 rounded-xl border-2 transition-all text-left relative ${
                  offerLevel === option.value
                    ? "border-blue-500 bg-blue-50 shadow-md"
                    : "border-gray-200 bg-white hover:border-blue-300 hover:shadow"
                }`}
              >
                <div className="flex items-start gap-3">
                  <option.icon
                    className={`text-xl mt-1 ${
                      offerLevel === option.value
                        ? "text-blue-600"
                        : "text-gray-400"
                    }`}
                  />
                  <div>
                    <div className="font-semibold text-gray-800">
                      {option.label}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {option.desc}
                    </div>
                  </div>
                </div>
                {offerLevel === option.value && (
                  <CheckCircleOutlined className="text-blue-600 absolute top-2 right-2" />
                )}
              </button>
            ))}
          </div>
        </div>

        {(offerLevel === "date" || offerLevel === "timeslot") && (
          <div className="rounded-xl">
            <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <CalendarOutlined className="text-blue-600" />
              Select Dates
              {weekdayAssociations.length > 0 && (
                <span className="text-xs text-gray-500 font-normal">
                  (Filtered by available weekdays)
                </span>
              )}
            </h3>
            {filteredDates.length === 0 ? (
              <Alert
                message="No dates available"
                description="No dates match the offer's validity period, weekday restrictions, and schedule range."
                type="warning"
                showIcon
              />
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                {filteredDates.map((date) => {
                  const isSelected = selectedDates.includes(date);
                  const dayOfWeek = dayjs(date)
                    .format("ddd")
                    .toUpperCase()
                    .substring(0, 3);
                  return (
                    <button
                      key={date}
                      type="button"
                      onClick={() => toggleDate(date)}
                      className={`p-2 rounded-xl transition-all text-center ${
                        isSelected
                          ? "bg-blue-600 text-white shadow-md scale-105"
                          : "bg-white text-gray-700 hover:bg-blue-50 hover:border-blue-300 border border-gray-200"
                      }`}
                    >
                      <div className="text-lg font-bold">
                        {dayjs(date).format("DD")}
                      </div>
                      <div className="text-xs opacity-80">
                        {dayjs(date).format("MMM")}
                      </div>
                      <div className="text-[10px] opacity-70">{dayOfWeek}</div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {offerLevel === "timeslot" && selectedDates.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-700 flex items-center gap-2">
              <ClockCircleOutlined className="text-green-600" />
              Configure Time Slots
              {weekdayAssociations.length > 0 && (
                <span className="text-xs text-gray-500 font-normal ml-2">
                  (Showing slots available for selected weekdays)
                </span>
              )}
            </h3>
            {selectedDates.map((date) => {
              const slots = timeSlotsByDate[date] || [];
              const filteredTimeSlots = filterTimeSlotsForDate(
                date,
                availableTimeSlots,
                showDates,
                weekdayAssociations
              );

              return (
                <div
                  key={date}
                  className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm"
                >
                  <div className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                    <CalendarOutlined className="text-blue-500" />
                    {dayjs(date).format("dddd, MMMM DD, YYYY")}
                  </div>
                  {filteredTimeSlots.length === 0 ? (
                    <Alert
                      message="No time slots available for this date"
                      type="warning"
                      showIcon
                      size="small"
                    />
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {filteredTimeSlots.map((slot) => {
                        const isSelected = slots.includes(slot.id);
                        return (
                          <button
                            key={slot.id}
                            type="button"
                            onClick={() => toggleTimeSlot(date, slot.id)}
                            className={`p-2 rounded-xl transition-all text-center text-sm ${
                              isSelected
                                ? "bg-green-600 text-white shadow-md"
                                : "bg-gray-50 text-gray-700 hover:bg-green-50 hover:border-green-300 border border-gray-200"
                            }`}
                          >
                            <ClockCircleOutlined
                              className={`mb-1 ${
                                isSelected ? "text-white" : "text-gray-400"
                              }`}
                            />
                            <div className="font-medium text-xs leading-tight">
                              {slot.label}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Form>
    </CustomModal>
  );
};

// Main Component
const OfferCouponConfig = ({ onSubmit, onBack }) => {
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [configurations, setConfigurations] = useState([]);
  const [pendingSelection, setPendingSelection] = useState(null);

  const hasMountedRef = useRef(false);

  const { eventDetails } = useSelector((state) => state.event);
  const scheduleFormData = useSelector(
    (state) => state?.schedules?.scheduleFormData || {}
  );

  useEffect(() => {
    hasMountedRef.current = true;
  }, []);

  const scheduleRange = {
    start_date: scheduleFormData.start_date,
    end_date: scheduleFormData.end_date,
  };

  const showDates =
    scheduleFormData.show_dates || scheduleFormData.showdates || [];
  const availableDates = extractAvailableDates(showDates);
  const availableTimeSlots = extractAvailableTimeSlots(showDates);

  const offers = (eventDetails?.event_offers || []).map((item) => {
    const offerValidation = validateOfferWithinSchedule(
      item.offer.start_date,
      item.offer.end_date,
      scheduleRange.start_date,
      scheduleRange.end_date
    );

    return {
      id: item.offer.id,
      name: item.offer.name,
      discount: item.offer.discount_percentage_amount,
      type: "offer",
      offer: item.offer,
      valid_from: item.valid_from,
      valid_to: item.valid_to,
      isValid: offerValidation.isValid,
      validationMessage: offerValidation.message,
    };
  });

  const coupons = (eventDetails?.event_coupons || []).map((item) => {
    const couponValidation = validateOfferWithinSchedule(
      item.coupons.start_date,
      item.coupons.end_date,
      scheduleRange.start_date,
      scheduleRange.end_date
    );

    return {
      id: item.coupons.id,
      code: item.coupons.name,
      discount: item.coupons.discount_percentage_amount,
      type: "coupon",
      coupons: item.coupons,
      valid_from: item.valid_from,
      valid_to: item.valid_to,
      isValid: couponValidation.isValid,
      validationMessage: couponValidation.message,
    };
  });

  const handleOfferSelect = (selectedIds) => {
    if (!hasMountedRef.current) return;

    const newIds = selectedIds.filter(
      (id) =>
        !configurations.some((c) => c.itemId === id && c.itemType === "offer")
    );

    if (newIds.length > 0) {
      const newId = newIds[newIds.length - 1];
      const selectedOffer = offers.find((o) => o.id === newId);

      if (!selectedOffer.isValid) {
        message.error({
          content: selectedOffer.validationMessage,
          duration: 5,
        });
        form.setFieldsValue({
          offers: selectedIds.filter((id) => id !== newId),
        });
        return;
      }

      setPendingSelection({ type: "offer", ids: selectedIds });
      setCurrentItem(selectedOffer);
      setModalVisible(true);
    }
  };

  const handleCouponSelect = (selectedIds) => {
    if (!hasMountedRef.current) return;

    const newIds = selectedIds.filter(
      (id) =>
        !configurations.some((c) => c.itemId === id && c.itemType === "coupon")
    );

    if (newIds.length > 0) {
      const newId = newIds[newIds.length - 1];
      const selectedCoupon = coupons.find((c) => c.id === newId);

      if (!selectedCoupon.isValid) {
        message.error({
          content: selectedCoupon.validationMessage,
          duration: 5,
        });
        form.setFieldsValue({
          coupons: selectedIds.filter((id) => id !== newId),
        });
        return;
      }

      setPendingSelection({ type: "coupon", ids: selectedIds });
      setCurrentItem(selectedCoupon);
      setModalVisible(true);
    }
  };

  const handleConfigureItem = (item) => {
    const existingConfig = configurations.find(
      (c) => c.itemId === item.id && c.itemType === item.type
    );
    setCurrentItem({
      ...item,
      ...existingConfig,
    });
    setModalVisible(true);
  };

  const handleSaveConfig = (config) => {
    const newConfig = {
      itemId: currentItem.id,
      itemType: currentItem.type,
      name: currentItem.name || currentItem.code,
      ...config,
    };

    setConfigurations((prev) => {
      const filtered = prev.filter(
        (c) => !(c.itemId === currentItem.id && c.itemType === currentItem.type)
      );
      return [...filtered, newConfig];
    });

    if (pendingSelection) {
      if (pendingSelection.type === "offer") {
        form.setFieldsValue({ offers: pendingSelection.ids });
      } else {
        form.setFieldsValue({ coupons: pendingSelection.ids });
      }
      setPendingSelection(null);
    }

    message.success(
      `${
        currentItem.type === "offer" ? "Offer" : "Coupon"
      } configured successfully!`
    );
    setModalVisible(false);
  };

  const handleModalClose = () => {
    if (pendingSelection) {
      const currentFormValues = form.getFieldsValue();
      if (pendingSelection.type === "offer") {
        const filteredOffers = currentFormValues.offers.filter((id) =>
          configurations.some((c) => c.itemId === id && c.itemType === "offer")
        );
        form.setFieldsValue({ offers: filteredOffers });
      } else {
        const filteredCoupons = currentFormValues.coupons.filter((id) =>
          configurations.some((c) => c.itemId === id && c.itemType === "coupon")
        );
        form.setFieldsValue({ coupons: filteredCoupons });
      }
      setPendingSelection(null);
    }
    setModalVisible(false);
  };

  const configuredOffers = configurations
    .filter((c) => c.itemType === "offer")
    .map((c) => c.itemId);

  const configuredCoupons = configurations
    .filter((c) => c.itemType === "coupon")
    .map((c) => c.itemId);

  const allSelectedItems = [
    ...configuredOffers.map((id) => offers.find((o) => o.id === id)),
    ...configuredCoupons.map((id) => coupons.find((c) => c.id === id)),
  ].filter(Boolean);

  // Handle submit similar to reference file
  const handleSubmit = useCallback(() => {
    try {
      const finalData = {
        offer_ids: configurations
          .filter((c) => c.itemType === "offer")
          .map((config) => ({
            offer_id: config.itemId,
            valid_from: config.valid_from || scheduleRange.start_date,
            valid_to: config.valid_to || scheduleRange.end_date,
            selected_time_slots: config.selected_time_slots || [],
            selected_show_dates: config.selected_show_dates || [],
          })),
        coupon_ids: configurations
          .filter((c) => c.itemType === "coupon")
          .map((config) => ({
            coupon_id: config.itemId,
            valid_from: config.valid_from || scheduleRange.start_date,
            valid_to: config.valid_to || scheduleRange.end_date,
            selected_time_slots: config.selected_time_slots || [],
            selected_show_dates: config.selected_show_dates || [],
          })),
      };

      message.success("Offers and Coupons configured successfully!");
      onSubmit(finalData);
    } catch (error) {
      message.error("Failed to submit configuration");
      console.error("Submit error:", error);
    }
  }, [configurations, scheduleRange, onSubmit]);

  const tableColumns = [
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (type) => (
        <Tag color={type === "offer" ? "green" : "blue"}>
          {type.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text, record) => <strong>{record.name || record.code}</strong>,
    },
    {
      title: "Discount",
      dataIndex: "discount",
      key: "discount",
      render: (discount) => `${discount}% off`,
    },
    {
      title: "Configuration",
      key: "config",
      render: (_, record) => {
        const config = configurations.find(
          (c) => c.itemId === record.id && c.itemType === record.type
        );
        if (!config) return "-";

        const levelLabels = {
          schedule: "Schedule Level",
          date: "Date Based",
          timeslot: "Time Slot Level",
        };

        return (
          <Space direction="vertical" size={0}>
            <Tag color="blue">{levelLabels[config.offerLevel]}</Tag>
            {config.offerLevel === "date" && (
              <small>{config.dates?.length || 0} dates selected</small>
            )}
            {config.offerLevel === "timeslot" && (
              <small>
                {config.selected_time_slots?.length || 0} time slots
              </small>
            )}
          </Space>
        );
      },
    },
    {
      title: "Validity",
      key: "validity",
      render: (_, record) => {
        const config = configurations.find(
          (c) => c.itemId === record.id && c.itemType === record.type
        );
        return config?.valid_from && config?.valid_to ? (
          <Space direction="vertical" size={0}>
            <small>{dayjs(config.valid_from).format("MMM DD, YYYY")}</small>
            <small>to {dayjs(config.valid_to).format("MMM DD, YYYY")}</small>
          </Space>
        ) : (
          "-"
        );
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<EditOutlined />}
          onClick={() => handleConfigureItem(record)}
        >
          Reconfigure
        </Button>
      ),
    },
  ];

  const hasScheduleData =
    scheduleFormData &&
    scheduleFormData.start_date &&
    scheduleFormData.end_date &&
    availableDates.length > 0;

  if (!hasScheduleData) {
    return (
      <div className="p-6 bg-white">
        <Alert
          message="Schedule Not Configured"
          description="Please configure your event schedule (dates and time slots) before setting up offers and coupons."
          type="warning"
          showIcon
          icon={<WarningOutlined />}
          className="mb-6"
        />
        <Button onClick={onBack} icon={<ArrowLeftOutlined />}>
          Back to Schedule
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-full bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Offer & Coupon Configuration
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {dayjs(scheduleRange.start_date).format("MMM DD, YYYY")} -{" "}
            {dayjs(scheduleRange.end_date).format("MMM DD, YYYY")}
          </p>
        </div>
        <div className="flex gap-3">
          <Button size="large" onClick={onBack} icon={<ArrowLeftOutlined />}>
            Back
          </Button>
          <Button
            type="primary"
            size="large"
            onClick={handleSubmit}
            icon={<SaveOutlined />}
            disabled={allSelectedItems.length === 0}
          >
            Save & Continue
          </Button>
        </div>
      </div>

      <Form form={form} layout="vertical">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Form.Item
            label="Select Offers (Multiple)"
            name="offers"
            initialValue={[]}
          >
            <Select
              mode="multiple"
              placeholder="Choose one or more offers"
              size="large"
              showSearch
              maxTagCount="responsive"
              allowClear
              onChange={handleOfferSelect}
              value={configuredOffers}
            >
              {offers.map((offer) => (
                <Option
                  key={offer.id}
                  value={offer.id}
                  disabled={!offer.isValid}
                >
                  <div className="flex items-center justify-between">
                    <span>
                      {offer.name} ({offer.discount}% off)
                    </span>
                    {!offer.isValid && (
                      <Tag color="error" className="ml-2">
                        Invalid
                      </Tag>
                    )}
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Select Coupons (Multiple)"
            name="coupons"
            initialValue={[]}
          >
            <Select
              mode="multiple"
              placeholder="Choose one or more coupons"
              size="large"
              showSearch
              maxTagCount="responsive"
              allowClear
              onChange={handleCouponSelect}
              value={configuredCoupons}
            >
              {coupons.map((coupon) => (
                <Option
                  key={coupon.id}
                  value={coupon.id}
                  disabled={!coupon.isValid}
                >
                  <div className="flex items-center justify-between">
                    <span>
                      {coupon.code} ({coupon.discount}% off)
                    </span>
                    {!coupon.isValid && (
                      <Tag color="error" className="ml-2">
                        Invalid
                      </Tag>
                    )}
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>
        </div>

        {allSelectedItems.length > 0 && (
          <div className="rounded-xl p-4 border border-gray-200 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Configured Items ({allSelectedItems.length})
            </h3>
            <Table
              columns={tableColumns}
              dataSource={allSelectedItems}
              rowKey={(record) => `${record.type}-${record.id}`}
              pagination={false}
              size="small"
            />
          </div>
        )}
      </Form>

      <ConfigModal
        isOpen={modalVisible}
        onClose={handleModalClose}
        onSave={handleSaveConfig}
        itemData={currentItem}
        availableDates={availableDates}
        availableTimeSlots={availableTimeSlots}
        scheduleRange={scheduleRange}
        showDates={showDates}
      />
    </div>
  );
};

export default OfferCouponConfig;
