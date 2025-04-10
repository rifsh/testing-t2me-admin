import React, { useEffect, useState } from "react";
import { Form, Select } from "antd";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchScreenData,
  setSelectedScreenData,
} from "store/slices/screenSlice";

const ScreenListForm = ({
  form,
  label = "Select Screen",
  rules,
  onSelect,
  mode,
  venueId,
  disabled,
}) => {
  const dispatch = useDispatch();
  const [filteredScreens, setFilteredScreens] = useState([]);

  const { response, loading } = useSelector((state) => state.screen);
  const { selectedVenue } = useSelector((state) => state.locations);

  useEffect(() => {
    if (selectedVenue?.id) {
      dispatch(fetchScreenData({ venue_id: selectedVenue.id }));
    }
  }, [dispatch, selectedVenue]);

  useEffect(() => {
    if (response?.items?.length > 0) {
      const newFormattedData = response.items.map((value) => ({
        venue_id: value.id,
        venue_name: value.name,
        movie_screens: value.movie_screen || [],
      }));

      if (newFormattedData.length > 0) {
        setFilteredScreens(newFormattedData[0].movie_screens);
      } else {
        setFilteredScreens([]);
      }
    } else {
      setFilteredScreens([]);
    }
  }, [response]);

  const handleScreenSelect = (value) => {
    const screen = filteredScreens.find((screen) => screen.id === value);
    dispatch(setSelectedScreenData(screen));
    if (onSelect) {
      onSelect(screen);
    }
  };

  const screenOptions = filteredScreens.map((screen) => ({
    value: screen.id,
    label: screen.screen_name,
  }));

  return (
    <Form.Item name="screen_id" label={label} rules={rules}>
      <Select
        mode={mode}
        disabled={disabled || !selectedVenue?.id}
        notFoundContent={
          loading ? (
            <span>Loading screens...</span>
          ) : (
            <span>
              {response?.items
                ? "No screens available for this venue"
                : "Please select a venue first"}
            </span>
          )
        }
        loading={loading}
        placeholder="Select a screen"
        showSearch
        filterOption={(input, option) =>
          option.label.toLowerCase().includes(input.toLowerCase())
        }
        options={screenOptions}
        onSelect={handleScreenSelect}
      />
    </Form.Item>
  );
};

export default ScreenListForm;
