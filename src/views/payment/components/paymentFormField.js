import React, { useEffect, useState } from "react";
import { Form, Card, Button, Input, message, Select, Row, Col } from "antd";
import PlaceWithCountryForm from "components/util-components/FormItems/PlaceWithCountryForm";
import Flex from "components/shared-components/Flex";
import DiscardButton from "components/shared-components/Buttons/DiscardButton";
import { addPayment } from "store/slices/paymentSlice";
import { RulesMessageConstants } from "constants/RulesConstant";
import { fetchAllEvent } from "store/slices/eventSlice";
import { useDispatch, useSelector } from "react-redux";
import AddOnServicesForm from "./AddOnServicesForm";
import PaymentMethodTabs from "./PaymentMethodTabs";
import { setSelectedSubmitItem } from "store/slices/modalSlice";
import { SubmitAndConfirmModal } from "components/util-components/ModalItems/SubmitConfirmModal";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import { EVENT_TYPES } from "constants/PageConstants";
import BackButton from "components/Buttons/BackPageButoon";

const { Option } = Select;

const PaymentFormFields = ({ mode }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const { filteredEvents = [], loading } = useSelector((state) => state.event);
  const { responseMessage, responseData } = useSelector(
    (state) => state.payment
  );
  const [placeId, setPlaceId] = useState();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchAllEvent({ event_type: EVENT_TYPES.event }));
  }, [dispatch]);

  const handleSelectEvent = (id) => {
    if (!id) return;
  };

  const validatePaymentMethods = (paymentMethods) => {
    if (!paymentMethods || paymentMethods?.length === 0) {
      message.error("At least one payment method is required");
      return false;
    }
    const paymentTypes = paymentMethods.map((method) => method.paymentType);
    const uniquePaymentTypes = new Set(paymentTypes.filter(Boolean));
    if (uniquePaymentTypes.size !== paymentTypes.filter(Boolean).length) {
      message.error("Duplicate payment methods are not allowed");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const submitData = {
        ...values,
        place_id: placeId,
      };
      console.log("Form values:", values);

      if (!validatePaymentMethods(submitData.payment_methods)) {
        return;
      }

      if (mode === "EDIT") {
        // const editData = {
        //   ...processedValues,
        //   id: coupon.id,
        // };
        // const resultAction = await dispatch(
        //   editCoupon({ data: editData, action: ActionType.WARNING })
        // );
        // if (editCoupon.fulfilled.match(resultAction)) {
        //   dispatch(setSelectedCoupon(editData));
        //   dispatch(setCouponDialogVisible(true));
        // }
      } else {
        const formData = {
          ...submitData,
        };

        dispatch(setSelectedSubmitItem(formData));
      }
    } catch (error) {
      console.error("Validation Failed:", error);
      message.error(
        error.message || "Please ensure all required fields are filled."
      );
    }
  };

  return (
    <>
      <Form form={form} layout="vertical">
        <Card title="Payment Form">
          <Row gutter={16}>
            <Col span={12}>
              <PlaceWithCountryForm
                form={form}
                label="Place"
                onSelect={(id) => {
                  setPlaceId(id);
                }}
                rules={[
                  { required: true, message: RulesMessageConstants.PLACE },
                ]}
              />
            </Col>
            <Col span={12}>
              <Form.Item
                name="event_id"
                label="Event"
                rules={[{ required: false, message: "Please select an event" }]}
              >
                <Select
                  loading={loading}
                  className="w-100"
                  placeholder="Select an event"
                  onChange={handleSelectEvent}
                  allowClear
                  showSearch
                  filterOption={(input, option) =>
                    option.children
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {filteredEvents.map((event) => (
                    <Option key={event.id} value={event.id}>
                      {event.event_name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="terms_and_conditions"
                label="Terms and Conditions"
              >
                <Input placeholder="Enter your URL" type="text" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="additional_urls" label="Additional Urls">
                <Input placeholder="Enter your URL" type="text" />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <PaymentMethodTabs form={form} />
        <AddOnServicesForm form={form} />
        <Flex className="py-2" mobileFlex={false} justifyContent="flex-end">
          <BackButton />
          <DiscardButton form={form} />
          <div className="mb-3">
            <Button
              onClick={handleSubmit}
              type="primary"
              htmlType="submit"
              loading={submitting}
              disabled={submitting}
            >
              Submit
            </Button>
          </div>
        </Flex>
      </Form>
      <SubmitAndConfirmModal
        responseData={responseData}
        addFunction={mode === "EDIT" ? addPayment : addPayment}
        navigationPath={`${APP_PREFIX_PATH}/payment/list`}
        responseMessage={responseMessage}
      />
    </>
  );
};

export default PaymentFormFields;
