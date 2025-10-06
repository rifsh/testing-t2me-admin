import React, { useCallback, useState, useEffect } from "react";
import {
  Form,
  Select,
  Button,
  message,
  DatePicker,
  Card,
  Tag,
  Tooltip,
  Empty,
  Spin,
} from "antd";
import {
  TagOutlined,
  PercentageOutlined,
  GiftOutlined,
  CalendarOutlined,
  SaveOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  CheckOutlined,
  ExclamationCircleOutlined,
  CopyOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { debounce } from "lodash";
import dayjs from "dayjs";
import OfferCard from "./OfferCard";
import CouponCard from "./CouponCard";

const { Option } = Select;
const { RangePicker } = DatePicker;

// Main OfferAndCoupons component - UPDATED to preserve selected data
const OfferAndCoupons = ({ onSubmit, form, onBack, initialData }) => {
  const dispatch = useDispatch();

  // Redux state
  const { eventDetails, loading } = useSelector((state) => state.event);
  const { selectedOffers = [], selectedCoupons = [] } = useSelector(
    (state) => state.schedules
  );

  // Local state - Initialize with data from Redux/initialData
  const [selectedOfferItems, setSelectedOfferItems] = useState([]);
  const [selectedCouponItems, setSelectedCouponItems] = useState([]);
  const [offerSearchValue, setOfferSearchValue] = useState("");
  const [couponSearchValue, setCouponSearchValue] = useState("");

  // Initialize selected items from initialData or Redux state
  useEffect(() => {
    if (initialData) {
      // Restore previously selected offers
      if (initialData.offer_ids && initialData.offer_ids.length > 0) {
        const restoredOffers = initialData.offer_ids
          .map((offerData) => {
            // Find the full offer data from available offers
            const fullOffer = eventDetails?.eventoffers?.find(
              (offer) => offer.offer.id === offerData.offer_id
            );

            if (fullOffer) {
              return {
                ...fullOffer,
                offer: {
                  ...fullOffer.offer,
                  startdate: offerData.valid_from,
                  enddate: offerData.valid_to,
                },
              };
            }
            return null;
          })
          .filter(Boolean);

        setSelectedOfferItems(restoredOffers);
      }

      // Restore previously selected coupons
      if (initialData.coupon_ids && initialData.coupon_ids.length > 0) {
        const restoredCoupons = initialData.coupon_ids
          .map((couponData) => {
            // Find the full coupon data from available coupons
            const fullCoupon = eventDetails?.eventcoupons?.find(
              (coupon) => coupon.id === couponData.coupon_id
            );

            if (fullCoupon) {
              return {
                ...fullCoupon,
                coupons: {
                  ...fullCoupon.coupons,
                  startdate: couponData.valid_from,
                  enddate: couponData.valid_to,
                },
              };
            }
            return null;
          })
          .filter(Boolean);

        setSelectedCouponItems(restoredCoupons);
      }
    }
  }, [initialData, eventDetails]);

  // Get available offers and coupons
  const availableOffers = eventDetails?.event_offers || [];
  const availableCoupons = eventDetails?.event_coupons || [];

  // Get schedule dates from form fields or initialData
  const getScheduleDates = () => {
    const formValues = form.getFieldsValue();

    // Try to get dates from multiple possible sources
    const scheduleStartDate =
      formValues.start_date ||
      initialData?.start_date ||
      formValues.startdate ||
      formValues.eventstartdate ||
      formValues.schedulestartdate ||
      formValues.dateRange?.[0];

    const scheduleEndDate =
      formValues.end_date ||
      initialData?.end_date ||
      formValues.enddate ||
      formValues.eventenddate ||
      formValues.scheduleenddate ||
      formValues.dateRange?.[1];

    const adStartDate =
      formValues.ad_start_date_time ||
      initialData?.ad_start_date_time ||
      formValues.adstartdate ||
      formValues.advertisementstarttime ||
      formValues.adstarttime;

    const bookingStartDate =
      formValues.booking_start_date_time ||
      initialData?.booking_start_date_time ||
      formValues.bookingstartdate ||
      formValues.bookingstarttime;

    return {
      scheduleStartDate,
      scheduleEndDate,
      adStartDate,
      bookingStartDate,
    };
  };

  const { scheduleStartDate, scheduleEndDate, adStartDate, bookingStartDate } =
    getScheduleDates();

  // Enhanced date validation function (keep existing logic)
  const validateItemDates = (startDate, endDate, itemName) => {
    if (!scheduleStartDate || !scheduleEndDate) {
      message.error("Please set schedule dates first in the previous steps");
      return false;
    }

    // Basic validation
    const start = dayjs(startDate);
    const end = dayjs(endDate);
    const schedStart = dayjs(scheduleStartDate);
    const schedEnd = dayjs(scheduleEndDate);

    if (start.isBefore(schedStart, "day") || end.isAfter(schedEnd, "day")) {
      message.error(`${itemName} dates must be within the schedule period`);
      return false;
    }

    return { isValid: true, wasAdjusted: false, message: "Valid dates" };
  };

  // Enhanced disabled date function
  const getDisabledDate = (current) => {
    if (!scheduleStartDate || !scheduleEndDate) return true;

    const scheduleStart = dayjs(scheduleStartDate);
    const scheduleEnd = dayjs(scheduleEndDate);

    // Block dates outside the main schedule range
    if (
      current &&
      (current.isBefore(scheduleStart, "day") ||
        current.isAfter(scheduleEnd, "day"))
    ) {
      return true;
    }

    return false;
  };

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

  // Handler functions with enhanced validation (keep existing logic but update state properly)
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
      selectedOffer.offer.startdate,
      selectedOffer.offer.enddate,
      "Offer"
    );

    if (!validation) return;

    const adjustedOffer = {
      ...selectedOffer,
      offer: {
        ...selectedOffer.offer,
        startdate:
          validation.adjustedDates?.startdate || selectedOffer.offer.startdate,
        enddate:
          validation.adjustedDates?.enddate || selectedOffer.offer.enddate,
        originalstartdate: selectedOffer.offer.startdate,
        originalenddate: selectedOffer.offer.enddate,
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
      selectedCoupon.coupons.startdate,
      selectedCoupon.coupons.enddate,
      "Coupon"
    );

    if (!validation) return;

    const adjustedCoupon = {
      ...selectedCoupon,
      coupons: {
        ...selectedCoupon.coupons,
        startdate:
          validation.adjustedDates?.startdate ||
          selectedCoupon.coupons.startdate,
        enddate:
          validation.adjustedDates?.enddate || selectedCoupon.coupons.enddate,
        originalstartdate: selectedCoupon.coupons.startdate,
        originalenddate: selectedCoupon.coupons.enddate,
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
    setSelectedCouponItems((prev) =>
      prev.filter((item) => item.id !== couponId)
    );
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
                startdate: validation.adjustedDates?.startdate || startDate,
                enddate: validation.adjustedDates?.enddate || endDate,
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
                startdate: validation.adjustedDates?.startdate || startDate,
                enddate: validation.adjustedDates?.enddate || endDate,
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
        selectedoffers: selectedOfferItems,
        selectedcoupons: selectedCouponItems,
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

  // Rest of the component JSX remains the same as your original code
  // Just make sure to use the updated handler functions above

  return (
    <div className="max-w-full m-6 bg-white rounded-xl shadow-md border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
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
          <Button onClick={onBack} className="flex items-center">
            Go Back
          </Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSubmit}
            loading={loading}
            // className="bg-gradient-to-r from-purple-600 to-pink-600 border-0 hover:from-purple-700 hover:to-pink-700"
          >
            Submit
          </Button>
        </div>
      </div>

      <div className="p-6">
        <Form form={form} layout="vertical" requiredMark={false}>
          <div className="grid grid-cols-12 gap-6">
            {/* Left Section - Selection */}
            <div className="col-span-8 space-y-8">
              {/* Enhanced Schedule Date Info */}
              {scheduleStartDate && scheduleEndDate ? (
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <CalendarOutlined className="text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">
                      Schedule Period Constraints
                    </span>
                  </div>
                  <div className="space-y-1 text-sm text-blue-700">
                    <p>
                      <strong>Main Schedule:</strong>{" "}
                      {dayjs(scheduleStartDate).format("MMM DD, YYYY")} -{" "}
                      {dayjs(scheduleEndDate).format("MMM DD, YYYY")}
                    </p>
                    {adStartDate && (
                      <p>
                        <strong>Ad Period Start:</strong>{" "}
                        {dayjs(adStartDate).format("MMM DD, YYYY")}
                      </p>
                    )}
                    {bookingStartDate && (
                      <p>
                        <strong>Booking Start:</strong>{" "}
                        {dayjs(bookingStartDate).format("MMM DD, YYYY")}
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-blue-600 mt-2">
                    All offers and coupons will be constrained to these date
                    ranges
                  </p>
                </div>
              ) : (
                <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <ExclamationCircleOutlined className="text-orange-600" />
                    <span className="text-sm font-medium text-orange-800">
                      Schedule Dates Required
                    </span>
                  </div>
                  <p className="text-sm text-orange-700">
                    Please go back to previous steps and set your event schedule
                    dates before configuring offers and coupons.
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
                    name="selectedoffer"
                    label={
                      <span className="text-sm font-medium text-gray-700">
                        Select Offer
                      </span>
                    }
                  >
                    <Select
                      showSearch
                      placeholder={
                        scheduleStartDate && scheduleEndDate
                          ? "Search and select offers"
                          : "Set schedule dates first"
                      }
                      loading={loading}
                      onSearch={debouncedOfferSearch}
                      onChange={handleOfferSelect}
                      allowClear
                      size="large"
                      disabled={!scheduleStartDate || !scheduleEndDate}
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
                                </div>
                              </div>
                              <div className="text-right">
                                {/* <div className="text-sm font-medium text-green-600">
                                  {offer.offer.discounttype === "percentage"
                                    ? `${offer.offer.discountvalue}% OFF`
                                    : `$${offer.offer.discountvalue} OFF`}
                                </div> */}
                                <div className="text-xs text-gray-500">
                                  {dayjs(offer.offer.startdate).format(
                                    "MMM DD"
                                  )}{" "}
                                  -{" "}
                                  {dayjs(offer.offer.enddate).format("MMM DD")}
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
                    name="selectedcoupon"
                    label={
                      <span className="text-sm font-medium text-gray-700">
                        Select Coupon
                      </span>
                    }
                  >
                    <Select
                      showSearch
                      placeholder={
                        scheduleStartDate && scheduleEndDate
                          ? "Search and select coupons"
                          : "Set schedule dates first"
                      }
                      loading={loading}
                      onSearch={debouncedCouponSearch}
                      onChange={handleCouponSelect}
                      allowClear
                      size="large"
                      disabled={!scheduleStartDate || !scheduleEndDate}
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
                                  {/* <div className="text-xs text-gray-500">
                                    Code: {coupon.coupons.code}
                                  </div> */}
                                </div>
                              </div>
                              <div className="text-right">
                                {/* <div className="text-sm font-medium text-blue-600">
                                  Max Uses: {coupon.coupons.maxuses}
                                </div> */}
                                <div className="text-xs text-gray-500">
                                  {dayjs(coupon.coupons.startdate).format(
                                    "MMM DD"
                                  )}{" "}
                                  -{" "}
                                  {dayjs(coupon.coupons.enddate).format(
                                    "MMM DD"
                                  )}
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
                        scheduleStartDate={scheduleStartDate}
                        scheduleEndDate={scheduleEndDate}
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
                        scheduleStartDate={scheduleStartDate}
                        scheduleEndDate={scheduleEndDate}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {selectedOfferItems.length === 0 &&
                selectedCouponItems.length === 0 && (
                  <div className="text-center py-8">
                    <GiftOutlined className="text-4xl text-gray-300 mb-4" />
                    <p className="text-gray-500 mb-2">No items selected</p>
                    <p className="text-sm text-gray-400">
                      {scheduleStartDate && scheduleEndDate
                        ? "Select offers and coupons from the left panel"
                        : "Set schedule dates first to enable selection"}
                    </p>
                  </div>
                )}

              {/* Summary */}
              {(selectedOfferItems.length > 0 ||
                selectedCouponItems.length > 0) && (
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <h4 className="text-sm font-medium text-gray-800 mb-3">
                    Selection Summary
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Offers:</span>
                      <span className="font-medium">
                        {selectedOfferItems.length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Coupons:</span>
                      <span className="font-medium">
                        {selectedCouponItems.length}
                      </span>
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

// OfferCard and CouponCard components remain the same as in your original code

export default OfferAndCoupons;
