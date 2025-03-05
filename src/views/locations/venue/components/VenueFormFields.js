import React, { useEffect } from "react";
import {
  Input,
  Row,
  Col,
  Card,
  Form,
  Select,
  Button,
  Space,
  message,
  Upload,
  Typography,
} from "antd";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {
  addVenue,
  setSelectedPlace,
  editVenue,
  setSelectedVenue,
  setLocationDialogVisible,
  setPlaceValidationDialogVisible,
  setLocationModalLoading,
  validatePlace,
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
import {
  PlusOutlined,
  UploadOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons";
import {
  SupportImageFormat,
  SupportFormatContent,
  ResolutionByServices,
  ThumbnailImageResolutions,
} from "constants/SupportFileConstants";
import Utils from "utils/index";
import LoadingOverlay from "components/util-components/Loader/index";
import { EditWarningAlert } from "components/util-components/EditWarningComponent/index";
import { ActionType } from "utils/api/warning-submit-util";
import WarningModal from "components/util-components/ModalItems/WarningModal";
import ValidationModal from "components/util-components/ModalItems/ValidationModal";
import ResizedImgePicker from "components/util-components/Image/ResizedImgePicker";

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
    warningPagination,
    ValidateData,
    validationStatus,
    placeValidationDialogVisible,
    message: warningMessage,
    message,
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

        thumbnail_image:
          venue.thumbnail_image && venue.thumbnail_image !== "images"
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
    return e?.fileList || [];
  };

  const handleBeforeUpload = Utils.handleBeforeUpload;
  const onFinish = async () => {
    const values = await form.validateFields();

    if (mode === "EDIT") {
      console.log("ITS AN EDITTTTTTTTTTTTT");

      // If placeId exists, it's an edit (Edit mode)
      const data = {
        ...values,
        place_id: selectedPlace ?? venue.place?.id,
        latitude: coordinates.lat || 0,
        longitude: coordinates.lng || 0,
        capacity: values.capacity || 0,
        indoor: values.indoor !== undefined ? values.indoor : false,
        address: values.address,
        description: values.description,
        venue_add_on_services: values.venue_add_on_services,
        id: venue.id,
      };
      console.log("Edit Data:", data);

      const resultAction = await dispatch(
        validatePlace(selectedPlace ?? venue.place?.id)
      );

      if (validatePlace.fulfilled.match(resultAction)) {
        const response = resultAction.payload;
        if (response.message === "warning") {
          dispatch(setPlaceValidationDialogVisible(true));
        } else if (response.data && response.data[0]?.validation_status) {
          const resultAction = await dispatch(
            editVenue({ data, action: ActionType.WARNING })
          );

          if (editVenue.fulfilled.match(resultAction)) {
            dispatch(setSelectedVenue(data));
            dispatch(setLocationDialogVisible(true));
          }
        }
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
          description: values.description,
          venue_add_on_services: values.venue_add_on_services,
        };

        const resultAction = await dispatch(validatePlace(selectedPlace));

        if (validatePlace.fulfilled.match(resultAction)) {
          const response = resultAction.payload;
          if (response.message === "warning") {
            dispatch(setPlaceValidationDialogVisible(true));
          } else if (response.data && response.data[0]?.validation_status) {
            dispatch(setSelectedSubmitItem(formData));
          }
        }
        // dispatch(setSelectedSubmitItem(formData));
      } catch (errorInfo) {
        console.error("Validation Failed:", errorInfo);
      }
    }
  };
  const handleWarningPagination = (page, size) => {
    console.log("------------------------");

    console.log("CHANIGN...........");

    dispatch(
      editVenue({
        data: selectedVenue,
        action: ActionType.WARNING,
        pageData: { page: page, size: size },
      })
    );
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

  const handleValidationModalCancel = () => {
    dispatch(setPlaceValidationDialogVisible(false));
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
              <Input
                type="number"
                placeholder="Enter capacity"
                onWheel={(e) => e.target.blur()}
              />
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
             // rules={rules.description}
            >
              <Input.TextArea
                rows={4}
                placeholder="Enter venue description"
              />
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
              valuePropName="value"
              getValueFromEvent={normFile}
              style={{ marginBottom: "0px", padding: "0px" }}
            >
              <ResizedImgePicker
                maxCount={1}
                targetResolution={ThumbnailImageResolutions.VENUE}
                form={form}
              />
            </Form.Item>

            <Text
              type="warning"
              style={{ padding: "00px 00px", fontSize: "11px" }}
            >
              {SupportFormatContent.join(",")}: {SupportImageFormat.join(", ")}{" "}
              &{" resolution "}
              {ResolutionByServices.venue} pixels.{" "}
            </Text>
            <Form.Item
              name="banner_images"
              label="Banner Images"
              valuePropName="value"
              getValueFromEvent={normFile}
              style={{ marginBottom: "0px", padding: "0px" }}
            >
              <ResizedImgePicker
                maxCount={20}
                targetResolution={ThumbnailImageResolutions.PLACE}
                form={form}
              />
            </Form.Item>
            <Text
              type="warning"
              style={{ padding: "00px 00px", fontSize: "11px" }}
            >
              {SupportFormatContent.join(",")}: {SupportImageFormat.join(", ")}{" "}
              &{" resolution "}
              {ResolutionByServices.place} pixels.{" "}
            </Text>
            </Card>
            <Card>
                      <Form.Item name="venue_add_on_services" label="Add on Services">
                        <Form.List name="venue_add_on_services">
                          {(fields, { add, remove }) => (
                            <>
                              {fields.map(({ key, name, ...restField }) => (
                                <div key={key}>
                                  <Form.Item
                                    {...restField}
                                    name={[name, "title"]}
                                    label="Title"
                                    //rules={[{ required: true, message: "Title is required" }]}
                                  >
                                    <Input placeholder="Enter title" />
                                  </Form.Item>
            
                                  <Form.List name={[name, "add"]}>
                                    {(priceFields, { add: addPrice, remove: removePrice }) => (
                                      <>
                                        <Row gutter={16}>
                                          {priceFields.map(({ key: priceKey, name: priceName, ...priceRestField }) => (
                                            <Col span={12} key={priceKey}>
                                              <Space style={{ display: "flex", marginBottom: 8 }} align="baseline">
                                                <Form.Item
                                                  {...priceRestField}
                                                  name={[priceName]}
                                                  //rules={[{ required: false, message: "Price include is required" }]}
                                                  style={{ width: "100%" }}
                                                >
                                                  <Input placeholder="Price Included" />
                                                </Form.Item>
                                                <MinusCircleOutlined onClick={() => removePrice(priceName)} />
                                              </Space>
                                            </Col>
                                          ))}
                                        </Row>
                                        <Row gutter={16}>
                                          <Col span={12}>
                                            <Button
                                              type="dashed"
                                              onClick={() => addPrice("")} // Add an empty string to the array
                                              block
                                              icon={<PlusOutlined />}
                                            >
                                              Add Price Included
                                            </Button>
                                          </Col>
                                          <Col span={12}>
                                            <Button
                                              type="dashed"
                                              danger
                                              onClick={() => remove(name)}
                                              block
                                              icon={<MinusCircleOutlined />}
                                            >
                                              Remove Title Section
                                            </Button>
                                          </Col>
                                        </Row>
                                      </>
                                    )}
                                  </Form.List>
                                </div>
                              ))}
                              <Form.Item style={{ marginTop: "16px" }}>
                                <Button
                                  type="dashed"
                                  onClick={() => add({ title: "", add: [] })}
                                  block
                                  icon={<PlusOutlined />}
                                >
                                  Add Title Section
                                </Button>
                              </Form.Item>
                            </>
                          )}
                        </Form.List>
                      </Form.Item>
                    </Card>
            

            <Card>

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

      <ValidationModal
        visible={placeValidationDialogVisible}
        data={ValidateData?.errors}
        statusMessage={message}
        onClose={handleValidationModalCancel}
      />
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
        loading={loading}
        tableConfig={{
          title: "Active Schedules",
          dataKey: "items",
        }}
        editable_status={editable_status}
        pagination={warningPagination}
        onPaginationChange={handleWarningPagination}
      />
      <LoadingOverlay loading={loading} />
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
