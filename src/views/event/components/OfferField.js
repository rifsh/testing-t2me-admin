import React, { useEffect, useState } from "react";
import { Row, Col, Card, Form, Select, Typography, Button, Alert } from "antd";
import {  CloseCircleOutlined, } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllOffers } from "store/slices/offerSlice";
import { fetchAllCoupons } from "store/slices/couponSlice";
import {
  toggleSelectedCoupon,
  toggleSelectedOffer,
} from "store/slices/eventSlice";

const { Option } = Select;
const { Text } = Typography;

const OfferField = () => {
  const dispatch = useDispatch();

  // State from Redux
  const { filteredOffers: filteredOffer, loading: offerLoading } = useSelector(
    (state) => state.offers
  );
  const { selectedOffers, selectedCoupons } = useSelector(
    (state) => state.event
  );
  const { filteredCoupons, loading: couponLoading } = useSelector(
    (state) => state.coupons
  );

  useEffect(() => {
    dispatch(fetchAllOffers({active: true}));
    dispatch(fetchAllCoupons({}));
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

  const handleDeleteOffer = (offer) => {
    dispatch(toggleSelectedOffer(offer));
  };

  const handleDeleteCoupon = (coupon) => {
    dispatch(toggleSelectedCoupon(coupon));
  };

  return (
    <Row gutter={16}>
      <Col xs={24} sm={24} md={17}>
        <Card title={"Offer & Coupon (Optional)"}>
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
        </Card>
      </Col>
      <Col xs={24} sm={24} md={17}>
        <Alert
          message="Warning"
          description="The Expired offers can be updated while scheduling events, should match the scheduled time."
          type="warning"
          showIcon
        />
      </Col>
      <Col xs={24} sm={24} md={7}>
        <div style={{ marginBottom: 16, marginTop: 0 }}>
          {selectedOffers.length > 0 ? <Text>Selected Offers</Text> : null}
          {selectedOffers.map((offer) => (
            <Card
              key={offer.id}
              size="small"
              style={{
                cursor: "pointer",
                marginBottom: "8px",
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
                  zIndex: 10,
                }}
              />
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
                {offer.date_required ? (
                  <Row justify="space-between">
                    <Text style={{ fontSize: "10px", color: "#595959" }}>
                      Start: {offer.start_date}
                    </Text>
                    <Text style={{ fontSize: "10px", color: "#595959" }}>
                      End: {offer.end_date}
                    </Text>
                  </Row>
                ) : (
                  <Text
                    style={{
                      fontSize: "10px",
                      lineHeight: "10px", 
                      margin: 0,
                      padding: 0, 
                      color: "orange",
                    }}
                  >
                    You can specify a date for this offer during scheduling, if needed.
                  </Text>
                )}
              </Col>
            </Card>
          ))}
        </div>
        <div style={{ marginBottom: 16, marginTop: 0 }}>
          {selectedCoupons.length > 0 ? <Text>Selected Coupons</Text> : null}
          {selectedCoupons.map((coupon) => (
            <Card
              key={coupon.id}
              size="small"
              style={{
                cursor: "pointer",
                marginBottom: "8px",
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
                  zIndex: 10,
                }}
              />
              <Col style={{ padding: "0px" }}>
                <Row
                  justify="space-between"
                  align="middle"
                  style={{ marginBottom: "8px" }}
                >
                  <Text strong style={{ fontSize: "14px", color: "#333" }}>
                    {coupon.name}
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
                    Max Uses: {coupon.max_uses}
                  </Text>
                </Row>
                <Row justify="space-between">
                  <Text style={{ fontSize: "10px ", color: "#595959" }}>
                    Start: {coupon.start_date}
                  </Text>
                  <Text style={{ fontSize: "10px ", color: "#595959" }}>
                    End: {coupon.end_date}
                  </Text>
                </Row>
              </Col>
            </Card>
          ))}
        </div>
      </Col>
    </Row>
  );
};

export default OfferField;