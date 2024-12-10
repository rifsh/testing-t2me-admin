import { Card, Col, Form, Select } from "antd";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllOffers } from "store/slices/offerSlice";
import { fetchAllCoupons } from "store/slices/couponSlice";

const { Option } = Select;

const OfferField = () => {
  const dispatch = useDispatch();
  const { filteredOffers: filteredOffer, loading: offerLoading } = useSelector(
    (state) => state.offers
  );
  const { filteredCoupons, loading: couponLoading } = useSelector(
    (state) => state.coupons
  );

  useEffect(() => {
    dispatch(fetchAllOffers());
    dispatch(fetchAllCoupons());
  }, [dispatch]);

  return (
    <Col xs={24} sm={24} md={17}>
      <Card>
        <Form.Item name="offer" label="Offer">
          <Select
            loading={offerLoading}
            mode="multiple"
            style={{ width: "100%" }}
            placeholder="Please select"
            defaultValue={[]}
            // onChange={handleChange}
          >
            {filteredOffer.map((elm) => (
              <Option key={elm.id} value={elm.id}>
                {elm.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        {/* <Form.Item name="offerstartDate" label="Offer Start Date" >
            <DatePicker className="w-100" placeholder="Select Offer Start date" />
          </Form.Item>

          <Form.Item name="offerEndDate" label="Offer End Date" >
          <DatePicker className="w-100" placeholder="Select Offer End date" />
          </Form.Item> */}
        <Form.Item name="coupon" label="Coupon">
          <Select
            loading={couponLoading}
            mode="multiple"
            style={{ width: "100%" }}
            placeholder="Please select"
            defaultValue={[]}
            // onChange={handleChange}
          >
            {filteredCoupons.map((elm) => (
              <Option key={elm.id} value={elm.id}>
                {elm.name}
              </Option>
            ))}
          </Select>
          {/* <Select
          className="w-100"
          placeholder="Choose a Coupon"
          
          >
          {couponList.map((elm) => (
            <Option key={elm.couponName} value={elm.couponName}>
              {elm.couponName}
              </Option>
              ))}
              </Select> */}
        </Form.Item>
        {/* <Form.Item name="couponStartDate" label="Coupon Start Date">
        <DatePicker className="w-100" placeholder="Select start date" />
        </Form.Item>
        
        <Form.Item name="couponEdDate" label="Coupon End Date">
        <DatePicker className="w-100" placeholder="Select Coupon End Date" />
        </Form.Item> */}
      </Card>
    </Col>
  );
};

export default OfferField;
