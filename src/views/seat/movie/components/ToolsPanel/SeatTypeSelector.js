import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedSeatType } from "store/slices/movieSeatSlice";
import { SEAT_TYPES } from "constants/SeatTypes";
import { Typography, Select } from "antd";

const { Text } = Typography;
const { Option } = Select;

const SeatTypeSelector = () => {
  const dispatch = useDispatch();
  const { selectedSeatType } = useSelector((state) => state.movieSeatSlice);

  const handleChange = (value) => {
    dispatch(setSelectedSeatType(value));
  };

  return (
    <div>
      <Text strong style={{ display: "block", marginBottom: "8px" }}>
        Seat Type
      </Text>
      <Select
        value={selectedSeatType}
        onChange={handleChange}
        style={{ width: "100%" }}
      >
        {SEAT_TYPES.map((type) => (
          <Option key={type.id} value={type.id}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <span
                style={{
                  display: "inline-block",
                  width: "12px",
                  height: "12px",
                  marginRight: "8px",
                  backgroundColor: type.color
                    .replace("bg-", "")
                    .replace("-500", ""),
                  borderRadius: "2px",
                }}
              />
              {type.label}
            </div>
          </Option>
        ))}
      </Select>
    </div>
  );
};

export default SeatTypeSelector;
