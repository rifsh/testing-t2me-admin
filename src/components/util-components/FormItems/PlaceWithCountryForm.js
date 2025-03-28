import React, { useEffect } from "react";
import { message, AutoComplete, Form } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { fetchPlaceWithCountry } from "store/slices/locationSlice";

const PlaceWithCountryForm = ({ form, onSelect, style, rules, label, allPlaceVisible }) => {
  const dispatch = useDispatch();

  const { placeWithCountryList, loading, error } = useSelector(
    (state) => state.locations
  );
  console.warn(placeWithCountryList, loading, error, "...");

  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  useEffect(() => {
    dispatch(fetchPlaceWithCountry(""));
  }, [dispatch]);

  const handleSearch = (value) => {
    if (value) {
      dispatch(fetchPlaceWithCountry(value));
    }
  };

  const handleSelect = async (value, option) => {
    try {
      await form.setFieldsValue({
        place_id: option.id,
        place: option.label,
      });

      if (onSelect) {
        onSelect(option.id);
      }
    } catch (error) {
      console.error("Error setting place_id or calling onSelect:", error);
    }
  };

  const autoCompleteOptions = [
    ...(allPlaceVisible ? [{ label: "All Places", value: 0, id: 0 }] : []),
    ...placeWithCountryList.map((place) => ({
      label: `${place.name}, ${place.country.name}`,
      id: place.id,
      value: place.id,
    })),
  ];

  return (
    <Form form={form} layout="vertical">
      <Form.Item name="place" label={label} rules={rules} style={style}>
        <AutoComplete
          notFoundContent={loading ? "Loading Places..." : "No Place Available"}
          onSearch={handleSearch}
          onSelect={handleSelect}
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
