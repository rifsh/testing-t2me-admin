import React from "react";
import { Form, Select } from "antd";
import { useDispatch, useSelector } from "react-redux";
import {
  setSelectedTicketType,
  setSelectedTicketSet,
} from "store/slices/ticketSlice";

const { Option } = Select;

export const TicketTypeSelector = () => {
  const dispatch = useDispatch();
  const {
    availableTicketTyps,
    selectedTicketType,
    
  } = useSelector((state) => state.tickets);

  const handleSetTicketType = (value) => {
    // Reset ticket set when changing ticket type
    dispatch(setSelectedTicketType(value));
  };


  return (
    <>
      <Form.Item
        name="available_types"
        label="Type"
        rules={[{ required: true, message: "Please select a ticket type." }]}
      >
        <Select
          className="w-100"
          placeholder="Choose a Ticket Type"
          value={selectedTicketType}
          onChange={handleSetTicketType}
        >
          {availableTicketTyps?.available_types?.map((type) => (
            <Option key={type.id} value={type.id}>
              {type.name}
            </Option>
          ))}
        </Select>
      </Form.Item>

      
    </>
  );
};