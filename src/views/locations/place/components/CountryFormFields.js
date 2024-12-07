import React, {  useEffect } from "react";
import { Input, Row, Col, Card, Form, Select } from "antd";
import { fetchAllCountires } from "store/slices/locationSlice";
import { useDispatch, useSelector } from "react-redux";
const { Option } = Select;

const rules = {
  country: [
    {
      required: true,
      message: "Please Choose a country",
    },
  ],
  name: [
    {
      required: true,
      message: "Please enter country name",
    },
  ],
  description: [
    {
      required: true,
      message: "Please enter country description",
    },
  ],
  price: [
    {
      required: true,
      message: "Please enter country price",
    },
  ],
  comparePrice: [],
  taxRate: [
    {
      required: true,
      message: "Please enter tax rate",
    },
  ],
  cost: [
    {
      required: true,
      message: "Please enter item cost",
    },
  ],
};

const CountryFormFields = (props) => {
  const dispatch = useDispatch();

  const { loading, countries } = useSelector((state) => state.locations);

  useEffect(() => {
    dispatch(fetchAllCountires());
  }, [dispatch]);

  console.log("Countries state:", countries);

  return (
    <Row gutter={16}>
      <Col xs={24} sm={24} md={17}>
        <Card title="Basic Info">
          <Form.Item name="id" label="Country name" rules={rules.country}>
            <Select
              className="w-100"
              placeholder="Choose a Country"
             
            >
             {countries.map((cntry) => (
                  <Option key={cntry.country} value={cntry.id}>
                    {cntry.country}
                  </Option>
                ))}
            </Select>
          </Form.Item>
          <Form.Item name="name" label="Place" rules={rules.name}>
            <Input placeholder="Place Name" />
          </Form.Item>
        </Card>
      </Col>
    </Row>
  );
};

export default CountryFormFields;
