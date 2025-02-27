import React, { useEffect } from "react";
import PageHeaderAlt from "components/layout-components/PageHeaderAlt";
import { Tabs, Form, Button, message, Alert, Col } from "antd";
import Flex from "components/shared-components/Flex";
import CouponFormFields from "../components/CouponFormFields";
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

const CouponForm = ({ mode, coupon }) => {
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
      const formData = {
        name: coupon.name,
        coupon_code: coupon.coupon_code,
        discount_percentage: coupon.discount_percentage,
        date_required: coupon.date_required,
        max_uses: coupon.max_uses,
        min_purchase_amount: coupon.min_purchase_amount,
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

      if (coupon.date_required && coupon.start_date && coupon.end_date) {
        formData.start_date = dayjs(coupon.start_date);
        formData.end_date = dayjs(coupon.end_date);
      }

      form.setFieldsValue(formData);

      dispatch(setIsDateRequired(coupon?.date_required));
    }
  }, [form, coupon]);

  const onFinish = async () => {
    try {
      const values = await form.validateFields();

      if (mode === "EDIT") {
        if (isDateRequired) {
          values.start_date = Utils.formatDate(values.start_date);
          values.end_date = Utils.formatDate(values.end_date);
        }
        values.date_required = values.date_required ?? isDateRequired;

        const editData = {
          ...values,
          id: coupon.id,
        };
        console.log("Edit Data:", editData);
        const resultAction = await dispatch(
          editCoupon({ data: editData, action: ActionType.WARNING })
        );

        if (editCoupon.fulfilled.match(resultAction)) {
          dispatch(setSelectedCoupon(editData));
          dispatch(setCouponDialogVisible(true));
        }
      } else {
        if (isDateRequired) {
          values.start_date = Utils.formatDate(values.start_date);
          values.end_date = Utils.formatDate(values.end_date);
        }
        values.date_required = values.date_required ?? isDateRequired;
        // dispatch(setSelectedSubmitItem(values));
        const formData = {
          ...values,
        };
        console.log(formData, "coupon daata");

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
    console.log("------------------------");

    console.log("CHANIGN...........");

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
                children: <CouponFormFields />,
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

export default CouponForm;
