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
import { fetchAllEvent } from "store/slices/eventSlice";

const { Option } = Select;
const { Text } = Typography;

function ScheduleFormFields() {
  const dispatch = useDispatch();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const { filteredOffers: filteredOffer, loading: offerLoading } = useSelector(
    (state) => state.offers
  );
  const { selectedOffers, selectedCoupons, selectedItemForModal } = useSelector(
    (state) => state.schedules
  );
  const { filteredCoupons, loading: couponLoading } = useSelector(
    (state) => state.coupons
  );

  useEffect(() => {
    dispatch(fetchAllOffers());
    dispatch(fetchAllCoupons());
    dispatch(fetchAllEvent());
  }, [dispatch]);

  const handleCouponSelect = (couponId) => {
    const selectedCoupon = filteredCoupons.find(
      (coupon) => coupon.id === couponId
    );
    if (selectedCoupon) {
      dispatch(toggleSelectedCoupon(selectedCoupon));
    }
  };

  const handleOfferSelect = (offerId) => {
    const selectedOffer = filteredOffer.find((offer) => offer.id === offerId);
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
  const {filteredEvents } = useSelector((state) => state.event);
  const navigate = useNavigate();

  return (
    <Row gutter={16}>
      <Col xs={24} sm={24} md={17}>
        <Card title="Schedule Details">
          {/* <Form form={form}> */}
          <Form.Item name="event" label="Event" rules={RulesConstants.event}>
          <Select className="w-100" placeholder="Choose a Category">
                {filteredEvents.map((elm) => (
                  <Option key={elm.id} value={elm.id}>
                    {elm.event_name}
                  </Option>
                ))}
              </Select>
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
              loading={offerLoading}
              style={{ width: "100%" }}
              placeholder="Please select"
              value={selectedOffers.length ? selectedOffers[0].id : undefined}
              onChange={(value) => handleOfferSelect(value)}
            >
              {filteredOffer.map((offer) => (
                <Option key={offer.id} value={offer.id}>
                  {offer.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="coupon" label="Coupon">
            <Select
              loading={couponLoading}
              style={{ width: "100%" }}
              placeholder="Please select"
              value={selectedCoupons.length ? selectedCoupons[0].id : undefined}
              onChange={(value) => handleCouponSelect(value)}
            >
              {filteredCoupons.map((coupon) => (
                <Option key={coupon.id} value={coupon.id}>
                  {coupon.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          {/* </Form> */}
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
