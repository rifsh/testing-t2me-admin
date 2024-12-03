import React, { useEffect } from "react";
import {
  Input,
  Row,
  Col,
  Card,
  Form,
  Select,
  Button,
  message,
} from "antd";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { addVenue } from "store/slices/locationSlice";
import { useDispatch, useSelector } from "react-redux";
import Flex from "components/shared-components/Flex";
import { useNavigate } from "react-router-dom";
import LocationMarker from "./LocationMarker";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import PlaceWithCountryForm from "components/util-components/FormItems/PlaceWithCountryForm";

const { Option } = Select;

const VenueFormFields = ({ mode }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { coordinates, loading, error } = useSelector(
    (state) => state.locations
  );

  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  const onFinish = async () => {
    try {
      const values = await form.validateFields();
      console.log(values);

      const resultAction = await dispatch(addVenue(values));

      if (addVenue.fulfilled.match(resultAction)) {
        message.success(`Venue ${values.name} added successfully`);
        form.resetFields();
        navigate(`${APP_PREFIX_PATH}/venue/list`);
      }
    } catch (errorInfo) {
      console.error("Validation Failed:", errorInfo);
    }
  };

  return (
    <Row gutter={16}>
      <Col xs={24} sm={24} md={17}>
        <Form
          layout="vertical"
          form={form}
          name="venue_form"
          className="ant-advanced-search-form"
        >
          <Card>
            <h2 className="mb-3">
              {mode === "ADD" ? "Add Venue" : "Edit Venue"}
            </h2>

            <Form.Item
              name="address"
              label="Address"
              rules={[{ required: true, message: "Please enter the address" }]}
            >
              <Input placeholder="Enter the address" />
            </Form.Item>

            <PlaceWithCountryForm form={form} />

            <Form.Item
              name="name"
              label="Venue"
              rules={[{ required: true, message: "Please enter the venue name" }]}
            >
              <Input placeholder="Enter the venue name" />
            </Form.Item>
            <Form.Item
              name="capacity"
              label="Capacity"
              rules={[{ required: true, message: "Please enter capacity" }]}
            >
              <Input type="number" placeholder="Enter capacity" />
            </Form.Item>
            <Form.Item
              name="indoor"
              label="Indoor/Outdoor"
              rules={[
                { required: true, message: "Please specify indoor/outdoor" },
              ]}
            >
              <Select className="w-100" placeholder="Select type">
                <Option value={true}>Indoor</Option>
                <Option value={false}>Outdoor</Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="description"
              label="Description"
              rules={[
                { required: true, message: "Please enter a description" },
              ]}
            >
              <Input.TextArea rows={4} placeholder="Enter a description" />
            </Form.Item>
            <Form.Item
              name="latitude"
              label="Latitude"
              rules={[
                { required: true, message: "Please select a location on the map" },
              ]}
            >
              <Input value={coordinates.lat} readOnly />
            </Form.Item>

            <Form.Item
              name="longitude"
              label="Longitude"
              rules={[
                { required: true, message: "Please select a location on the map" },
              ]}
            >
              <Input value={coordinates.lng} readOnly />
            </Form.Item>

            <div className="mb-3">
              <h3>Pick Location</h3>
              <MapContainer
                center={coordinates}
                zoom={13}
                style={{ height: "400px", width: "100%" }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <LocationMarker form={form} />
              </MapContainer>
            </div>

            <Flex
              className="py-2"
              mobileFlex={false}
              justifyContent="space-between"
            >
              <Button>Discard</Button>
              <Button type="primary" onClick={onFinish} loading={loading}>
                {mode === "ADD" ? "Add" : "Save"}
              </Button>
            </Flex>
          </Card>
        </Form>
      </Col>
    </Row>
  );
};

export default VenueFormFields;
