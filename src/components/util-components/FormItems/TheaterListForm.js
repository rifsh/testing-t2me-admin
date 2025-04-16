import React, { useEffect, useCallback, useState } from "react";
import { Form, Select } from "antd";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchTheaterByid,
  fetchTheaters,
  setSeectedTheater
} from "store/slices/theaterSlice";
import debounce from "lodash/debounce";

const TheaterListForm = ({
  form,
  label = "Theater",
  rules,
  onSelect,
  mode,
  disabled
}) => {
  const dispatch = useDispatch();
  const [searchInput, setSearchInput] = useState("");
  const { response, selectedTheater, loading } = useSelector(
    (state) => state.theater
  );
  const { selectedVenue } = useSelector((state) => state.locations);

  const fetchData = (search = null) => {
    const venueId = form.getFieldValue("venue_id");
    if (venueId) {
      dispatch(fetchTheaters({ venue_id: venueId, search }));
    }
  };

  useEffect(() => {
    fetchData();
  }, [dispatch, selectedVenue]);

  const handleSetSelectedTheater = (value) => {
    dispatch(setSeectedTheater(value));
    dispatch(fetchTheaterByid({ theatre_id: value }));
    const theater = response?.items
      ?.flatMap((item) => item.theatre)
      .find((theater) => theater.id === value);
    if (onSelect) onSelect(theater);
  };

  const debouncedSearch = useCallback(
    debounce((input) => {
      setSearchInput(input);
      fetchData(input || null);
    }, 300),
    []
  );

  const handleSearch = (input) => {
    debouncedSearch(input);
  };

  return (
    <Form.Item name="theatre_id" label={label} rules={rules}>
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
        filterOption={false} // Use server-side search
        options={
          response?.items?.flatMap((item) =>
            item.theatre.map((theater) => ({
              value: theater.id,
              label: `${theater.name} (${theater.movie_screen?.length || 0} ${theater.movie_screen?.length === 1 ? "Screen" : "Screens"
                })`
            }))
          ) || []
        }
        onSelect={handleSetSelectedTheater}
      />
    </Form.Item>
  );
};

export default TheaterListForm;
