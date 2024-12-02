import { AutoComplete, Card, Col, Form, Select } from "antd";
import React, { useState } from "react";
import countryListData from "assets/data/country-list.json";
import venueListData from "assets/data/venue-list.json";

const LocationDetailsField = () => {
  const rules = {
    place: [{ required: true, message: "Please enter event place" }],
    venue: [{ required: true, message: "Please enter event venue" }],
  };

  const [value, setValue] = useState("");
  const [options, setOptions] = useState([]);
  const [countryList] = useState(countryListData);
  const [venueList] = useState(venueListData);

  const onSearch = (searchText) => {
    const filteredOptions = countryList
      .filter((item) =>
        `${item.place}, ${item.countryName}`
          .toLowerCase()
          .includes(searchText.toLowerCase())
      )
      .map((item) => ({
        value: `${item.place}, ${item.countryName}`, 
      }));

    setOptions(filteredOptions);
  };

  const onSelect = (data) => {
    console.log("Selected place:", data);
    setValue(data); 
  };

  const onChange = (data) => {
    setValue(data);
  };

  return (
    <Col>
      <Card title="Location Details">
        <Form.Item name="place" label="Place" rules={rules.place}>
          <AutoComplete
            options={options}
            value={value}
            onSelect={onSelect}
            onSearch={onSearch}
            onChange={onChange}
            placeholder="Search for a Place"
            style={{ width: "100%" }}
          />
        </Form.Item>
        <Form.Item name="venue" label="Venue" rules={rules.venue}>
          <Select className="w-100" placeholder="Select a Venue">
            {venueList.map((venue) => (
              <Select.Option
                key={`${venue.venue}, ${venue.countryName}`}
                value={`${venue.venue}, ${venue.countryName}`}
              >
                {`${venue.venue}, ${venue.countryName}`}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Card>
    </Col>
  );
};

export default LocationDetailsField;
