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
import { addVenue, fetchPlaceWithCountry } from "store/slices/locationSlice";
import { useDispatch, useSelector } from "react-redux";
import Flex from "components/shared-components/Flex";
import { useNavigate } from "react-router-dom";
import { APP_PREFIX_PATH } from "configs/AppConfig";

const { Option } = Select;

const VenueFormFields = (props) => {
  const { mode } = props;
  const [form] = Form.useForm(); // Move useForm inside the component body
  const dispatch = useDispatch();
  const { placeWithCountryList, loading, error } = useSelector(
    (state) => state.locations
  );
  const navigate = useNavigate();

  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  const onFinish = async () => {
    try {
      const values = await form.validateFields();

      const resultAction = await dispatch(addVenue(values));
      if (addVenue.fulfilled.match(resultAction)) {
        message.success(`Category ${values.name} added successfully`);
        form.resetFields();
        navigate(`${APP_PREFIX_PATH}/venue/list`);
      }
    } catch (errorInfo) {
      console.log("Validation Failed:", errorInfo);
    }
  };

  useEffect(() => {
    dispatch(fetchPlaceWithCountry(""));
  }, [dispatch]);

  const handleSearch = (value) => {
    dispatch(fetchPlaceWithCountry(value));
  };

  return (
    <Row gutter={16}>
      <Col xs={24} sm={24} md={17}>
        <Form
          layout="vertical"
          form={form}
          name="advanced_search"
          className="ant-advanced-search-form"
          initialValues={{
            heightUnit: "cm",
            widthUnit: "cm",
            weightUnit: "kg",
          }}
        >
          <Card>
            <h2 className="mb-3">
              {mode === "ADD" ? "Add New Event" : `Edit Event`}{" "}
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
                options={
                  placeWithCountryList?.map((place) => ({
                    value: `${place.place_name}, ${place.country_name}`,
                  })) || []
                }
                loading={loading}
              />
            </Form.Item>

            <Form.Item
              name="venue"
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
                <Option value="indoor">Indoor</Option>
                <Option value="outdoor">Outdoor</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="description"
              label="Description"
              rules={[{ required: true, message: "Please enter a description" }]}
            >
              <Input.TextArea rows={4} placeholder="Enter a description" />
            </Form.Item>
            <Flex
              className="py-2"
              mobileFlex={false}
              justifyContent="space-between"
              alignItems="center"
            >
              <div className="mb-3">
                <Button className="mr-2">Discard</Button>
                <Button
                  type="primary"
                  onClick={() => onFinish()}
                  htmlType="submit"
                  loading={loading}
                >
                  {mode === "ADD" ? "Add" : `Save`}
                </Button>
              </div>
            </Flex>
          </Card>
        </Form>
      </Col>
    </Row>
  );
};

export default VenueFormFields;
