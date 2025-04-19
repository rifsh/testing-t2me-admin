import React, { useEffect, useState, useCallback } from "react";
import { Form, Select } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { fetchScreenData, setSelectedScreenData } from "store/slices/screenSlice";
import debounce from "lodash/debounce";

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
  const { selectedTheaterId } = useSelector((state) => state.theater);

  const fetchData = (search = null) => {
    if (selectedTheaterId) {
      dispatch(fetchScreenData({ theatre_id: selectedTheaterId, search }));
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedTheaterId]);

  useEffect(() => {
    if (response?.items?.length > 0) {
      const screens = response.items.flatMap((item) =>
        (item.movie_screen || []).map((screen) => ({
          value: screen.id,
          label: screen.screen_name,
        }))
      );
      setFilteredScreens(screens);
    } else {
      setFilteredScreens([]);
    }
  }, [response]);

  const handleScreenSelect = (value) => {
    const screen = filteredScreens.find((screen) => screen.value === value);
    dispatch(setSelectedScreenData(screen));
    if (onSelect) {
      onSelect(screen);
    }
  };

  const debouncedSearch = useCallback(
    debounce((input) => {
      fetchData(input || null);
    }, 300),
    [selectedTheaterId]
  );

  const handleSearch = (input) => {
    debouncedSearch(input);
  };

  return (
    <Form.Item name="screen_id" label={label} rules={rules}>
      <Select
        mode={mode}
        disabled={disabled || !selectedTheaterId}
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
        onSearch={handleSearch}
        options={filteredScreens}
        onSelect={handleScreenSelect}
        filterOption={false}
      />
    </Form.Item>
  );
};

export default ScreenListForm;
