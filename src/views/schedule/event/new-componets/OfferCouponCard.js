import React, { useCallback, useEffect, useState } from "react";
import {
  Form,
  Select,
  Input,
  Button,
  message,
  DatePicker,
  InputNumber,
  Switch,
  Card,
  Tag,
  Space,
  Tooltip,
  Empty,
  Spin,
} from "antd";
import {
  TagOutlined,
  PercentageOutlined,
  GiftOutlined,
  CalendarOutlined,
  DollarOutlined,
  SaveOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  CheckOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { debounce } from "lodash";
import dayjs from "dayjs";
import { OfferDateValidation } from "../utils/OfferDateValidation";

const { Option } = Select;
const { RangePicker } = DatePicker;

// Simple OfferCard component (inline to avoid import issues)
const OfferCard = ({ item, type, onRemove, onDateChange, getDisabledDate }) => {
  const [isEditingDate, setIsEditingDate] = useState(false);
  const itemData = type === "offer" ? item.offer : item.coupons;

  const handleDateRangeChange = (dates) => {
    if (dates && dates[0] && dates[1]) {
      onDateChange(itemData.id, dates);
      setIsEditingDate(false);
    }
  };

  const getStatusColor = () => {
    if (itemData.wasAdjusted) return "orange";
    return "green";
  };

  const getStatusText = () => {
    if (itemData.wasAdjusted) return "Dates Adjusted";
    return "Valid";
  };

  return (
    <Card
      size="small"
      className="hover:shadow-md transition-shadow duration-200 border border-gray-200 rounded-xl"
      bodyStyle={{ padding: "16px" }}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <TagOutlined className="text-orange-600 text-sm" />
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm truncate">
                {itemData.name}
              </p>
              <p className="text-xs text-gray-500">
                {type === "offer" ? "Offer" : "Coupon"}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Tooltip title="Edit dates">
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={() => setIsEditingDate(!isEditingDate)}
                className="hover:bg-blue-50 hover:text-blue-600"
              />
            </Tooltip>
            <Tooltip title="Remove">
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={() => onRemove(itemData.id)}
                className="hover:bg-red-50"
              />
            </Tooltip>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Tag color={getStatusColor()} size="small" className="rounded">
            {itemData.wasAdjusted && (
              <ExclamationCircleOutlined className="mr-1" />
            )}
            {getStatusText()}
          </Tag>
          {type === "offer" && (
            <Tag color="green" size="small">
              {itemData.discount_type === 'percentage' ? 
                `${itemData.discount_value}% OFF` : 
                `$${itemData.discount_value} OFF`
              }
            </Tag>
          )}
        </div>

        {isEditingDate ? (
          <div className="space-y-2">
            <RangePicker
              size="small"
              value={[
                dayjs(itemData.start_date),
                dayjs(itemData.end_date)
              ]}
              onChange={handleDateRangeChange}
              disabledDate={getDisabledDate}
              className="w-full"
              format="MMM DD, YYYY"
            />
            <div className="flex justify-end space-x-2">
              <Button
                size="small"
                onClick={() => setIsEditingDate(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1">
                <CalendarOutlined className="text-gray-500" />
                <span className="text-gray-600">Start:</span>
                <span className="font-medium">
                  {dayjs(itemData.start_date).format("MMM DD")}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-gray-600">End:</span>
                <span className="font-medium">
                  {dayjs(itemData.end_date).format("MMM DD")}
                </span>
              </div>
            </div>
          </div>
        )}

        {type === "offer" && itemData.description && (
          <p className="text-xs text-gray-500 truncate">
            {itemData.description}
          </p>
        )}

        {itemData.wasAdjusted && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-2">
            <div className="flex items-start space-x-2">
              <ExclamationCircleOutlined className="text-orange-500 text-xs mt-0.5" />
              <div className="text-xs">
                <p className="text-orange-800 font-medium">Dates Adjusted</p>
                <p className="text-orange-700">
                  Original: {dayjs(itemData.original_start_date).format("MMM DD")} - {dayjs(itemData.original_end_date).format("MMM DD")}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

// Simple CouponCard component (inline to avoid import issues)
const CouponCard = ({ item, type, onRemove, onDateChange, getDisabledDate }) => {
  const [isEditingDate, setIsEditingDate] = useState(false);
  const itemData = item.coupons;

  const handleDateRangeChange = (dates) => {
    if (dates && dates[0] && dates[1]) {
      onDateChange(item.id, dates);
      setIsEditingDate(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(itemData.code);
    message.success("Coupon code copied to clipboard!");
  };

  const getStatusColor = () => {
    if (itemData.wasAdjusted) return "orange";
    return "green";
  };

  const getStatusText = () => {
    if (itemData.wasAdjusted) return "Dates Adjusted";
    return "Valid";
  };

  const getRemainingUses = () => {
    const used = itemData.used_count || 0;
    const max = itemData.max_uses;
    return max - used;
  };

  return (
    <Card
      size="small"
      className="hover:shadow-md transition-shadow duration-200 border border-gray-200 rounded-xl"
      bodyStyle={{ padding: "16px" }}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <PercentageOutlined className="text-green-600 text-sm" />
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm truncate">
                {itemData.name}
              </p>
              <p className="text-xs text-gray-500">Coupon</p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Tooltip title="Edit dates">
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={() => setIsEditingDate(!isEditingDate)}
                className="hover:bg-blue-50 hover:text-blue-600"
              />
            </Tooltip>
            <Tooltip title="Remove">
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={() => onRemove(item.id)}
                className="hover:bg-red-50"
              />
            </Tooltip>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 mb-1">Coupon Code</p>
              <p className="font-mono text-lg font-bold text-green-800 tracking-wider">
                {itemData.code}
              </p>
            </div>
            <Tooltip title="Copy code">
              <Button
                type="text"
                size="small"
                icon={<PercentageOutlined />}
                onClick={handleCopyCode}
                className="hover:bg-white hover:text-green-600"
              />
            </Tooltip>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Tag color={getStatusColor()} size="small" className="rounded">
            {itemData.wasAdjusted && (
              <ExclamationCircleOutlined className="mr-1" />
            )}
            {getStatusText()}
          </Tag>
          <div className="flex items-center space-x-2">
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {getRemainingUses()} left
            </span>
          </div>
        </div>

        {isEditingDate ? (
          <div className="space-y-2">
            <RangePicker
              size="small"
              value={[
                dayjs(itemData.start_date),
                dayjs(itemData.end_date)
              ]}
              onChange={handleDateRangeChange}
              disabledDate={getDisabledDate}
              className="w-full"
              format="MMM DD, YYYY"
            />
            <div className="flex justify-end space-x-2">
              <Button
                size="small"
                onClick={() => setIsEditingDate(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1">
                <CalendarOutlined className="text-gray-500" />
                <span className="text-gray-600">Start:</span>
                <span className="font-medium">
                  {dayjs(itemData.start_date).format("MMM DD")}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-gray-600">End:</span>
                <span className="font-medium">
                  {dayjs(itemData.end_date).format("MMM DD")}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-blue-50 rounded p-2 text-center">
            <p className="text-blue-600 font-medium">{itemData.max_uses}</p>
            <p className="text-blue-500">Max Uses</p>
          </div>
          <div className="bg-gray-50 rounded p-2 text-center">
            <p className="text-gray-600 font-medium">{itemData.used_count || 0}</p>
            <p className="text-gray-500">Used</p>
          </div>
        </div>

        {itemData.wasAdjusted && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-2">
            <div className="flex items-start space-x-2">
              <ExclamationCircleOutlined className="text-orange-500 text-xs mt-0.5" />
              <div className="text-xs">
                <p className="text-orange-800 font-medium">Dates Adjusted</p>
                <p className="text-orange-700">
                  Original: {dayjs(itemData.original_start_date).format("MMM DD")} - {dayjs(itemData.original_end_date).format("MMM DD")}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

// Main OfferCouponCard component
const OfferCouponCard = ({
  onSubmit,
  form,
  scheduleStartDate,
  scheduleEndDate,
}) => {
  const dispatch = useDispatch();

  // Redux state
  const { eventDetails, loading } = useSelector((state) => state.event || {});
  const { selectedOffers = [], selectedCoupons = [] } = useSelector(
    (state) => state.schedules || {}
  );

  // Local state
  const [selectedOfferItems, setSelectedOfferItems] = useState([]);
  const [selectedCouponItems, setSelectedCouponItems] = useState([]);
  const [offerSearchValue, setOfferSearchValue] = useState("");
  const [couponSearchValue, setCouponSearchValue] = useState("");

  // Get available offers and coupons
  const availableOffers = eventDetails?.event_offers || [];
  const availableCoupons = eventDetails?.event_coupons || [];

  // Filter functions
  const filteredOffers = availableOffers.filter((offer) =>
    offer.offer.name.toLowerCase().includes(offerSearchValue.toLowerCase())
  );

  const filteredCoupons = availableCoupons.filter((coupon) =>
    coupon.coupons.name.toLowerCase().includes(couponSearchValue.toLowerCase())
  );

  // Debounced search
  const debouncedOfferSearch = useCallback(
    debounce((value) => setOfferSearchValue(value), 300),
    []
  );

  const debouncedCouponSearch = useCallback(
    debounce((value) => setCouponSearchValue(value), 300),
    []
  );

  // Rest of the component logic remains the same...
  // [Include all the handler functions here]

  const validateItemDates = (startDate, endDate, itemName) => {
    if (!scheduleStartDate || !scheduleEndDate) {
      message.error("Please set schedule dates first");
      return false;
    }

    const validation = OfferDateValidation.validateDates({
      startDate,
      endDate,
      scheduleStartDate,
      scheduleEndDate,
      itemName,
      isRequired: true,
    });

    if (!validation.isValid) {
      message.error(validation.message);
      return false;
    }

    if (validation.wasAdjusted) {
      message.warning(validation.message);
    }

    return validation;
  };

  const handleOfferSelect = (offerId) => {
    const selectedOffer = availableOffers.find(
      (offer) => offer.offer.id === offerId
    );

    if (!selectedOffer) return;

    if (selectedOfferItems.some((item) => item.offer.id === offerId)) {
      message.warning("This offer is already selected");
      return;
    }

    const validation = validateItemDates(
      selectedOffer.offer.start_date,
      selectedOffer.offer.end_date,
      "Offer"
    );

    if (!validation) return;

    const adjustedOffer = {
      ...selectedOffer,
      offer: {
        ...selectedOffer.offer,
        start_date:
          validation.adjustedDates?.start_date ||
          selectedOffer.offer.start_date,
        end_date:
          validation.adjustedDates?.end_date || selectedOffer.offer.end_date,
        original_start_date: selectedOffer.offer.start_date,
        original_end_date: selectedOffer.offer.end_date,
        wasAdjusted: validation.wasAdjusted,
      },
    };

    setSelectedOfferItems((prev) => [...prev, adjustedOffer]);
    message.success(`Offer "${selectedOffer.offer.name}" added successfully`);
  };

  const handleCouponSelect = (couponId) => {
    const selectedCoupon = availableCoupons.find(
      (coupon) => coupon.id === couponId
    );

    if (!selectedCoupon) return;

    if (selectedCouponItems.some((item) => item.id === couponId)) {
      message.warning("This coupon is already selected");
      return;
    }

    const validation = validateItemDates(
      selectedCoupon.coupons.start_date,
      selectedCoupon.coupons.end_date,
      "Coupon"
    );

    if (!validation) return;

    const adjustedCoupon = {
      ...selectedCoupon,
      coupons: {
        ...selectedCoupon.coupons,
        start_date:
          validation.adjustedDates?.start_date ||
          selectedCoupon.coupons.start_date,
        end_date:
          validation.adjustedDates?.end_date || selectedCoupon.coupons.end_date,
        original_start_date: selectedCoupon.coupons.start_date,
        original_end_date: selectedCoupon.coupons.end_date,
        wasAdjusted: validation.wasAdjusted,
      },
    };

    setSelectedCouponItems((prev) => [...prev, adjustedCoupon]);
    message.success(
      `Coupon "${selectedCoupon.coupons.name}" added successfully`
    );
  };

  const handleOfferRemove = (offerId) => {
    setSelectedOfferItems((prev) =>
      prev.filter((item) => item.offer.id !== offerId)
    );
    message.success("Offer removed successfully");
  };

  const handleCouponRemove = (couponId) => {
    setSelectedCouponItems((prev) => prev.filter((item) => item.id !== couponId));
    message.success("Coupon removed successfully");
  };

  const handleOfferDateChange = (offerId, dateRange) => {
    if (!dateRange || !dateRange[0] || !dateRange[1]) return;

    const startDate = dateRange[0].format("YYYY-MM-DD");
    const endDate = dateRange[1].format("YYYY-MM-DD");

    const validation = validateItemDates(startDate, endDate, "Offer");
    if (!validation) return;

    setSelectedOfferItems((prev) =>
      prev.map((item) =>
        item.offer.id === offerId
          ? {
              ...item,
              offer: {
                ...item.offer,
                start_date: validation.adjustedDates?.start_date || startDate,
                end_date: validation.adjustedDates?.end_date || endDate,
                wasAdjusted: validation.wasAdjusted,
              },
            }
          : item
      )
    );

    message.success("Offer dates updated successfully");
  };

  const handleCouponDateChange = (couponId, dateRange) => {
    if (!dateRange || !dateRange[0] || !dateRange[1]) return;

    const startDate = dateRange[0].format("YYYY-MM-DD");
    const endDate = dateRange[1].format("YYYY-MM-DD");

    const validation = validateItemDates(startDate, endDate, "Coupon");
    if (!validation) return;

    setSelectedCouponItems((prev) =>
      prev.map((item) =>
        item.id === couponId
          ? {
              ...item,
              coupons: {
                ...item.coupons,
                start_date: validation.adjustedDates?.start_date || startDate,
                end_date: validation.adjustedDates?.end_date || endDate,
                wasAdjusted: validation.wasAdjusted,
              },
            }
          : item
      )
    );

    message.success("Coupon dates updated successfully");
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const finalData = {
        ...values,
        selected_offers: selectedOfferItems,
        selected_coupons: selectedCouponItems,
      };

      message.success("Offers and coupons saved successfully!");
      onSubmit(finalData);
    } catch (errorInfo) {
      message.error("Please check the form fields and try again");
    }
  };

  const handleCancel = () => {
    setSelectedOfferItems([]);
    setSelectedCouponItems([]);
    setOfferSearchValue("");
    setCouponSearchValue("");
    message.info("Form has been reset");
  };

  const getDisabledDate = (current) => {
    if (!scheduleStartDate || !scheduleEndDate) return false;
    return OfferDateValidation.getDisabledDate(
      scheduleStartDate,
      scheduleEndDate
    )(current);
  };

  return (
    <div className="max-w-full m-6 bg-white rounded-xl shadow-md border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <GiftOutlined className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              Offers & Coupons
            </h1>
            <p className="text-sm text-gray-600">
              Manage promotional offers and discount coupons for your event
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            icon={<CloseOutlined />}
            onClick={handleCancel}
            className="flex items-center"
          >
            Reset
          </Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSubmit}
            loading={loading}
            className="bg-gradient-to-r from-purple-600 to-pink-600 border-0 hover:from-purple-700 hover:to-pink-700"
          >
            Save Configuration
          </Button>
        </div>
      </div>

      <div className="p-6">
        <Form form={form} layout="vertical" requiredMark={false}>
          <div className="grid grid-cols-12 gap-6">
            {/* Left Section - Selection */}
            <div className="col-span-8 space-y-8">
              {/* Schedule Date Info */}
              {scheduleStartDate && scheduleEndDate && (
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <CalendarOutlined className="text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">
                      Schedule Period
                    </span>
                  </div>
                  <p className="text-sm text-blue-700">
                    {dayjs(scheduleStartDate).format("MMM DD, YYYY")} -{" "}
                    {dayjs(scheduleEndDate).format("MMM DD, YYYY")}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    All offers and coupons will be adjusted to fit within this
                    period
                  </p>
                </div>
              )}

              {/* Offers Section */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <TagOutlined className="mr-2 text-orange-500" />
                  Available Offers
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  <Form.Item
                    name="selected_offer"
                    label={
                      <span className="text-sm font-medium text-gray-700">
                        Select Offer
                      </span>
                    }
                  >
                    <Select
                      showSearch
                      placeholder="Search and select offers"
                      loading={loading}
                      onSearch={debouncedOfferSearch}
                      onChange={handleOfferSelect}
                      allowClear
                      size="large"
                      dropdownStyle={{
                        borderRadius: "12px",
                        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                      }}
                      filterOption={(input, option) =>
                        option?.label
                          ?.toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      notFoundContent={
                        loading ? (
                          <div className="text-center py-4">
                            <Spin size="small" />
                            <div className="mt-2 text-gray-500">
                              Loading offers...
                            </div>
                          </div>
                        ) : (
                          <Empty
                            description="No offers found"
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                          />
                        )
                      }
                    >
                      {filteredOffers.map((offer) => (
                        <Option
                          key={offer.offer.id}
                          value={offer.offer.id}
                          label={offer.offer.name}
                        >
                          <div className="py-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                                  <TagOutlined className="text-orange-600 text-sm" />
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">
                                    {offer.offer.name}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {offer.offer.description}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium text-green-600">
                                  {offer.offer.discount_type === "percentage"
                                    ? `${offer.offer.discount_value}% OFF`
                                    : `$${offer.offer.discount_value} OFF`}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {dayjs(offer.offer.start_date).format("MMM DD")} -{" "}
                                  {dayjs(offer.offer.end_date).format("MMM DD")}
                                </div>
                              </div>
                            </div>
                          </div>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </div>
              </div>

              {/* Coupons Section */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <PercentageOutlined className="mr-2 text-green-500" />
                  Available Coupons
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  <Form.Item
                    name="selected_coupon"
                    label={
                      <span className="text-sm font-medium text-gray-700">
                        Select Coupon
                      </span>
                    }
                  >
                    <Select
                      showSearch
                      placeholder="Search and select coupons"
                      loading={loading}
                      onSearch={debouncedCouponSearch}
                      onChange={handleCouponSelect}
                      allowClear
                      size="large"
                      dropdownStyle={{
                        borderRadius: "12px",
                        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                      }}
                      filterOption={(input, option) =>
                        option?.label
                          ?.toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      notFoundContent={
                        loading ? (
                          <div className="text-center py-4">
                            <Spin size="small" />
                            <div className="mt-2 text-gray-500">
                              Loading coupons...
                            </div>
                          </div>
                        ) : (
                          <Empty
                            description="No coupons found"
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                          />
                        )
                      }
                    >
                      {filteredCoupons.map((coupon) => (
                        <Option
                          key={coupon.id}
                          value={coupon.id}
                          label={coupon.coupons.name}
                        >
                          <div className="py-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                  <PercentageOutlined className="text-green-600 text-sm" />
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">
                                    {coupon.coupons.name}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    Code: {coupon.coupons.code}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium text-blue-600">
                                  Max Uses: {coupon.coupons.max_uses}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {dayjs(coupon.coupons.start_date).format("MMM DD")} -{" "}
                                  {dayjs(coupon.coupons.end_date).format("MMM DD")}
                                </div>
                              </div>
                            </div>
                          </div>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </div>
              </div>
            </div>

            {/* Right Section - Selected Items */}
            <div className="col-span-4 space-y-6">
              {/* Selected Offers */}
              {selectedOfferItems.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <CheckOutlined className="mr-2 text-green-500" />
                    Selected Offers ({selectedOfferItems.length})
                  </h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {selectedOfferItems.map((item) => (
                      <OfferCard
                        key={item.offer.id}
                        item={item}
                        type="offer"
                        onRemove={handleOfferRemove}
                        onDateChange={handleOfferDateChange}
                        getDisabledDate={getDisabledDate}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Selected Coupons */}
              {selectedCouponItems.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <CheckOutlined className="mr-2 text-green-500" />
                    Selected Coupons ({selectedCouponItems.length})
                  </h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {selectedCouponItems.map((item) => (
                      <CouponCard
                        key={item.id}
                        item={item}
                        type="coupon"
                        onRemove={handleCouponRemove}
                        onDateChange={handleCouponDateChange}
                        getDisabledDate={getDisabledDate}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {selectedOfferItems.length === 0 && selectedCouponItems.length === 0 && (
                <div className="text-center py-8">
                  <GiftOutlined className="text-4xl text-gray-300 mb-4" />
                  <p className="text-gray-500 mb-2">No items selected</p>
                  <p className="text-sm text-gray-400">
                    Select offers and coupons from the left panel
                  </p>
                </div>
              )}

              {/* Summary */}
              {(selectedOfferItems.length > 0 || selectedCouponItems.length > 0) && (
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <h4 className="text-sm font-medium text-gray-800 mb-3">
                    Selection Summary
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Offers:</span>
                      <span className="font-medium">{selectedOfferItems.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Coupons:</span>
                      <span className="font-medium">{selectedCouponItems.length}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default OfferCouponCard;
