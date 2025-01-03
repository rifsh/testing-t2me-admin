import React, { useEffect, useState } from "react";
import {
  Card,
  Form,
  Select,
  Typography,
  Row,
  Col,
  Button,
  message,
} from "antd";
import { CloseCircleOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import {
  setSubmitLoading,
  setCurrentStep,
  resetState,
  fetchEventDetails,
} from "store/slices/eventSlice";
import {
  toggleSelectedOffer,
  toggleSelectedCoupon,
  setSelectedItemForModal,
} from "store/slices/scheduleSlice";
import OfferDateModal from "./OfferDateModal";
import Utils from "utils";

const { Option } = Select;
const { Text } = Typography;

export const ScheduleOffersAndCoupons = ({ form }) => {
  const dispatch = useDispatch();
  const { eventDetails, submitLoading } = useSelector((state) => state.event);
  const { selectedOffers, selectedCoupons, selectedItemForModal } = useSelector(
    (state) => state.schedules
  );
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isOffer, setIsOffer] = useState(false);

  useEffect(() => {
    const eventId = form?.getFieldValue("event_id");
    if (eventId) {
      dispatch(fetchEventDetails(eventId));
    }
  }, [dispatch, form]);

  const handleModalClose = () => {
    setIsModalVisible(false);
    dispatch(setSelectedItemForModal(null));
  };

  const adjustDateToSchedule = (
    itemStartDate,
    itemEndDate,
    scheduleStartDate,
    scheduleEndDate
  ) => {
    const itemStart = new Date(itemStartDate);
    const itemEnd = new Date(itemEndDate);
    const scheduleStart = new Date(scheduleStartDate);
    const scheduleEnd = new Date(scheduleEndDate);

    // Find the overlapping period
    const startDate = new Date(Math.max(itemStart, scheduleStart));
    const endDate = new Date(Math.min(itemEnd, scheduleEnd));

    // Check if there is a valid overlap
    if (startDate <= endDate) {
      return {
        start_date: Utils.formatDate(startDate),
        end_date: Utils.formatDate(endDate),
        wasAdjusted: true,
        originalDates: {
          start: Utils.formatDate(itemStartDate),
          end: Utils.formatDate(itemEndDate),
        },
      };
    }

    // No valid overlap
    return {
      start_date: Utils.formatDate(itemStartDate),
      end_date: Utils.formatDate(itemEndDate),
      wasAdjusted: false,
      originalDates: null,
    };
  };
  const renderValidationMessage = (validationResult) => {
    if (!validationResult) return null;

    return (
      <Text
        style={{
          color: validationResult.type === "error" ? "red" : "#52c41a",
          padding: "2px 0px",
          fontSize: "11px",
        }}
      >
        {validationResult.message}
      </Text>
    );
  };
  const isDateValid = (
    scheduleStartDate,
    scheduleEndDate,
    itemStartDate,
    itemEndDate
  ) => {
    if (!scheduleStartDate || !scheduleEndDate) {
      message.error("Please select schedule dates first");
      return false;
    }

    const schedule = {
      start: new Date(scheduleStartDate).setHours(0, 0, 0, 0),
      end: new Date(scheduleEndDate).setHours(23, 59, 59, 999),
    };

    const item = {
      start: itemStartDate
        ? new Date(itemStartDate).setHours(0, 0, 0, 0)
        : null,
      end: itemEndDate ? new Date(itemEndDate).setHours(23, 59, 59, 999) : null,
    };

    // If schedule dates are within item dates
    if (item.start && item.end) {
      if (schedule.start >= item.start && schedule.end <= item.end) {
        return true;
      }
      // No overlap
      if (schedule.end < item.start || schedule.start > item.end) {
        return false;
      }
    }

    return true;
  };

  const handleOfferSelect = (offerId) => {
    const selectedOffer = eventDetails?.event_offers?.find(
      (offer) => offer.offer.id === offerId
    );

    if (selectedOffer) {
      const scheduleStartDate = form.getFieldValue("start_date");
      const scheduleEndDate = form.getFieldValue("end_date");

      if (!scheduleStartDate || !scheduleEndDate) {
        message.error("Please select schedule dates before adding an offer");
        return;
      }

      if (selectedOffer.offer.date_required && selectedOffer.offer.start_date) {
        if (
          !isDateValid(
            scheduleStartDate,
            scheduleEndDate,
            selectedOffer.offer.start_date,
            selectedOffer.offer.end_date
          )
        ) {
          message.error(
            `This offer is only valid from ${selectedOffer.offer.start_date} to ${selectedOffer.offer.end_date}`
          );
          return;
        }

        const adjustedDates = adjustDateToSchedule(
          selectedOffer.offer.start_date,
          selectedOffer.offer.end_date,
          scheduleStartDate,
          scheduleEndDate
        );

        if (adjustedDates.wasAdjusted) {
          message.success(
            `Dates updated to match schedule: ${adjustedDates.start_date} - ${adjustedDates.end_date}`
          );
        }

        const updatedOffer = {
          ...selectedOffer,
          offer: {
            ...selectedOffer.offer,
            start_date: adjustedDates.start_date,
            end_date: adjustedDates.end_date,
            original_start_date: adjustedDates.originalDates?.start,
            original_end_date: adjustedDates.originalDates?.end,
          },
        };
        dispatch(toggleSelectedOffer(updatedOffer));
      } else {
        const updatedOffer = {
          ...selectedOffer,
          offer: {
            ...selectedOffer.offer,
            start_date: Utils.formatDate(scheduleStartDate),
            end_date: Utils.formatDate(scheduleEndDate),
          },
        };
        dispatch(toggleSelectedOffer(updatedOffer));
      }
    }
  };

  const handleCouponSelect = (couponId) => {
    const selectedCoupon = eventDetails?.event_coupons?.find(
      (coupon) => coupon.id === couponId
    );

    if (selectedCoupon) {
      const scheduleStartDate = form.getFieldValue("start_date");
      const scheduleEndDate = form.getFieldValue("end_date");

      if (!scheduleStartDate || !scheduleEndDate) {
        message.error("Please select schedule dates before adding a coupon");
        return;
      }

      if (
        !isDateValid(
          scheduleStartDate,
          scheduleEndDate,
          selectedCoupon.coupons.start_date,
          selectedCoupon.coupons.end_date
        )
      ) {
        message.error(
          `This coupon is only valid from ${selectedCoupon.coupons.start_date} to ${selectedCoupon.coupons.end_date}`
        );
        return;
      }

      const adjustedDates = adjustDateToSchedule(
        selectedCoupon.coupons.start_date,
        selectedCoupon.coupons.end_date,
        scheduleStartDate,
        scheduleEndDate
      );

      if (adjustedDates.wasAdjusted) {
        message.success(
          `Dates updated to match schedule: ${adjustedDates.start_date} - ${adjustedDates.end_date}`
        );
      }

      const updatedCoupon = {
        ...selectedCoupon,
        coupons: {
          ...selectedCoupon.coupons,
          start_date: adjustedDates.start_date,
          end_date: adjustedDates.end_date,
          original_start_date: adjustedDates.originalDates?.start,
          original_end_date: adjustedDates.originalDates?.end,
        },
      };
      dispatch(toggleSelectedCoupon(updatedCoupon));
    }
  };

  const getDateValidationMessage = (
    item,
    scheduleStartDate,
    scheduleEndDate
  ) => {
    if (!item.start_date || !item.end_date) return null;

    const schedule = {
      start: new Date(scheduleStartDate).setHours(0, 0, 0, 0),
      end: new Date(scheduleEndDate).setHours(23, 59, 59, 999),
    };

    const itemDates = {
      start: new Date(item.start_date).setHours(0, 0, 0, 0),
      end: new Date(item.end_date).setHours(23, 59, 59, 999),
    };

    if (item.original_start_date || item.wasAdjusted) {
      if (!item.original_start_date) {
        return {
          type: "success",
          message: "The date has been successfully adjusted.",
        };
      }
      return {
        type: "success",
        message: `The schedule was adjusted from ${item.original_start_date} to ${item.original_end_date}.`,
      };
    }

    if (schedule.end < itemDates.start) {
      return {
        type: "error",
        message: "Schedule ends before valid period",
      };
    }
    if (schedule.start > itemDates.end) {
      return {
        type: "error",
        message: "Schedule starts after valid period",
      };
    }
    return null;
  };

  const handleDeleteOffer = (offer) => {
    dispatch(toggleSelectedOffer(offer));
  };

  const handleDeleteCoupon = (coupon) => {
    form.setFieldsValue({
      coupon: 1,
    });
    dispatch(toggleSelectedCoupon(coupon));
  };

  const showItemDetails = (item) => {
    dispatch(setSelectedItemForModal(item));
    setIsModalVisible(true);
  };

  return (
    <Row gutter={16}>
      <Col xs={24} sm={24} md={17}>
        <Card title="Offers & Coupons (Optional)">
          <Form layout="vertical">
            <Form.Item name="offer" label="Offer">
              <Select
                className="w-100"
                placeholder="Select Offer"
                onChange={handleOfferSelect}
                loading={submitLoading}
                optionLabelProp="label"
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
                          ({offer.offer.start_date} - {offer.offer.end_date})
                        </Text>
                      )}
                    </Row>
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="coupon" label="Coupon">
              <Select
                className="w-100"
                placeholder="Select Coupon"
                onChange={handleCouponSelect}
                loading={submitLoading}
              >
                {eventDetails?.event_coupons?.map((coupon) => (
                  <Option key={coupon.id} value={coupon.id}>
                    <Row justify="space-between">
                      <span>{coupon.coupons.name}</span>
                      <Text type="secondary" style={{ fontSize: "12px" }}>
                        ({coupon.coupons.start_date} - {coupon.coupons.end_date}
                        )
                      </Text>
                    </Row>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Form>
        </Card>
      </Col>

      <Col xs={24} sm={24} md={7}>
        {selectedOffers.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <Text strong>Selected Offers</Text>
            {selectedOffers.map((offer) => (
              <Card
                key={offer.id}
                size="small"
                style={{
                  marginBottom: "8px",
                  cursor: "pointer",
                  position: "relative",
                }}
              >
                <Button
                  type="text"
                  icon={<CloseCircleOutlined />}
                  onClick={() => handleDeleteOffer(offer)}
                  style={{
                    position: "absolute",
                    top: "15px",
                    right: "-40px",
                  }}
                />
                <div
                  onClick={() => {
                    setIsOffer(true);
                    return showItemDetails(offer);
                  }}
                >
                  <Row justify="space-between" align="middle">
                    <Text strong>{offer.offer.name}</Text>
                    <Text
                      style={{
                        backgroundColor: "#e6f7ff",
                        padding: "2px 8px",
                        borderRadius: "4px",
                        fontSize: "12px",
                      }}
                    >
                      Max Uses: {offer.offer.max_uses}
                    </Text>
                  </Row>
                  {offer.offer.date_required && offer.offer.start_date ? (
                    <>
                      <Row justify="space-between">
                        <Text style={{ padding: "2px 0px", fontSize: "12px" }}>
                          Start: {offer.offer.start_date}
                        </Text>
                        <Text style={{ padding: "2px 0px", fontSize: "12px" }}>
                          End: {offer.offer.end_date}
                        </Text>
                      </Row>
                      {(() => {
                        const validationMessage = getDateValidationMessage(
                          offer.offer,
                          form.getFieldValue("start_date"),
                          form.getFieldValue("end_date")
                        );
                        if (validationMessage) {
                          return (
                            <Text
                              style={{
                                color:
                                  validationMessage.type === "error"
                                    ? "red"
                                    : "#52c41a",
                                padding: "2px 0px",
                                fontSize: "11px",
                              }}
                            >
                              {validationMessage.message}
                            </Text>
                          );
                        }
                        return null;
                      })()}
                    </>
                  ) : (
                    <Text
                      type="warning"
                      style={{ padding: "2px 0px", fontSize: "11px" }}
                    >
                      This offer does not have a valid date. Please click here
                      to adjust the date, or the default scheduled dates will be
                      used.{" "}
                    </Text>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {selectedCoupons.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <Text>Selected Coupons</Text>
            {selectedCoupons.map((coupon) => (
              <Card
                key={coupon.coupons.id}
                size="small"
                style={{
                  marginBottom: "8px",
                  cursor: "pointer",
                  position: "relative",
                }}
              >
                <Button
                  type="text"
                  icon={<CloseCircleOutlined />}
                  onClick={() => handleDeleteCoupon(coupon)}
                  style={{
                    position: "absolute",
                    top: "15px",
                    right: "-40px",
                  }}
                />
                <div
                // onClick={() => {
                //   setIsOffer(false);
                //   showItemDetails(coupon);
                // }}
                >
                  <Row justify="space-between" align="middle">
                    <Text strong>{coupon.coupons.name}</Text>
                    <Text
                      style={{
                        backgroundColor: "#e6f7ff",
                        padding: "2px 8px",
                        borderRadius: "4px",
                      }}
                    >
                      Max Uses: {coupon.coupons.max_uses}
                    </Text>
                  </Row>
                  <Row justify="space-between">
                    <Text>Start: {coupon.coupons.start_date}</Text>
                    <Text>End: {coupon.coupons.end_date}</Text>
                  </Row>
                  {renderValidationMessage(
                    getDateValidationMessage(
                      coupon.coupons,
                      form.getFieldValue("start_date"),
                      form.getFieldValue("end_date")
                    )
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </Col>

      <OfferDateModal
        isModalVisible={isModalVisible}
        isOffer={isOffer}
        selectedItemForModal={selectedItemForModal}
        handleModalClose={handleModalClose}
        scheduleStartDate={form.getFieldValue("start_date")}
        scheduleEndDate={form.getFieldValue("end_date")}
      />
    </Row>
  );
};
