import React, { useEffect } from "react";
import { Input, Row, Col, Card, Form, Select, Button, message, Upload, Typography } from "antd";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {
  addVenue, setSelectedPlace, editVenue, setSelectedVenue, setLocationDialogVisible,
  setLocationModalLoading,
} from "store/slices/locationSlice";
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
import { SupportImageFormat, SupportFormatContent, ResolutionByServices } from "constants/SupportFileConstants";
import Utils from "utils/index"
import LoadingOverlay from "components/util-components/Loader/index";
import { EditWarningAlert } from "components/util-components/EditWarningComponent/index";
import { ActionType } from "utils/api/warning-submit-util";
import WarningModal from "components/util-components/ModalItems/WarningModal";

const { Option } = Select;
const { Text } = Typography;

const VenueFormFields = ({ mode, venue }) => {

  console.log(venue, "VENUEEEEEEEEEE FOR EDIT -------------");

  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    coordinates,
    loading,
    error,
    responseData,
    dialogVisible,
    responseMessage,
    selectedPlace,
    selectedVenue,
    modalLoading,
    editable_status,
    responseImpactData,
    message: warningMessage,
  } = useSelector((state) => state.locations);

  useEffect(() => {

    if (venue && mode === "EDIT") {
      form.setFieldsValue({
        address: venue.address,
        place: venue.place?.name,
        name: venue.name,
        capacity: venue.capacity,
        indoor: venue.indoor,
        latitude: venue.latitude,
        longitude: venue.longitude,
        banner_images: venue?.media
          ? venue?.media?.map((banner, index) => ({
            uid: `-banner-${index}`,
            name: banner?.media_url.split("/").pop(),
            status: "done",
            url: banner?.media_url,
          }))
          : [],

        thumbnail_image: venue.thumbnail_image && venue.thumbnail_image !== "images"
          ? [
            {
              uid: "-1",
              name: venue.thumbnail_image.split("/").pop(),
              status: "done",
              url: venue.thumbnail_image,
            },
          ]
          : [],
      });

    }
  }, [form, venue, mode]);

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

  const handleBeforeUpload = Utils.handleBeforeUpload;
  const onFinish = async () => {
    const values = await form.validateFields();

    if (mode === "EDIT") {
      console.log("ITS AN EDITTTTTTTTTTTTT");

      // If placeId exists, it's an edit (Edit mode)
      const data = {
        ...values,
        place_id: selectedPlace,
        latitude: coordinates.lat || 0,
        longitude: coordinates.lng || 0,
        capacity: values.capacity || 0,
        indoor: values.indoor !== undefined ? values.indoor : false,
        address: values.address,
        id: venue.id
      };
      console.log("Edit Data:", data);

      const resultAction = await dispatch(
        editVenue({ data, action: ActionType.WARNING, })
      );

      if (editVenue.fulfilled.match(resultAction)) {
        dispatch(setSelectedVenue(data));
        dispatch(setLocationDialogVisible(true));
      }



    } else {
      try {
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
    }

  };


  const handleModalSubmit = async () => {
    dispatch(setLocationModalLoading(true));
    const resultAction = await dispatch(
      editVenue({ data: selectedVenue, action: ActionType.SUBMIT })
    );
    dispatch(setLocationModalLoading(false));
    dispatch(setLocationDialogVisible(false));
    if (editVenue.fulfilled.match(resultAction)) {
      dispatch(setSelectedSubmitItem(selectedVenue));
      // antdMessage.success(`Event ${selectedPlace.name} updated successfully`);
      // form.resetFields();
      // navigate(`${APP_PREFIX_PATH}/place/list`);
    }
  };

  const handleModalCancel = () => {
    dispatch(setLocationDialogVisible(false));
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
              style={{ marginBottom: "0px", padding:"0px"}}

            >
              <Upload name="thumbnail_image" listType="picture" maxCount={1} 
              beforeUpload={(file) => Utils.handleBeforeUpload(file, ResolutionByServices.place)}
                // beforeUpload={handleBeforeUpload}
                accept={`.${SupportImageFormat.join(',.')}`}
              >
                <Button icon={<UploadOutlined />}>Click to upload</Button>
              </Upload>

            </Form.Item>
            <Text
              type="warning"
              style={{ padding: "00px 00px", fontSize: "11px" }}
            >
              {SupportFormatContent.join(",")}: {" "}
              {SupportImageFormat.join(", ")} &{" resolution "}{ResolutionByServices.place} pixels.
              {" "}
            </Text>

            <Form.Item
              name="banner_images"
              label="Banner Images"
              valuePropName="fileList"
              getValueFromEvent={normFile}
              style={{ marginBottom: "0px", padding:"0px"}}
            >
              <Upload name="banner_images" listType="picture" 
              beforeUpload={(file) => Utils.handleBeforeUpload(file, ResolutionByServices.place)}
              //beforeUpload={handleBeforeUpload}
                accept={`.${SupportImageFormat.join(',.')}`}
              >
                <Button icon={<UploadOutlined />}>Click to upload banners</Button>
              </Upload>

            </Form.Item>
            <Text
              type="warning"
              style={{ padding: "00px 00px", fontSize: "11px" }}
            >
              {SupportFormatContent.join(",")}: {" "}
              {SupportImageFormat.join(", ")} &{" resolution "}{ResolutionByServices.place} pixels.
              {" "}
            </Text>

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
          {mode === "EDIT" && <EditWarningAlert />}
        </Form>
      </Col>
      <WarningModal
        visible={dialogVisible}
        title="Confirm Action"
        details={warningMessage}
        responseData={responseImpactData}
        warningMessage="Do you want to continue?"
        onSubmit={handleModalSubmit}
        onCancel={handleModalCancel}
        confirmText="Proceed"
        cancelText="Back"
        loading={modalLoading}
        tableConfig={{
          title: "Active Schedules",
          dataKey: "active_schedules"
        }}
        editable_status={editable_status}
      />
      <LoadingOverlay 
        loading={loading} 
      />
      <SubmitAndConfirmModal
        responseData={responseData}
        addFunction={mode === "EDIT" ? editVenue : addVenue}
        navigationPath={`${APP_PREFIX_PATH}/venue/list`}
        responseMessage={responseMessage}
      />
    </Row>
  );
};

export default VenueFormFields;
