import React, { useEffect, useState } from "react";
import PageHeaderAlt from "components/layout-components/PageHeaderAlt";
import { Tabs, Form, Button, message as antdMessage } from "antd";
import Flex from "components/shared-components/Flex";
import CountryFormFields from "../components/CountryFormFields";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  createPlace,
  editPlace,
  getPlaces,
  setLoading,
  setLocationDialogVisible,
  setLocationModalLoading,
  setSelectedPlace,
  getSinglePlace,
} from "store/slices/locationSlice";
import { APP_PREFIX_PATH, CDN_PATH } from "configs/AppConfig";
import { ActionType } from "utils/api/warning-submit-util";
import WarningModal from "components/util-components/ModalItems/WarningModal";
import {
  setSelectedItem,
  setSelectedSubmitItem,
  setOriginalFiles,
} from "store/slices/modalSlice";
import { SubmitAndConfirmModal } from "components/util-components/ModalItems/SubmitConfirmModal";
import DiscardButton from "components/shared-components/Buttons/DiscardButton";
import LoadingOverlay from "components/util-components/Loader/index";
import DraftSystem from "drafts/components/DraftSystem";
import { extractFileObjects, UPLOAD_FIELD_CONFIGS } from "utils/s3UploadUtil";

const CountryForm = ({ mode, placeId }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);

  const {
    loading,
    error,
    detailedCountryList,
    dialogVisible,
    responseData,
    responseMessage,
    createPlaceLoading,
    modalLoading,
    warningPagination,
    selectedPlace,
    filteredPlaces,
    responseImpactData,
    editable_status,
    singlePlace,
    message: warningMessage,
  } = useSelector((state) => state.locations);

  // Define which fields from ORIGINAL FORM DATA to include in confirmation
  const FIELDS_TO_CONFIRM = [
    "name",
    "description",
    "thumbnail_image",
    "banner_images",
    "country_id",
  ];

  // Define which fields from SUBMIT RESPONSE to include in confirmation
  const EXTRA_FIELDS_FROM_RESPONSE = [
    "thumbnail_image_upload_url",
    "banner_images_upload_url",
  ];

  useEffect(() => {
    if (placeId) {
      dispatch(getSinglePlace(placeId));
    }
  }, [dispatch, placeId]);

  useEffect(() => {
    if (singlePlace) {
      if (mode === "EDIT") {
        form.setFieldsValue({
          country_id: singlePlace.country.name,
          name: singlePlace.name,
          banner_images: singlePlace?.media
            ? singlePlace?.media?.map((banner, index) => ({
                uid: `-banner-${index}`,
                name: banner?.media_url.split("/").pop(),
                status: "done",
                url: `${CDN_PATH}/${banner?.media_url}`,
              }))
            : [],
          thumbnail_image:
            singlePlace.thumbnail_image &&
            singlePlace.thumbnail_image !== "images"
              ? [
                  {
                    uid: "-1",
                    name: singlePlace.thumbnail_image.split("/").pop(),
                    status: "done",
                    url: `${CDN_PATH}/${singlePlace.thumbnail_image}`,
                  },
                ]
              : [],
          description: singlePlace.description,
        });
      }
    }
  }, [singlePlace, form, mode]);
  // In your edit form component (where you fetch and set initial values)
  useEffect(() => {
    if (singlePlace) {
      // Map thumbnail image
      const thumbnailFile = singlePlace.thumbnail_image
        ? [
            {
              uid: "thumbnail-1",
              name: singlePlace.thumbnail_image.split("/").pop(),
              status: "done",
              url: `${CDN_PATH}/${singlePlace.thumbnail_image}`,
              id: null, // Thumbnail doesn't have id in media array
            },
          ]
        : [];

      // Map banner images from media array
      const bannerFiles = singlePlace.media
        ? singlePlace.media.map((media, index) => ({
            uid: `banner-${media.id}`,
            name: media.media_url.split("/").pop(),
            status: "done",
            url: `${CDN_PATH}/${media.media_url}`,
            id: media.id, // This is the important part - media id for deletion
            mediaType: media.media_type,
            caption: media.caption,
          }))
        : [];

      form.setFieldsValue({
        name: singlePlace.name,
        description: singlePlace.description,
        thumbnail_image: thumbnailFile,
        banner_images: bannerFiles, // Now each file has the media id
      });
    }
  }, [singlePlace, form]);

  useEffect(() => {
    if (error) {
      antdMessage.error(error);
    }
  }, [error]);

  const onFinish = async () => {
    try {
      const values = await form.validateFields();

      // Extract original file objects for later S3 upload
      const originalFiles = extractFileObjects(values);

      // Store original files in Redux for use in confirmation
      dispatch(setOriginalFiles(originalFiles));

      // Transform the data to extract file names
      const data = {
        ...values,
        thumbnail_image: {
          file_name:
            values.thumbnail_image?.[0]?.name ||
            values.thumbnail_image?.[0]?.file_name ||
            null,
          media_type: "image",
        },
        banner_images:
          values.banner_images?.map((img) => ({
            id: img.id,
            file_name: img.name || img.file_name,
            media_type: "image",
          })) || [],
      };

      if (!placeId) {
        dispatch(setSelectedSubmitItem(data));
      } else {
        const editData = {
          ...data,
          id: placeId,
        };

        const resultAction = await dispatch(
          editPlace({ data: editData, action: ActionType.WARNING })
        );

        if (editPlace.fulfilled.match(resultAction)) {
          dispatch(setSelectedPlace(editData));
          dispatch(setLocationDialogVisible(true));
        }
      }
    } catch (errorInfo) {
      console.error("Validation Failed:", errorInfo);
    }
  };

  const handleWarningPagination = (page, size) => {
    dispatch(
      editPlace({
        data: selectedPlace,
        action: ActionType.WARNING,
        pageData: { page: page, size: size },
      })
    );
  };

  const handleModalSubmit = async () => {
    dispatch(setLocationModalLoading(true));
    const resultAction = await dispatch(
      editPlace({ data: selectedPlace, action: ActionType.SUBMIT })
    );

    dispatch(setLocationModalLoading(false));
    dispatch(setLocationDialogVisible(false));

    if (editPlace.fulfilled.match(resultAction)) {
      dispatch(setSelectedSubmitItem(selectedPlace));
    }
  };

  const handleModalCancel = () => {
    dispatch(setLocationDialogVisible(false));
  };

  return (
    <>
      <Form
        layout="vertical"
        form={form}
        name="country_form"
        className="ant-advanced-search-form"
        initialValues={{
          heightUnit: "cm",
          widthUnit: "cm",
          weightUnit: "kg",
        }}
      >
        <PageHeaderAlt className="border-bottom" overlap>
          <div className="container">
            <Flex
              className="py-2"
              mobileFlex={false}
              justifyContent="space-between"
              alignItems="center"
            >
              <h2 className="mb-3 font-semibold">
                {!placeId ? "Add New Place" : `Edit Place`}
              </h2>
              <div className="mb-3 flex">
                <DraftSystem
                  form={form}
                  formType="place"
                  mode={mode}
                  titleField="name"
                  excludeFromDraft={["id", "created_at"]}
                  style={{ marginRight: 12, display: "inline-block" }}
                  enableAutoSave={mode !== "EDIT"}
                />
                <DiscardButton form={form} />
                <Button
                  type="primary"
                  onClick={onFinish}
                  htmlType="submit"
                  loading={createPlaceLoading || isUploading}
                >
                  {!placeId ? "Add" : `Save`}
                </Button>
              </div>
            </Flex>
          </div>
        </PageHeaderAlt>
        <div className="container pt-20">
          <CountryFormFields mode={mode} form={form} />
        </div>
      </Form>

      <LoadingOverlay loading={createPlaceLoading || isUploading} />

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

      <SubmitAndConfirmModal
        responseData={responseData}
        addFunction={mode === "EDIT" ? editPlace : createPlace}
        navigationPath={`${APP_PREFIX_PATH}/place/list`}
        responseMessage={responseMessage}
        mode={mode}
        form={form}
        formType={"place"}
        setIsUploading={setIsUploading}
        extraFieldsFromResponse={EXTRA_FIELDS_FROM_RESPONSE}
        uploadFieldConfigs={UPLOAD_FIELD_CONFIGS.PLACE}
      />
    </>
  );
};

export default CountryForm;
