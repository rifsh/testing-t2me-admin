import React, { useState, useEffect } from "react";
import { Card, Form, Select, Row, Col, Alert, message, Typography } from "antd";
import { useDispatch, useSelector } from "react-redux";
import {
  toggleSelectedOffer,
  toggleSelectedCoupon,
  updateSelectedOffer,
  updateSelectedCoupons,
} from "store/slices/scheduleSlice";
import { fetchEventDetails } from "store/slices/eventSlice";
import { OfferItemCard } from "./OfferItemCard";
import { DateChangeModal } from "./DateChangeModal";

import dayjs from "dayjs";
import { OfferDateValidation } from "../utils/OfferDateValidation";

const { Text } = Typography;
const { Option } = Select;

export const ScheduleOffersAndCoupons = ({ form }) => {
  const dispatch = useDispatch();
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemType, setItemType] = useState(null);

  const { eventDetails } = useSelector((state) => state.event);
  const { selectedOffers, selectedCoupons } = useSelector(
    (state) => state.schedules
  );

  useEffect(() => {
    const eventId = form?.getFieldValue("event_id");
    if (eventId) {
      dispatch(fetchEventDetails(eventId));
    }
  }, [dispatch, form]);

  const handleOfferSelect = (offerId, offers) => {
    const scheduleStartDate = form.getFieldValue("booking_start_date_time");
    const scheduleEndDate = form.getFieldValue("end_date");

    if (!scheduleStartDate || !scheduleEndDate) {
      message.error("Please select schedule dates before adding an offer");
      return;
    }

    const selectedOffer = offers?.find((offer) => offer.offer.id === offerId);

    if (selectedOffer) {
      const adjustedDates = OfferDateValidation.adjustDateToSchedule(
        selectedOffer.offer.start_date,
        selectedOffer.offer.end_date,
        scheduleStartDate,
        scheduleEndDate
      );

      if (!adjustedDates.isValid) {
        message.error("Offer dates must be within event dates");
        return;
      }

      const updatedOffer = {
        ...selectedOffer,
        offer: {
          ...selectedOffer.offer,
          start_date: adjustedDates.start_date,
          end_date: adjustedDates.end_date,
        },
      };

      dispatch(toggleSelectedOffer(updatedOffer));

      if (adjustedDates.wasAdjusted) {
        message.success(
          `Dates adjusted to: ${dayjs(adjustedDates.start_date).format(
            "YYYY-MM-DD"
          )} - ${dayjs(adjustedDates.end_date).format("YYYY-MM-DD")}`
        );
      }
    }
  };

  const handleCouponSelect = (couponId, coupons) => {
    const scheduleStartDate = form.getFieldValue("start_date");
    const scheduleEndDate = form.getFieldValue("end_date");

    if (!scheduleStartDate || !scheduleEndDate) {
      message.error("Please select schedule dates before adding a coupon");
      return;
    }

    const selectedCoupon = coupons?.find((coupon) => coupon.id === couponId);

    if (selectedCoupon) {
      const adjustedDates = OfferDateValidation.adjustDateToSchedule(
        selectedCoupon.coupons.start_date,
        selectedCoupon.coupons.end_date,
        scheduleStartDate,
        scheduleEndDate
      );

      if (!adjustedDates.isValid) {
        message.error("Coupon dates must be within event dates");
        return;
      }

      const updatedCoupon = {
        ...selectedCoupon,
        coupons: {
          ...selectedCoupon.coupons,
          start_date: adjustedDates.start_date,
          end_date: adjustedDates.end_date,
        },
      };

      dispatch(toggleSelectedCoupon(updatedCoupon));

      if (adjustedDates.wasAdjusted) {
        message.success(
          `Dates adjusted to: ${dayjs(adjustedDates.start_date).format(
            "YYYY-MM-DD"
          )} - ${dayjs(adjustedDates.end_date).format("YYYY-MM-DD")}`
        );
      }
    }
  };

  const handleOfferDelete = (offer) => {
    dispatch(toggleSelectedOffer(offer));
  };

  const handleCouponDelete = (coupon) => {
    dispatch(toggleSelectedCoupon(coupon));
  };

  const handleDateChange = (item, type) => {
    setSelectedItem(item);
    setItemType(type);
    setDateModalVisible(true);
  };

  const handleDateSave = (dates) => {
    const scheduleStartDate = form.getFieldValue("booking_start_date_time");
    const scheduleEndDate = form.getFieldValue("end_date");

    if (!scheduleStartDate || !scheduleEndDate) {
      message.error("Schedule dates are required");
      return;
    }

    const adjustedDates = OfferDateValidation.adjustDateToSchedule(
      dates.start_date,
      dates.end_date,
      scheduleStartDate,
      scheduleEndDate
    );

    if (!adjustedDates.isValid) {
      message.error("Selected dates must be within schedule dates");
      return;
    }

    if (itemType === "offer") {
      dispatch(
        updateSelectedOffer({
          id: selectedItem.offer.id,
          start_date: adjustedDates.start_date,
          end_date: adjustedDates.end_date,
        })
      );
    } else {
      dispatch(
        updateSelectedCoupons({
          id: selectedItem.coupons.id,
          start_date: adjustedDates.start_date,
          end_date: adjustedDates.end_date,
        })
      );
    }

    setDateModalVisible(false);
    setSelectedItem(null);
    setItemType(null);

    if (adjustedDates.wasAdjusted) {
      message.success(
        `Dates adjusted to: ${dayjs(adjustedDates.start_date).format(
          "YYYY-MM-DD"
        )} - ${dayjs(adjustedDates.end_date).format("YYYY-MM-DD")}`
      );
    }
  };

  return (
    <Row gutter={16}>
      <Col xs={24} sm={24} md={17}>
        <Card title="Offers & Coupons (Optional)">
          <Form layout="vertical">
            <Form.Item name="offer" label="Offer">
              <Select
                placeholder="Select Offer"
                onChange={(id) =>
                  handleOfferSelect(id, eventDetails?.event_offers)
                }
              >
                {eventDetails?.event_offers?.map((offer) => (
                  <Option
                    key={offer.offer.id}
                    value={offer.offer.id}
                    label={offer.offer.name}
                  >
                    <Row justify="space-between">
                      <span>{offer.offer.name}</span>
                      {offer.offer.date_required && (
                        <Text type="secondary" style={{ fontSize: "12px" }}>
                          ({dayjs(offer.offer.start_date).format("YYYY-MM-DD")}{" "}
                          - {dayjs(offer.offer.end_date).format("YYYY-MM-DD")})
                        </Text>
                      )}
                    </Row>
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="coupon" label="Coupon">
              <Select
                placeholder="Select Coupon"
                onChange={(id) =>
                  handleCouponSelect(id, eventDetails?.event_coupons)
                }
              >
                {eventDetails?.event_coupons?.map((coupon) => (
                  <Option key={coupon.id} value={coupon.id}>
                    <Row justify="space-between">
                      <span>{coupon.coupons.name}</span>
                      <Text type="secondary" style={{ fontSize: "12px" }}>
                        ({dayjs(coupon.coupons.start_date).format("YYYY-MM-DD")}{" "}
                        - {dayjs(coupon.coupons.end_date).format("YYYY-MM-DD")})
                      </Text>
                    </Row>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Form>
        </Card>
        <Alert
          message="Warning"
          description="Offers and coupons should be updated here & should match with the scheduled time."
          type="warning"
          showIcon
        />
      </Col>

      <Col xs={24} sm={24} md={7}>
        {selectedOffers.length > 0 && (
          <div className="selected-items-section">
            <Text strong>Selected Offers</Text>
            {selectedOffers.map((offer) => (
              <OfferItemCard
                key={offer.id}
                item={offer}
                type="offer"
                onDelete={() => handleOfferDelete(offer)}
                onDateChange={() => handleDateChange(offer, "offer")}
                scheduleStartDate={form.getFieldValue(
                  "booking_start_date_time"
                )}
                scheduleEndDate={form.getFieldValue("end_date")}
              />
            ))}
          </div>
        )}

        {selectedCoupons.length > 0 && (
          <div className="selected-items-section">
            <Text strong>Selected Coupons</Text>
            {selectedCoupons.map((coupon) => (
              <OfferItemCard
                key={coupon.id}
                item={coupon}
                type="coupon"
                onDelete={() => handleCouponDelete(coupon)}
                onDateChange={() => handleDateChange(coupon, "coupon")}
                scheduleStartDate={form.getFieldValue(
                  "booking_start_date_time"
                )}
                scheduleEndDate={form.getFieldValue("end_date")}
              />
            ))}
          </div>
        )}
      </Col>

      <DateChangeModal
        isVisible={dateModalVisible}
        onClose={() => {
          setDateModalVisible(false);
          setSelectedItem(null);
          setItemType(null);
        }}
        onSave={handleDateSave}
        item={selectedItem}
        scheduleStartDate={form.getFieldValue("booking_start_date_time")}
        scheduleEndDate={form.getFieldValue("end_date")}
      />
    </Row>
  );
};
