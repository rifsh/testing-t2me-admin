import React, { useState } from "react";
import { Input, Card, Form, Select, Button, message } from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import venueListData from "assets/data/venue-list.json";
import { useNavigate } from "react-router-dom";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import Flex from "components/shared-components/Flex";
import PlaceWithCountryForm from "components/util-components/FormItems/PlaceWithCountryForm";
import { RulesMessageConstants } from "constants/RulesConstant";

const rules = {
  venue: [
    {
      required: true,
      message: "Please select a venue",
    },
  ],
  section: [
    {
      required: true,
      message: "This field is required",
    },
  ],
};

const TicketFormFields = ({ form }) => {
  const navigate = useNavigate();

  const addTicketType = () => {
    navigate(`${APP_PREFIX_PATH}/ticket/type/add`);
  };

  const onFinish = async () => {
    try {
      const values = await form.validateFields();
      console.log("Form Submitted:", values);
    } catch (error) {
      console.log("Form validation failed:", error);
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      <Card title="Ticket Form">
        <PlaceWithCountryForm
          label={"Place"}
          rules={[{ required: true, message: RulesMessageConstants.PLACE }]}
        />
        <Form.Item name="venue" label="Venue" rules={rules.venue}>
          <Select
            placeholder="Select a venue"
            options={venueListData.map((venue) => ({
              value: venue.venue,
              label: venue.venue,
            }))}
          />
        </Form.Item>

        <Form.Item name={"number_of_tickets"} label="No of Ticket">
          <Input placeholder="Number of Tickets" />
        </Form.Item>
        <Form.Item name={"base_price"} label="Ticket Price">
          <Input placeholder="Enter Ticket Price" />
        </Form.Item>

        <div className="container" style={{ padding: "0px" }}>
          <Flex
            className="py-2"
            mobileFlex={false}
            justifyContent="space-between"
            // alignItems="center"
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

              <Button type="primary" htmlType="submit">
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
