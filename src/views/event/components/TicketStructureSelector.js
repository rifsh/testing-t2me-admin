import React from "react";
import { Form, Select } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedTicketSet, setSelectedTicketStructure } from "store/slices/ticketSlice";

const { Option } = Select;

export const TicketStructureSelector = ({form}) => {
  const dispatch = useDispatch();
  const {
    filteredTickets,
    loading,
    selectedTicketType,
    availableTicketSets,
    selectedTicketSet,
  } = useSelector((state) => state.tickets);

  const handleSelectTicketSet = (setName) => {
    
    dispatch(setSelectedTicketSet(setName));
  };
  const handleSelectTicketStructure = (structureId) => {
    form.setFieldsValue({
      ticket_set: null,
    });
    const selectedStructure = filteredTickets.find(
      (ticket) => ticket.id === structureId
    );

    if (selectedStructure) {
      dispatch(setSelectedTicketStructure(selectedStructure));
    }
  };

  const renderStructureField = () => {
    const structureNames = {
      2: "Ticket Type",
      1: "Seat Type",
      3: "Movie Seat Type",
    };

    const fieldNames = {
      2: "ticket_structure_id",
      1: "seat_structure_id",
      3: "movie_seat_structure_id",
    };

    return (
      <div>
        <Form.Item
          name={fieldNames[selectedTicketType]}
          label={structureNames[selectedTicketType]}
          rules={[
            {
              required: true,
              message: `Please select a ${structureNames[
                selectedTicketType
              ].toLowerCase()}.`,
            },
          ]}
        >
          <Select
            className="w-100"
            placeholder={`Choose a ${structureNames[selectedTicketType]}`}
            loading={loading}
            onChange={handleSelectTicketStructure}
          >
            {filteredTickets.map((ticket) => (
              <Option key={ticket.id} value={ticket.id}>
                {ticket.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        {selectedTicketType && availableTicketSets.length > 0 && (
          <Form.Item
            name="ticket_set"
            label="Sub Type"
            rules={[{ required: true, message: "Please select a ticket set." }]}
          >
            <Select
              className="w-100"
              placeholder="Choose a Ticket Set"
              loading={loading}
              onChange={handleSelectTicketSet}
              value={selectedTicketSet?.ticket_set}
            >
              {availableTicketSets.map((ticketSet) => (
                <Option key={ticketSet.ticket_set} value={ticketSet.ticket_set}>
                  {ticketSet.ticket_set}
                </Option>
              ))}
            </Select>
          </Form.Item>
        )}{" "}
      </div>
    );
  };

  return selectedTicketType ? renderStructureField() : null;
};
