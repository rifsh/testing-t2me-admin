import React from "react";
import { Form, Select } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { 
  setSelectedTicketSet, 
  setSelectedTicketStructure,
  addOrUpdateTicketSet 
} from "store/slices/ticketSlice";

const { Option } = Select;

export const TicketStructureSelector = ({ form }) => {
  const dispatch = useDispatch();
  const {
    filteredTickets,
    loading,
    selectedTicketType,
    availableTicketSets,
    ticketTypes
  } = useSelector((state) => state.tickets);

  const handleSelectTicketSet = (setName) => {
    const formValues = form.getFieldsValue();
    const selectedStructure = filteredTickets.find(
      (ticket) => ticket.id === formValues[`${getFieldPrefix()}_structure_id`]
    );
    const selectedSet = availableTicketSets.find(
      (set) => set.ticket_set === setName
    );
  
    // Check if this ticket set already exists in any ticket type
    const isDuplicate = ticketTypes.some(type => 
      type.ticket_types?.some(set => 
        set.ticket_set === setName && 
        type.name === selectedStructure?.name
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
        id: selectedStructure.id,  // Using the structure ID directly
        ticketStructureId: selectedStructure.id
      };
  
      dispatch(addOrUpdateTicketSet(ticketSetData));
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
      dispatch(setSelectedTicketStructure(selectedStructure));
    }
  };

  const getFieldPrefix = () => {
    switch (selectedTicketType) {
      case 2: return 'ticket';
      case 1: return 'seat';
      case 3: return 'movie_seat';
      default: return 'ticket';
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
            label="Sub Type">
            <Select
              className="w-100"
              
              placeholder="Choose a Ticket Set"
              loading={loading}
              onChange={handleSelectTicketSet}
            >
              {availableTicketSets.map((ticketSet) => {
                const isDisabled = ticketTypes.some(type => 
                  type.ticket_types?.some(set => 
                    set.ticket_set === ticketSet.ticket_set &&
                    type.name === filteredTickets.find(
                      t => t.id === form.getFieldValue(`${getFieldPrefix()}_structure_id`)
                    )?.name
                  )
                );

                return (
                  <Option 
                    key={ticketSet.ticket_set} 
                    value={ticketSet.ticket_set}
                    disabled={isDisabled}
                  >
                    {ticketSet.ticket_set} {isDisabled ? '(Already Added)' : ''}
                  </Option>
                );
              })}
            </Select>
          </Form.Item>
        )}
      </div>
    );
  };

  return selectedTicketType ? renderStructureField() : null;
};

export default TicketStructureSelector; 