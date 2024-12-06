import React, { useState, useEffect } from "react";
import { Input, Form, Card, Button, Col, Select } from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";

const { Option } = Select;

const TicketStructureFields = () => {
  const [form] = Form.useForm();
  const [ticketTypes, setTicketTypes] = useState([{ id: 1 }]);
  
  // Predefined lists to make each structure unique
  const structureTypes = [
    'Event Ticket', 
    'Conference Pass', 
    'Workshop Registration', 
    'Seminar Entry', 
    'Festival Ticket'
  ];

  const ticketCategories = [
    'Standard', 
    'Premium', 
    'VIP', 
    'Early Bird', 
    'Group'
  ];

  const addTicketTypeField = () => {
    setTicketTypes((prev) => [...prev, { id: Date.now() }]);
  };

  const deleteTicketTypeField = (id) => {
    if (ticketTypes.length > 1) {
      setTicketTypes((prev) => prev.filter((type) => type.id !== id));
    }
  };

  return (
    <Col xs={24} sm={24} md={24}>
      {/* <Form.Item
        name="structure_type"
        label="Structure Type"
        rules={[{ required: true, message: "Please select a structure type" }]}
      >
        <Select placeholder="Select Structure Type">
          {structureTypes.map(type => (
            <Option key={type} value={type}>{type}</Option>
          ))}
        </Select>
      </Form.Item> */}

      {ticketTypes.map((ticketType, index) => (
        <Card
          key={ticketType.id}
          title={`Ticket Type Details ${index + 1}`}
          style={{ marginBottom: "24px", position: "relative" }}
        >
          <Form.Item
            name={['ticket_types', index, 'category']}
            label="Ticket Category"
            rules={[{ required: true, message: "Please select a ticket category" }]}
          >
            <Select placeholder="Select Ticket Category">
              {ticketCategories.map(category => (
                <Option key={category} value={category}>{category}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name={['ticket_types', index, 'name']}
            label="Ticket Name"
            rules={[{ required: true, message: "Please enter a name" }]}
          >
            <Input placeholder="Enter Ticket Name" />
          </Form.Item>

          <Form.Item
            name={['ticket_types', index, 'price']}
            label="Ticket Price"
            rules={[
              { required: true, message: "Please enter a price" },
              { pattern: /^\d+(\.\d{1,2})?$/, message: "Please enter a valid price" }
            ]}
          >
            <Input 
              placeholder="Enter Ticket Price" 
              type="number" 
              min={0} 
              step="0.01" 
            />
          </Form.Item>

          <Form.Item
            name={['ticket_types', index, 'quantity']}
            label="Ticket Quantity"
            rules={[
              { required: true, message: "Please enter ticket quantity" },
              { pattern: /^\d+$/, message: "Please enter a valid number" }
            ]}
          >
            <Input 
              placeholder="Enter Number of Tickets" 
              type="number" 
              min={1} 
            />
          </Form.Item>

          {ticketTypes.length > 1 && (
            <Button
              type="default"
              danger
              icon={<DeleteOutlined />}
              onClick={() => deleteTicketTypeField(ticketType.id)}
              style={{ position: "absolute", top: "10px", right: "10px" }}
            />
          )}
        </Card>
      ))}

      <Button 
        type="dashed" 
        onClick={addTicketTypeField} 
        icon={<PlusOutlined />} 
        style={{ width: "100%" }}
      >
        Add Ticket Type
      </Button>
    </Col>
  );
};

export default TicketStructureFields;