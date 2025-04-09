import React, { useState } from "react";
import { Form, Input, InputNumber, Button, Tag, Row, Col, Space, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";

const TableCreationForm = () => {
  const [form] = Form.useForm();
  const [tables, setTables] = useState([]);
  const [newTable, setNewTable] = useState({
    name: "",
    type: "",
    seats: 2,
    capacity: 2
  });

  const handleAddTable = () => {
    if (!newTable.name || !newTable.type || !newTable.seats || !newTable.capacity) {
      message.error("Please fill all table fields");
      return;
    }

    setTables([...tables, { ...newTable }]);
    setNewTable({
      name: "",
      type: "",
      seats: 2,
      capacity: 2
    });
  };

  const handleRemoveTable = (index) => {
    const updatedTables = tables.filter((_, i) => i !== index);
    setTables(updatedTables);
  };

  const handleSubmit = () => {
    if (tables.length === 0) {
      message.error("Please add at least one table");
      return;
    }
    console.log("Submitted tables:", tables);
    message.success("Tables created successfully!");
  };

  return (
    <div style={{ padding: "24px", maxWidth: "800px", margin: "0 auto" }}>
      <Form form={form} layout="vertical">
        <Form.Item label="Table Configuration">
          <div style={{ marginBottom: 16 }}>
            {tables.map((table, index) => (
              <Tag
                key={index}
                closable
                onClose={() => handleRemoveTable(index)}
                style={{ 
                  marginBottom: 8,
                  padding: "8px 12px",
                  borderRadius: 4,
                  background: "#f6f6f6"
                }}
              >
                <div>
                  <strong>{table.name}</strong>
                  <div>Type: {table.type}</div>
                  <div>Seats: {table.seats}</div>
                  {/* <div>Capacity: {table.capacity}</div> */}
                </div>
              </Tag>
            ))}
          </div>
          
          <Space direction="vertical" style={{ width: "100%" }}>
            <Row gutter={16}>
              <Col span={6}>
                <Input
                  placeholder="Table Name"
                  value={newTable.name}
                  onChange={(e) => setNewTable({...newTable, name: e.target.value})}
                />
              </Col>
              <Col span={6}>
                <Input
                  placeholder="Table Type"
                  value={newTable.type}
                  onChange={(e) => setNewTable({...newTable, type: e.target.value})}
                />
              </Col>
              <Col span={6}>
                <InputNumber
                  min={1}
                  max={20}
                  placeholder="Seats"
                  value={newTable.seats}
                  onChange={(value) => setNewTable({...newTable, seats: value})}
                  style={{ width: "100%" }}
                />
              </Col>
              {/* <Col span={6}>
                <InputNumber
                  min={1}
                  max={50}
                  placeholder="Capacity"
                  value={newTable.capacity}
                  onChange={(value) => setNewTable({...newTable, capacity: value})}
                  style={{ width: "100%" }}
                />
              </Col> */}
            </Row>
            {/* <Button
              type="dashed"
              onClick={handleAddTable}
              icon={<PlusOutlined />}
              style={{ width: "100%" }}
            >
              Add Table
            </Button> */}
          </Space>
        </Form.Item>

        <Form.Item>
          <Button type="primary" onClick={handleSubmit}>
            Submit Tables
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default TableCreationForm;