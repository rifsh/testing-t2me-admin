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
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";
import PlaceWithCountryForm from "components/util-components/FormItems/PlaceWithCountryForm";
import Flex from "components/shared-components/Flex";
import DiscardButton from "components/shared-components/Buttons/DiscardButton";
import { getVenues } from "store/slices/locationSlice";
import { addPayment } from "store/slices/paymentSlice";
import { RulesMessageConstants } from "constants/RulesConstant";
import { fetchAllEvent } from "store/slices/eventSlice";
import { useDispatch, useSelector } from "react-redux";
import { PAYMENT_METHODS } from "constants/PaymentConstants";
import { processPaymentMethods } from "utils/PaymentUtils";
import { PaymentMethodFields } from "./PaymentMethodFields";
import AddOnServicesForm from "./AddOnServicesForm";

const { Option } = Select;

const PaymentFormFields = ({ mode, id }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const { filteredEvents = [], loading } = useSelector((state) => state.event);

  // State for confirmation modal
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [formValues, setFormValues] = useState(null);

  useEffect(() => {
    dispatch(fetchAllEvent({}));
  }, [dispatch]);

  const handleSelectEvent = (id) => {
    if (!id) return;
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      console.log("Form values:", values);

      // Set form values and open confirmation modal
      setFormValues(values);
      setIsModalVisible(true);
    } catch (error) {
      console.error("Validation Failed:", error);
    }
  };

  const handleModalConfirm = async () => {
    if (!formValues) return;

    try {
      const formData = new FormData();

      formData.append("place_id", formValues.venue_id);

      if (formValues.event_id) {
        formData.append("event_id", formValues.event_id);
      }

      if (formValues.url) {
        formData.append("terms_and_conditions", formValues.url);
      }

      if (formValues.additional_urls) {
        formData.append("additional_urls", formValues.additional_urls);
      }

      // Process payment methods using utility function
      const paymentMethods = formValues.paymentMethods || [];
      const processedPaymentMethods = processPaymentMethods(paymentMethods);
      formData.append(
        "payment_methods",
        JSON.stringify(processedPaymentMethods)
      );

      // Process services
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
        setIsModalVisible(false); // Close the modal
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      message.error("Failed to add payment details");
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false); // Close the modal without submitting
  };

  const handleFinishFailed = (errorInfo) => {
    console.log("Form submission failed:", errorInfo);
  };

  return (
    <>
      <Form form={form} layout="vertical" onFinishFailed={handleFinishFailed}>
        <Card title="Payment Form">
          {/* Two fields in one row using Row and Col */}
          <Row gutter={16}>
            <Col span={12}>
              <PlaceWithCountryForm
                form={form}
                label="Place"
                onSelect={(id) => {
                  dispatch(getVenues({ place_id: id }));
                  form.setFieldsValue({ venue_id: id });
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
              <Form.Item name="url" label="Terms and Conditions">
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

        <Card title="Payment Methods">
          <Form.List name="paymentMethods">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => {
                  // Get the current payment type value for this field
                  const paymentType = form.getFieldValue([
                    "paymentMethods",
                    name,
                    "paymentType",
                  ]);

                  return (
                    <Card
                      key={key}
                      style={{ marginBottom: 16 }}
                      size="small"
                      title={`Payment Method ${name + 1}`}
                      extra={
                        <MinusCircleOutlined onClick={() => remove(name)} />
                      }
                    >
                      <Form.Item
                        {...restField}
                        name={[name, "paymentType"]}
                        label="Payment Type"
                        rules={[
                          {
                            required: true,
                            message: "Please select payment type",
                          },
                        ]}
                      >
                        <Select
                          placeholder="Select payment type"
                          onChange={() => {
                            // When payment type changes, clear the dependent fields
                            const currentValues = form.getFieldValue([
                              "paymentMethods",
                              name,
                            ]);
                            const newValues = {
                              paymentType: currentValues.paymentType,
                              paymentCharge: currentValues.paymentCharge,
                              authorizedUrl: currentValues.authorizedUrl,
                            };
                            form.setFieldsValue({
                              paymentMethods: {
                                [name]: newValues,
                              },
                            });
                          }}
                        >
                          {PAYMENT_METHODS.map((method) => (
                            <Option key={method.value} value={method.value}>
                              {method.label}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>

                      {/* Two fields in one row in the Payment Method card */}
                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item
                            {...restField}
                            name={[name, "paymentCharge"]}
                            label="Payment Charge (%)"
                          >
                            <Input
                              placeholder="Enter payment charge"
                              type="number"
                              min={0}
                              step={0.01}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item
                            {...restField}
                            name={[name, "authorizedUrl"]}
                            label="Authorized URL"
                          >
                            <Input placeholder="Enter authorized URL" />
                          </Form.Item>
                        </Col>
                      </Row>

                      <PaymentMethodFields
                        name={name}
                        paymentType={paymentType}
                        form={form}
                      />
                    </Card>
                  );
                })}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    Add Payment Method
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Card>

        <AddOnServicesForm />
        <Flex className="py-2" mobileFlex={false} justifyContent="flex-end">
          <DiscardButton form={form} />
          <div className="mb-3">
            <Button onClick={handleSubmit} type="primary" htmlType="submit">
              Submit
            </Button>
          </div>
        </Flex>
      </Form>

      {/* Confirmation Modal */}
      <Modal
        title="Confirm Submission"
        visible={isModalVisible}
        onOk={handleModalConfirm}
        onCancel={handleModalCancel}
        okText="Confirm"
        cancelText="Cancel"
      >
        <p>Are you sure you want to submit the form?</p>
      </Modal>
    </>
  );
};

export default PaymentFormFields;
