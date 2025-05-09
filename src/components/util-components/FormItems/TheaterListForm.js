import React, { useEffect, useCallback, useState, useMemo } from "react";
import { Form, Select } from "antd";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDropdownTheaters,
  fetchTheaterByid,
  setScreenCapacity,
  setSeectedTheater,
} from "store/slices/theaterSlice";
import debounce from "lodash/debounce";

const TheaterListForm = ({
  form,
  label = "Theater",
  rules,
  onSelect,
  mode,
  name = "theater_id",
  disabled,
  apiParams,
}) => {
  const dispatch = useDispatch();
  const { response, loading } = useSelector((state) => state.theater);
  const { selectedVenue } = useSelector((state) => state.locations);
  const [searchTerm, setSearchTerm] = useState(null);

  // Memoize apiParams to prevent unnecessary re-renders
  const memoizedApiParams = useMemo(
    () => apiParams || {},
    [
      // Stringify the apiParams to properly detect changes
      apiParams ? JSON.stringify(apiParams) : null,
    ]
  );

  const fetchData = useCallback(() => {
    const venueId = form.getFieldValue("venue_id");
    dispatch(
      fetchDropdownTheaters({
        venue_id: venueId,
        search: searchTerm,
        ...memoizedApiParams,
      })
    );
  }, [dispatch, form, searchTerm, memoizedApiParams]);

  useEffect(() => {
    fetchData();
  }, [fetchData, selectedVenue]); // Only re-fetch when these dependencies change

  const handleSetSelectedTheater = (value) => {
    if (value) {
      dispatch(setSeectedTheater(value));
      const theater = response?.items?.find((theater) => theater.id === value);
      dispatch(setScreenCapacity(theater?.number_of_screens));
      if (onSelect) onSelect(theater);
    }
  };

  const debouncedSearch = useCallback(
    debounce((input) => {
      setSearchTerm(input || null);
    }, 300),
    []
  );

  const handleSearch = (input) => {
    debouncedSearch(input);
  };

  return (
    <Form.Item name={name} label={label} rules={rules}>
      <Select
        mode={mode}
        notFoundContent={
          loading ? (
            <span>Loading theaters...</span>
          ) : (
            <span>
              No theaters available. You can add a theater under the selected
              venue.
            </span>
          )
        }
        disabled={disabled}
        loading={loading}
        placeholder="Select a theater"
        showSearch
        onSearch={handleSearch}
        filterOption={false}
        options={
          response?.items?.map((theater) => ({
            value: theater?.id,
            label: `${theater.name} (${theater.movie_screen?.length || 0} ${theater.movie_screen?.length === 1 ? "Screen" : "Screens"
              })`,
            theaterName: theater.name,
          })) || []
        }
        onSelect={handleSetSelectedTheater}
      />
    </Form.Item>
  );
};

export default TheaterListForm;
