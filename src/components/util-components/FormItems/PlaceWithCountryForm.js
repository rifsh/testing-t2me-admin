import React, { useEffect, useCallback } from "react";
import { message, AutoComplete, Form } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { fetchPlaceWithCountry } from "store/slices/locationSlice";
import debounce from "lodash/debounce";

const PlaceWithCountryForm = ({
  form,
  onSelect,
  style,
  rules,
  label,
  allPlaceVisible,
  isActivePlaces,
  disabled,
}) => {
  const dispatch = useDispatch();

  const { placeWithCountryList, loading, error } = useSelector(
    (state) => state.locations
  );

  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  useEffect(() => {
    dispatch(fetchPlaceWithCountry({ place: '', active: true }));
  }, [dispatch]);

  // Debounced handler
  const debouncedSearch = useCallback(
    debounce((value) => {
      dispatch(fetchPlaceWithCountry({ place: value, active: true }));
    }, 300),
    [dispatch]
  );

  const handleSearch = (value) => {
    const trimmedValue = value.trim();
    if (trimmedValue) {
      debouncedSearch(trimmedValue);
    } else {
      dispatch(fetchPlaceWithCountry({ place: '', active: true }));
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
          disabled={disabled}
          allowClear
        />
      </Form.Item>
    </Form>
  );
};

export default PlaceWithCountryForm;
