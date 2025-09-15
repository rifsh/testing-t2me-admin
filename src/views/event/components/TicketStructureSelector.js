import React from "react";
import { Form, Select } from "antd";
import { useDispatch, useSelector } from "react-redux";
import {
  setSelectedTicketSet,
  setSelectedTicketStructureforEvent,
  addOrUpdateTicketSetforEvent,
} from "store/slices/ticketSlice";

const { Option } = Select;

export const TicketStructureSelector = ({ form }) => {
  const dispatch = useDispatch();
  const { filteredTickets, loading, availableTicketSets, ticketTypes } =
    useSelector((state) => state.tickets);

  const handleSelectTicketSet = (setName) => {
    const formValues = form.getFieldsValue();
    const selectedStructure = filteredTickets.find(
      (ticket) => ticket.id === formValues[`ticket_structure_id`]
    );
    const selectedSet = availableTicketSets.find(
      (set) => set.ticket_set === setName
    );

    const isDuplicate = ticketTypes.some((type) =>
      type.ticket_types?.some(
        (set) =>
          set.ticket_set === setName && type.name === selectedStructure?.name
      )
    );

    if (!isDuplicate) {
      const ticketSetData = {
        venue_id: selectedStructure?.venue_id,
        place_id: selectedStructure?.place_id,
        number_of_tickets: selectedStructure?.number_of_tickets,
        name: selectedStructure?.name,
        base_price: selectedStructure?.base_price,
        ticket_set: selectedSet?.ticket_set,
        tickets: selectedSet?.tickets,
        id: selectedStructure?.id,
        ticketStructureId: selectedStructure?.id,
      };

      dispatch(addOrUpdateTicketSetforEvent(ticketSetData));
      dispatch(setSelectedTicketSet(setName));

      form.setFieldsValue({
        ticket_set: null,
      });
    }
  };

  const handleSelectTicketStructure = (structureId) => {
    form.setFieldsValue({
      ticket_set: null,
    });
    const selectedStructure = filteredTickets.find(
      (ticket) => ticket.id === structureId
    );

    if (selectedStructure) {
      dispatch(setSelectedTicketStructureforEvent(selectedStructure));
    }
  };

  return (
    <div>
      <Form.Item name={"ticket_structure_id"} label="Ticket Type">
        <Select
          className="w-100"
          placeholder={`Choose a Ticket Type`}
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
      {availableTicketSets.length > 0 && (
        <Form.Item
          name="ticket_set"
          label="Sub Type"
          
        >
          <Select
            className="w-100"
            placeholder="Choose a Ticket Set"
            loading={loading}
            onChange={handleSelectTicketSet}
          >
            {availableTicketSets.map((ticketSet) => {
              const isDisabled = ticketTypes.some((type) =>
                type.ticket_types?.some(
                  (set) =>
                    set.ticket_set === ticketSet.ticket_set &&
                    type.name ===
                      filteredTickets.find(
                        (t) =>
                          t.id === form.getFieldValue(`ticket_structure_id`)
                      )?.name
                )
              );

              return (
                <Option
                  key={ticketSet.ticket_set}
                  value={ticketSet.ticket_set}
                  disabled={isDisabled}
                >
                  {ticketSet.ticket_set} {isDisabled ? "(Already Added)" : ""}
                </Option>
              );
            })}
          </Select>
        </Form.Item>
      )}
    </div>
  );
};

export default TicketStructureSelector;
