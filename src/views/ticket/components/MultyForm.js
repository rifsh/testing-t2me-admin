import React, { useEffect, useState } from "react";
import { Button, Form, Steps, Row, Col, message, Input } from "antd";
import TicketStructureFields from "./TicketStructureFields";
import { useNavigate } from "react-router-dom";
import { addOrUpdateTicketSet, currentStepSaveUpdate, removeSpecificTicketSet, resetTicketSets } from "store/slices/ticketSlice";
import { useDispatch, useSelector } from "react-redux";
import { addTicket } from "store/slices/ticketSlice";
import { APP_PREFIX_PATH } from "configs/AppConfig";


const { Step } = Steps;

const MultyStepTicketForm = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const { ticketTypes: tickets, currentStepSaved } = useSelector((state) => state.tickets);
  const { filteredVenues, venues } = useSelector((state) => state.locations);
  const dispatch = useDispatch();
  const [ticketCategory, setTicketCategory] = useState([]);
  const [ticketStructures, setTicketStructures] = useState([
    { id: 1, values: null }, // Initial structure
  ]);




  

  const nextStep = async () => {
    try {
      const values = await form.validateFields();

      // Update current structure values
      const updatedStructures = ticketStructures.map((structure, index) =>
        index === currentStep ? { ...structure, values } : structure
      );
      setTicketStructures(updatedStructures);

      // Move to next step
      if (currentStep < ticketStructures.length - 1) {
        setCurrentStep(currentStep + 1);
        // Reset form for next step
        form.resetFields();
        form.setFieldsValue(ticketStructures[currentStep + 1]?.values || {});
      }
    } catch (error) {
      message.error("Please complete all required fields.");
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      form.setFieldsValue(ticketStructures[currentStep - 1]?.values || {});
    }
  };

  const updateTitle = (value) => {
    setTicketCategory((prevCategory) => {
      // Check if the currentStep already exists in the array
      const existingStep = prevCategory.find((category) => category.step === currentStep);
  
      if (existingStep) {
        // If the currentStep exists, update its value
        return prevCategory.map((category) =>
          category.step === currentStep
            ? { ...category, value: value }
            : category
        );
      } else {
        // If the currentStep doesn't exist, add a new entry
        return [...prevCategory, { step: currentStep, value: value }];
      }
    });
  };
  
  
console.log(ticketCategory,'tikcetgdgd')
  const addTicketStructure = () => {
    if (currentStepSaved){

      const newStructureId = Date.now();
      setTicketStructures([
        ...ticketStructures,
        { id: newStructureId, values: null }, // Add a new structure with null values
      ]);
      setCurrentStep(ticketStructures.length); 
      dispatch(currentStepSaveUpdate(false))
    }

  };

  const removeTicketStructure = () => {
    if (ticketStructures.length > 1) {
      const updatedStructures = ticketStructures.filter(
        (_, index) => index !== currentStep
      );
      setTicketStructures(updatedStructures);
      const ticketToRemove = ticketCategory.find(ticket => ticket.step === currentStep);

      if (ticketToRemove?.step) {
        dispatch(removeSpecificTicketSet(ticketToRemove.step));
        setTicketCategory((prevCategory) =>
          prevCategory.filter((category) => category.step !== currentStep)
        );
      } else {
        console.warn("No matching ticket found to remove.");
      }
      setCurrentStep(Math.min(currentStep, updatedStructures.length - 1));
      if (ticketCategory.length==updatedStructures.length){

        dispatch(currentStepSaveUpdate(true))
      }
    } else {
      message.warning("At least one Ticket Structure must remain.");
    }
  };

  const onSubmit = async () => {
    try {
      // Create a shallow copy of tickets[0] to avoid mutating the original object
      let ticketData = { ...tickets[0] };
      let venue_id = ticketData.venue_id;
  
      console.warn("Original Ticket Data:", ticketData);
  
      // Flatten the ticket_types and replace it with the extracted tickets
      if (ticketData.ticket_types && Array.isArray(ticketData.ticket_types)) {
        let extractedTickets = ticketData.ticket_types.flatMap((type) => type.tickets);
  
        // Replace the original `ticket_types` with the extracted tickets in the copied object
        ticketData = {
          ...ticketData,
          ticket_types: extractedTickets,
        };
      } else {
        console.warn("No ticket_types found or invalid format.");
        throw new Error("Invalid ticket data format.");
      }
  
      console.log("Updated Ticket Data with Flattened Tickets:", ticketData);
  
      // Dispatch the updated ticket data
      const resultAction = await dispatch(addTicket({ ticketData, venue_id }));
  
      if (addTicket.fulfilled.match(resultAction)) {
        message.success(`Ticket added successfully!`);
        form.resetFields();
        dispatch(resetTicketSets())
        navigate(`${APP_PREFIX_PATH}/ticket/list`);
      } else {
        message.error(resultAction.payload || "Failed to add the ticket. Please try again.");
      }
    } catch (error) {
      console.error("Submission failed:", error);
      message.error("An error occurred. Please check your data and try again.");
    }
  };
  
  const handleExternalFunction = async (values) => {
    console.log(values);
  
    try {
      const setId = currentStep; // Current step will be the unique ID for this set
      const ticketSetName = ticketCategory.find(item => item.step === currentStep)?.value;
      if (!ticketSetName){
        message.error(`Enter a title for Ticket Type`);
        return;
      }else {
        console.log('ticket...')
        const ticket = tickets[0].ticket_types.find(
          (ticket) => ticket.ticket_set === ticketSetName && ticket.id !== currentStep
        );
        console.log(ticket,'...')

        if (ticket){
          message.error("Title for Ticket Type is already exist, Please change the title !!!")
          return 
        }
      }
      
      // Calculate the total number of tickets for the current set
      let totalNumberOfTicketsPerSet = values.reduce((acc, curr) => {
        return acc + (parseInt(curr.number_of_tickets) || 0); // Default to 0 if number_of_tickets is undefined
      }, 0); // Initialize accumulator to 0

      // Get the venue's capacity for validation
      const TicketCapacity = tickets[0]
      
      console.log(TicketCapacity.number_of_tickets,"///////////////////////////////",TicketCapacity.number_of_tickets> totalNumberOfTicketsPerSet ,totalNumberOfTicketsPerSet) // Replace with the actual venue ID if needed
      if (TicketCapacity && totalNumberOfTicketsPerSet > TicketCapacity.number_of_tickets) {
        // If the total number of tickets exceeds the venue's capacity, show an error message
        message.error(`The total number of tickets exceeds the venue's capacity of ${TicketCapacity.number_of_tickets} in ${ticketSetName} . Please adjust the number of tickets.`);
        return; // Prevent further processing
      }
  
      if (Array.isArray(values)) {
        // Map over tickets and add the necessary data (with id, name, price, quantity)
        const ticketsWithIds = values.map((ticket, index) => ({
          id: `${setId}-ticket-${index + 1}`, // Ensure id is set properly
          name: ticket.name,
          price: ticket.price,
          number_of_tickets: ticket.number_of_tickets,
          ticket_set: ticketSetName,
        }));
  
        // Dispatch the action with the correct payload
        dispatch(
          addOrUpdateTicketSet({
            id: setId, // Ensure id is passed to the action
            ticket_set: ticketSetName,
            tickets: ticketsWithIds,
          })
        );
        
        if (ticketStructures.length==ticketCategory.length){

          dispatch(currentStepSaveUpdate(true))
        }
        message.success("data saved")
      }
    } catch (error) {
      console.error(error);
    }
  };
  
  
  return (
    <div>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
        Multi-Step Ticket Form
      </h2>

      {/* Progress Indicator */}
      <Steps current={currentStep} style={{ marginBottom: "20px" }}>
  {ticketStructures.map((structure, index) => (
    <Step
      key={structure.id}
      title={
        <div style={{ display: "flex", alignItems: "center" }}>
          <Input
            value={structure.title}
            onChange={(e) => updateTitle(e.target.value)}
            placeholder="Enter Title"
            style={{ marginRight: "10px" }}
            disabled={currentStep !== index } // Disable if not the current step
          />
        </div>
      }
    />
  ))}
</Steps>



      {/* Form Fields for Current Step */}
      <Form
        form={form}
        layout="vertical"
        initialValues={ticketStructures[currentStep]?.values || {}}
      >
        <TicketStructureFields
          ticket_states={{ form, tickets,ticketCategory,handleExternalFunction,currentStep }}
          
        />
      </Form>

      {/* Navigation Buttons */}
      <Row justify="space-between" style={{ marginTop: "30px" }}>
        <Col>
          <Button onClick={prevStep} disabled={currentStep === 0}>
            Previous
          </Button>
        </Col>
        <Col style={{ display: "flex", gap: "10px" }}>
          
            <Button type="dashed" disabled={!currentStepSaved}  onClick={currentStepSaved&&addTicketStructure}>
              Add Ticket Structure
            </Button>
          {ticketStructures.length > 1 && (
            <Button danger onClick={removeTicketStructure}>
              Remove Current Structure
            </Button>
          )}
          <Button
            type="primary"
            onClick={currentStep === ticketStructures.length - 1 ? onSubmit : nextStep}
          >
            {currentStep === ticketStructures.length - 1 ? "Submit" : "Next"}
          </Button>
        </Col>
      </Row>
    </div>
  );
};

export default MultyStepTicketForm;
