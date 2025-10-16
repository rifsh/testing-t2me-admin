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

// const EDIT = "EDIT";

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
      message.error(error);
    }
  }, [error]);

  useEffect(() => {
    if (offer && mode === "EDIT") {
      const formData = {
        name: offer.name,
        theatre_ids: offer.theatre_ids?.map((item) => item) || [],
        discount_percentage_amount: offer.discount_percentage_amount,
        is_percentage: offer.is_percentage,
        max_uses: offer.max_uses,
        date_required: offer.date_required,
        key_words: offer.key_words,
        applicable_days:
          offer.mapped_offer_weekdays?.map((day) => day.code) || [],

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

      form.setFieldsValue(formData);
    }

    dispatch(setIsDateRequired(offer?.date_required));
  }, [form, offer]);

  const onFinish = async () => {
    const values = await form.validateFields();
    console.log("Form Values:", values);

    try {
      // Format dates if required
      if (isDateRequired) {
        values.start_date = Utils.formatDate(values.start_date);
        values.end_date = Utils.formatDate(values.end_date);
      }

      values.key_words = values.key_words ?? [];
      values.date_required = values.date_required ?? isDateRequired;

      // Map the applicable days to full weekday objects
      values.mapped_offer_weekdays =
        availableOfferDays?.filter((day) =>
          values.applicable_days.includes(day.code)
        ) ?? [];

      if (mode === "EDIT") {
        if (isOrganizer() && isMakeChange) {
          dispatch(setCommentModalVisibility(true));
          return;
        }

        const editData = {
          ...values,
          id: offer.id,
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
        const formData = {
          ...values,
        };
        console.log("DATA IS THIS", formData);

        dispatch(setSelectedSubmitItem(formData));
      }
    } catch (info) {
      console.error("Validation Failed:", info);
      message.error("Please enter all required fields.");
    }
  };
  const handleWarningPagination = (page, size) => {
    console.log("------------------------");

    console.log("CHANIGN...........");

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
    try {
      const editData = {
        ...values,
        id: offer.id,
      };
      const pageData = {
        offer_id: offer.id,
      };

      console.log("editData", editData);
      const resultAction = await dispatch(
        makeChangeOffer({ data: editData, action: ActionType.SUBMIT, pageData })
      );

      if (makeChangeOffer.fulfilled.match(resultAction)) {
        console.log("HEREEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEssss");
        dispatch(setComment(""));
        dispatch(setCommentModalVisibility(false));
        dispatch(setSelectedSubmitItem(editData));
        message.success(`Update ${actionType}ed successfully`);
        // navigate(`${APP_PREFIX_PATH}/track-team/event-organizer/updatelist`);
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
        // addFunction={mode === "EDIT" ? editOffer : addOffer}
        addFunction={
          mode === "EDIT"
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
