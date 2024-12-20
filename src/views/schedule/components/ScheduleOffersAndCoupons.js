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
import { CloseCircleOutlined } from "@ant-design/icons";
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

const { Option } = Select;
const { Text } = Typography;

export const ScheduleOffersAndCoupons = ({ form }) => {
  const dispatch = useDispatch();
  const { eventDetails, submitLoading } = useSelector((state) => state.event);
  const { selectedOffers, selectedCoupons, selectedItemForModal } = useSelector(
    (state) => state.schedules
  );
  const [isModalVisible, setIsModalVisible] = useState(false);

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

  const handleOfferSelect = (offerId) => {
    const selectedOffer = eventDetails?.event_offers?.find(
      (offer) => offer.offer.id === offerId
    );
    if (selectedOffer) {
      dispatch(toggleSelectedOffer(selectedOffer));
    }
  };

  const handleCouponSelect = (couponId) => {
    const selectedCoupon = eventDetails?.event_coupons?.find(
      (coupon) => coupon.id === couponId
    );
    if (selectedCoupon) {
      dispatch(toggleSelectedCoupon(selectedCoupon));
    }
  };

  const handleDeleteOffer = (offer) => {
    dispatch(toggleSelectedOffer(offer));
  };

  const handleDeleteCoupon = (coupon) => {
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
            <Form.Item
              name="offer"
              label="Offer"
              rules={[{ required: true, message: "Please select an offer." }]}
            >
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
                    {offer.offer.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="coupon"
              label="Coupon"
              rules={[{ required: true, message: "Please select a coupon." }]}
            >
              <Select
                className="w-100"
                placeholder="Select Coupon"
                onChange={handleCouponSelect}
                loading={submitLoading}
              >
                {eventDetails?.event_coupons?.map((coupon) => (
                  <Option key={coupon.id} value={coupon.id}>
                    {coupon.coupons.name}
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
            <Text>Selected Offers</Text>
            {selectedOffers.map((offer) => (
              <Card
                key={offer.id}
                size="small"
                onClick={() => showItemDetails(offer)}
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
                {offer.offer.date_required ? (
                  <Row justify="space-between">
                    <Text style={{ padding: "2px 0px", fontSize: "12px" }}>
                      Start: {offer.offer.start_date}
                    </Text>
                    <Text style={{ padding: "2px 0px", fontSize: "12px" }}>
                      End: {offer.offer.end_date}
                    </Text>
                  </Row>
                ) : (
                  <Text
                    style={{
                      color: "orange",
                      padding: "2px 0px",
                      fontSize: "11px",
                    }}
                  >
                    This offer does not have a specified date. Please click here
                    to select a date, or the schedule date will be used by
                    default.
                  </Text>
                )}
              </Card>
            ))}
          </div>
        )}

        {selectedCoupons.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <Text>Selected Coupons</Text>
            {selectedCoupons.map((coupon) => (
              <Card
                key={coupon.id}
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
                <Row justify="space-between" align="middle">
                  <Text strong>{coupon.name}</Text>
                  <Text
                    style={{
                      backgroundColor: "#e6f7ff",
                      padding: "2px 8px",
                      borderRadius: "4px",
                    }}
                  >
                    Max Uses: {coupon.max_uses}
                  </Text>
                </Row>
                <Row justify="space-between">
                  <Text>Start: {coupon.start_date}</Text>
                  <Text>End: {coupon.end_date}</Text>
                </Row>
              </Card>
            ))}
          </div>
        )}
      </Col>

      <OfferDateModal
        isModalVisible={isModalVisible}
        selectedItemForModal={selectedItemForModal}
        handleModalClose={handleModalClose}
        scheduleStartDate={form.getFieldValue("start_date")}
        scheduleEndDate={form.getFieldValue("end_date")}
      />
    </Row>
  );
};
