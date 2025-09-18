import React, { useEffect } from "react";
import * as antd from "antd";
import {
  CloseCircleOutlined,
  GiftOutlined,
  TagOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllOffers,
  setOfferCouponValidationDialogVisible,
} from "store/slices/offerSlice";
import { fetchAllCoupons } from "store/slices/couponSlice";
import ValidationModal from "components/util-components/ModalItems/ValidationModal";
import {
  toggleSelectedCoupon,
  toggleSelectedOffer,
} from "store/slices/eventSlice";

const { Row, Col, Card, Form, Select, Typography, Button, Alert, List, Space } =
  antd;
const { Option } = Select;
const { Text } = Typography;

const OfferField = ({ mode, form }) => {
  const dispatch = useDispatch();

  // State from Redux
  const {
    filteredOffers: filteredOffer,
    loading: offerLoading,
    ValidateData,
    offerCouponValidationDialogVisible,
    message,
  } = useSelector((state) => state.offers);
  const { selectedOffers, selectedCoupons } = useSelector(
    (state) => state.event
  );
  const { filteredCoupons, loading: couponLoading } = useSelector(
    (state) => state.coupons
  );

  useEffect(() => {
    dispatch(fetchAllOffers({ active: true }));
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

  const handleValidationModalCancel = () => {
    dispatch(setOfferCouponValidationDialogVisible(false));
  };

  return (
    <>
      <Row gutter={24}>
        {/* Left Column with Forms */}
        <Col xs={24} lg={14}>
          <Card title="Offers & Coupons" bordered>
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item name="offer" label="Offer (Optional)">
                  <Select
                    loading={offerLoading}
                    placeholder="Select an offer"
                    value={
                      selectedOffers.length ? selectedOffers[0].id : undefined
                    }
                    onChange={handleOfferSelect}
                    allowClear
                  >
                    {filteredOffer.map((offer) => (
                      <Option key={offer.id} value={offer.id}>
                        {offer.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="coupon" label="Coupon (Optional)">
                  <Select
                    loading={couponLoading}
                    placeholder="Select a coupon"
                    value={
                      selectedCoupons.length ? selectedCoupons[0].id : undefined
                    }
                    onChange={handleCouponSelect}
                    allowClear
                  >
                    {filteredCoupons.map((coupon) => (
                      <Option key={coupon.id} value={coupon.id}>
                        {coupon.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Alert
              message="Warning"
              description="Expired offers can be updated while scheduling events and should match the scheduled time."
              type="warning"
              showIcon
            />
          </Card>
        </Col>

        {/* Right Column displaying selections */}
        <Col xs={24} lg={10}>
          <Card title="Selection Summary" bordered style={{ marginBottom: 16 }}>
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <div>
                <Text strong>
                  <GiftOutlined style={{ marginRight: 8 }} />
                  Selected Offers:
                </Text>
                {selectedOffers.length > 0 ? (
                  <List
                    size="small"
                    dataSource={selectedOffers}
                    renderItem={(offer) => (
                      <List.Item
                        actions={
                          mode !== "EDIT"
                            ? [
                                <Button
                                  type="text"
                                  danger
                                  size="small"
                                  icon={<CloseCircleOutlined />}
                                  onClick={() => handleDeleteOffer(offer)}
                                />,
                              ]
                            : []
                        }
                      >
                        <List.Item.Meta
                          title={offer.name}
                          description={
                            <Space direction="vertical" size={2}>
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                Max Uses: {offer.max_uses}
                              </Text>
                              {offer.date_required ? (
                                <Text type="secondary" style={{ fontSize: 11 }}>
                                  {offer.start_date} - {offer.end_date}
                                </Text>
                              ) : (
                                <Text type="warning" style={{ fontSize: 11 }}>
                                  Date can be specified during scheduling
                                </Text>
                              )}
                            </Space>
                          }
                        />
                      </List.Item>
                    )}
                  />
                ) : (
                  <Text type="secondary">No offers selected</Text>
                )}
              </div>

              <div>
                <Text strong>
                  <TagOutlined style={{ marginRight: 8 }} />
                  Selected Coupons:
                </Text>
                {selectedCoupons.length > 0 ? (
                  <List
                    size="small"
                    dataSource={selectedCoupons}
                    renderItem={(coupon) => (
                      <List.Item
                        actions={[
                          <Button
                            type="text"
                            danger
                            size="small"
                            icon={<CloseCircleOutlined />}
                            onClick={() => handleDeleteCoupon(coupon)}
                          />,
                        ]}
                      >
                        <List.Item.Meta
                          title={coupon.name}
                          description={
                            <Space direction="vertical" size={2}>
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                Max Uses: {coupon.max_uses}
                              </Text>
                              <Text type="secondary" style={{ fontSize: 11 }}>
                                {coupon.start_date} - {coupon.end_date}
                              </Text>
                            </Space>
                          }
                        />
                      </List.Item>
                    )}
                  />
                ) : (
                  <Text type="secondary">No coupons selected</Text>
                )}
              </div>
            </Space>
          </Card>

          {mode === "EDIT" && selectedOffers.length > 0 && (
            <Alert
              message="Edit Mode Notice"
              description="You cannot delete an offer for auditing purposes. You are only allowed to add offers."
              type="info"
              style={{ fontSize: 12 }}
            />
          )}
        </Col>
      </Row>

      <ValidationModal
        visible={offerCouponValidationDialogVisible}
        data={ValidateData?.errors}
        statusMessage={message}
        onClose={handleValidationModalCancel}
      />
    </>
  );
};

export default OfferField;
