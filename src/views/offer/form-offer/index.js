import React, { useEffect, useState } from "react";
import PageHeaderAlt from "components/layout-components/PageHeaderAlt";
import { Tabs, Form, Button, message } from "antd";
import Flex from "components/shared-components/Flex";
import OfferFormFields from "../components/OfferFormFields";
import { useDispatch, useSelector } from "react-redux";
import {
  addOffer,
  setIsDateRequired,
  editOffer,
  setSelectedOffer,
  setOfferDialogVisible,
  setOfferModalLoading,
} from "store/slices/offerSlice";
import { useNavigate } from "react-router-dom";
import { APP_PREFIX_PATH, CDN_PATH } from "configs/AppConfig";
import moment from "moment/moment";
import dayjs from "dayjs";
import { SubmitAndConfirmModal } from "components/util-components/ModalItems/SubmitConfirmModal";
import {
  setSelectedSubmitItem,
  setOriginalFiles,
} from "store/slices/modalSlice";
import DiscardButton from "components/shared-components/Buttons/DiscardButton";
import Utils from "utils";
import { ActionType } from "utils/api/warning-submit-util";
import LoadingOverlay from "components/util-components/Loader/index";
import WarningModal from "components/util-components/ModalItems/WarningModal";
import CommentShowModal from "components/util-components/ModalItems/CommentShowModal";
import {
  makeChangeOffer,
  setComment,
  setCommentModalVisibility,
} from "store/slices/EventOrganizerSlice";
import { isOrganizer } from "configs/UserAccessConfig";
import { ADD, EDIT } from "constants/AppConstants";
import { extractFileObjects, UPLOAD_FIELD_CONFIGS } from "utils/s3UploadUtil";

const OfferForm = ({ mode, offer, type, isMakeChange }) => {
  const {
    loading,
    error,
    isDateRequired,
    responseData,
    responseMessage,
    dialogVisible,
    editable_status,
    selectedOffer,
    responseImpactData,
    warningPagination,
    submitPagination,
    message: warningMessage,
    availableOfferDays,
    modalLoading,
  } = useSelector((state) => state.offers);

  const {
    singleOrganizerUpdate,
    loading: organizerLoading,
    isCommentModalVisible,
    comment,
    actionType,
    responseDataEvent,
    responseMessageEvent,
    organizerUpdateResponseData,
  } = useSelector((state) => state.organizerUpdates);

  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    dispatch(setIsDateRequired(false));
    if (error) {
      console.error(error);
      message.error(error);
    }
  }, [error]);

  useEffect(() => {
    dispatch(setIsDateRequired(false));
    if (offer && mode === EDIT && availableOfferDays.length > 0) {
      // Extract day names from mapped_offer_weekdays
      const applicableDayNames =
        offer.weekday_associations?.map((day) => {
          return day.weekday.toUpperCase();
        }) || [];

      // ✅ Map thumbnail with proper structure for edit mode
      const thumbnailFile =
        offer.thumbnail_image && offer.thumbnail_image !== "images"
          ? [
              {
                uid: "thumbnail-1",
                name: offer.thumbnail_image.split("/").pop(),
                status: "done",
                url: `${CDN_PATH}/${offer.thumbnail_image}`,
                id: null,
              },
            ]
          : [];

      const formData = {
        name: offer.name,
        theatre_ids: offer.theatre_ids?.map((item) => item) || [],
        discount_percentage_amount: offer.discount_percentage_amount,
        is_percentage: offer.is_percentage,
        max_uses: offer.max_uses,
        date_required: offer.date_required,
        key_words: offer.key_words || [],
        applicable_days: applicableDayNames,
        thumbnail_image: thumbnailFile,
        event_ids: offer.event_ids || [],
      };

      if (offer.date_required && offer.start_date && offer.end_date) {
        formData.start_date = dayjs(offer.start_date);
        formData.end_date = dayjs(offer.end_date);
      }

      console.log("Final Form Data:", formData);
      form.setFieldsValue(formData);

      // Force re-render after a small delay
      setTimeout(() => {
        form.setFieldsValue({ applicable_days: applicableDayNames });
      }, 100);
    }

    dispatch(setIsDateRequired(offer?.date_required));
  }, [form, offer, availableOfferDays]);

  const onFinish = async () => {
    const values = await form.validateFields();
    console.log("Form Values on Submit:", values);

    try {
      // ✅ Extract original file objects for S3 upload FIRST
      const originalFiles = extractFileObjects(values);

      // ✅ Store original files in Redux
      dispatch(setOriginalFiles(originalFiles));

      // Format dates if required
      if (isDateRequired) {
        values.start_date = Utils.formatDate(values.start_date);
        values.end_date = Utils.formatDate(values.end_date);
      }

      values.key_words = values.key_words ?? [];
      values.date_required = values.date_required ?? isDateRequired;
      values.applicable_days = values.applicable_days || [];

      // Map the applicable days to full weekday objects
      values.mapped_offer_weekdays =
        availableOfferDays?.filter((day) => {
          const dayName = day.full_name.toUpperCase();
          return values.applicable_days?.includes(dayName);
        }) ?? [];

      if (mode === EDIT) {
        if (isOrganizer() && isMakeChange) {
          dispatch(setCommentModalVisibility(true));
          return;
        }

        // ✅ Transform thumbnail image for edit mode
        let thumbnailData = null;

        if (values.thumbnail_image && Array.isArray(values.thumbnail_image)) {
          const thumbnailFile = values.thumbnail_image[0];

          // Check if it's a new file (has originFileObj)
          if (thumbnailFile && thumbnailFile.originFileObj) {
            thumbnailData = {
              file_name: thumbnailFile.name || thumbnailFile.originFileObj.name,
              media_type: "image",
            };
          }
          // If it's an existing file (has url but no originFileObj), don't send it
          // The backend will keep the existing image
        }

        const editData = {
          ...values,
          id: offer.id,
          thumbnail_image: thumbnailData,
        };

        const pageData = {
          offer_id: offer.id,
        };

        console.log("Edit Data:", editData);

        const resultAction = await dispatch(
          editOffer({ data: editData, action: ActionType.WARNING, pageData })
        );

        if (editOffer.fulfilled.match(resultAction)) {
          dispatch(setSelectedOffer(editData));
          dispatch(setOfferDialogVisible(true));
        }
      } else {
        // ✅ ADD mode - transform data for submission
        let thumbnailData = null;

        if (values.thumbnail_image && Array.isArray(values.thumbnail_image)) {
          const thumbnailFile = values.thumbnail_image[0];

          if (thumbnailFile) {
            thumbnailData = {
              file_name:
                thumbnailFile.name || thumbnailFile.originFileObj?.name || null,
              media_type: "image",
            };
          }
        }

        const formData = {
          ...values,
          thumbnail_image: thumbnailData,
        };

        console.log("Add Data:", formData);
        dispatch(setSelectedSubmitItem(formData));
      }
    } catch (info) {
      console.error("Validation Failed:", info);
      message.error("Please enter all required fields.");
    }
  };

  const handleWarningPagination = (page, size) => {
    console.log("Pagination Change:", page, size);

    dispatch(
      editOffer({
        data: selectedOffer,
        action: ActionType.WARNING,
        pageData: { page: page, size: size },
      })
    );
  };

  const handleModalSubmit = async () => {
    dispatch(setOfferModalLoading(true));
    const resultAction = await dispatch(
      editOffer({ data: selectedOffer, action: ActionType.SUBMIT })
    );
    dispatch(setOfferModalLoading(false));
    dispatch(setOfferDialogVisible(false));

    if (editOffer.fulfilled.match(resultAction)) {
      dispatch(setSelectedSubmitItem(selectedOffer));
    }
  };

  const handleModalCancel = () => {
    dispatch(setOfferDialogVisible(false));
  };

  const handleSubmit = async () => {
    if (comment.trim().length === 0) {
      message.error("Please add a comment!");
      return;
    }

    const values = await form.validateFields();

    // Extract original file objects
    const originalFiles = extractFileObjects(values);
    dispatch(setOriginalFiles(originalFiles));

    // Format dates if required
    if (isDateRequired) {
      values.start_date = Utils.formatDate(values.start_date);
      values.end_date = Utils.formatDate(values.end_date);
    }

    values.key_words = values.key_words ?? [];
    values.date_required = values.date_required ?? isDateRequired;
    values.applicable_days = values.applicable_days || [];

    // Map the applicable days
    values.mapped_offer_weekdays =
      availableOfferDays?.filter((day) => {
        const dayName = day.full_name.toUpperCase();
        return values.applicable_days?.includes(dayName);
      }) ?? [];

    const editData = {
      ...values,
      id: offer.id,
      offer_id: offer.id,
      thumbnail_image: {
        file_name:
          values.thumbnail_image?.[0]?.name ||
          values.thumbnail_image?.[0]?.file_name ||
          null,
        media_type: "image",
      },
    };

    try {
      dispatch(setComment(""));
      dispatch(setCommentModalVisibility(false));
      dispatch(setSelectedSubmitItem(editData));
    } catch (error) {
      message.error(`Failed to ${actionType} the update`);
    }

    dispatch(setComment(""));
    dispatch(setCommentModalVisibility(false));
  };

  return (
    <>
      <Form
        layout="vertical"
        form={form}
        name="advanced_search"
        className="ant-advanced-search-form"
        initialValues={{
          heightUnit: "cm",
          widthUnit: "cm",
          weightUnit: "kg",
          applicable_days: [],
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
              <h2 className="mb-3">
                {mode === ADD ? "Add New Offer" : `Edit Offer`}{" "}
              </h2>
              <div className="mb-3">
                <DiscardButton form={form} />
                <Button
                  type="primary"
                  onClick={() => onFinish()}
                  htmlType="submit"
                  loading={loading || isUploading}
                >
                  {mode === ADD ? "Add" : `Save`}
                </Button>
              </div>
            </Flex>
          </div>
        </PageHeaderAlt>
        <div className="container">
          <Tabs
            defaultActiveKey="1"
            style={{ marginTop: 30 }}
            items={[
              {
                label: "General",
                key: "1",
                children: <OfferFormFields type={type} />,
              },
            ]}
          />
        </div>
      </Form>

      <LoadingOverlay loading={loading || isUploading} />

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
          dataKey: "items",
        }}
        editable_status={editable_status}
        pagination={warningPagination}
        onPaginationChange={handleWarningPagination}
      />

      {/* ✅ Added setIsUploading and uploadFieldConfigs */}
      <SubmitAndConfirmModal
        responseData={responseData || organizerUpdateResponseData}
        addFunction={
          mode === EDIT
            ? isMakeChange
              ? makeChangeOffer
              : editOffer
            : addOffer
        }
        navigationPath={`${APP_PREFIX_PATH}/offer/list/${type}`}
        responseMessage={responseMessage}
        pagination={submitPagination}
        mode={mode}
        form={form}
        additionalParams={{
          offer_id: offer?.id,
        }}
        formType={"offer"}
        setIsUploading={setIsUploading}
        uploadFieldConfigs={UPLOAD_FIELD_CONFIGS.OFFER}
        extraFieldsFromResponse={["thumbnail_image_upload_url"]}
      />

      <CommentShowModal
        visible={isCommentModalVisible}
        onSubmit={handleSubmit}
        onCancel={() => dispatch(setCommentModalVisibility(false))}
        loading={organizerLoading}
        comment={comment}
        setComment={(value) => dispatch(setComment(value))}
        title={`${
          actionType.charAt(0).toUpperCase() + actionType.slice(1)
        } Comment`}
        warningMessage={`Please provide a reason for the update.`}
      />
    </>
  );
};

export default OfferForm;
