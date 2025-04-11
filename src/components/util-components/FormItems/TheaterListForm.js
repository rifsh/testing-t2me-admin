import React, { useEffect } from "react";
import { Form, Select } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { fetchTheaters } from "store/slices/theaterSlice";

const TheaterListForm = ({ form, label = "Theater", rules, onSelect, mode, disabled }) => {
  const dispatch = useDispatch();
  const { response, selectedTheater, loading } = useSelector(
    (state) => state.theater
  );

  useEffect(() => {
    const venueId = form.getFieldValue("venue_id");
      dispatch(fetchTheaters({ venue_id: venueId }));
  }, [dispatch, form]);

  const handleSetSelectedTheater = (value) => {
    const theater = response?.items.find((theater) => theater.id === value);
    if (onSelect) onSelect(value);
    // dispatch(setSelectedTheater(theater));
  };

  return (
    <Form.Item name="theater_id" label={label} rules={rules}>
      <Select
        mode={mode}
        notFoundContent={
          loading ? (
            <span>Loading theaters...</span>
          ) : (
            <span>
              No theaters available. You can add a theater under the selected venue.
            </span>
          )
        }
        disabled={disabled}
        loading={loading}
        placeholder="Select a theater"
        showSearch
        filterOption={(input, option) =>
          option.label.toLowerCase().includes(input.toLowerCase())
        }
        options={response?.items.map((theater) => ({
          value: theater.id,
          label: theater.name,
        }))}
        onSelect={handleSetSelectedTheater}
      />
    </Form.Item>
  );
};

export default TheaterListForm;
