import React from "react";
import { Form, Select } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedTicketType } from "store/slices/ticketSlice";

const { Option } = Select;

export const TicketTypeSelector = ({ form }) => {
  const dispatch = useDispatch();
  const { availableTicketTyps, selectedTicketType } = useSelector(
    (state) => state.tickets
  );

  const handleSetTicketType = (value) => {
    form.setFieldsValue({
      seat_structure_id: null,
      ticket_structure_id: null,
      ticket_set: null,
    });
    dispatch(setSelectedTicketType(value));
  };

  return (
    <>
      <Form.Item
        name="available_types"
        label="Booking Type"
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
