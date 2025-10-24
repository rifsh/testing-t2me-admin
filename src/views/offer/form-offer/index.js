import React, { useEffect } from "react";
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
  makeChangeOffer,
} from "store/slices/offerSlice";
import { useNavigate } from "react-router-dom";
import { APP_PREFIX_PATH, CDN_PATH } from "configs/AppConfig";
import moment from "moment/moment";
import dayjs from "dayjs";
import { SubmitAndConfirmModal } from "components/util-components/ModalItems/SubmitConfirmModal";
import { setSelectedSubmitItem } from "store/slices/modalSlice";
import DiscardButton from "components/shared-components/Buttons/DiscardButton";
import Utils from "utils";
import { ActionType } from "utils/api/warning-submit-util";
import LoadingOverlay from "components/util-components/Loader/index";
import WarningModal from "components/util-components/ModalItems/WarningModal";
import CommentShowModal from "components/util-components/ModalItems/CommentShowModal";
import {
  setComment,
  setCommentModalVisibility,
} from "store/slices/EventOrganizerSlice";
import { isOrganizer } from "configs/UserAccessConfig";
import { EDIT } from "constants/AppConstants";

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
  } = useSelector((state) => state.organizerUpdates);

  const [form] = Form.useForm();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setIsDateRequired(false));
    if (error) {
      console.error(error);
      message.error(error);
    }
  }, [error]);

  useEffect(() => {
    if (offer && mode === EDIT && availableOfferDays.length > 0) {
      console.log("=== Setting Form Values ===");
      console.log("Offer Data:", offer);
      console.log("Available Days:", availableOfferDays);
      console.log("Mapped Offer Weekdays:", offer.mapped_offer_weekdays);

      // Extract day names from mapped_offer_weekdays
      const applicableDayNames =
        offer.mapped_offer_weekdays?.map((day) => {
          // Handle both uppercase and mixed case
          return day.full_name.toUpperCase();
        }) || [];

      console.log("Applicable Day Names:", applicableDayNames);

      const formData = {
        name: offer.name,
        theatre_ids: offer.theatre_ids?.map((item) => item) || [],
        discount_percentage_amount: offer.discount_percentage_amount,
        is_percentage: offer.is_percentage,
        max_uses: offer.max_uses,
        date_required: offer.date_required,
        key_words: offer.key_words || [],
        applicable_days: applicableDayNames,
        thumbnail_image:
          offer.thumbnail_image && offer.thumbnail_image !== "images"
            ? [
                {
                  uid: "-1",
                  name: offer.thumbnail_image.split("/").pop(),
                  status: "done",
                  url: `${CDN_PATH}/${offer.thumbnail_image}`,
                },
              ]
            : [],
      };

      if (offer.date_required && offer.start_date && offer.end_date) {
        formData.start_date = dayjs(offer.start_date);
        formData.end_date = dayjs(offer.end_date);
      }

      console.log("Final Form Data:", formData);
      form.setFieldsValue(formData);

      // Force re-render after a small delay to ensure state is updated
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

      // Handle thumbnail_image - store ORIGINAL form data separately
      let originalThumbnailImage = null;

      if (values.thumbnail_image && Array.isArray(values.thumbnail_image)) {
        if (values.thumbnail_image.length > 0) {
          const file = values.thumbnail_image[0];

          // Store the original file reference
          originalThumbnailImage = file;

          // For WARNING request, send appropriate format
          if (file.response?.path) {
            values.thumbnail_image = file.response.path;
          } else if (file.url && file.status === "done") {
            const urlPath = file.url.replace(`${CDN_PATH}/`, "");
            values.thumbnail_image = urlPath;
          } else if (file.originFileObj) {
            // For new uploads, we'll handle differently in submit
            values.thumbnail_image = "images"; // Placeholder for warning
          } else {
            delete values.thumbnail_image;
          }
        } else {
          delete values.thumbnail_image;
        }
      } else if (!values.thumbnail_image || values.thumbnail_image === null) {
        delete values.thumbnail_image;
      }

      console.log("Processed thumbnail_image:", values.thumbnail_image);
      console.log("Original thumbnail file:", originalThumbnailImage);

      if (mode === EDIT) {
        if (isOrganizer() && isMakeChange) {
          dispatch(setCommentModalVisibility(true));
          return;
        }

        const editData = {
          ...values,
          id: offer.id,
          _originalThumbnail: originalThumbnailImage, // Store original file
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
        // ADD mode
        const formData = {
          ...values,
          _originalThumbnail: originalThumbnailImage,
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
    console.warn(" entered ");
    if (editOffer.fulfilled.match(resultAction)) {
      console.warn("not entered ");
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
    try {
      // Format dates if required
      if (isDateRequired) {
        values.start_date = Utils.formatDate(values.start_date);
        values.end_date = Utils.formatDate(values.end_date);
      }

      values.key_words = values.key_words ?? [];
      values.date_required = values.date_required ?? isDateRequired;

      // Ensure applicable_days is always an array
      values.applicable_days = values.applicable_days || [];

      // Map the applicable days back to the weekday objects
      values.mapped_offer_weekdays =
        availableOfferDays?.filter((day) => {
          const dayName = day.full_name.toUpperCase();
          return values.applicable_days?.includes(dayName);
        }) ?? [];

      const editData = {
        ...values,
        id: offer.id,
      };
      const pageData = {
        offer_id: offer.id,
      };

      console.log("Make Change Data:", editData);
      const resultAction = await dispatch(
        makeChangeOffer({ data: editData, action: ActionType.SUBMIT, pageData })
      );

      if (makeChangeOffer.fulfilled.match(resultAction)) {
        dispatch(setComment(""));
        dispatch(setCommentModalVisibility(false));
        dispatch(setSelectedSubmitItem(editData));
        message.success(`Update ${actionType}ed successfully`);
      }
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
                {mode === "ADD" ? "Add New Offer" : `Edit Offer`}{" "}
              </h2>
              <div className="mb-3">
                <DiscardButton form={form} />
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
      <LoadingOverlay loading={loading} />
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
      <SubmitAndConfirmModal
        responseData={responseData}
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
        formType={"offer"}
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
