import React, { useEffect, useState } from "react";
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
  Typography,
  InputNumber,
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
  makeChangeVenue,
} from "store/slices/locationSlice";
import { useDispatch, useSelector } from "react-redux";
import Flex from "components/shared-components/Flex";
import { APP_PREFIX_PATH, CDN_PATH } from "configs/AppConfig";
import PlaceWithCountryForm from "components/util-components/FormItems/PlaceWithCountryForm";
import { RulesMessageConstants } from "constants/RulesConstant";
import {
  setSelectedSubmitItem,
  setOriginalFiles,
} from "store/slices/modalSlice";
import DiscardButton from "components/shared-components/Buttons/DiscardButton";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";
import {
  SupportImageFormat,
  SupportFormatContent,
  ResolutionByServices,
  ThumbnailImageResolutions,
} from "constants/SupportFileConstants";
import LoadingOverlay from "components/util-components/Loader/index";
import { EditWarningAlert } from "components/util-components/EditWarningComponent/index";
import { ActionType } from "utils/api/warning-submit-util";
import WarningModal from "components/util-components/ModalItems/WarningModal";
import ValidationModal from "components/util-components/ModalItems/ValidationModal";
import TextEditor from "components/util-components/FormItems/TextEditor";
import DraftSystem from "drafts/components/DraftSystem";
import { UPLOAD_FIELD_CONFIGS, extractFileObjects } from "utils/s3UploadUtil";
import useS3ImageDelete from "utils/hooks/useS3ImageDelete";
import ResizedMediaPicker from "components/util-components/Image/ResizedImgePicker";
import {
  setComment,
  setCommentModalVisibility,
} from "store/slices/EventOrganizerSlice";
import { isOrganizer } from "configs/UserAccessConfig";
import CommentShowModal from "components/util-components/ModalItems/CommentShowModal";
import LocationMarker from "./LocationMarker";
import { SubmitAndConfirmModal } from "components/util-components/ModalItems/SubmitConfirmModal";

const { Option } = Select;
const { Text } = Typography;

const VenueFormFields = ({ mode, venue, isMakeChanges }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [isUploading, setIsUploading] = useState(false);

  const { handleDeleteImage, deletingImages } = useS3ImageDelete("venue");

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
    placeValidationDialogVisible,
    message: warningMessage,
  } = useSelector((state) => state.locations);

  const {
    isCommentModalVisible,
    comment,
    actionType,
    loading: organizerLoading,
  } = useSelector((state) => state.organizerUpdates);

  useEffect(() => {
    if (venue && mode === "EDIT") {
      const thumbnailFile =
        venue.thumbnail_image && venue.thumbnail_image !== "images"
          ? [
              {
                uid: "thumbnail-1",
                name: venue.thumbnail_image.split("/").pop(),
                status: "done",
                url: `${CDN_PATH}/${venue.thumbnail_image}`,
                id: null,
                type: "image",
              },
            ]
          : [];
      const bannerFiles = venue?.media
        ? venue.media.map((media) => ({
            uid: `banner-${media.id}`,
            name: media.media_url.split("/").pop(),
            status: "done",
            url: `${CDN_PATH}/${media.media_url}`,
            thumbUrl: media.thumbnail_url
              ? `${CDN_PATH}/${media.thumbnail_url}`
              : undefined,
            id: media.id,
            type: media.media_type || "image",
            mediaType: media.media_type,
            caption: media.caption,
          }))
        : [];
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
        banner_images: bannerFiles,
        thumbnail_image: thumbnailFile,
      });
    }
  }, [form, venue, mode]);

  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  const handlePlaceSelect = (id) => dispatch(setSelectedPlace(id));
  const normFile = (e) => (Array.isArray(e) ? e : e?.fileList || []);
  // Helper function to determine media type from file
  const getMediaType = (file) => {
    // If it's existing media with mediaType or media_type property, use that directly
    if (file.mediaType) {
      return file.mediaType;
    }

    if (file.media_type) {
      return file.media_type;
    }

    // If it's a new file being uploaded, check the originFileObj first (Ant Design Upload)
    if (file.originFileObj && file.originFileObj.type) {
      return file.originFileObj.type.startsWith("video/") ? "video" : "image";
    }

    // Check the type property directly
    if (file.type) {
      // If it's a MIME type string
      if (typeof file.type === "string" && file.type.includes("/")) {
        return file.type.startsWith("video/") ? "video" : "image";
      }
      // If it's already "image" or "video" string
      return file.type;
    }

    // Fallback: Check file extension
    const fileName = file.name || file.file_name || "";
    const videoExtensions = [".mp4", ".webm", ".ogg", ".mov", ".avi"];
    const isVideo = videoExtensions.some((ext) =>
      fileName.toLowerCase().endsWith(ext)
    );

    return isVideo ? "video" : "image";
  };

  const onFinish = async () => {
    try {
      const values = await form.validateFields();
      const originalFiles = extractFileObjects(values);
      dispatch(setOriginalFiles(originalFiles));
      const cleanedAddOnServices = Array.isArray(values.venue_add_on_services)
        ? values.venue_add_on_services.map((item) => ({
            title: item.title?.trim(),
            services: Array.isArray(item.services) ? item.services : [],
          }))
        : [];
      const thumbnailData = values.thumbnail_image?.[0]
        ? {
            file_name:
              values.thumbnail_image[0].name ||
              values.thumbnail_image[0].file_name ||
              null,
            media_type: "image",
          }
        : null;
      const bannerImagesData =
        values.banner_images?.map((media) => {
          const mediaType = getMediaType(media);
          return {
            id: media.id || null,
            file_name: media.name || media.file_name,
            media_type: mediaType,
          };
        }) || [];
      const baseData = {
        ...values,
        latitude: coordinates.lat || venue?.latitude || 0,
        longitude: coordinates.lng || venue?.longitude || 0,
        capacity: values.capacity || 0,
        indoor: values.indoor !== undefined ? values.indoor : false,
        address: values.address,
        description: values.description,
        venue_add_on_services: cleanedAddOnServices,
        thumbnail_image: thumbnailData,
        banner_images: bannerImagesData,
      };
      if (mode === "EDIT") {
        if (isOrganizer() && isMakeChanges) {
          dispatch(setCommentModalVisibility(true));
          return;
        }
        const data = {
          ...baseData,
          place_id: selectedPlace ?? venue.place?.id,
          id: venue?.id,
        };
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
        if (!selectedPlace) {
          message.error("Place ID is missing. Please select a place.");
          return;
        }
        const formData = {
          ...baseData,
          place_id: selectedPlace,
        };
        const resultAction = await dispatch(validatePlace(selectedPlace));
        if (validatePlace.fulfilled.match(resultAction)) {
          const response = resultAction.payload;
          if (response.message === "warning") {
            dispatch(setPlaceValidationDialogVisible(true));
            return;
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
      console.log("Validation Failed:", errorInfo);
    }
  };

  const handleSubmit = async () => {
    if (comment.trim().length === 0) {
      message.error("Please add a comment!");
      return;
    }

    const values = await form.validateFields();

    try {
      // Extract original files
      const originalFiles = extractFileObjects(values);
      dispatch(setOriginalFiles(originalFiles));

      const cleanedAddOnServices = Array.isArray(values.venue_add_on_services)
        ? values.venue_add_on_services.map((item) => ({
            title: item.title?.trim(),
            services: Array.isArray(item.services) ? item.services : [],
          }))
        : [];

      const thumbnailData = values.thumbnail_image?.[0]
        ? {
            file_name:
              values.thumbnail_image[0].name ||
              values.thumbnail_image[0].file_name ||
              null,
            media_type: "image",
          }
        : null;

      const bannerImagesData =
        values.banner_images?.map((media) => {
          const mediaType = getMediaType(media);
          return {
            id: media.id || null,
            file_name: media.name || media.file_name,
            media_type: mediaType,
          };
        }) || [];

      const editData = {
        ...values,
        latitude: coordinates.lat || venue?.latitude || 0,
        longitude: coordinates.lng || venue?.longitude || 0,
        capacity: values.capacity || 0,
        indoor: values.indoor !== undefined ? values.indoor : false,
        address: values.address,
        description: values.description,
        venue_add_on_services: cleanedAddOnServices,
        thumbnail_image: thumbnailData,
        banner_images: bannerImagesData,
        place_id: selectedPlace ?? venue.place?.id,
        id: venue?.id,
        comment,
      };

      const pageData = { venue_id: venue.id };

      console.log("Make Change Data:", editData);

      // ✅ EXACTLY LIKE TICKET: Just dispatch and let SubmitAndConfirmModal handle it
      const resultAction = await dispatch(
        makeChangeVenue({
          data: editData,
          action: ActionType.SUBMIT,
          pageData,
        })
      );

      // ✅ EXACTLY LIKE TICKET: If successful, dispatch setSelectedSubmitItem
      if (makeChangeVenue.fulfilled.match(resultAction)) {
        dispatch(setComment(""));
        dispatch(setCommentModalVisibility(false));
        dispatch(setSelectedSubmitItem(editData)); // ← This triggers SubmitAndConfirmModal
        message.success(`Update ${actionType}ed successfully`);
      } else {
        message.error("Failed to submit venue changes");
        dispatch(setComment(""));
        dispatch(setCommentModalVisibility(false));
      }
    } catch (error) {
      console.error("Failed to submit change:", error);
      message.error("Failed to submit venue changes");
    }

    dispatch(setComment(""));
    dispatch(setCommentModalVisibility(false));
  };

  const handleWarningPagination = (page, size) => {
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
            <Flex
              className="py-2"
              mobileFlex={false}
              justifyContent="space-between"
            >
              <div className="flex ">
                <DraftSystem
                  form={form}
                  formType="venue"
                  mode={mode}
                  titleField="name"
                  excludeFromDraft={["id", "created_at"]}
                  style={{ marginRight: 12, display: "inline-block" }}
                  enableAutoSave={mode !== "EDIT"}
                />
                <DiscardButton form={form} />
              </div>
              <Button
                type="primary"
                onClick={onFinish}
                loading={loading || isUploading}
              >
                {mode === "ADD" ? "Add" : "Save"}
              </Button>
            </Flex>
            <PlaceWithCountryForm
              form={form}
              label={"Place"}
              onSelect={handlePlaceSelect}
              rules={[{ required: true, message: RulesMessageConstants.PLACE }]}
              isActivePlaces={true}
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
              name="description"
              label="Description"
              rules={[
                { required: true, message: RulesMessageConstants.DESCRIPTION },
              ]}
            >
              <TextEditor />
            </Form.Item>
            <Form.Item
              name="thumbnail_image"
              label="Thumbnail Image"
              valuePropName="value"
              rules={[
                { required: true, message: "Please select thumbnail image" },
              ]}
              getValueFromEvent={normFile}
              style={{ marginBottom: "0px", padding: "0px" }}
            >
              <ResizedMediaPicker
                maxCount={1}
                targetResolution={ThumbnailImageResolutions.VENUE}
                form={form}
                onDelete={handleDeleteImage}
                deletingImages={deletingImages}
                allowVideo={false}
              />
            </Form.Item>
            <Text
              type="warning"
              style={{ padding: "00px 00px", fontSize: "11px" }}
            >
              {SupportFormatContent.join(",")}: {SupportImageFormat.join(", ")}{" "}
              & resolution {ResolutionByServices.venue} pixels.
            </Text>
            <Form.Item
              name="banner_images"
              label="Banner Media (Images & Videos)"
              valuePropName="value"
              getValueFromEvent={normFile}
              style={{ marginBottom: "0px", padding: "0px", marginTop: "16px" }}
            >
              <ResizedMediaPicker
                maxCount={20}
                targetResolution={ThumbnailImageResolutions.VENUE}
                form={form}
                onDelete={handleDeleteImage}
                deletingImages={deletingImages}
                allowVideo={true}
                maxVideoSize={100}
              />
            </Form.Item>
            <Text
              type="warning"
              style={{ padding: "00px 00px", fontSize: "11px" }}
            >
              Images: {SupportFormatContent.join(",")}:{" "}
              {SupportImageFormat.join(", ")} & resolution{" "}
              {ResolutionByServices.venue} pixels.
              <br />
              Videos: MP4, WebM, OGG formats. Max size: 100MB.
            </Text>
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
                  center={[
                    coordinates.lat || venue?.latitude || 25.2048,
                    coordinates.lng || venue?.longitude || 55.2708,
                  ]}
                  zoom={13}
                  style={{ height: "400px", width: "100%" }}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <LocationMarker form={form} />
                </MapContainer>
              </div>
            </Card>
            {mode === "EDIT" && <EditWarningAlert />}
          </Card>
        </Form>
      </Col>
      <ValidationModal
        visible={placeValidationDialogVisible}
        data={ValidateData?.errors}
        statusMessage={warningMessage}
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
        tableConfig={{ title: "Active Schedules", dataKey: "items" }}
        editable_status={editable_status}
        pagination={warningPagination}
        onPaginationChange={handleWarningPagination}
      />
      <LoadingOverlay loading={loading || isUploading} />
      <SubmitAndConfirmModal
        responseData={responseData}
        addFunction={
          mode === "EDIT"
            ? isMakeChanges
              ? makeChangeVenue 
              : editVenue
            : addVenue
        }
        navigationPath={`${APP_PREFIX_PATH}/venue/list`}
        responseMessage={responseMessage}
        mode={mode}
        form={form}
        formType={"venue"}
        setIsUploading={setIsUploading}
        uploadFieldConfigs={UPLOAD_FIELD_CONFIGS.VENUE}
        extraFieldsFromResponse={[
          "thumbnail_image_upload_url",
          "banner_images_upload_url",
        ]}
      />
      <CommentShowModal
        visible={isCommentModalVisible}
        onSubmit={handleSubmit}
        onCancel={() => dispatch(setCommentModalVisibility(false))}
        loading={organizerLoading}
        comment={comment}
        setComment={(value) => dispatch(setComment(value))}
        title={`${
          actionType?.charAt(0).toUpperCase() + actionType?.slice(1) || "Change"
        } Comment`}
        warningMessage="Please provide a reason for the update."
      />
    </Row>
  );
};

export default VenueFormFields;
