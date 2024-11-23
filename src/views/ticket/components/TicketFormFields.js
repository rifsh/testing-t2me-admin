import React, { useState } from "react";
import {
  Input,
  Row,
  Col,
  Card,
  Form,
  AutoComplete,
  Select,
  Switch,
  Button,
} from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import countryListData from "assets/data/country-list.json";
import venueListData from "assets/data/venue-list.json";

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

const TicketFormFields = () => {
  const [value, setValue] = useState("");
  const [options, setOptions] = useState([]);
  const [countryList] = useState(countryListData);
  const [venueList] = useState(venueListData);
  const [isTicketTypeEnable, setIsTicketTypeEnable] = useState(false);
  const [ticketTypes, setTicketTypes] = useState([{ id: 1 }]);

  const onSearch = (searchText) => {
    const filteredOptions = countryList
      .filter((item) =>
        `${item.place}, ${item.countryName}`
          .toLowerCase()
          .includes(searchText.toLowerCase())
      )
      .map((item) => ({
        value: `${item.place}, ${item.countryName}`,
      }));

    setOptions(filteredOptions);
  };

  const onSelect = (data) => {
    setValue(data);
  };

  const onChange = (data) => {
    setValue(data);
  };

  const addTicketTypeField = () => {
    setTicketTypes((prev) => [...prev, { id: prev.length + 1 }]);
  };

  const deleteTicketTypeField = (id) => {
    setTicketTypes((prev) => prev.filter((ticketType) => ticketType.id !== id));
  };

  return (
    <Row gutter={16}>
      <Col xs={24} sm={24} md={17}>
        <Card title="Seat Details">
          <Form.Item name="place" label="Place" rules={rules.place}>
            <AutoComplete
              options={options}
              value={value}
              onSelect={onSelect}
              onSearch={onSearch}
              onChange={onChange}
              placeholder="Search for a Place"
              style={{ width: "100%" }}
            />
          </Form.Item>
          <Form.Item name="venue" label="Venue" rules={rules.venue}>
            <Select className="w-100" placeholder="Select a Venue">
              {venueList.map((venue) => (
                <Select.Option
                  key={`${venue.venue}, ${venue.countryName}`}
                  value={`${venue.venue}, ${venue.countryName}`}
                >
                  {`${venue.venue}, ${venue.countryName}`}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="price" label="Ticket Price" rules={rules.section}>
            <Input placeholder="Enter Ticket Price" />
          </Form.Item>
          <Form.Item
            name="ticketNumber"
            label="No of Ticket"
            rules={rules.section}
          >
            <Input placeholder="Enter No of Ticket" />
          </Form.Item>
          <Form.Item
            name="enableTicketType"
            label="Enable Ticket Type"
            valuePropName="checked"
          >
            <Switch
              checked={isTicketTypeEnable}
              onChange={(checked) => setIsTicketTypeEnable(checked)}
            />
          </Form.Item>
        </Card>

        {isTicketTypeEnable &&
          ticketTypes.map((ticketType, index) => (
            <div
              key={ticketType.id}
              style={{
                marginBottom: "24px",
                position: "relative",
              }}
            >
              <Card
                title={`Ticket Type Details ${index + 1}`}
                style={{
                  marginBottom: "8px",
                }}
              >
                <Form.Item
                  name={`ticketTypeName${ticketType.id}`}
                  label="Ticket Type Name"
                  rules={rules.section}
                >
                  <Input placeholder="Enter Ticket Type Name" />
                </Form.Item>
                <Form.Item
                  name={`ticketTypePrice${ticketType.id}`}
                  label="Ticket Price"
                  rules={rules.section}
                >
                  <Input placeholder="Enter Ticket Price" />
                </Form.Item>
                <Form.Item
                  name={`noOfTicket${ticketType.id}`}
                  label="No of Ticket"
                  rules={rules.section}
                >
                  <Input placeholder="Enter No of Ticket" />
                </Form.Item>
              </Card>
              <Button
                type="default"
                danger
                icon={<DeleteOutlined />}
                onClick={() => deleteTicketTypeField(ticketType.id)}
                style={{
                  position: "absolute",
                  top: "50%",
                  right: "-48px", 
                }}
              />
            </div>
          ))}
        {isTicketTypeEnable && (
          <Button
            type="dashed"
            onClick={addTicketTypeField}
            icon={<PlusOutlined />}
            style={{ width: "100%" }}
          >
            Add Ticket Type
          </Button>
        )}
      </Col>
    </Row>
  );
};

export default TicketFormFields;
