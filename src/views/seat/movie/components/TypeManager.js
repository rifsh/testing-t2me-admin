// TypeManager.jsx
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addSeatType,
  updateSeatType,
  removeSeatType,
  setSelectedSeatType,
} from "store/slices/movieSeatSlice";
import {
  Button,
  Table,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  Badge,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";

const TypeManager = () => {
  const dispatch = useDispatch();
  const { seatTypes, selectedSeatType } = useSelector(
    (state) => state.movieSeatSlice
  );
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [form] = Form.useForm();

  const showModal = (type = null) => {
    if (type) {
      setEditingType(type);
      form.setFieldsValue({
        id: type.id,
        label: type.label,
        basePrice: type.basePrice,
        color: type.color,
      });
    } else {
      setEditingType(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleOk = () => {
    form.validateFields().then((values) => {
      const seatType = {
        id: values.id || values.label.toLowerCase().replace(/\s+/g, "_"),
        label: values.label,
        basePrice: parseFloat(values.basePrice),
        color: values.color,
      };

      if (editingType) {
        dispatch(updateSeatType(seatType));
      } else {
        dispatch(addSeatType(seatType));
      }

      setIsModalVisible(false);
    });
  };

  const handleRemoveSeatType = (typeId) => {
    dispatch(removeSeatType(typeId));
  };

  const handleSelectSeatType = (typeId) => {
    dispatch(setSelectedSeatType(typeId));
  };

  const columns = [
    {
      title: "Type",
      dataIndex: "label",
      key: "label",
      render: (text, record) => (
        <div
          className="flex items-center cursor-pointer"
          onClick={() => handleSelectSeatType(record.id)}
        >
          <span
            className="inline-block w-4 h-4 mr-2 rounded-full"
            style={{
              backgroundColor: record.color,
              border: `2px solid ${record.color}`,
            }}
          />
          <span>{text}</span>
          {record.id === selectedSeatType && (
            <Badge color="blue" className="ml-2"></Badge>
          )}
        </div>
      ),
    },
    {
      title: "Price",
      dataIndex: "basePrice",
      key: "basePrice",
      render: (price, record) => (
        <div
          className="cursor-pointer"
          onClick={() => handleSelectSeatType(record.id)}
        >
          ${price.toFixed(2)}
        </div>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => showModal(record)} size="small">
            <EditOutlined />
          </Button>
          <Button
            type="link"
            danger
            onClick={() => handleRemoveSeatType(record.id)}
            size="small"
          >
            <DeleteOutlined />
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => showModal()}
          size="small"
        >
          Add Type
        </Button>
      </div>

      <Table
        dataSource={seatTypes}
        columns={columns}
        rowKey="id"
        pagination={false}
        size="small"
      />

      <Modal
        title={editingType ? "Edit Seat Type" : "Add Seat Type"}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          {editingType && (
            <Form.Item
              name="id"
              label="ID"
              rules={[
                { required: true, message: "Please enter the seat type ID" },
              ]}
            >
              <Input disabled />
            </Form.Item>
          )}

          <Form.Item
            name="label"
            label="Label"
            rules={[
              { required: true, message: "Please enter the seat type label" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="basePrice"
            label="Base Price"
            rules={[{ required: true, message: "Please enter the base price" }]}
          >
            <InputNumber
              formatter={(value) => `$ ${value}`}
              parser={(value) => value.replace(/\$\s?/g, "")}
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item name="color" label="Color">
            <Input type="color" style={{ width: "100%", height: "32px" }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TypeManager;