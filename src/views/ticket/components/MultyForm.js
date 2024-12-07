import React, { useState } from "react";
import { Button, Form, Steps, Row, Col, message } from "antd";
import TicketStructureFields from "./TicketStructureFields";
import { useNavigate } from "react-router-dom";

const { Step } = Steps;

const MultyStepTicketForm = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [ticketStructures, setTicketStructures] = useState([
    { id: 1, values: null }
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

  const addTicketStructure = () => {
    const newStructureId = Date.now();
    setTicketStructures([
      ...ticketStructures, 
      { id: newStructureId, values: null }
    ]);
    setCurrentStep(ticketStructures.length);
  };

  const removeTicketStructure = () => {
    if (ticketStructures.length > 1) {
      const updatedStructures = ticketStructures.filter((_, index) => index !== currentStep);
      setTicketStructures(updatedStructures);
      
      setCurrentStep(Math.min(currentStep, updatedStructures.length - 1));
    } else {
      message.warning("At least one Ticket Structure must remain.");
    }
  };

  const onSubmit = async () => {
    try {
      const finalValues = await form.validateFields();
      
      const updatedStructures = ticketStructures.map((structure, index) => 
        index === currentStep ? { ...structure, values: finalValues } : structure
      );

      console.log("All Ticket Structures:", updatedStructures);
      message.success("Form submitted successfully!");
      navigate(-1);
    } catch (error) {
      message.error("Please complete all required fields.");
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
            title={`Ticket Structure ${index + 1}`} 
          />
        ))}
      </Steps>

      {/* Form Fields for Current Step */}
      <Form
        form={form}
        layout="vertical"
        initialValues={ticketStructures[currentStep]?.values || {}}
      >
        <TicketStructureFields />
      </Form>

      {/* Navigation Buttons */}
      <Row justify="space-between" style={{ marginTop: "30px" }}>
        <Col>
          <Button onClick={prevStep} disabled={currentStep === 0}>
            Previous
          </Button>
        </Col>
        <Col style={{ display: "flex", gap: "10px" }}>
          {currentStep === ticketStructures.length - 1 && (
            <Button type="dashed" onClick={addTicketStructure}>
              Add Ticket Structure
            </Button>
          )}
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