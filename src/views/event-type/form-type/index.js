import React, { useEffect } from "react";
import PageHeaderAlt from "components/layout-components/PageHeaderAlt";
import { Tabs, Form, Button, message, Alert, Col } from "antd";
import Flex from "components/shared-components/Flex";
import EventTypeFormFields from "../components/CouponFormFields";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import {
  addCoupon,
  editCoupon,
  setSelectedCoupon,
  setCouponDialogVisible,
  setCouponModalLoading,
  setIsDateRequired,
} from "store/slices/couponSlice";
import { SubmitAndConfirmModal } from "components/util-components/ModalItems/SubmitConfirmModal";
import { setSelectedSubmitItem } from "store/slices/modalSlice";
import DiscardButton from "components/shared-components/Buttons/DiscardButton";
import Utils from "utils";
import dayjs from "dayjs";
import LoadingOverlay from "components/util-components/Loader/index";
import WarningModal from "components/util-components/ModalItems/WarningModal";
import { ActionType } from "utils/api/warning-submit-util";

const ADD = "ADD";
// const EDIT = 'EDIT'

const EventTypeForm = ({ mode, coupon }) => {
  const {
    loading,
    error,
    responseData,
    responseMessage,
    dialogVisible,
    editable_status,
    selectedCoupon,
    warningPagination,
    responseImpactData,
    isDateRequired,
    message: warningMessage,
    submitPagination,
    modalLoading,
  } = useSelector((state) => state.coupons);
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(setIsDateRequired(false));
    if (error) {
      message.error(error);
    }
  }, [error]);

  useEffect(() => {
    if (coupon && mode === "EDIT") {
      // Format key_words for the form if present
      let formattedKeyWords = {};
      if (coupon.key_words && Array.isArray(coupon.key_words)) {
        // Convert array of key_words to the expected object format
        coupon.key_words.forEach((code, index) => {
          formattedKeyWords[index + 1] = code;
        });
      } else if (coupon.key_words && typeof coupon.key_words === "object") {
        // If already in object format, use directly
        formattedKeyWords = coupon.key_words;
      }

      const formData = {
        name: coupon.name,
        coupon_type: coupon.coupon_type || "single",
        is_single: coupon.is_single !== undefined ? coupon.is_single : true,
        is_reusable: coupon.is_reusable || false,
        key_words: formattedKeyWords,
        is_percentage:
          coupon.is_percentage !== undefined ? coupon.is_percentage : true,
        discount_percentage_amount:
          coupon.discount_percentage_amount || coupon.discount_percentage_amount,
        max_uses: coupon.max_uses,
        min_purchase_amount: coupon.min_purchase_amount,
        date_required: Boolean(coupon.date_required),
        thumbnail_image:
          coupon.thumbnail_image && coupon.thumbnail_image !== "images"
            ? [
                {
                  uid: "-1",
                  name: coupon.thumbnail_image.split("/").pop(),
                  status: "done",
                  url: coupon.thumbnail_image,
                },
              ]
            : [],
      };

      // Handle dates properly
      if (coupon.start_date) {
        formData.start_date = dayjs(coupon.start_date);
      }

      if (coupon.end_date) {
        formData.end_date = dayjs(coupon.end_date);
      }

      form.setFieldsValue(formData);

      // Set isDateRequired based on the coupon's existing date settings
      dispatch(setIsDateRequired(Boolean(coupon.date_required)));
    }
  }, [form, coupon, dispatch, mode]);

  // Process form values before submission
  const processFormValues = (values) => {
    const processedValues = { ...values };

    // Process key_words from object to array
    if (
      processedValues.key_words &&
      typeof processedValues.key_words === "object"
    ) {
      processedValues.key_words = Object.values(
        processedValues.key_words
      ).filter(Boolean);
    }

    // Set date_required explicitly based on current state
    processedValues.date_required = isDateRequired;

    // Process dates if they exist
    if (isDateRequired) {
      if (processedValues.start_date) {
        // Handle both moment and dayjs objects
        processedValues.start_date =
          processedValues.start_date.format("YYYY-MM-DD");
      }

      if (processedValues.end_date) {
        processedValues.end_date =
          processedValues.end_date.format("YYYY-MM-DD");
      }
    } else {
      // If dates not required, ensure they're cleared
      processedValues.start_date = null;
      processedValues.end_date = null;
    }

    return processedValues;
  };

  const onFinish = async () => {
    try {
      const values = await form.validateFields();

      // Use the processFormValues function to handle all transformations
      const processedValues = processFormValues(values);

      if (mode === "EDIT") {
        const editData = {
          ...processedValues,
          id: coupon.id,
        };

        const resultAction = await dispatch(
          editCoupon({ data: editData, action: ActionType.WARNING })
        );

        if (editCoupon.fulfilled.match(resultAction)) {
          dispatch(setSelectedCoupon(editData));
          dispatch(setCouponDialogVisible(true));
        }
      } else {
        const formData = {
          ...processedValues,
        };

        dispatch(setSelectedSubmitItem(formData));
      }
    } catch (info) {
      console.error("Validation Failed:", info);
      message.error("Please enter all required fields.");
    }
  };

  const handleModalSubmit = async () => {
    dispatch(setCouponModalLoading(true));
    const resultAction = await dispatch(
      editCoupon({ data: selectedCoupon, action: ActionType.SUBMIT })
    );
    dispatch(setCouponModalLoading(false));
    dispatch(setCouponDialogVisible(false));
    if (editCoupon.fulfilled.match(resultAction)) {
      dispatch(setSelectedSubmitItem(selectedCoupon));
    }
  };

  const handleModalCancel = () => {
    dispatch(setCouponDialogVisible(false));
  };

  const handleWarningPagination = (page, size) => {
    dispatch(
      editCoupon({
        data: selectedCoupon,
        action: ActionType.WARNING,
        pageData: { page: page, size: size },
      })
    );
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
          is_percentage: true,
          coupon_type: "single",
          is_reusable: false,
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
                {mode === "ADD" ? "Add New Coupon" : `Edit Coupon`}{" "}
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
                children: <EventTypeFormFields form={form} />,
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
        addFunction={mode === "EDIT" ? editCoupon : addCoupon}
        navigationPath={`${APP_PREFIX_PATH}/coupon/list`}
        responseMessage={responseMessage}
        pagination={submitPagination}
      />
    </>
  );
};

export default EventTypeForm;
