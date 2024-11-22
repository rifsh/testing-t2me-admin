import { Card, Form, Select } from "antd";
import React, { useState } from "react";

import offerListData from "assets/data/offer-list.json";
import couponListData from "assets/data/coupon-list.json";

const { Option } = Select;

const OfferField = () => {
  const [offerList] = useState(offerListData);
  const [couponList] = useState(couponListData);



  return (
    <Card>
      <Form.Item name="offer" label="Offer">
        <Select
          className="w-100"
          placeholder="Choose a Offer"
          
        >
          {offerList.map((elm) => (
            <Option key={elm.offerName} value={elm.offerName}>
              {elm.offerName}
            </Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item name="coupon" label="Coupon">
        <Select
          className="w-100"
          placeholder="Choose a Coupon"
          
        >
          {couponList.map((elm) => (
            <Option key={elm.couponName} value={elm.couponName}>
              {elm.couponName}
            </Option>
          ))}
        </Select>
      </Form.Item>

      
    </Card>
  );
};

export default OfferField;
