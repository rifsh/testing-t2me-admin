import React, { useEffect } from "react";
import { Form, Select } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { getVenues, setSelectedVenue } from "store/slices/locationSlice";

const VenueListForm = ({ form, label, rules, onSelect }) => {
  const dispatch = useDispatch();
  const { filteredVenues, selectedVenue } = useSelector(
    (state) => state.locations
  );

  useEffect(() => {
    if (form.getFieldValue("venue_id")) {
      dispatch(getVenues(form.getFieldValue("venue_id")));
    }
  }, [dispatch, form]);

  const handleSetSelectedVenue = (value) => {
    const venue = filteredVenues.find((venue) => venue.id === value);
    if (onSelect) onSelect(value);
    dispatch(setSelectedVenue(venue));
  };

  return (
    <Form.Item name="venue_id" label={label} rules={rules}>
      <Select
        placeholder="Select a venue"
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
