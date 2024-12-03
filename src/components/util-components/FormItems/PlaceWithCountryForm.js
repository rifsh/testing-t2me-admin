import React, { useEffect } from "react";
import { message, AutoComplete, Form } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { fetchPlaceWithCountry } from "store/slices/locationSlice";

const PlaceWithCountryForm = ({ form }) => {
  const dispatch = useDispatch();

  const { placeWithCountryList, loading, error } = useSelector(
    (state) => state.locations
  );

  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  const handleSearch = (value) => {
    if (value) {
      dispatch(fetchPlaceWithCountry(value ?? ""));
    }
  };

  const autoCompleteOptions = placeWithCountryList.length
    ? placeWithCountryList.map((place) => ({
        label: `${place.name}, ${place.country.name}`,
        value: place.id,
      }))
    : [{ label: "No places found", value: "" }];

  return (
    <Form form={form} style={{ marginBottom: 50 }}>
      <Form.Item
        name="place_id"
        label="Place"
        rules={[{ required: true, message: "Please select a place" }]}
      >
        <AutoComplete
          onSearch={handleSearch}
          placeholder="Search for a Place"
          style={{ width: "100%" }}
          options={autoCompleteOptions}
          loading={loading}
        />
      </Form.Item>
    </Form>
  );
};

export default PlaceWithCountryForm;
