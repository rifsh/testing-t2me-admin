// ConfigPanel.jsx
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  initializeSeats,
  setRows,
  setColumns,
} from "store/slices/movieSeatSlice";
import { Button, InputNumber, Form, Row, Col } from "antd";
import { BorderOuterOutlined } from "@ant-design/icons";

const ConfigPanel = () => {
  const dispatch = useDispatch();
  const { rows, columns } = useSelector((state) => state.movieSeatSlice);

  const handleGenerateLayout = () => {
    dispatch(initializeSeats({ rows, columns }));
  };

  return (
    <Form layout="vertical" size="small" style={{ width: "100%" }}>
      <Row gutter={8}>
        <Col span={12}>
          <Form.Item label="Rows" className="mb-2">
            <InputNumber
              value={rows}
              onChange={(value) => dispatch(setRows(value))}
              min={1}
              max={40}
              className="w-full"
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Seats per Row" className="mb-2">
            <InputNumber
              value={columns}
              onChange={(value) => dispatch(setColumns(value))}
              min={1}
              max={50}
              className="w-full"
            />
          </Form.Item>
        </Col>
      </Row>

      <Button
        type="primary"
        onClick={handleGenerateLayout}
        className="w-full"
        icon={<BorderOuterOutlined />}
      >
        Generate Layout
      </Button>
    </Form>
  );
};

export default ConfigPanel;
