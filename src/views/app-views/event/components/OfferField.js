import { Card, Form, Select ,DatePicker} from "antd";
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
      <Form.Item name="offerstartDate" label="Offer Start Date" >
            <DatePicker className="w-100" placeholder="Select Offer Start date" />
          </Form.Item>

          <Form.Item name="offerEndDate" label="Offer End Date" >
            <DatePicker className="w-100" placeholder="Select Offer End date" />
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
      <Form.Item name="couponStartDate" label="Coupon Start Date" >
            <DatePicker className="w-100" placeholder="Select start date" />
          </Form.Item>

          <Form.Item name="couponEdDate" label="Coupon End Date" >
            <DatePicker className="w-100" placeholder="Select Coupon End Date" />
          </Form.Item>
      
    </Card>
  );
};

export default OfferField;
