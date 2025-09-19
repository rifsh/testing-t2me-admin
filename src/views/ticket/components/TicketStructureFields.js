import React, { useEffect, useState } from "react";
import { Input, Form, Card, Button, Col, message } from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import { useDispatch } from "react-redux";
import { currentStepSaveUpdate } from "store/slices/ticketSlice";
import DraftSystem from "drafts/components/DraftSystem";
const TicketStructureFields = ({ ticket_states }) => {
  const [ticketTypes, setTicketTypes] = useState([{ id: 1 }]); // Dynamically manage form fields
  const {
    form,
    currentStepSaved,
    tickets,
    ticketCategory,
    handleExternalFunction,
    currentStep,
    setTicketCategory,
  } = ticket_states;
  const dispatch = useDispatch();
  const nav = useNavigate();
  // Add new ticket type field

  const addTicketTypeField = () => {
    console.warn(ticketCategory, currentStep);
    setTicketTypes((prev) => [...prev, { id: Date.now() }]);
    const values = form.getFieldsValue();
    const TicketTypeNames = values.ticket_types.map((item) => item.name);
    const pipeSeparatedNames = TicketTypeNames.join(" | ");
    console.warn(pipeSeparatedNames);
    setTicketCategory((prevCategory) =>
      prevCategory.map(
        (item) =>
          item.step === currentStep
            ? {
                ...item,
                value: pipeSeparatedNames, // Directly set to pipeSeparatedNames
              }
            : item // Leave other steps unchanged
      )
    );
    console.warn(TicketTypeNames, ";///", ticketCategory, currentStep);
  };

  // Delete ticket type field
  const deleteTicketTypeField = (id) => {
    if (ticketTypes.length > 1) {
      setTicketTypes((prev) => prev.filter((type) => type.id !== id));
    }
  };

  // Save current step data
  const saveCurrentStep = async () => {
    const values = await form.validateFields();
    if (!currentStepSaved) {
      const TicketTypeNames = values.ticket_types.map((item) => item.name);
      const pipeSeparatedNames = TicketTypeNames.join(" | ");
      console.warn(pipeSeparatedNames);
      setTicketCategory((prevCategory) =>
        prevCategory.map(
          (item) =>
            item.step === currentStep
              ? {
                  ...item,
                  value: pipeSeparatedNames, // Directly set to pipeSeparatedNames
                }
              : item // Leave other steps unchanged
        )
      );
      const isDuplicateTitle = ticketCategory.some(
        (item) => item.value === pipeSeparatedNames && item.step !== currentStep
      );

      if (isDuplicateTitle) {
        message.error(
          "Title for Ticket Type already exists. Please manually change the title and save the current step again"
        );
        dispatch(currentStepSaveUpdate(true));
        return;
      }

      handleExternalFunction(values.ticket_types, pipeSeparatedNames); // Pass only ticket types data
    } else {
      handleExternalFunction(values.ticket_types); // Pass only ticket types data
    }
    console.log(values, form, "Saved Step Data");
  };

  useEffect(() => {
    console.log(tickets, tickets.length, "Current Step");
    if (tickets && tickets.length > 0) {
      const ticketss = tickets[0]; // Access the first item in the tickets array
      console.log(ticketss, "Ticket Data");

      // Find the ticket set corresponding to the current step
      const existingData = ticketss.ticket_types?.find(
        (ticket) => ticket.id === currentStep
      );
      console.log(existingData, "Existing Data");

      if (existingData) {
        // Set form fields using existing data if found
        form.setFieldsValue({
          ticket_types: existingData.tickets || [], // Use 'tickets' data
        });

        // Update ticketTypes state to match the existing data
        setTicketTypes(
          existingData.tickets.map((_, index) => ({ id: index + 1 }))
        );
      } else {
        // Reset the form and ticketTypes for this step
        form.resetFields();
        setTicketTypes([{ id: 1 }]); // Default to one ticket form
      }
    } else {
      // If no tickets exist, reset everything
      form.resetFields();
      setTicketTypes([{ id: 1 }]);
      nav(`${APP_PREFIX_PATH}/ticket/add`);
    }
  }, [currentStep, tickets, form]);

  console.log(tickets, "Rendered Ticket Types");

  return (
    <Col xs={24} sm={24} md={24}>
      {ticketTypes.map((ticketType, index) => (
        <Card
          key={ticketType.id}
          title={`Ticket Type Details ${index + 1}`}
          style={{ marginBottom: "24px", position: "relative" }}
        >
          <Form.Item
            name={["ticket_types", index, "name"]}
            label="Ticket Type Name"
            rules={[{ required: true, message: "Please enter a name" }]}
          >
            <Input placeholder="Enter Ticket Name" />
          </Form.Item>

          <Form.Item
            name={["ticket_types", index, "price"]}
            label="Ticket Price"
            rules={[
              { required: true, message: "Please enter a price" },
              {
                pattern: /^\d+(\.\d{1,2})?$/,
                message: "Please enter a valid price",
              },
            ]}
          >
            <Input placeholder="Enter Ticket Price" type="number" min={0} />
          </Form.Item>

          <Form.Item
            name={["ticket_types", index, "number_of_tickets"]}
            label="Ticket Quantity"
            rules={[
              { required: true, message: "Please enter ticket quantity" },
              { pattern: /^\d+$/, message: "Please enter a valid number" },
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
        style={{ width: "50%" }}
      >
        Add Ticket Type
      </Button>
      <Button
        type="dashed"
        onClick={saveCurrentStep}
        icon={<PlusOutlined />}
        style={{ width: "50%" }}
      >
        Save Current Step
      </Button>
    </Col>
  );
};

export default TicketStructureFields;
