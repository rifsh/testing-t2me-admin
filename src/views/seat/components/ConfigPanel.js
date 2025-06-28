import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  initializeSeats,
  setRows,
  setColumns,
} from "store/slices/movieSeatSlice";
import { Button, InputNumber, Form, Row, Col, Modal } from "antd";
import {
  BorderOuterOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";

const ConfigPanel = () => {
  const dispatch = useDispatch();
  const { rows, columns } = useSelector((state) => state.movieSeatSlice);
  const { singleVenues } = useSelector((state) => state.locations);
  const { singleScreen } = useSelector((state) => state.screen);

  const getMaxCapacity = () => {
    // First check if singleScreen has capacity, otherwise use venue capacity
    if (singleScreen?.capacity) {
      return singleScreen.capacity;
    }
    if (singleVenues?.capacity) {
      return singleVenues.capacity;
    }
    return null; // No capacity limit if neither screen nor venue has capacity
  };

  const handleGenerateLayout = () => {
    const maxCapacity = getMaxCapacity();
    const totalSeats = rows * columns;

    if (maxCapacity && totalSeats > maxCapacity) {
      Modal.warning({
        title: "Capacity Exceeded",
        icon: <ExclamationCircleOutlined />,
        content: (
          <div>
            <p>
              The requested layout ({totalSeats} seats) exceeds the maximum
              capacity.
            </p>
            <p>
              <strong>Maximum allowed capacity:</strong> {maxCapacity} seats
            </p>
            <p>
              <strong>Current layout:</strong> {rows} rows × {columns} seats ={" "}
              {totalSeats} seats
            </p>
            <p>
              Please reduce the number of rows or seats per row to stay within
              the capacity limit.
            </p>
          </div>
        ),
        okText: "OK",
        width: 500,
      });
      return;
    }

    dispatch(initializeSeats({ rows, columns }));
  };

  const maxCapacity = getMaxCapacity();
  const totalSeats = rows * columns;
  const isOverCapacity = maxCapacity && totalSeats > maxCapacity;

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

      {maxCapacity && (
        <div className="mb-3">
          <div className="text-xs text-gray-600 mb-1">
            Capacity: {totalSeats} / {maxCapacity} seats
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                isOverCapacity
                  ? "bg-red-500"
                  : totalSeats > maxCapacity * 0.8
                  ? "bg-yellow-500"
                  : "bg-green-500"
              }`}
              style={{
                width: `${Math.min((totalSeats / maxCapacity) * 100, 100)}%`,
              }}
            />
          </div>
          {isOverCapacity && (
            <div className="text-xs text-red-600 mt-1">
              ⚠️ Exceeds maximum capacity by {totalSeats - maxCapacity} seats
            </div>
          )}
        </div>
      )}

      <Button
        type="primary"
        onClick={handleGenerateLayout}
        className="w-full"
        icon={<BorderOuterOutlined />}
        danger={isOverCapacity}
      >
        Generate Layout
      </Button>
    </Form>
  );
};

export default ConfigPanel;
