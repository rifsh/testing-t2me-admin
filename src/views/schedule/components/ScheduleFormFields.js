import React, { useEffect, useState } from "react";
import {
  Input,
  Row,
  Col,
  Card,
  Form,
  DatePicker,
  Select,
  Modal,
  Typography,
  Button,
} from "antd";
import { RulesConstants } from "constants/RulesConstant";
import { useDispatch, useSelector } from "react-redux";
import {
  toggleSelectedOffer,
  setSelectedItemForModal,
  toggleSelectedCoupon,
} from "store/slices/scheduleSlice";
import { fetchAllOffers } from "store/slices/offerSlice";
import { fetchAllCoupons } from "store/slices/couponSlice";
import OfferDateModal from "./OfferDateModal";
import { useNavigate } from "react-router-dom";
import { fetchAllEvent, fetchEventDetails } from "store/slices/eventSlice";

const { Option } = Select;
const { Text } = Typography;

function ScheduleFormFields() {
  const dispatch = useDispatch();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const { selectedOffers, selectedCoupons, selectedItemForModal } = useSelector(
    (state) => state.schedules
  );
  const { eventDetails, loading } = useSelector((state) => state.event);

  useEffect(() => {
    dispatch(fetchAllEvent());
  }, [dispatch]);

  const handleEventSelect = (eventId) => {
    dispatch(fetchEventDetails(eventId));
  };
  const handleCouponSelect = (couponId) => {
    const selectedCoupon = eventDetails.event_coupons.find(
      (coupon) => coupon.coupons.id === couponId
    );
    if (selectedCoupon) {
      dispatch(toggleSelectedCoupon(selectedCoupon));
    }
  };

  const handleOfferSelect = (offerId) => {
    const selectedOffer = eventDetails.event_offers.find(
      (offer) => offer.id === offerId
    );
    if (selectedOffer) {
      dispatch(toggleSelectedOffer(selectedOffer));
    }
  };

  const handleDeleteOffer = (offerId) => {
    const existingOffer = selectedOffers.find((offer) => offer.id === offerId);
    if (existingOffer) {
      dispatch(toggleSelectedOffer(existingOffer));
    }
  };

  const showItemDetails = (item) => {
    dispatch(setSelectedItemForModal(item));
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    dispatch(setSelectedItemForModal(null));
  };
  const { filteredEvents } = useSelector((state) => state.event);
  const navigate = useNavigate();

  return (
    <Row gutter={16}>
      <Col xs={24} sm={24} md={17}>
        <Card title="Schedule Details">
          <Form.Item name="event" label="Event" rules={RulesConstants.event}>
            {loading ? (
              <div>Loading...</div>
            ) : (
              <Select
                className="w-100"
                placeholder="Choose a Category"
                onSelect={(id) => handleEventSelect(id)}
              >
                {filteredEvents.map((elm) => (
                  <Option key={elm.id} value={elm.id}>
                    {elm.event_name}
                  </Option>
                ))}
              </Select>
            )}
          </Form.Item>

          <Form.Item
            name="start_date"
            label="Start Time"
            rules={RulesConstants.start_time}
          >
            <DatePicker
              showTime
              className="w-100"
              placeholder="Select start time"
            />
          </Form.Item>

          <Form.Item
            name="end_date"
            label="End Time"
            rules={RulesConstants.end_time}
          >
            <DatePicker
              showTime
              className="w-100"
              placeholder="Select end time"
            />
          </Form.Item>

          <Form.Item name="offer" label="Offer">
            <Select
              loading={loading}
              style={{ width: "100%" }}
              placeholder="Please select"
              value={selectedOffers.length ? selectedOffers[0].id : undefined}
              onChange={(value) => handleOfferSelect(value)}
            >
              {eventDetails?.event_offers?.map((offer) => (
                <Option key={offer.id} value={offer.id}>
                  {offer.offer.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="coupon" label="Coupon">
            <Select
              loading={loading}
              style={{ width: "100%" }}
              placeholder="Please select"
              value={selectedCoupons.length ? selectedCoupons[0].id : undefined}
              onChange={(value) => handleCouponSelect(value)}
            >
              {eventDetails?.event_coupons?.map((coupon) => (
                <Option key={coupon.coupons.id} value={coupon.coupons.id}>
                  {coupon.coupons.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Card>
      </Col>

      <Col xs={24} sm={24} md={7}>
        <div style={{ marginBottom: 16, marginTop: 0 }}>
          {selectedOffers.length > 0 ? <Text>Selected Offers</Text> : null}
          {selectedOffers.map((offer) => (
            <Card
              key={offer.id}
              size="small"
              onClick={() => showItemDetails(offer)}
              style={{
                cursor: "pointer",
                marginBottom: "8px",
                position: "relative",
              }}
            >
              <Col style={{ padding: "0px" }}>
                <Row
                  justify="space-between"
                  align="middle"
                  style={{ marginBottom: "8px" }}
                >
                  <Text strong style={{ fontSize: "14px", color: "#333" }}>
                    {offer.name}
                  </Text>
                  <Text
                    style={{
                      fontSize: "12px",
                      color: "#8c8c8c",
                      backgroundColor: "#e6f7ff",
                      padding: "2px 8px",
                      borderRadius: "4px",
                    }}
                  >
                    Max Uses: {offer.max_uses}
                  </Text>
                </Row>
                <Row justify="space-between">
                  <Text style={{ fontSize: "10px ", color: "#595959" }}>
                    Start: {offer.start_date}
                  </Text>
                  <Text style={{ fontSize: "10px ", color: "#595959" }}>
                    End: {offer.end_date}
                  </Text>
                </Row>
              </Col>
            </Card>
          ))}
        </div>
        <div style={{ marginBottom: 16, marginTop: 0 }}>
          {selectedCoupons.length > 0 ? <Text>Selected Coupons</Text> : null}
          {selectedCoupons.map((offer) => (
            <Card
              key={offer.id}
              size="small"
              onClick={() => showItemDetails(offer)}
              style={{
                cursor: "pointer",
                marginBottom: "8px",
                position: "relative",
              }}
            >
              <Col style={{ padding: "0px" }}>
                <Row
                  justify="space-between"
                  align="middle"
                  style={{ marginBottom: "8px" }}
                >
                  <Text strong style={{ fontSize: "14px", color: "#333" }}>
                    {offer.name}
                  </Text>
                  <Text
                    style={{
                      fontSize: "12px",
                      color: "#8c8c8c",
                      backgroundColor: "#e6f7ff",
                      padding: "2px 8px",
                      borderRadius: "4px",
                    }}
                  >
                    Max Uses: {offer.max_uses}
                  </Text>
                </Row>
                <Row justify="space-between">
                  <Text style={{ fontSize: "10px ", color: "#595959" }}>
                    Start: {offer.start_date}
                  </Text>
                  <Text style={{ fontSize: "10px ", color: "#595959" }}>
                    End: {offer.end_date}
                  </Text>
                </Row>
              </Col>
            </Card>
          ))}
        </div>
      </Col>

      <OfferDateModal
        isModalVisible={isModalVisible}
        selectedItemForModal={selectedItemForModal}
        handleModalClose={handleModalClose}
      />
    </Row>
  );
}

export default ScheduleFormFields;
