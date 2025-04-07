import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setRows,
  setColumns,
  initializeSeats,
} from "store/slices/movieSeatSlice";
import { InputNumber, Button, Form, Space } from "antd";

const ConfigPanel = () => {
  const dispatch = useDispatch();
  const { rows, columns } = useSelector((state) => state.movieSeatSlice);

  const handleRowsChange = (value) => {
    dispatch(setRows(value));
  };

  const handleColumnsChange = (value) => {
    dispatch(setColumns(value));
  };

  const handleGenerateLayout = () => {
    dispatch(initializeSeats({ rows, columns }));
  };

  return (
    <Form layout="vertical">
      <Form.Item label="Number of Rows">
        <InputNumber
          value={rows}
          onChange={handleRowsChange}
          min={1}
          max={30}
          style={{ width: "100%" }}
        />
      </Form.Item>

      <Form.Item label="Seats per Row">
        <InputNumber
          value={columns}
          onChange={handleColumnsChange}
          min={1}
          max={30}
          style={{ width: "100%" }}
        />
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          onClick={handleGenerateLayout}
          style={{ width: "100%" }}
        >
          Generate Layout
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ConfigPanel;
