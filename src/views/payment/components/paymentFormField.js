import React, { useEffect, useState } from "react";
import {
  Form,
  Card,
  Button,
  Input,
  Space,
  message,
  Select,
  Modal,
  Row,
  Col,
} from "antd";
import PlaceWithCountryForm from "components/util-components/FormItems/PlaceWithCountryForm";
import Flex from "components/shared-components/Flex";
import DiscardButton from "components/shared-components/Buttons/DiscardButton";
import { getVenues } from "store/slices/locationSlice";
import { addPayment } from "store/slices/paymentSlice";
import { RulesMessageConstants } from "constants/RulesConstant";
import { fetchAllEvent } from "store/slices/eventSlice";
import { useDispatch, useSelector } from "react-redux";
import { processPaymentMethods } from "utils/PaymentUtils";
import AddOnServicesForm from "./AddOnServicesForm";
import PaymentMethodTabs from "./PaymentMethodTabs";

const { Option } = Select;

const PaymentFormFields = ({ mode, id }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const { filteredEvents = [], loading } = useSelector((state) => state.event);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [formValues, setFormValues] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchAllEvent({}));
  }, [dispatch]);

  const handleSelectEvent = (id) => {
    if (!id) return;
  };

  const validatePaymentMethods = (paymentMethods) => {
    if (!paymentMethods || paymentMethods.length === 0) {
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
      console.log("Form values:", values);

      if (!validatePaymentMethods(values.paymentMethods)) {
        return;
      }

      setFormValues(values);
      setIsModalVisible(true);
    } catch (error) {
      console.error("Validation Failed:", error);
    }
  };

  const handleModalConfirm = async () => {
    if (!formValues) return;

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("place_id", formValues.place_id); // Use place_id, not venue_id

      if (formValues.event_id) {
        formData.append("event_id", formValues.event_id);
      }

      if (formValues.terms_and_conditions) {
        formData.append(
          "terms_and_conditions",
          formValues.terms_and_conditions
        );
      }

      if (formValues.additional_urls) {
        formData.append("additional_urls", formValues.additional_urls);
      }

      const paymentMethods = formValues.paymentMethods || [];
      const processedPaymentMethods = processPaymentMethods(paymentMethods);
      formData.append(
        "payment_methods",
        JSON.stringify(processedPaymentMethods)
      );

      const services = formValues.services || [];
      const serviceDetails = services.map((service) => ({
        service_name: service.name,
        description: service.description || "",
        thumbnail_image:
          service.thumbnail_image && service.thumbnail_image[0]?.uid
            ? service.thumbnail_image[0].uid
            : null,
        is_percentage: service.isPercentage || false,
        percentage_or_amount: service.percentageOrAmount || 0,
      }));
      formData.append("add_on_services", JSON.stringify(serviceDetails));

      console.log("FormData content:");
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      const result = await dispatch(addPayment(formData));
      if (result) {
        message.success("Payment details added successfully");
        form.resetFields();
        setIsModalVisible(false);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      message.error("Failed to add payment details");
    } finally {
      setSubmitting(false);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  const handleFinishFailed = (errorInfo) => {
    console.log("Form submission failed:", errorInfo);
  };

  return (
    <>
      <Form form={form} layout="vertical" onFinishFailed={handleFinishFailed}>
        <Card title="Payment Form">
          <Row gutter={16}>
            <Col span={12}>
              <PlaceWithCountryForm
                form={form}
                label="Place"
                onSelect={(id) => {
                  console.log("Selected place_id:", id);
                  // Optionally dispatch getVenues if needed
                  // dispatch(getVenues({ place_id: id }));
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
      <Modal
        title="Confirm Submission"
        visible={isModalVisible}
        onOk={handleModalConfirm}
        onCancel={handleModalCancel}
        okText="Confirm"
        cancelText="Cancel"
        confirmLoading={submitting}
      >
        <p>Are you sure you want to submit the form?</p>
      </Modal>
    </>
  );
};

export default PaymentFormFields;
