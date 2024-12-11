import React, { useEffect } from "react";
import { message, AutoComplete, Form,} from "antd";
import { useDispatch, useSelector } from "react-redux";
import { fetchPlaceWithCountry } from "store/slices/locationSlice";

const PlaceWithCountryForm = ({ form, onSelect,style, rules,label }) => {
  const dispatch = useDispatch();

  const { placeWithCountryList, loading, error } = useSelector(
    (state) => state.locations
  );
  console.warn(placeWithCountryList, loading, error,'...')
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
    console.log(value, option)
    try {
      await form.setFieldsValue({
        place_id: option.label, 
      });
      if (onSelect) {
        onSelect(option.id); 
      }
    } catch (error) {
      console.error("Error setting place_id or calling onSelect:", error);
    }
  };

  const autoCompleteOptions = placeWithCountryList.length
    ? placeWithCountryList.map((place) => ({
        label: `${place.name}, ${place.country.name}`,
        id: place.id, 
        value: place.id,
      }))
    : [{ label: "No places found", value: "" }];

  return (
    <Form form={form} layout="vertical">
      <Form.Item
        name="place_id"
        label={label}
        rules={rules}
        style={style}
      >
        <AutoComplete
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