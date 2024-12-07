import React, { useState } from "react";
import { Input, Card, Form, Select, Button,  } from "antd";
import {  PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import Flex from "components/shared-components/Flex";
import PlaceWithCountryForm from "components/util-components/FormItems/PlaceWithCountryForm";
import { RulesMessageConstants } from "constants/RulesConstant";
import { getVenues } from "store/slices/locationSlice";
import { useSelector, useDispatch } from "react-redux";

const TicketFormFields = ({ form }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const addTicketType = () => {
    navigate(`${APP_PREFIX_PATH}/ticket/type/add`);
  };

  // Fetch filtered venues from Redux store
  const { filteredVenues } = useSelector((state) => state.locations);

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
          onSelect={(id) => {
            dispatch(getVenues(id)); 
          }}
          rules={[{ required: true, message: RulesMessageConstants.PLACE }]}
        />
        <Form.Item
          name="venue"
          label="Venue"
          rules={[{ required: true, message: RulesMessageConstants.VENUE }]}
        >
          <Select
            placeholder="Select a venue"
            options={filteredVenues.map((venue) => ({
              value: venue.name,
              label: venue.name,
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
