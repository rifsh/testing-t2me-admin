import React, { useCallback, useEffect } from "react";
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
import { debounce } from "lodash";

const {
  Row,
  Col,
  Card,
  Form,
  Select,
  Typography,
  Button,
  Alert,
  List,
  Space,
  message,
} = antd;
const { Option } = Select;
const { Text } = Typography;

const OfferField = ({ mode, form, eventDetails }) => {
  const dispatch = useDispatch();

  // State from Redux
  const {
    filteredOffers: filteredOffer,
    loading: offerLoading,
    ValidateData,
    offerCouponValidationDialogVisible,
    message: validationMessage,
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

  // Helper function to check if offer was already submitted
  const isSubmittedOffer = (offerId) => {
    if (mode === "EDIT" && eventDetails?.event_offers) {
      return eventDetails.event_offers.some((eo) => eo.offer?.id === offerId);
    }
    return false;
  };

  // Helper function to check if coupon was already submitted
  const isSubmittedCoupon = (couponId) => {
    if (mode === "EDIT" && eventDetails?.event_coupons) {
      return eventDetails.event_coupons.some(
        (ec) => ec.coupon?.id === couponId
      );
    }
    return false;
  };

  const handleOfferSelect = (offerId) => {
    const selectedOffer = filteredOffer.find((offer) => offer.id === offerId);
    if (selectedOffer) {
      dispatch(toggleSelectedOffer(selectedOffer));
    }
  };

  const handleOfferSearch = useCallback(
    debounce((value) => {
      dispatch(fetchAllOffers({ active: true, search: value }));
    }, 500),
    []
  );

  const handleCouponSearch = useCallback(
    debounce((value) => {
      dispatch(fetchAllCoupons({ search: value }));
    }, 500),
    []
  );

  const handleCouponSelect = (couponId) => {
    const selectedCoupon = filteredCoupons.find(
      (coupon) => coupon.id === couponId
    );
    if (selectedCoupon) {
      dispatch(toggleSelectedCoupon(selectedCoupon));
    }
  };

  const handleOfferDeselect = (offerId) => {
    if (isSubmittedOffer(offerId)) {
      message.error(
        "This offer is already submitted and cannot be removed. You are only allowed to add offers."
      );
      return false;
    }
    return true;
  };

  const handleCouponDeselect = (couponId) => {
    if (isSubmittedCoupon(couponId)) {
      message.error("This coupon is already submitted and cannot be removed");
      return false;
    }
    return true;
  };

  const handleDeleteOffer = (offer) => {
    if (!handleOfferDeselect(offer.id)) {
      return;
    }
    dispatch(toggleSelectedOffer(offer));
  };

  const handleDeleteCoupon = (coupon) => {
    if (!handleCouponDeselect(coupon.id)) {
      return;
    }
    dispatch(toggleSelectedCoupon(coupon));
  };

  const handleOfferClear = () => {
    if (selectedOffers.length > 0) {
      const offer = selectedOffers[0];
      if (!handleOfferDeselect(offer.id)) {
        return;
      }
      dispatch(toggleSelectedOffer(offer));
    }
  };

  const handleCouponClear = () => {
    if (selectedCoupons.length > 0) {
      const coupon = selectedCoupons[0];
      if (!handleCouponDeselect(coupon.id)) {
        return;
      }
      dispatch(toggleSelectedCoupon(coupon));
    }
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
                    showSearch
                    loading={offerLoading}
                    placeholder="Select an offer"
                    value={selectedOffers.length ? selectedOffers[0].id : undefined}
                    onChange={handleOfferSelect}
                    onClear={handleOfferClear}
                    onSearch={handleOfferSearch}
                    onDeselect={handleOfferClear}
                    allowClear
                    filterOption={false}
                  >
                    {filteredOffer.map((offer) => {
                      const isSubmitted = isSubmittedOffer(offer.id);
                      const isSelected = selectedOffers.some((o) => o.id === offer.id);

                      return (
                        <Option
                          key={offer.id}
                          value={offer.id}
                          disabled={isSubmitted && isSelected}
                        >
                          {offer.name}
                        </Option>
                      );
                    })}
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
                    onClear={handleCouponClear}
                    onDeselect={handleCouponClear}
                    allowClear
                  >
                    {filteredCoupons.map((coupon) => {
                      const isSubmitted = isSubmittedCoupon(coupon.id);
                      const isSelected = selectedCoupons.some(
                        (c) => c.id === coupon.id
                      );

                      return (
                        <Option
                          key={coupon.id}
                          value={coupon.id}
                          disabled={isSubmitted && isSelected}
                        >
                          <Space>
                            <Text>{coupon.name}</Text>
                            {isSubmitted && isSelected && (
                              <Text type="warning">(Submitted)</Text>
                            )}
                          </Space>
                        </Option>
                      );
                    })}
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
                    renderItem={(offer) => {
                      const isSubmitted = isSubmittedOffer(offer.id);

                      return (
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
                              : isSubmitted
                                ? [
                                  <Button
                                    type="text"
                                    disabled
                                    size="small"
                                    icon={<CloseCircleOutlined />}
                                    title="Cannot delete submitted offer"
                                  />,
                                ]
                                : []
                          }
                        >
                          <List.Item.Meta
                            title={
                              <Space>
                                <Text>{offer.name}</Text>
                                {isSubmitted && (
                                  <Text type="warning">(Submitted)</Text>
                                )}
                              </Space>
                            }
                            description={
                              <Space direction="vertical" size={2}>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                  Max Uses: {offer.max_uses}
                                </Text>
                                {offer.date_required ? (
                                  <Text
                                    type="secondary"
                                    style={{ fontSize: 11 }}
                                  >
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
                      );
                    }}
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
                    renderItem={(coupon) => {
                      const isSubmitted = isSubmittedCoupon(coupon.id);

                      return (
                        <List.Item
                          actions={[
                            <Button
                              type="text"
                              danger={!isSubmitted}
                              disabled={isSubmitted}
                              size="small"
                              icon={<CloseCircleOutlined />}
                              onClick={() => handleDeleteCoupon(coupon)}
                              title={
                                isSubmitted
                                  ? "Cannot delete submitted coupon"
                                  : ""
                              }
                            />,
                          ]}
                        >
                          <List.Item.Meta
                            title={
                              <Space>
                                <Text>{coupon.name}</Text>
                                {isSubmitted && (
                                  <Text type="warning">(Submitted)</Text>
                                )}
                              </Space>
                            }
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
                      );
                    }}
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
        statusMessage={validationMessage}
        onClose={handleValidationModalCancel}
      />
    </>
  );
};

export default OfferField;
