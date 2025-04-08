import React, { useEffect, useState } from "react";
import {
  Input,
  Row,
  Col,
  Card,
  Form,
  Button,
  Select,
  message,
  message as antdMessage,
  Upload,
  Typography,
} from "antd";
import {
  fetchAdCategories,
  validateAdCategory,
  setAdCategoryValidationDialogVisible,
} from "store/slices/adCategorySlice";
import ValidationModal from "components/util-components/ModalItems/ValidationModal";
import {
  createAdBanner,
  updateAdBanner,
  setSelectedAdBanner,
  setAdBannerDialogVisible,
  setAdBannerModalLoading,
} from "store/slices/advertisementSlice";
import { getPlaces } from "store/slices/locationSlice";
import { fetchEventOnPlaces, fetchEventType } from "store/slices/eventSlice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ActionType } from "utils/api/warning-submit-util";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import { setSelectedSubmitItem } from "store/slices/modalSlice";
import { SubmitAndConfirmModal } from "components/util-components/ModalItems/SubmitConfirmModal";
import DiscardButton from "components/shared-components/Buttons/DiscardButton";
import { UploadOutlined } from "@ant-design/icons";
import WarningModal from "components/util-components/ModalItems/WarningModal";
import LoadingOverlay from "components/util-components/Loader/index";
import {
  SupportImageFormat,
  SupportFormatContent,
  parseSizeToBytes,
} from "constants/SupportFileConstants";
import Utils from "utils/index";
import { filterOption } from "components/util-components/FormItems/dropDownSearch";

const { Option } = Select;
const ADD = "ADD";
const EDIT = "EDIT";
const { Text } = Typography;

const rules = {
  name: [{ required: true, message: "Please enter category name" }],
  category: [{ required: true, message: "Please choose country" }],
  event: [{ required: false, message: "Please choose event" }],
  place: [{ required: false, message: "Please choose place" }],
  thumbnail_image: [
    { required: true, message: "Please choose a banner image" },
  ],
  description: [
    { required: true, message: "Please enter category description" },
  ],
};

const AdBannerFormFields = ({ mode, banner }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);

  const { eventType } = useSelector((state) => state.event);
  const { places } = useSelector((state) => state.locations);
  const { eventOnPlaces } = useSelector((state) => state.event);
  const {
    filteredAdCategories,
    adCategoryValidationDialogVisible,
    ValidateData,
    message,
  } = useSelector((state) => state.adCategory);
  const {
    loading,
    error,
    responseData,
    responseMessage,
    dialogVisible,
    modalLoading,
    message: warningMessage,
    selectedAdBanner,
    createBannerLoading,
    warningPagination,
    responseImpactData,
    editable_status,
  } = useSelector((state) => state.advertisement);

  useEffect(() => {
    if (filteredAdCategories.length === 0) {
      dispatch(fetchAdCategories({}));
    }
    if (!eventType.length) {
      dispatch(fetchEventType({ active: true }));
    }
    if (places.length === 0) {
      dispatch(getPlaces({}));
    }
  }, [dispatch, eventType.length, filteredAdCategories.length, places.length]);

 useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

 useEffect(() => {
    if (mode === EDIT && banner) {
      const category = filteredAdCategories.find(
        (cat) => cat.id === banner.banner_category.id
      );
      setSelectedCategory(category || null);

      if (banner.place?.id) {
        setSelectedPlace(banner.place.id);
        dispatch(fetchEventOnPlaces(banner.place.id)).then(() => {
         if (banner.event?.id) {
            form.setFieldValue("event_id", banner.event.id);
          }
        });
      }

      form.setFieldsValue({
        name: banner.name,
        description: banner.description,
        ads_url: banner.ads_url,
        banner_category_id: banner.banner_category.id,
        place_id: banner.place?.id,
        event_type_id: banner.event_type?.id,
        media_path: banner.media_path
          ? [
              {
                uid: "-1",
                name: banner.media_path.split("/").pop(),
                status: "done",
                url: banner.media_path,
              },
            ]
          : [],
      });
    }
  }, [mode, banner, form, filteredAdCategories, dispatch]);

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  const handlePlaceChange = (placeId) => {
    setSelectedPlace(placeId);
    form.setFieldValue("event_id", undefined); // Clear the event when place changes

    if (placeId) {
      setEventsLoading(true);
      dispatch(fetchEventOnPlaces(placeId)).finally(() => {
        setEventsLoading(false);
      });
    }
  };

  const onFinish = async () => {
    try {
      const values = await form.validateFields();
      if (mode === ADD) {
        const resultAction = await dispatch(
          validateAdCategory(values.banner_category_id)
        );

        if (validateAdCategory.fulfilled.match(resultAction)) {
          const response = resultAction.payload;
          if (response.message === "warning") {
            dispatch(setAdCategoryValidationDialogVisible(true));
          } else if (response.data && response.data[0]?.validation_status) {
            dispatch(setSelectedSubmitItem(values));
          }
        }
      } else if (mode === EDIT) {
        const data = {
          ...values,
          id: banner.id,
        };

        const resultAction = await dispatch(
          validateAdCategory(values.banner_category_id)
        );

        if (validateAdCategory.fulfilled.match(resultAction)) {
          const response = resultAction.payload;
          if (response.message === "warning") {
            dispatch(setAdCategoryValidationDialogVisible(true));
          } else if (response.data && response.data[0]?.validation_status) {
            const updateAction = await dispatch(
              updateAdBanner({ data, action: ActionType.WARNING })
            );

            if (updateAdBanner.fulfilled.match(updateAction)) {
              dispatch(setSelectedAdBanner(data));
              dispatch(setAdBannerDialogVisible(true));
            }
          }
        }
      }
    } catch (errorInfo) {
      console.log("Validation Failed:", errorInfo);
    }
  };

  const handleWarningPagination = (page, size) => {
    dispatch(
      updateAdBanner({
        data: selectedAdBanner,
        action: ActionType.WARNING,
        pageData: { page: page, size: size },
      })
    );
  };

  const handleValidationModalCancel = () => {
    dispatch(setAdCategoryValidationDialogVisible(false));
  };

  const handleModalSubmit = async () => {
    dispatch(setAdBannerModalLoading(true));
    const resultAction = await dispatch(
      updateAdBanner({ data: selectedAdBanner, action: ActionType.SUBMIT })
    );
    dispatch(setAdBannerModalLoading(false));
    dispatch(setAdBannerDialogVisible(false));
    if (updateAdBanner.fulfilled.match(resultAction)) {
      dispatch(setSelectedSubmitItem(selectedAdBanner));
    }
  };

  const handleModalCancel = () => {
    dispatch(setAdBannerDialogVisible(false));
  };

  return (
    <Row gutter={16}>
      <Col xs={24} sm={24} md={17}>
        <Card title="Basic Info">
          <Form form={form} layout="vertical">
            <Form.Item
              name="banner_category_id"
              label="Category"
              rules={rules.category}
            >
              <Select
                className="w-100"
                placeholder="Choose a Category"
                loading={loading}
                onChange={(value) => {
                  const selected = filteredAdCategories.find(
                    (category) => category.id === value
                  );
                  setSelectedCategory(selected || null);
                }}
              >
                {filteredAdCategories && filteredAdCategories.length > 0 ? (
                  filteredAdCategories.map((category) => (
                    <Option key={category.id} value={category.id}>
                      {category.name}{" "}
                      {category.fileType ? `(${category.fileType})` : ""}
                    </Option>
                  ))
                ) : (
                  <Option disabled>No category available</Option>
                )}
              </Select>
            </Form.Item>

            <Form.Item name="event_type_id" label="Event Type (Optional)">
              <Select
                allowClear
                loading={loading}
                style={{ width: "100%" }}
                placeholder="Select event type"
              >
                {eventType.map((type) => (
                  <Option key={type.id} value={type.id}>
                    {type.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="name" label="Name" rules={rules.name}>
              <Input placeholder="Name" />
            </Form.Item>

            <Form.Item
              name="description"
              label="Description"
              rules={rules.description}
            >
              <Input placeholder="Description" />
            </Form.Item>

            <Form.Item
              name="media_path"
              label="Banner Media"
              valuePropName="fileList"
              getValueFromEvent={normFile}
              rules={rules.thumbnail_image}
              style={{ marginBottom: "0px", padding: "0px" }}
            >
              <Upload
                name="thumbnail_image"
                listType="picture"
                maxCount={1}
                beforeUpload={(file) =>
                  Utils.handleBannerBeforeUpload(
                    file,
                    selectedCategory?.resolution,
                    parseSizeToBytes(selectedCategory?.min_size),
                    parseSizeToBytes(selectedCategory?.max_size)
                  )
                }
                accept={`.${SupportImageFormat.join(",.")}`}
              >
                <Button icon={<UploadOutlined />}>Click to upload</Button>
              </Upload>
            </Form.Item>

            <Text
              type="warning"
              style={{ padding: "0px 0px", fontSize: "11px" }}
            >
              {selectedCategory
                ? `${SupportFormatContent.join(",")}: ${
                    selectedCategory.file_types?.join(", ") ||
                    SupportImageFormat.join(", ")
                  }, Resolution: ${
                    selectedCategory.resolution || "N/A"
                  }, Min size: ${
                    selectedCategory.min_size || "N/A"
                  }, Max size: ${selectedCategory.max_size || "N/A"}`
                : `${SupportFormatContent.join(",")}: ${SupportImageFormat.join(
                    ", "
                  )}`}
            </Text>

            <Form.Item
              name="ads_url"
              label="Banner Redirect Url"
              rules={rules.name}
            >
              <Input placeholder="Enter banner url" />
            </Form.Item>

            <Form.Item
              name="place_id"
              label="Place (optional)"
              rules={rules.place}
            >
              <Select
                className="w-100"
                placeholder="Choose a Place"
                loading={loading}
                showSearch
                allowClear
                filterOption={filterOption}
                onChange={handlePlaceChange}
                value={selectedPlace}
              >
                {places.map((place) => (
                  <Option key={place.id} value={place.id}>
                    {place.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {selectedPlace && (
              <Form.Item name="event_id" label="Event" rules={rules.event}>
                <Select
                  className="w-100"
                  placeholder="Choose an Event"
                  loading={eventsLoading}
                  showSearch
                  allowClear
                  filterOption={filterOption}
                >
                  {eventOnPlaces.map((event) => (
                    <Option key={event.id} value={event.id}>
                      {`${event.event_name} - ${
                        event.schedules && event.schedules.length > 0
                          ? event.schedules[0]?.name ?? ""
                          : "No Schedule"
                      }`}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: 20,
                gap: 10,
              }}
            >
              <DiscardButton form={form} />
              <Button
                type="primary"
                onClick={onFinish}
                loading={createBannerLoading}
              >
                {mode === ADD ? "Add" : "Update"}
              </Button>
            </div>
          </Form>
        </Card>
      </Col>
      <LoadingOverlay loading={createBannerLoading} />
      <ValidationModal
        visible={adCategoryValidationDialogVisible}
        data={ValidateData?.errors}
        statusMessage={message}
        onClose={handleValidationModalCancel}
      />
      <WarningModal
        visible={dialogVisible}
        title="Confirm Action"
        details={warningMessage}
        warningMessage="Do you want to continue?"
        onSubmit={handleModalSubmit}
        onCancel={handleModalCancel}
        confirmText="Proceed"
        cancelText="Back"
        loading={loading}
        responseData={responseImpactData}
        tableConfig={{
          title: "Active Schedules",
          dataKey: "items",
        }}
        editable_status={editable_status}
        pagination={warningPagination}
        onPaginationChange={handleWarningPagination}
      />

      <SubmitAndConfirmModal
        responseData={responseData}
        addFunction={mode === ADD ? createAdBanner : updateAdBanner}
        navigationPath={`${APP_PREFIX_PATH}/advertisement/banner/list`}
        responseMessage={responseMessage}
        loading={modalLoading}
      />
    </Row>
  );
};

export default AdBannerFormFields;
