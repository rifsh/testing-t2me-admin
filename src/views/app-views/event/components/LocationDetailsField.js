import { Card, Col, Form, Input, message, Radio, Select } from "antd";
import React, { useState } from "react";
import countryListData from "assets/data/country-list.json";
import venueListData from "assets/data/venue-list.json";
const LocationDetailsField = () => {
  const rules = {
    name: [{ required: true, message: "Please enter event name" }],
    description: [
      {
        required: true,
        message: "Please enter event description",
      },
    ],
    country: [
      {
        required: true,
        message: "Please enter event country",
      },
    ],
    place: [
      {
        required: true,
        message: "Please enter event place",
      },
    ],
    venue: [
      {
        required: true,
        message: "Please enter event venue",
      },
    ],
    isAvailable: [
      {
        required: true,
        message: "Please enter event isAvailable",
      },
    ],
  };

  const [countryList, setCountryList] = useState(countryListData);
  const [venueList, setVenueList] = useState(venueListData);
  return (
    <Col>
      <Card title="Location Details">
        <Form.Item name="country" label="Country" labelAlign="right" rules={rules.country}>
          <Select className="w-100" placeholder="Select a Country">
            {countryList.map((country) => (
              <Select.Option
                key={country.countryName}
                value={country.countryName}
              >
                {country.countryName}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="place" label="Place" rules={rules.place}>
          <Select className="w-100" placeholder="Select a Place">
            {countryList.map((country) => (
              <Select.Option key={country.place} value={country.place}>
                {country.place}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="venue" label="Venue" rules={rules.venue}>
          <Select className="w-100" placeholder="Select a Venue">
            {venueList.map((country) => (
              <Select.Option key={country.venue} value={country.venue}>
                {country.venue}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="max-ticket" label="Maximum Ticket" rules={rules.name}>
          <Input placeholder="Maximum Ticket" />
        </Form.Item>
        <Form.Item
          name="is-available"
          label="Is Available"
          rules={rules.isAvailable}
        >
          <Radio.Group>
              <Radio value="yes">Yes</Radio>
              <Radio value="no">No</Radio>
            </Radio.Group>
        </Form.Item>
      </Card>
    </Col>
  );
};

export default LocationDetailsField;
