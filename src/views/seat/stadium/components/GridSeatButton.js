import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Modal, InputNumber, Button, Space, Form, Tooltip, Select } from "antd";
import { TableOutlined } from "@ant-design/icons";
import { addSeat } from "store/slices/seatSlice";

const GridSeatCreator = ({ onClose }) => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const categories = useSelector((state) => state.seat.categories);
  const activeCategory = useSelector((state) => state.seat.activeCategory);

  const handleCreateGrid = (values) => {
    const { rows, columns, spacing, startX, startY, categoryId } = values;

    // Generate a unique grid ID to identify seats from the same grid
    const gridId = `grid-${Date.now()}`;

    // Create grid of seats
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < columns; c++) {
        const x = startX + c * spacing;
        const y = startY + r * spacing;
        dispatch(
          addSeat({
            x,
            y,
            gridId,
            gridPosition: { row: r, column: c },
            categoryId,
          })
        );
      }
    }

    onClose();
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        rows: 5,
        columns: 5,
        spacing: 30,
        startX: 50,
        startY: 50,
        categoryId: activeCategory,
      }}
      onFinish={handleCreateGrid}
    >
      <Form.Item
        name="rows"
        label="Number of Rows"
        rules={[{ required: true, message: "Please enter number of rows" }]}
      >
        <InputNumber min={1} max={20} />
      </Form.Item>

      <Form.Item
        name="columns"
        label="Number of Columns"
        rules={[{ required: true, message: "Please enter number of columns" }]}
      >
        <InputNumber min={1} max={20} />
      </Form.Item>

      <Form.Item
        name="spacing"
        label="Spacing between seats"
        rules={[{ required: true, message: "Please enter spacing" }]}
      >
        <InputNumber min={20} max={100} />
      </Form.Item>

      <Form.Item
        name="startX"
        label="Start X position"
        rules={[{ required: true, message: "Please enter start X position" }]}
      >
        <InputNumber />
      </Form.Item>

      <Form.Item
        name="startY"
        label="Start Y position"
        rules={[{ required: true, message: "Please enter start Y position" }]}
      >
        <InputNumber />
      </Form.Item>

      <Form.Item
        name="categoryId"
        label="Seat Category"
        rules={[{ required: true, message: "Please select a category" }]}
      >
        <Select>
          {categories.map((category) => (
            <Select.Option key={category.id} value={category.id}>
              {category.name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit">
            Create Grid
          </Button>
          <Button onClick={onClose}>Cancel</Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

const GridSeatButton = () => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <Tooltip title="Create Grid of Seats">
        <button
          onClick={() => setModalVisible(true)}
          style={{
            backgroundColor: "white",
            border: "1px solid #d9d9d9",
            padding: "4px 8px",
            cursor: "pointer",
          }}
        >
          <TableOutlined />
        </button>
      </Tooltip>

      <Modal
        title="Create Grid of Seats"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <GridSeatCreator onClose={() => setModalVisible(false)} />
      </Modal>
    </>
  );
};

export default GridSeatButton;
