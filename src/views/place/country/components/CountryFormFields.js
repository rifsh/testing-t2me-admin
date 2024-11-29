import React, { useState, useEffect } from "react";
import { Input, Row, Col, Card, Form, Select } from "antd";
import { fetchCountry } from "../api/countryService"; // Assuming this fetches data from an API
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
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    const getCountries = async () => {
      try {
        const countryData = await fetchCountry(); 
        console.log("Fetched country data:", countryData); 
        setCountries(countryData); 
      } catch (error) {
        console.error("Error fetching countries:", error);
      }
    };

    getCountries();
  }, []);

  console.log("Countries state:", countries); 

  return (
    <Row gutter={16}>
      <Col xs={24} sm={24} md={17}>
        <Card title="Basic Info">
          <Form.Item name="country" label="Country name" rules={rules.country}>
            <Select className="w-100" placeholder="Choose a Country">
              {countries && Object.entries(countries).length > 0 ? (
                Object.entries(countries).map(([country, code]) => (
                  <Option key={code} value={code}>
                    {country}
                  </Option>
                ))
              ) : (
                <Option disabled>No countries available</Option>
              )}
            </Select>
          </Form.Item>
          <Form.Item name="Place" label="Place" rules={rules.name}>
            <Input placeholder="Place Name" />
          </Form.Item>
        </Card>
      </Col>
    </Row>
  );
};

export default CountryFormFields;
