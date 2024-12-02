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
  AutoComplete,
} from "antd";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { addVenue, fetchPlaceWithCountry } from "store/slices/locationSlice";
import { useDispatch, useSelector } from "react-redux";
import Flex from "components/shared-components/Flex";
import { useNavigate } from "react-router-dom";
import LocationMarker from "./LocationMarker";
import { APP_PREFIX_PATH } from "configs/AppConfig";

const { Option } = Select;

const VenueFormFields = ({ mode }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { placeWithCountryList, coordinates, loading, error } = useSelector(
    (state) => state.locations
  );

  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  useEffect(() => {
    dispatch(fetchPlaceWithCountry(""));
  }, [dispatch]);

  const handleSearch = (value) => {
    dispatch(fetchPlaceWithCountry(value));
  };

  const onFinish = async () => {
    try {
      const values = await form.validateFields();
      const resultAction = await dispatch(
        addVenue({ ...values, ...coordinates })
      );

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

            <Form.Item
              name="city"
              label="City"
              rules={[{ required: true, message: "Please enter the city" }]}
            >
              <Input placeholder="Enter the city" />
            </Form.Item>

            <Form.Item
              name="place"
              label="Place"
              rules={[{ required: true, message: "Please select a place" }]}
            >
              <AutoComplete
                onSearch={handleSearch}
                placeholder="Search for a Place"
                style={{ width: "100%" }}
                options={placeWithCountryList.map((place) => ({
                  value: `${place.place_name}, ${place.country_name}`,
                }))}
                loading={loading}
              />
            </Form.Item>
            <Form.Item
              name="venue"
              label="Venue"
              rules={[
                { required: true, message: "Please enter the venue name" },
              ]}
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
                <Option value="indoor">Indoor</Option>
                <Option value="outdoor">Outdoor</Option>
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
                {
                  required: true,
                  message: "Please select a location on the map",
                },
              ]}
            >
              <Input value={coordinates.lat} readOnly />
            </Form.Item>

            <Form.Item
              name="longitude"
              label="Longitude"
              rules={[
                {
                  required: true,
                  message: "Please select a location on the map",
                },
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
              <Button onClick={() => form.resetFields()}>Discard</Button>
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
