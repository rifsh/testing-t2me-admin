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
      dispatch(fetchPlaceWithCountry(value));
    }
  };

  return (
    <Form.Item
      name="place_id"
      label="Place"
      rules={[{ required: true, message: "Please select a place" }]}
    >
      <AutoComplete
        onSearch={handleSearch}
        placeholder="Search for a Place"
        style={{ width: "100%" }}
        options={placeWithCountryList.map((place) => ({
          label: `${place.name}, ${place.country.name}`,
          value: place.id,
        }))}
        loading={loading}
      />
    </Form.Item>
  );
};

export default PlaceWithCountryForm;
