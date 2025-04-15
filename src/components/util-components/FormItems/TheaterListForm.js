import React, { useEffect } from "react";
import { Form, Select } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { fetchTheaterByid, fetchTheaters, setSeectedTheater } from "store/slices/theaterSlice";

const TheaterListForm = ({ form, label = "Theater", rules, onSelect, mode, disabled }) => {
  const dispatch = useDispatch();
  const { response, selectedTheater, loading } = useSelector(
    (state) => state.theater
  );
  const { selectedVenue } = useSelector((state) => state.locations);

  useEffect(() => {
    const venueId = form.getFieldValue("venue_id");
    if (venueId) {
      dispatch(fetchTheaters({ venue_id: venueId }));
      console.log("venue_id", venueId);
    }

  }, [dispatch, form, selectedVenue]);

  useEffect(() => {
    if (response) {
      console.log("venue_id", response?.items?.map((keys) => keys.theatre));
    }

  }, [response]);

  const handleSetSelectedTheater = (value) => {
    dispatch(setSeectedTheater(value))
    dispatch(fetchTheaterByid({ theatre_id: value }))
    const theater = response?.items.find((theater) => theater.id === value);
    if (onSelect) onSelect(value);
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
        options={
          response?.items?.flatMap((item) =>
            item.theatre.map((theater) => ({
              value: theater.id,
              label: theater.name,
            }))
          ) || []
        }
        onSelect={handleSetSelectedTheater}
      />
    </Form.Item>

  );
};

export default TheaterListForm;
