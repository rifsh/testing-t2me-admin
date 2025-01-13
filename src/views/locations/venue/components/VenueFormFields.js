import React, { useEffect } from "react";
import { Input, Row, Col, Card, Form, Select, Button, message ,Upload} from "antd";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { addVenue, setSelectedPlace } from "store/slices/locationSlice";
import { useDispatch, useSelector } from "react-redux";
import Flex from "components/shared-components/Flex";
import { useNavigate } from "react-router-dom";
import LocationMarker from "./LocationMarker";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import PlaceWithCountryForm from "components/util-components/FormItems/PlaceWithCountryForm";
import { RulesMessageConstants } from "constants/RulesConstant";
import { setSelectedSubmitItem } from "store/slices/modalSlice";
import { SubmitAndConfirmModal } from "components/util-components/ModalItems/SubmitConfirmModal";
import DiscardButton from "components/shared-components/Buttons/DiscardButton";
import { UploadOutlined } from "@ant-design/icons";

const { Option } = Select;

const VenueFormFields = ({ mode }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    coordinates,
    loading,
    error,
    responseData,
    responseMessage,
    selectedPlace,
  } = useSelector((state) => state.locations);

  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);
  const handlePlaceSelect = (id) => {
    dispatch(setSelectedPlace(id));
  };
  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };
  const onFinish = async () => {
    try {
      const values = await form.validateFields();
      console.log("Form valuexxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxs:", values); 
  
      if (!selectedPlace) {
        message.error("Place ID is missing. Please select a place.");
        return;
      }
  
      // Provide default values for missing fields
      const formData = {
        ...values,
        place_id: selectedPlace,
        latitude: coordinates.lat || 0, // Use 0 if undefined
        longitude: coordinates.lng || 0, // Use 0 if undefined
        capacity: values.capacity || 0, // Ensure capacity is always a number
        indoor: values.indoor !== undefined ? values.indoor : false, // Ensure indoor is boolean
        address: values.address,
      };
  
      dispatch(setSelectedSubmitItem(formData));
  
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


            <PlaceWithCountryForm
              form={form}
              label={"Place"}
              onSelect={handlePlaceSelect}
              rules={[{ required: true, message: RulesMessageConstants.PLACE }]}
            />

            <Form.Item
              name="name"
              label="Venue"
              rules={[{ required: true, message: RulesMessageConstants.VENUE }]}
            >
              <Input placeholder="Enter the venue name" />
            </Form.Item>
            <Form.Item
              name="capacity"
              label="Capacity"
              rules={[
                { required: true, message: RulesMessageConstants.CAPACITY },
              ]}
            >
              <Input type="number" placeholder="Enter capacity" />
            </Form.Item>
            <Form.Item
              name="indoor"
              label="Indoor/Outdoor"
              FTRDESW
              rules={[
                { required: true, message: RulesMessageConstants.INDOOR },
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
            <Form.Item
            name="thumbnail_image"
            label="Thumbnail Image"
            valuePropName="fileList"
            getValueFromEvent={normFile}
  
          >
            <Upload name="thumbnail_image" listType="picture" maxCount={1} beforeUpload={() => false}>
              <Button icon={<UploadOutlined />}>Click to upload</Button>
            </Upload>
          </Form.Item>
          <Form.Item
            name="banner_images"
            label="Banner Images"
            valuePropName="fileList"
            getValueFromEvent={normFile}
   
          >
            <Upload name="banner_images" listType="picture" multiple beforeUpload={() => false}>
              <Button icon={<UploadOutlined />}>Click to upload banners</Button>
            </Upload>
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
              <DiscardButton form={form} />
              <Button type="primary" onClick={onFinish} loading={loading}>
                {mode === "ADD" ? "Add" : "Save"}
              </Button>
            </Flex>
          </Card>
        </Form>
      </Col>
      <SubmitAndConfirmModal
        responseData={responseData}
        addFunction={addVenue}
        navigationPath={`${APP_PREFIX_PATH}/venue/list`}
        responseMessage={responseMessage}
      />
    </Row>
  );
};

export default VenueFormFields;
