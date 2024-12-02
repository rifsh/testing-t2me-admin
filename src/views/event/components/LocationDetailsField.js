import { AutoComplete, Card, Col, Form, Select } from "antd";
import React, { useState } from "react";
import countryListData from "assets/data/country-list.json";
import venueListData from "assets/data/venue-list.json";
import { fetchPlaceWithCountry } from "store/slices/locationSlice";
import { useDispatch, useSelector } from "react-redux";

const LocationDetailsField = () => {
  const dispatch = useDispatch();
  const rules = {
    place: [{ required: true, message: "Please enter event place" }],
    venue: [{ required: true, message: "Please enter event venue" }],
  };

  const [venueList] = useState(venueListData);
  const { placeWithCountryList, coordinates, loading, error } = useSelector(
    (state) => state.locations
  );

  const handleSearch = (value) => {
    dispatch(fetchPlaceWithCountry(value));
  };

  return (
    <Col>
      <Card title="Location Details">
        <Form.Item name="place" label="Place" rules={rules.place}>
          <AutoComplete
            onSearch={handleSearch}
            placeholder="Search for a Place"
            style={{ width: "100%" }}
            options={placeWithCountryList.map((place) => ({
              value: `${place.place_name}, ${place.country_name}`,
            }))}
            loading={loading}
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
