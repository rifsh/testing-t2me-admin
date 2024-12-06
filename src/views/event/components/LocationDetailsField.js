import { AutoComplete, Card, Col, Form, Select } from "antd";
import React, { useState } from "react";
import countryListData from "assets/data/country-list.json";
import venueListData from "assets/data/venue-list.json";
import { fetchPlaceWithCountry } from "store/slices/locationSlice";
import { useDispatch, useSelector } from "react-redux";
import PlaceWithCountryForm from "components/util-components/FormItems/PlaceWithCountryForm";

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

  

  return (
    <Col>
      <Card title="Location Details">
      <PlaceWithCountryForm />
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
