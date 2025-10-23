import React, { useCallback, useState, useEffect, useMemo } from "react";
import {
  Form,
  Select,
  Button,
  message,
  DatePicker,
  Tag,
  Tooltip,
  Empty,
  Spin,
  Alert,
} from "antd";
import {
  TagOutlined,
  PercentageOutlined,
  GiftOutlined,
  SaveOutlined,
  CheckOutlined,
  InfoCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { debounce } from "lodash";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { ADD } from "constants/AppConstants";

dayjs.extend(isBetween);

const { Option } = Select;
const { RangePicker } = DatePicker;

// Helper function to generate date list ONLY for dates with show_times
const getAvailableShowDates = (startDate, endDate, existingShowDates) => {
  const dates = [];

  // Only include dates that have show_times configured
  existingShowDates.forEach((dateStr) => {
    const dateObj = dayjs(dateStr);
    if (
      dateObj.isSameOrAfter(dayjs(startDate), "day") &&
      dateObj.isSameOrBefore(dayjs(endDate), "day")
    ) {
      dates.push({
        date: dateStr,
        display: dateObj.format("MMM DD"),
        dayName: dateObj.format("ddd"),
        dayNumber: dateObj.date(),
      });
    }
  });

  return dates.sort((a, b) => dayjs(a.date).diff(dayjs(b.date)));
};

// Simplified Offer Card Component
const SimplifiedOfferCard = ({
  item,
  onRemove,
  onDateChange,
  onDatesChange,
  scheduleStartDate,
  scheduleEndDate,
  existingShowDates,
}) => {
  const itemData = item.offer;

  const availableDates = getAvailableShowDates(
    itemData.start_date,
    itemData.end_date,
    existingShowDates
  );

  const selectedDatesCount = itemData.selected_dates?.length || 0;
  const totalDatesCount = availableDates.length;
  const isScheduleLevel =
    selectedDatesCount === 0 || selectedDatesCount === totalDatesCount;

  const handleDateToggle = (dateStr) => {
    const currentDates = itemData.selected_dates || [];
    const newDates = currentDates.includes(dateStr)
      ? currentDates.filter((d) => d !== dateStr)
      : [...currentDates, dateStr].sort();

    onDatesChange(itemData.id, newDates);
  };

  const handleSelectAll = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const allDates = availableDates.map((d) => d.date);
    console.log("Select All clicked:", allDates);
    onDatesChange(itemData.id, allDates);
  };

  const handleClearAll = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onDatesChange(itemData.id, []);
  };

  const getDisabledDate = (current) => {
    const schedStart = dayjs(scheduleStartDate);
    const schedEnd = dayjs(scheduleEndDate);
    return (
      current &&
      (current.isBefore(schedStart, "day") || current.isAfter(schedEnd, "day"))
    );
  };

  return (
    <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border-2 border-orange-200 hover:border-orange-300 transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <TagOutlined className="text-white text-sm" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">
              {itemData.name}
            </p>
            {itemData.discount_percentage_amount && (
              <p className="text-xs text-orange-600 font-medium">
                {itemData.discount_percentage_amount}% OFF
              </p>
            )}
          </div>
        </div>
        <Tooltip title="Remove offer">
          <Button
            type="text"
            danger
            size="small"
            icon={<CloseCircleOutlined />}
            onClick={() => onRemove(itemData.id)}
            className="hover:bg-red-100"
          />
        </Tooltip>
      </div>

      <div className="mb-3">
        {isScheduleLevel ? (
          <div className="bg-blue-100 border border-blue-300 rounded-lg px-3 py-1.5">
            <p className="text-xs text-blue-800 font-medium flex items-center">
              <CheckOutlined className="mr-1" />
              Schedule Level - Applies to all {totalDatesCount} date(s)
            </p>
          </div>
        ) : (
          <div className="bg-purple-100 border border-purple-300 rounded-lg px-3 py-1.5">
            <p className="text-xs text-purple-800 font-medium flex items-center">
              <CalendarOutlined className="mr-1" />
              Date Level - {selectedDatesCount} specific date(s)
            </p>
          </div>
        )}
      </div>

      <div className="mb-3">
        <label className="text-xs text-gray-600 mb-1 block flex items-center">
          <CalendarOutlined className="mr-1" />
          Valid Period
        </label>
        <RangePicker
          size="small"
          value={[dayjs(itemData.start_date), dayjs(itemData.end_date)]}
          onChange={(dates) => onDateChange(itemData.id, dates)}
          disabledDate={getDisabledDate}
          className="w-full"
          format="MMM DD, YYYY"
          suffixIcon={null}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-gray-600 flex items-center">
            Select Active Dates{" "}
            <span className="ml-1 text-orange-600 font-medium">
              ({selectedDatesCount}/{totalDatesCount})
            </span>
          </label>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-xs h-auto px-2 py-0.5 text-orange-600 hover:text-orange-700 hover:underline cursor-pointer"
            >
              All
            </button>
            <span className="text-gray-300">|</span>
            <button
              type="button"
              onClick={handleClearAll}
              className="text-xs h-auto px-2 py-0.5 text-gray-500 hover:text-gray-700 hover:underline cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>

        {availableDates.length > 0 ? (
          <div className="bg-white rounded-lg p-2 border border-orange-200 max-h-48 overflow-y-auto">
            <div className="grid grid-cols-7 gap-1">
              {availableDates.map((dateObj) => {
                const isSelected =
                  itemData.selected_dates &&
                  itemData.selected_dates.includes(dateObj.date);
                return (
                  <button
                    key={dateObj.date}
                    type="button"
                    onClick={() => handleDateToggle(dateObj.date)}
                    className={`relative flex flex-col items-center justify-center py-2 rounded-md text-xs font-medium transition-all ${
                      isSelected
                        ? "bg-orange-500 text-white shadow-md"
                        : "bg-gray-50 text-gray-700 border border-gray-200 hover:border-orange-300 hover:bg-orange-50"
                    }`}
                  >
                    <span className="text-[10px] opacity-70">
                      {dateObj.dayName}
                    </span>
                    <span className="text-sm font-bold">
                      {dateObj.dayNumber}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
            <p className="text-xs text-yellow-800">
              No dates with time slots configured yet
            </p>
          </div>
        )}

        {isScheduleLevel && selectedDatesCount > 0 && (
          <p className="text-xs text-blue-600 mt-2 italic text-center font-medium">
            ✓ All available dates selected - Applies at schedule level
          </p>
        )}

        {selectedDatesCount === 0 && availableDates.length > 0 && (
          <p className="text-xs text-gray-500 mt-2 italic text-center">
            No dates selected - Click "All" to select all dates with time slots
          </p>
        )}
      </div>
    </div>
  );
};

// Simplified Coupon Card Component
const SimplifiedCouponCard = ({
  item,
  onRemove,
  onDateChange,
  onDatesChange,
  scheduleStartDate,
  scheduleEndDate,
  existingShowDates,
}) => {
  const itemData = item.coupons;

  const availableDates = getAvailableShowDates(
    itemData.start_date,
    itemData.end_date,
    existingShowDates
  );

  const selectedDatesCount = itemData.selected_dates?.length || 0;
  const totalDatesCount = availableDates.length;
  const isScheduleLevel =
    selectedDatesCount === 0 || selectedDatesCount === totalDatesCount;

  const handleDateToggle = (dateStr) => {
    const currentDates = itemData.selected_dates || [];
    const newDates = currentDates.includes(dateStr)
      ? currentDates.filter((d) => d !== dateStr)
      : [...currentDates, dateStr].sort();
    onDatesChange(itemData.id, newDates);
  };

  const handleSelectAll = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const allDates = availableDates.map((d) => d.date);
    onDatesChange(itemData.id, allDates);
  };

  const handleClearAll = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onDatesChange(itemData.id, []);
  };

  const handleCopyCode = () => {
    if (itemData.key_words && itemData.key_words.length > 0) {
      navigator.clipboard.writeText(itemData.key_words[0]);
      message.success("Coupon code copied!");
    }
  };

  const getDisabledDate = (current) => {
    const schedStart = dayjs(scheduleStartDate);
    const schedEnd = dayjs(scheduleEndDate);
    return (
      current &&
      (current.isBefore(schedStart, "day") || current.isAfter(schedEnd, "day"))
    );
  };

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200 hover:border-green-300 transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
            <PercentageOutlined className="text-white text-sm" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">
              {itemData.name}
            </p>
            {itemData.discount_percentage_amount && (
              <p className="text-xs text-green-600 font-medium">
                {itemData.discount_percentage_amount}% OFF
              </p>
            )}
          </div>
        </div>
        <Tooltip title="Remove coupon">
          <Button
            type="text"
            danger
            size="small"
            icon={<CloseCircleOutlined />}
            onClick={() => onRemove(itemData.id)}
            className="hover:bg-red-100"
          />
        </Tooltip>
      </div>

      <div className="mb-3">
        {isScheduleLevel ? (
          <div className="bg-blue-100 border border-blue-300 rounded-lg px-3 py-1.5">
            <p className="text-xs text-blue-800 font-medium flex items-center">
              <CheckOutlined className="mr-1" />
              Schedule Level - Applies to all {totalDatesCount} date(s)
            </p>
          </div>
        ) : (
          <div className="bg-purple-100 border border-purple-300 rounded-lg px-3 py-1.5">
            <p className="text-xs text-purple-800 font-medium flex items-center">
              <CalendarOutlined className="mr-1" />
              Date Level - {selectedDatesCount} specific date(s)
            </p>
          </div>
        )}
      </div>

      {itemData.key_words && itemData.key_words.length > 0 && (
        <div className="mb-3">
          <label className="text-xs text-gray-600 mb-1 block">
            Coupon Code
          </label>
          <div className="bg-white rounded-lg p-2 border border-green-200 flex items-center justify-between">
            <span className="font-mono text-sm font-bold text-green-800">
              {itemData.key_words[0]}
            </span>
            <Button
              type="link"
              size="small"
              onClick={handleCopyCode}
              className="text-green-600 text-xs"
            >
              Copy
            </Button>
          </div>
        </div>
      )}

      <div className="mb-3">
        <label className="text-xs text-gray-600 mb-1 block flex items-center">
          <CalendarOutlined className="mr-1" />
          Valid Period
        </label>
        <RangePicker
          size="small"
          value={[dayjs(itemData.start_date), dayjs(itemData.end_date)]}
          onChange={(dates) => onDateChange(itemData.id, dates)}
          disabledDate={getDisabledDate}
          className="w-full"
          format="MMM DD, YYYY"
          suffixIcon={null}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-gray-600 flex items-center">
            Select Active Dates{" "}
            <span className="ml-1 text-green-600 font-medium">
              ({selectedDatesCount}/{totalDatesCount})
            </span>
          </label>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-xs h-auto px-2 py-0.5 text-green-600 hover:text-green-700 hover:underline cursor-pointer"
            >
              All
            </button>
            <span className="text-gray-300">|</span>
            <button
              type="button"
              onClick={handleClearAll}
              className="text-xs h-auto px-2 py-0.5 text-gray-500 hover:text-gray-700 hover:underline cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>

        {availableDates.length > 0 ? (
          <div className="bg-white rounded-lg p-2 border border-green-200 max-h-48 overflow-y-auto">
            <div className="grid grid-cols-7 gap-1">
              {availableDates.map((dateObj) => {
                const isSelected =
                  itemData.selected_dates &&
                  itemData.selected_dates.includes(dateObj.date);
                return (
                  <button
                    key={dateObj.date}
                    type="button"
                    onClick={() => handleDateToggle(dateObj.date)}
                    className={`relative flex flex-col items-center justify-center py-2 rounded-md text-xs font-medium transition-all ${
                      isSelected
                        ? "bg-green-500 text-white shadow-md"
                        : "bg-gray-50 text-gray-700 border border-gray-200 hover:border-green-300 hover:bg-green-50"
                    }`}
                  >
                    <span className="text-[10px] opacity-70">
                      {dateObj.dayName}
                    </span>
                    <span className="text-sm font-bold">
                      {dateObj.dayNumber}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
            <p className="text-xs text-yellow-800">
              No dates with time slots configured yet
            </p>
          </div>
        )}

        {isScheduleLevel && selectedDatesCount > 0 && (
          <p className="text-xs text-blue-600 mt-2 italic text-center font-medium">
            ✓ All available dates selected - Applies at schedule level
          </p>
        )}

        {selectedDatesCount === 0 && availableDates.length > 0 && (
          <p className="text-xs text-gray-500 mt-2 italic text-center">
            No dates selected - Click "All" to select all dates with time slots
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-green-200">
        <div className="text-center">
          <p className="text-lg font-bold text-gray-900">{itemData.max_uses}</p>
          <p className="text-xs text-gray-600">Max Uses</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-gray-900">
            {itemData.used_count || 0}
          </p>
          <p className="text-xs text-gray-600">Used</p>
        </div>
      </div>
    </div>
  );
};

// Main Component
const OfferAndCoupons = ({ onSubmit, form, onBack, initialData, mode }) => {
  const dispatch = useDispatch();
  const { eventDetails, loading } = useSelector((state) => state.event);

  const [selectedOfferItems, setSelectedOfferItems] = useState([]);
  const [selectedCouponItems, setSelectedCouponItems] = useState([]);
  const [offerSearchValue, setOfferSearchValue] = useState("");
  const [couponSearchValue, setCouponSearchValue] = useState("");

  useEffect(() => {
    console.log("=== STATE UPDATE ===");
    console.log("Selected Offers:", selectedOfferItems);
    console.log("Selected Coupons:", selectedCouponItems);
  }, [selectedOfferItems, selectedCouponItems]);

  useEffect(() => {
    if (initialData) {
      // Load existing offers (both schedule and date level)
      if (initialData.offer_ids && initialData.offer_ids.length > 0) {
        const restoredOffers = initialData.offer_ids
          .map((offerData) => {
            const fullOffer = eventDetails?.event_offers?.find(
              (offer) => offer.offer.id === offerData.offer_id
            );

            if (fullOffer) {
              return {
                ...fullOffer,
                offer: {
                  ...fullOffer.offer,
                  start_date: offerData.valid_from,
                  end_date: offerData.valid_to,
                  selected_dates: offerData.selected_dates || [],
                },
              };
            }
            return null;
          })
          .filter(Boolean);

        setSelectedOfferItems(restoredOffers);
      }

      //✅ ADD: Load schedule-level offers from offer_schedule
      else if (
        initialData.offer_schedule &&
        initialData.offer_schedule.length > 0
      ) {
        const scheduleOffers = initialData.offer_schedule
          .map((offerScheduleItem) => {
            const fullOffer = eventDetails?.event_offers?.find(
              (offer) => offer.offer.id === offerScheduleItem.offer.id
            );

            if (fullOffer) {
              return {
                ...fullOffer,
                offer: {
                  ...fullOffer.offer,
                  start_date: offerScheduleItem.valid_from,
                  end_date: offerScheduleItem.valid_to,
                  selected_dates: [], // Empty means schedule-level
                },
              };
            }
            return null;
          })
          .filter(Boolean);

        setSelectedOfferItems(scheduleOffers);
      }

      // Load existing coupons (both schedule and date level)
      if (initialData.coupon_ids && initialData.coupon_ids.length > 0) {
        const restoredCoupons = initialData.coupon_ids
          .map((couponData) => {
            const fullCoupon = eventDetails?.event_coupons?.find(
              (coupon) => coupon.coupons.id === couponData.coupon_id
            );

            if (fullCoupon) {
              return {
                ...fullCoupon,
                coupons: {
                  ...fullCoupon.coupons,
                  start_date: couponData.valid_from,
                  end_date: couponData.valid_to,
                  selected_dates: couponData.selected_dates || [],
                },
              };
            }
            return null;
          })
          .filter(Boolean);

        setSelectedCouponItems(restoredCoupons);
      }

      // ✅ ADD: Load schedule-level coupons from coupon_schedule
      else if (
        initialData.coupon_schedule &&
        initialData.coupon_schedule.length > 0
      ) {
        const scheduleCoupons = initialData.coupon_schedule
          .map((couponScheduleItem) => {
            const fullCoupon = eventDetails?.event_coupons?.find(
              (coupon) => coupon.coupons.id === couponScheduleItem.coupons.id
            );

            if (fullCoupon) {
              return {
                ...fullCoupon,
                coupons: {
                  ...fullCoupon.coupons,
                  start_date: couponScheduleItem.valid_from,
                  end_date: couponScheduleItem.valid_to,
                  selected_dates: [], // Empty means schedule-level
                },
              };
            }
            return null;
          })
          .filter(Boolean);

        setSelectedCouponItems(scheduleCoupons);
      }
    }
  }, [initialData, eventDetails]);

  const availableOffers = eventDetails?.event_offers || [];
  const availableCoupons = eventDetails?.event_coupons || [];

  // Memoized schedule dates with proper dayjs conversion and validation
  const { scheduleStartDate, scheduleEndDate, schedStart, schedEnd } =
    useMemo(() => {
      const formValues = form.getFieldsValue();

      const startDate =
        formValues.start_date ||
        initialData?.start_date ||
        formValues.startdate ||
        formValues.eventstartdate ||
        formValues.schedulestartdate ||
        formValues.dateRange?.[0];

      const endDate =
        formValues.end_date ||
        initialData?.end_date ||
        formValues.enddate ||
        formValues.eventenddate ||
        formValues.scheduleenddate ||
        formValues.dateRange?.[1];

      return {
        scheduleStartDate: startDate,
        scheduleEndDate: endDate,
        schedStart: startDate ? dayjs(startDate) : null,
        schedEnd: endDate ? dayjs(endDate) : null,
      };
    }, [form, initialData]);

  // Get existing show dates (dates with configured time slots)
  const existingShowDates = (initialData?.show_dates || []).map(
    (sd) => sd.start_date
  );

  const validateItemDates = (offerStart, offerEnd, itemName) => {
    if (
      !schedStart ||
      !schedEnd ||
      !schedStart.isValid() ||
      !schedEnd.isValid()
    ) {
      message.error("Please set valid schedule dates first");
      return false;
    }

    const offerStartDate = dayjs(offerStart);
    const offerEndDate = dayjs(offerEnd);

    const isScheduleStartValid = schedStart.isSameOrAfter(
      offerStartDate,
      "day"
    );
    const isScheduleEndValid = schedEnd.isSameOrBefore(offerEndDate, "day");

    if (!isScheduleStartValid || !isScheduleEndValid) {
      message.error(
        `${itemName} period must cover your schedule dates (${schedStart.format(
          "MMM DD"
        )} - ${schedEnd.format("MMM DD")})`
      );
      return false;
    }

    return true;
  };

  const filteredOffers = availableOffers.filter((offer) =>
    offer.offer.name.toLowerCase().includes(offerSearchValue.toLowerCase())
  );

  const filteredCoupons = availableCoupons.filter((coupon) =>
    coupon.coupons.name.toLowerCase().includes(couponSearchValue.toLowerCase())
  );

  // Validation helper
  const areDatesValid =
    schedStart && schedEnd && schedStart.isValid() && schedEnd.isValid();

  const debouncedOfferSearch = useCallback(
    debounce((value) => setOfferSearchValue(value), 300),
    []
  );

  const debouncedCouponSearch = useCallback(
    debounce((value) => setCouponSearchValue(value), 300),
    []
  );

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
        start_date: scheduleStartDate,
        end_date: scheduleEndDate,
        selected_dates: [],
        original_start_date: selectedOffer.offer.start_date,
        original_end_date: selectedOffer.offer.end_date,
      },
    };

    setSelectedOfferItems((prev) => [...prev, adjustedOffer]);
    message.success(
      `"${selectedOffer.offer.name}" added. Select specific dates or click "All".`
    );
  };

  const handleCouponSelect = (couponId) => {
    const selectedCoupon = availableCoupons.find(
      (coupon) => coupon.coupons.id === couponId
    );
    if (!selectedCoupon) return;

    if (selectedCouponItems.some((item) => item.coupons.id === couponId)) {
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
        start_date: scheduleStartDate,
        end_date: scheduleEndDate,
        selected_dates: [],
        original_start_date: selectedCoupon.coupons.start_date,
        original_end_date: selectedCoupon.coupons.end_date,
      },
    };

    setSelectedCouponItems((prev) => [...prev, adjustedCoupon]);
    message.success(
      `"${selectedCoupon.coupons.name}" added. Select specific dates or click "All".`
    );
  };

  const handleOfferRemove = (offerId) => {
    setSelectedOfferItems((prev) =>
      prev.filter((item) => item.offer.id !== offerId)
    );
    message.success("Offer removed");
  };

  const handleCouponRemove = (couponId) => {
    setSelectedCouponItems((prev) =>
      prev.filter((item) => item.coupons.id !== couponId)
    );
    message.success("Coupon removed");
  };

  const handleOfferDateChange = (offerId, dateRange) => {
    if (!dateRange || !dateRange[0] || !dateRange[1]) return;

    const startDate = dateRange[0].format("YYYY-MM-DD");
    const endDate = dateRange[1].format("YYYY-MM-DD");

    setSelectedOfferItems((prev) =>
      prev.map((item) =>
        item.offer.id === offerId
          ? {
              ...item,
              offer: {
                ...item.offer,
                start_date: startDate,
                end_date: endDate,
                selected_dates: [],
              },
            }
          : item
      )
    );
  };

  const handleCouponDateChange = (couponId, dateRange) => {
    if (!dateRange || !dateRange[0] || !dateRange[1]) return;

    const startDate = dateRange[0].format("YYYY-MM-DD");
    const endDate = dateRange[1].format("YYYY-MM-DD");

    setSelectedCouponItems((prev) =>
      prev.map((item) =>
        item.coupons.id === couponId
          ? {
              ...item,
              coupons: {
                ...item.coupons,
                start_date: startDate,
                end_date: endDate,
                selected_dates: [],
              },
            }
          : item
      )
    );
  };

  const handleOfferDatesChange = (offerId, selectedDates) => {
    console.log("handleOfferDatesChange:", { offerId, selectedDates });

    setSelectedOfferItems((prevItems) => {
      return prevItems.map((item) => {
        if (item.offer.id === offerId) {
          const updatedItem = {
            ...item,
            offer: {
              ...item.offer,
              selected_dates: [...selectedDates],
            },
          };
          console.log("Updated offer item:", updatedItem);
          return updatedItem;
        }
        return item;
      });
    });
  };

  const handleCouponDatesChange = (couponId, selectedDates) => {
    console.log("handleCouponDatesChange:", { couponId, selectedDates });

    setSelectedCouponItems((prevItems) => {
      return prevItems.map((item) => {
        if (item.coupons.id === couponId) {
          const updatedItem = {
            ...item,
            coupons: {
              ...item.coupons,
              selected_dates: [...selectedDates],
            },
          };
          console.log("Updated coupon item:", updatedItem);
          return updatedItem;
        }
        return item;
      });
    });
  };

  const handleSubmit = async () => {
    try {
      console.log("=== SUBMIT STARTED ===");
      console.log("Current offers:", selectedOfferItems);
      console.log("Current coupons:", selectedCouponItems);

      const finalData = {
        offer_ids: selectedOfferItems.map((item) => ({
          offer_id: item.offer.id,
          valid_from: item.offer.start_date,
          valid_to: item.offer.end_date,
          selected_dates: item.offer.selected_dates || [],
        })),
        coupon_ids: selectedCouponItems.map((item) => ({
          coupon_id: item.coupons.id,
          valid_from: item.coupons.start_date,
          valid_to: item.coupons.end_date,
          selected_dates: item.coupons.selected_dates || [],
        })),
      };

      console.log("=== FINAL DATA TO SUBMIT ===");
      console.log(JSON.stringify(finalData, null, 2));

      message.success("Offers and coupons saved successfully!");

      onSubmit(finalData);
    } catch (errorInfo) {
      console.error("Submit error:", errorInfo);
      message.error("Please check the form fields");
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Offers & Coupons
            </h1>
            <p className="text-sm text-gray-600">
              Select offers/coupons for dates with configured time slots
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button onClick={onBack} size="large">
              Go Back
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSubmit}
              loading={loading}
              size="large"
            >
              Save & Continue
            </Button>
          </div>
        </div>
      </div>

      {scheduleStartDate && scheduleEndDate ? (
        <Alert
          message={
            <span>
              <strong>Schedule Period:</strong>{" "}
              {dayjs(scheduleStartDate).format("MMM DD, YYYY")} -{" "}
              {dayjs(scheduleEndDate).format("MMM DD, YYYY")} (
              {existingShowDates.length} dates with time slots)
            </span>
          }
          description="Only dates with configured time slots will be shown for selection."
          type="info"
          icon={<InfoCircleOutlined />}
          showIcon
          className="mb-6"
        />
      ) : (
        <Alert
          message="Schedule Dates Required"
          description="Please go back and set your event schedule dates first."
          type="warning"
          icon={<ExclamationCircleOutlined />}
          showIcon
          className="mb-6"
        />
      )}

      <Form form={form} layout="vertical">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Offers Column */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <TagOutlined className="mr-2 text-orange-500" />
                Add Offers
              </h2>

              <Select
                showSearch
                placeholder="Search and select an offer..."
                loading={loading}
                onSearch={debouncedOfferSearch}
                onChange={handleOfferSelect}
                value={null}
                allowClear
                size="large"
                disabled={!scheduleStartDate || !scheduleEndDate}
                className="w-full"
                filterOption={false}
                notFoundContent={
                  loading ? (
                    <div className="text-center py-4">
                      <Spin size="small" />
                    </div>
                  ) : (
                    <Empty
                      description="No offers available"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                  )
                }
              >
                {filteredOffers.map((offer) => {
                  const offerStart = dayjs(offer.offer.start_date);
                  const offerEnd = dayjs(offer.offer.end_date);

                  // Check if dates are valid before comparison
                  const isValid =
                    mode === ADD &&
                    areDatesValid &&
                    schedStart.isSameOrAfter(offerStart, "day") &&
                    schedEnd.isSameOrBefore(offerEnd, "day");

                  const isAlreadySelected = selectedOfferItems.some(
                    (item) => item.offer.id === offer.offer.id
                  );

                  return (
                    <Option
                      key={offer.offer.id}
                      value={offer.offer.id}
                      disabled={!isValid || isAlreadySelected}
                    >
                      <div className="py-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-10 h-10 ${
                                isValid && !isAlreadySelected
                                  ? "bg-orange-100"
                                  : "bg-gray-100"
                              } rounded-lg flex items-center justify-center`}
                            >
                              <TagOutlined
                                className={`${
                                  isValid && !isAlreadySelected
                                    ? "text-orange-600"
                                    : "text-gray-400"
                                }`}
                              />
                            </div>
                            <div>
                              <div
                                className={`font-medium ${
                                  isValid && !isAlreadySelected
                                    ? "text-gray-900"
                                    : "text-gray-400"
                                }`}
                              >
                                {offer.offer.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {offerStart.format("MMM DD")} -{" "}
                                {offerEnd.format("MMM DD, YYYY")}
                              </div>
                            </div>
                          </div>
                          <div>
                            {isAlreadySelected ? (
                              <Tag color="blue">Added</Tag>
                            ) : isValid ? (
                              <Tag color="green">Valid</Tag>
                            ) : (
                              <Tag color="red">Invalid</Tag>
                            )}
                          </div>
                        </div>
                      </div>
                    </Option>
                  );
                })}
              </Select>

              {selectedOfferItems.length > 0 && (
                <div className="mt-4 space-y-3">
                  <h3 className="text-sm font-medium text-gray-700 flex items-center">
                    <CheckOutlined className="mr-1.5 text-green-500" />
                    Selected Offers ({selectedOfferItems.length})
                  </h3>
                  {selectedOfferItems.map((item) => (
                    <SimplifiedOfferCard
                      key={item.offer.id}
                      item={item}
                      onRemove={handleOfferRemove}
                      onDateChange={handleOfferDateChange}
                      onDatesChange={handleOfferDatesChange}
                      scheduleStartDate={scheduleStartDate}
                      scheduleEndDate={scheduleEndDate}
                      existingShowDates={existingShowDates}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Coupons Column */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <PercentageOutlined className="mr-2 text-green-500" />
                Add Coupons
              </h2>

              <Select
                showSearch
                placeholder="Search and select a coupon..."
                loading={loading}
                onSearch={debouncedCouponSearch}
                onChange={handleCouponSelect}
                value={null}
                allowClear
                size="large"
                disabled={!scheduleStartDate || !scheduleEndDate}
                className="w-full"
                filterOption={false}
                notFoundContent={
                  loading ? (
                    <div className="text-center py-4">
                      <Spin size="small" />
                    </div>
                  ) : (
                    <Empty
                      description="No coupons available"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                  )
                }
              >
                {filteredCoupons.map((coupon) => {
                  const couponStart = dayjs(coupon.coupons.start_date);
                  const couponEnd = dayjs(coupon.coupons.end_date);

                  // Check if dates are valid before comparison
                  const isValid =
                    mode === ADD &&
                    areDatesValid &&
                    schedStart.isSameOrAfter(couponStart, "day") &&
                    schedEnd.isSameOrBefore(couponEnd, "day");

                  const isAlreadySelected = selectedCouponItems.some(
                    (item) => item.coupons.id === coupon.coupons.id
                  );

                  return (
                    <Option
                      key={coupon.coupons.id}
                      value={coupon.coupons.id}
                      disabled={!isValid || isAlreadySelected}
                    >
                      <div className="py-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-10 h-10 ${
                                isValid && !isAlreadySelected
                                  ? "bg-green-100"
                                  : "bg-gray-100"
                              } rounded-lg flex items-center justify-center`}
                            >
                              <PercentageOutlined
                                className={`${
                                  isValid && !isAlreadySelected
                                    ? "text-green-600"
                                    : "text-gray-400"
                                }`}
                              />
                            </div>
                            <div>
                              <div
                                className={`font-medium ${
                                  isValid && !isAlreadySelected
                                    ? "text-gray-900"
                                    : "text-gray-400"
                                }`}
                              >
                                {coupon.coupons.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {couponStart.format("MMM DD")} -{" "}
                                {couponEnd.format("MMM DD, YYYY")}
                              </div>
                            </div>
                          </div>
                          <div>
                            {isAlreadySelected ? (
                              <Tag color="blue">Added</Tag>
                            ) : isValid ? (
                              <Tag color="green">Valid</Tag>
                            ) : (
                              <Tag color="red">Invalid</Tag>
                            )}
                          </div>
                        </div>
                      </div>
                    </Option>
                  );
                })}
              </Select>

              {selectedCouponItems.length > 0 && (
                <div className="mt-4 space-y-3">
                  <h3 className="text-sm font-medium text-gray-700 flex items-center">
                    <CheckOutlined className="mr-1.5 text-green-500" />
                    Selected Coupons ({selectedCouponItems.length})
                  </h3>
                  {selectedCouponItems.map((item) => (
                    <SimplifiedCouponCard
                      key={item.coupons.id}
                      item={item}
                      onRemove={handleCouponRemove}
                      onDateChange={handleCouponDateChange}
                      onDatesChange={handleCouponDatesChange}
                      scheduleStartDate={scheduleStartDate}
                      scheduleEndDate={scheduleEndDate}
                      existingShowDates={existingShowDates}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </Form>

      {selectedOfferItems.length === 0 && selectedCouponItems.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center mt-6">
          <GiftOutlined className="text-5xl text-gray-300 mb-4" />
          <p className="text-gray-600 text-lg mb-2">
            No offers or coupons selected yet
          </p>
          <p className="text-gray-400">
            {existingShowDates.length > 0
              ? `Select from the dropdowns above. ${existingShowDates.length} dates with time slots available.`
              : "Configure time slots in the previous step first."}
          </p>
        </div>
      )}
    </div>
  );
};

export default OfferAndCoupons;
