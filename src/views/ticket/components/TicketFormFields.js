import React from "react";
import { Form, Input, Card,  Button, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import Flex from "components/shared-components/Flex";
import PlaceWithCountryForm from "components/util-components/FormItems/PlaceWithCountryForm";
import { RulesMessageConstants } from "constants/RulesConstant";
import { getVenues } from "store/slices/locationSlice";
import {  useDispatch } from "react-redux";
import { addTicket } from "store/slices/ticketSlice";
import VenueListForm from "components/util-components/FormItems/VenueList";

const TicketFormFields = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const addTicketType = () => {
    navigate(`${APP_PREFIX_PATH}/ticket/type/add`);
  };

  const onFinish = async () => {
    try {
      const values = await form.validateFields();
      const ticketData = {
        venue_id: values.venue_id,
        // name: values.name,
        number_of_tickets: values.number_of_tickets,
        base_price: values.base_price,
        ticket_types: [],
      };
      const venue_id = values.venue_id;

      const resultAction = await dispatch(addTicket({ ticketData, venue_id }));

      if (addTicket.fulfilled.match(resultAction)) {
        message.success(`Ticket "${values.name}" added successfully!`);
        form.resetFields();
        navigate(`${APP_PREFIX_PATH}/ticket/list`);
      } else {
        message.error(
          resultAction.payload || "Failed to add the ticket. Please try again."
        );
      }
    } catch (error) {
      console.log("Form validation failed:", error);
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={onFinish}>
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

        

        <Form.Item name={"number_of_tickets"} label="No of Ticket">
          <Input placeholder="Number of Tickets" />
        </Form.Item>
        <Form.Item name={"base_price"} label="Price">
          <Input placeholder="Enter Ticket Price" type="number" />
        </Form.Item>

        <div className="container" style={{ padding: "0px" }}>
          <Flex
            className="py-2"
            mobileFlex={false}
            justifyContent="space-between"
          >
            <Button className="mr-2">Discard</Button>
            <div className="mb-3">
              <Button
                icon={<PlusOutlined />}
                type="default"
                onClick={addTicketType}
                style={{ marginRight: "10px" }}
              >
                Add Ticket Type
              </Button>

              <Button type="primary" htmlType="submit" onClick={onFinish}>
                Submit
              </Button>
            </div>
          </Flex>
        </div>
      </Card>
    </Form>
  );
};

export default TicketFormFields;
