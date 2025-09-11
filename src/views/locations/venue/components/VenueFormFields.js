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
  Tabs,
  Checkbox,
  InputNumber,
  Rate,
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
import { APP_PREFIX_PATH, CDN_PATH } from "configs/AppConfig";
import PlaceWithCountryForm from "components/util-components/FormItems/PlaceWithCountryForm";
import { RulesMessageConstants } from "constants/RulesConstant";
import { setSelectedSubmitItem } from "store/slices/modalSlice";
import { SubmitAndConfirmModal } from "components/util-components/ModalItems/SubmitConfirmModal";
import DiscardButton from "components/shared-components/Buttons/DiscardButton";
import {
  PlusOutlined,
  UploadOutlined,
  MinusCircleOutlined,
  DesktopOutlined,
  SoundOutlined,
  SafetyOutlined,
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
import VenueTechnology from "./VenueTechnology";
import ReactQuill from "react-quill";
import TextEditor from "components/util-components/FormItems/TextEditor";

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
        description: venue.description,
        screen_tech: venue.screen_tech || [],
        audios: venue.audio || [],
        accessbility_feature: venue.accessibility || [],
        venue_add_on_services: !venue.venue_add_on_services
          ? []
          : venue.venue_add_on_services,
        banner_images: venue?.media
          ? venue?.media?.map((banner, index) => ({
            uid: `-banner-${index}`,
            name: banner?.media_url.split("/").pop(),
            status: "done",
            url: `${CDN_PATH}/${banner?.media_url}`,
          }))
          : [],

        thumbnail_image:
          venue.thumbnail_image && venue.thumbnail_image !== "images"
            ? [
              {
                uid: "-1",
                name: venue.thumbnail_image.split("/").pop(),
                status: "done",
                url: `${CDN_PATH}/${venue.thumbnail_image}`,
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

  // const onFinish = async () => {
  //   try {
  //     // Validate form fields
  //     const values = await form.validateFields();

  //     if (mode === "EDIT") {
  //       console.log("ITS AN EDITTTTTTTTTTTTT");

  //       // Prepare data for edit mode
  //       const data = {
  //         ...values,
  //         place_id: selectedPlace ?? venue.place?.id,
  //         latitude: coordinates.lat || 0,
  //         longitude: coordinates.lng || 0,
  //         capacity: values.capacity || 0,
  //         indoor: values.indoor !== undefined ? values.indoor : false,
  //         address: values.address,
  //         description: values.description,
  //         audios: !values.audios ? [] : values.audios,
  //         screen_tech: !values.screen_tech ? [] : values.screen_tech,
  //         accessbility_feature: !values.accessbility_feature
  //           ? []
  //           : values.accessbility_feature,
  //         venue_add_on_services: !values.venue_add_on_services
  //           ? []
  //           : values.venue_add_on_services,
  //         id: venue.id,
  //       };

  //       // Validate place
  //       const resultAction = await dispatch(
  //         validatePlace(selectedPlace ?? venue.place?.id)
  //       );

  //       if (validatePlace.fulfilled.match(resultAction)) {
  //         const response = resultAction.payload;
  //         if (response.message === "warning") {
  //           dispatch(setPlaceValidationDialogVisible(true));
  //         } else if (response.data && response.data[0]?.validation_status) {
  //           const editResultAction = await dispatch(
  //             editVenue({ data, action: ActionType.WARNING })
  //           );

  //           if (editVenue.fulfilled.match(editResultAction)) {
  //             dispatch(setSelectedVenue(data));
  //             dispatch(setLocationDialogVisible(true));
  //           } else if (editVenue.rejected.match(editResultAction)) {
  //             // Handle API validation errors
  //             const error = editResultAction.error;
  //             if (error.message) {
  //               message.error(error.message); // Show error message to the user
  //             }
  //           }
  //         }
  //       }
  //     } else {
  //       console.log("Form values:", values);

  //       if (!selectedPlace) {
  //         message.error("Place ID is missing. Please select a place.");
  //         return;
  //       }

  //       // Prepare data for add mode
  //       const formData = {
  //         ...values,
  //         place_id: selectedPlace,
  //         latitude: coordinates.lat || 0,
  //         longitude: coordinates.lng || 0,
  //         capacity: values.capacity || 0,
  //         indoor: values.indoor !== undefined ? values.indoor : false,
  //         address: values.address,
  //         description: values.description,
  //         audios: !values.audios ? [] : values.audios,
  //         screen_tech: !values.screen_tech ? [] : values.screen_tech,
  //         accessbility_feature: !values.accessbility_feature
  //           ? []
  //           : values.accessbility_feature,
  //         venue_add_on_services: !values.venue_add_on_services
  //           ? []
  //           : values.venue_add_on_services,
  //       };

  //       // Validate place
  //       const resultAction = await dispatch(validatePlace(selectedPlace));

  //       if (validatePlace.fulfilled.match(resultAction)) {
  //         const response = resultAction.payload;
  //         if (response.message === "warning") {
  //           dispatch(setPlaceValidationDialogVisible(true));
  //         } else if (response.data && response.data[0]?.validation_status) {
  //           dispatch(setSelectedSubmitItem(formData));
  //         }
  //       } else if (validatePlace.rejected.match(resultAction)) {
  //         // Handle API validation errors
  //         const error = resultAction.error;
  //         if (error.message) {
  //           message.error(error.message); // Show error message to the user
  //         }
  //       }
  //     }
  //   } catch (errorInfo) {
  //     console.error("Validation Failed:", errorInfo);

  //     // Handle form validation errors
  //     if (errorInfo.errorFields) {
  //       message.error(`Please fill all the required fields`);
  //       errorInfo.errorFields.forEach((field) => {
  //         // message.error(`${field.name.join(".")}: ${field.errors.join(", ")}`);
  //         // message.error(`Fill all the required fields`);
  //       });
  //     } else {
  //       message.error("An unexpected error occurred. Please try again.");
  //     }
  //   }
  // };

  //test

  const onFinish = async () => {
    try {
      const values = await form.validateFields();

      // Clean and sanitize add-on services
      const cleanedAddOnServices = Array.isArray(values.venue_add_on_services)
        ? values.venue_add_on_services.map((item) => ({
          title: item.title?.trim(),
          services: Array.isArray(item.services) ? item.services : [],
        }))
        : [];

      // Shared base data
      const baseData = {
        ...values,
        latitude: coordinates.lat || 0,
        longitude: coordinates.lng || 0,
        capacity: values.capacity || 0,
        indoor: values.indoor !== undefined ? values.indoor : false,
        address: values.address,
        description: values.description,
        venue_add_on_services: cleanedAddOnServices,
      };

      if (mode === "EDIT") {
        const data = {
          ...baseData,
          place_id: selectedPlace ?? venue.place?.id,
          id: venue?.id,
        };
        console.log(data, 'data');

        const resultAction = await dispatch(validatePlace(data.place_id));
        if (validatePlace.fulfilled.match(resultAction)) {
          const response = resultAction.payload;
          if (response.message === "warning") {
            dispatch(setPlaceValidationDialogVisible(true));
          } else if (response.data && response.data[0]?.validation_status) {
            const editResultAction = await dispatch(
              editVenue({ data, action: ActionType.WARNING })
            );

            if (editVenue.fulfilled.match(editResultAction)) {
              dispatch(setSelectedVenue(data));
              dispatch(setLocationDialogVisible(true));
            } else {
              message.error(editResultAction.error?.message || "Edit failed.");
            }
          }
        }
      } else {
        // ADD MODE
        if (!selectedPlace) {
          message.error("Place ID is missing. Please select a place.");
          return;
        }

        const formData = {
          ...baseData,
          place_id: selectedPlace,
        };
        console.log("Form values:", formData);

        const resultAction = await dispatch(validatePlace(selectedPlace));

        if (validatePlace.fulfilled.match(resultAction)) {
          const response = resultAction.payload;
          if (response.message === "warning") {
            dispatch(setPlaceValidationDialogVisible(true));
          } else if (response.data && response.data[0]?.validation_status) {
            dispatch(setSelectedSubmitItem(formData));
          }
        } else if (validatePlace.rejected.match(resultAction)) {
          const error = resultAction.error;
          if (error.message) {
            message.error(error.message);
          }
        }
      }
    } catch (errorInfo) {
      console.error("Validation Failed:", errorInfo);

      if (errorInfo.errorFields) {
        console.log(`Please fill all the required fields`);
      } else {
        console.log("An unexpected error occurred. Please try again.");
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
              <Input placeholder="Enter the venue name." />
            </Form.Item>
            <Form.Item
              name="address"
              label="Address"
              rules={[{ required: true, message: "Please enter the address" }]}
            >
              <Input placeholder="Enter the address" />
            </Form.Item>
            <Row gutter={5}>
              <Col xs={24} sm={12}>
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
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="indoor"
                  label="Indoor/Outdoor"
                  rules={[
                    { required: true, message: RulesMessageConstants.INDOOR },
                  ]}
                >
                  <Select className="w-100" placeholder="Select type">
                    <Option value={true}>Indoor</Option>
                    <Option value={false}>Outdoor</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) =>
                prevValues.indoor !== currentValues.indoor
              }
            >
            </Form.Item>
            <Form.Item
              name="description"
              label="Description"
              rules={[
                { required: true, message: RulesMessageConstants.DESCRIPTION },
              ]}
            >
              <TextEditor />
              {/* <Input.TextArea rows={4} placeholder="Enter venue description" /> */}
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

          {/* Rest of the form remains the same */}
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
                        >
                          <Input placeholder="Enter title" />
                        </Form.Item>

                        <Form.List name={[name, "services"]}>
                          {(
                            serviceFields,
                            { add: addService, remove: removeService }
                          ) => (
                            <>
                              <Row gutter={16}>
                                {serviceFields.map(
                                  ({
                                    key: serviceKey,
                                    name: serviceName,
                                    ...serviceRestField
                                  }) => (
                                    <Col span={12} key={serviceKey}>
                                      <Space
                                        style={{
                                          display: "flex",
                                          marginBottom: 8,
                                        }}
                                        align="baseline"
                                      >
                                        <Form.Item
                                          {...serviceRestField}
                                          name={[serviceName]}
                                          style={{ width: "100%" }}
                                        >
                                          <Input placeholder="Enter service" />
                                        </Form.Item>
                                        <MinusCircleOutlined
                                          onClick={() =>
                                            removeService(serviceName)
                                          }
                                        />
                                      </Space>
                                    </Col>
                                  )
                                )}
                              </Row>
                              <Row gutter={16}>
                                <Col span={12}>
                                  <Button
                                    type="dashed"
                                    onClick={() => addService("")}
                                    block
                                    icon={<PlusOutlined />}
                                  >
                                    Add Service
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
                        onClick={() => add({ title: "", services: [] })}
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
