import React, { useEffect, useCallback } from "react";
import { Form, Select } from "antd";
import { useDispatch, useSelector } from "react-redux";
import debounce from "lodash/debounce";
import { getVenues, setSelectedVenue } from "store/slices/locationSlice";

const VenueListForm = ({ form, label, rules, onSelect, mode, disabled }) => {
  const dispatch = useDispatch();
  const { filteredVenues, selectedVenue, loading } = useSelector(
    (state) => state.locations
  );

  const placeId = form.getFieldValue("place_id");

  useEffect(() => {
    if (placeId) {
      dispatch(getVenues({ place_id: placeId, search: "" }));
    }
  }, [dispatch, placeId]);

  const debouncedSearch = useCallback(
    debounce((value) => {
      if (placeId) {
        dispatch(getVenues({ place_id: placeId, search: value }));
      }
    }, 300),
    [dispatch, placeId]
  );

  const handleSetSelectedVenue = (value) => {
    const venue = filteredVenues.find((venue) => venue.id === value);
    if (onSelect) onSelect(value);
    dispatch(setSelectedVenue(venue));
  };

  return (
    <Form.Item name="venue_id" label={label} rules={rules}>
      <Select
        mode={mode}
        disabled={disabled}
        loading={loading}
        placeholder="Search and select a venue"
        showSearch
        filterOption={false} // This disables local filtering so onSearch is used
        onSearch={debouncedSearch}
        notFoundContent={
          loading ? (
            <span>Loading venues...</span>
          ) : (
            <span>
              No venues available. You can add a venue under the selected place.
            </span>
          )
        }
        options={filteredVenues.map((venue) => ({
          value: venue.id,
          label: venue.name,
        }))}
        onSelect={handleSetSelectedVenue}
      />
    </Form.Item>
  );
};

export default VenueListForm;
