import { useSelector, useDispatch } from 'react-redux';
import React, { useEffect } from "react";
import { Input, Row, Col, Card, Form, AutoComplete } from "antd";
import { fetchAllCountires, allLocations, onSelect, onchange, onSearch } from 'store/slices/locationSlice';


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
  const { list: searchTerm, options } = useSelector(allLocations);

  useEffect(() => {
    dispatch(fetchAllCountires());
  }, [dispatch]);

  const handleSelect = (data) => {
    dispatch(onSelect(data));
  };

  const handleChange = (data) => {
    dispatch(onchange(data));
  };

  const handleSearch = (searchText) => {
    dispatch(onSearch(searchText));
  }


  return (
    <Row gutter={16}>
      <Col xs={24} sm={24} md={17}>
        <Card title="Basic Info">
          <Form.Item name="country" label="Country name" rules={rules.country}>
            <AutoComplete
              options={options}
              value={searchTerm}
              onSelect={handleSelect}
              onSearch={handleSearch}
              onChange={handleChange}
              placeholder="Search for a Place"
              style={{ width: "100%" }}
            />
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
