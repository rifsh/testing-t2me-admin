import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addSeatType,
  updateSeatType,
  removeSeatType,
  setSelectedSeatType,
  updateSeats,
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
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";

const TypeManager = () => {
  const dispatch = useDispatch();
  const { seatTypes, selectedSeatType, seats } = useSelector(
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

  // Check if seat type is used in any seat
  const isSeatTypeInUse = (typeId) => {
    return seats.some((row) => row.some((seat) => seat.type === typeId));
  };

  // Get count of seats using this type
  const getSeatTypeUsageCount = (typeId) => {
    let count = 0;
    seats.forEach((row) => {
      row.forEach((seat) => {
        if (seat.type === typeId) {
          count++;
        }
      });
    });
    return count;
  };

  // Update seats to remove the deleted seat type
  const updateSeatsAfterTypeRemoval = (removedTypeId) => {
    const defaultSeatType = seatTypes.find((type) => type.id !== removedTypeId);
    const updatedSeats = seats.map((row) =>
      row.map((seat) => {
        if (seat.type === removedTypeId) {
          return {
            ...seat,
            type: defaultSeatType.id,
            price: defaultSeatType.basePrice,
          };
        }
        return seat;
      })
    );
    dispatch(updateSeats(updatedSeats));
  };

  const handleRemoveSeatType = (typeId) => {
    // Check if this is the last seat type
    if (seatTypes.length <= 1) {
      Modal.warning({
        title: "Cannot Delete",
        content: "At least one seat type must exist.",
        okText: "OK",
      });
      return;
    }

    // Check if seat type is in use
    if (isSeatTypeInUse(typeId)) {
      const usageCount = getSeatTypeUsageCount(typeId);
      const seatTypeLabel = seatTypes.find((type) => type.id === typeId)?.label;
      const defaultSeatType = seatTypes.find((type) => type.id !== typeId);

      Modal.confirm({
        title: "Seat Type In Use",
        icon: <ExclamationCircleOutlined />,
        content: (
          <div>
            <p>
              The seat type "{seatTypeLabel}" is currently used by {usageCount}{" "}
              seat(s).
            </p>
            <p>
              If you proceed, all seats using this type will be converted to "
              {defaultSeatType?.label}" type.
            </p>
            <p>Do you want to continue?</p>
          </div>
        ),
        okText: "Yes, Delete",
        okType: "danger",
        cancelText: "Cancel",
        onOk() {
          // First update seats, then remove the seat type
          updateSeatsAfterTypeRemoval(typeId);
          dispatch(removeSeatType(typeId));
        },
        onCancel() {
          // Do nothing
        },
      });
    } else {
      // Seat type is not in use, delete directly
      dispatch(removeSeatType(typeId));
    }
  };

  const handleSelectSeatType = (typeId) => {
    dispatch(setSelectedSeatType(typeId));
  };

  useEffect(() => {
    console.log("seatTypesTesting", seatTypes);

  }, [seatTypes])

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
      render: (basePrice, record) => (
        <div
          className="cursor-pointer"
          onClick={() => handleSelectSeatType(record.id)}
        >
          {record?.venue?.name} {record?.basePrice.toFixed(2)}
        </div>
      ),
    },
    {
      title: "Usage",
      key: "usage",
      render: (_, record) => {
        const count = getSeatTypeUsageCount(record.id);
        return (
          <span className={count > 0 ? "text-blue-600" : "text-gray-400"}>
            {count} seat(s)
          </span>
        );
      },
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
