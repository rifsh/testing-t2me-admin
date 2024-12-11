import React, { useEffect } from "react";
import { Input, Row, Col, Card, Form, Select, Spin } from "antd";
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
  const { loading, countries, error } = useSelector((state) => state.locations);

  useEffect(() => {
    if (countries.length === 0) {
      dispatch(fetchAllCountires());
    }
  }, [dispatch, countries]);

 
  useEffect(() => {
  }, [countries, loading, error]);

  // Show loading state
  if (loading) {
    return (
      <Row justify="center" align="middle" style={{ minHeight: '200px' }}>
        <Spin size="large" />
      </Row>
    );
  }

  // Show error state if exists
  if (error) {
    return (
      <Row>
        <Col span={24}>
          <div style={{ color: 'red', textAlign: 'center' }}>
            {error || 'Failed to load countries'}
          </div>
        </Col>
      </Row>
    );
  }

  return (
    <Row gutter={16}>
      <Col xs={24} sm={24} md={17}>
        <Card title="Basic Info">
          <Form.Item
            name="id"  
            label="Country name"
            rules={rules.country}
          >
            <Select
              className="w-100"
              placeholder="Choose a Country"
              loading={loading}
            >
              {countries && countries.length > 0 ? (
                countries.map((country) => (
                  <Option key={country.id} value={country.id}>
                    {country.country}
                  </Option>
                ))
              ) : (
                <Option disabled>No countries available</Option>
              )}
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