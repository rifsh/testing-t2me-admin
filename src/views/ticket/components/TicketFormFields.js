import React, { useState, useEffect } from "react";
import { Form, Input, Card, Select, Button, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import Flex from "components/shared-components/Flex";
import PlaceWithCountryForm from "components/util-components/FormItems/PlaceWithCountryForm";
import { RulesMessageConstants } from "constants/RulesConstant";
import { getVenues, singleVenue } from "store/slices/locationSlice";
import { useSelector, useDispatch } from "react-redux";
import { addTicket, currentStepSaveUpdate, addOrUpdateTicketSet, resetTicketTypes, resetTicketSets } from "store/slices/ticketSlice";
import VenueListForm from "components/util-components/FormItems/VenueList";
import { SubmitAndConfirmModal } from "components/util-components/ModalItems/SubmitConfirmModal";
import { setSelectedSubmitItem } from "store/slices/modalSlice";

const TicketFormFields = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { filteredVenues } = useSelector((state) => state.locations);
  const tickets = useSelector((state) => state.tickets.ticketTypes);
  const VenueData = useSelector((state) =>
    state.locations.filteredVenues.find((venue) => venue.id === form.getFieldValue("venue_id"))
  );
  const { responseData, responseMessage } =
  useSelector((state) => state.tickets);
  const addTicketType = async () => {
    try {
      const formValues = await form.validateFields();
      dispatch(addOrUpdateTicketSet(formValues));
      navigate(`${APP_PREFIX_PATH}/ticket/type/add`);
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const onSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      const ticketData = {
        venue_id: values.venue_id,
        number_of_tickets: values.number_of_tickets,
        base_price: values.base_price,
        name:values.name,
        ticket_types: [],
      };
      // const resultAction = await dispatch(addTicket({ ticketData, venue_id: values.venue_id }));
      dispatch(setSelectedSubmitItem(ticketData));

      // if (addTicket.fulfilled.match(resultAction)) {
      //   message.success(`Ticket added successfully!`);
      //   form.resetFields();
      //   dispatch(resetTicketSets())
      //   navigate(`${APP_PREFIX_PATH}/ticket/list`);
      // } else {
      //   message.error(
      //     resultAction.payload || "Failed to add the ticket. Please try again."
      //   );
      // }
    } catch (error) {
      console.log("Form validation failed:", error);
    }
  };
 
  
  useEffect(() => {
    dispatch(resetTicketTypes());
    dispatch(currentStepSaveUpdate(false))

    if (tickets && tickets.length > 0) {
      const ticket = tickets[0];
      if (ticket.base_price) form.setFieldsValue({ base_price: ticket.base_price });
      if (ticket.number_of_tickets) form.setFieldsValue({ number_of_tickets: ticket.number_of_tickets });
      if (ticket.venue_id) form.setFieldsValue({ venue_id: ticket.venue_id });
      if (ticket.place_id) form.setFieldsValue({ place_id: ticket.place_id });
    }
  }, []);

  return (


    
<Form form={form} layout="vertical" >
<Card title="Ticket Form">
        <PlaceWithCountryForm
          form={form}
          label={"Place"}
          onSelect={(id) => {
            dispatch(getVenues(id));
            form.setFieldsValue({ venue_id: null });
          }}
          rules={[{ required: true, message: RulesMessageConstants.PLACE }]}
        />
        <VenueListForm
          form={form}
          label="Venue"
          rules={[{ required: true, message: RulesMessageConstants.VENUE }]}
        />
        
        <Form.Item name="name" label="Ticket Type name" rules={[
            { required: true, message: "Please enter the number of tickets" }]}>
          <Input placeholder="Enter Ticket Type Name" type="text"  />
        </Form.Item>
        <Form.Item
          name="number_of_tickets"
          label="No of Tickets"
          rules={[
            { required: true, message: "Please enter the number of tickets" },
            {
              validator: (_, value) =>
                value && VenueData?.capacity && value > VenueData.capacity
                  ? Promise.reject(new Error(`The number of tickets cannot exceed the venue capacity of ${VenueData.capacity}.`))
                  : Promise.resolve(),
            },
          ]}
        >
          <Input
            placeholder={VenueData ? `Venue Capacity: ${VenueData.capacity || 0}` : "Number of tickets"}
            type="number"
          />
        </Form.Item>
        <Form.Item name="base_price" label="Price">
          <Input placeholder="Enter Ticket Price" type="number" />
        </Form.Item>
        <div className="container" style={{ padding: "0px" }}>
          <Flex className="py-2" mobileFlex={false} justifyContent="space-between">
            <Button className="mr-2">Discard</Button>
            <div className="mb-3">
              <Button
                icon={<PlusOutlined />}
                type="default"
                onClick={addTicketType}
                style={{ marginRight: "10px" }}
              >
                Add Sub Ticket Type
              </Button>
              <Button onClick={onSubmit} type="primary" htmlType="submit">
                Submit
              </Button>
            </div>
          </Flex>
        </div>
      </Card>
      <SubmitAndConfirmModal
        responseData={responseData}
        addFunction={addTicket}
        navigationPath={`${APP_PREFIX_PATH}/ticket/list`}
        responseMessage={responseMessage}
      />
    </Form>
    
  );
};

export default TicketFormFields;
