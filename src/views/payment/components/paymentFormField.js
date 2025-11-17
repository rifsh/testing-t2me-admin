import React, { useEffect, useState } from "react";
import { Form, Card, Button, Input, message, Select, Row, Col } from "antd";
import PlaceWithCountryForm from "components/util-components/FormItems/PlaceWithCountryForm";
import Flex from "components/shared-components/Flex";
import DiscardButton from "components/shared-components/Buttons/DiscardButton";
import {
  addPayment,
  getSinglePayment,
  editPayment,
} from "store/slices/paymentSlice";
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
import DraftSystem from "drafts/components/DraftSystem";

const { Option } = Select;

const PaymentFormFields = ({ mode, paymentId }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const { filteredEvents = [], loading } = useSelector((state) => state.event);
  const { responseMessage, responseData, singlePayment } = useSelector(
    (state) => state.payment
  );
  const [placeId, setPlaceId] = useState();
  const [submitting, setSubmitting] = useState(false);

  const [allFormData, setAllFormData] = useState({});

  useEffect(() => {
    if (mode === "EDIT") {
      dispatch(getSinglePayment({ payment_id: paymentId }));
    }
    dispatch(fetchAllEvent({ event_type: EVENT_TYPES.event }));
  }, [dispatch]);

  useEffect(() => {
    if (mode == "EDIT" && singlePayment) {
      if (singlePayment.place?.id) {
        setPlaceId(singlePayment.place.id);
      }

      const formValues = {
        place_id: singlePayment.place?.id,
        place: singlePayment.place
          ? `${singlePayment.place.name}, ${singlePayment.place.country.name}`
          : "",
        event_id: singlePayment.event?.id || null,
        terms_and_conditions: singlePayment.terms_and_conditions || "",
        additional_urls: singlePayment.additional_urls || "",
        payment_methods: singlePayment.payment_methods?.map((method) => ({
          id: method.id, // Include existing ID
          payment_type: method.payment_type, // Keep as snake_case to match form field
          paymentType: method.payment_type, // Also include camelCase in case form uses this
          authorized_url: method.authorized_url,
          payment_charge: method.payment_charge,
          is_percentage: method.is_percentage,
          additional_details: method.additional_details || {},
        })) || [{}],
        add_on_services:
          singlePayment.add_on_services?.map((service) => ({
            id: service.id, // Include existing ID
            service_name: service.service_name,
            description: service.description,
            is_percentage: service.is_percentage,
            percentage_or_amount: service.percentage_or_amount,
            service_features: service.service_features || [],
          })) || [],
      };

      console.log("✅ Edit data loaded - Payment Methods:", formValues.payment_methods);

      form.setFieldsValue(formValues);

      setAllFormData(formValues);

      console.log("✅ Edit data loaded:", formValues);
    }
  }, [singlePayment, mode, form]);

  const handleSelectEvent = (id) => {
    if (!id) return;
  };

  // Enhanced function to get complete form data including nested arrays
  const getCompleteFormData = () => {
    const mainFormValues = form.getFieldsValue();
    console.log("🔍 Getting complete form data:", mainFormValues);

    // Ensure payment_methods and add_on_services are properly structured
    const completeData = {
      ...mainFormValues,
      place_id: placeId,
      payment_methods: mainFormValues.payment_methods || [],
      add_on_services: mainFormValues.add_on_services || [],
    };

    console.log("📊 Complete form data structure:", {
      mainFields: Object.keys(mainFormValues).filter(
        (k) => !["payment_methods", "add_on_services"].includes(k)
      ),
      paymentMethods: completeData.payment_methods?.length || 0,
      addOnServices: completeData.add_on_services?.length || 0,
    });

    return completeData;
  };

  // Handle draft loaded - restore all form data including nested structures
  const handleDraftLoaded = (draftData) => {
    console.log("📥 Loading draft data:", draftData);

    const { formValues } = draftData;

    // Set place ID if it exists
    if (formValues.place_id) {
      setPlaceId(formValues.place_id);
    }

    // Set all form values at once
    form.setFieldsValue({
      ...formValues,
      // Ensure arrays are properly set
      payment_methods: formValues.payment_methods || [{}],
      add_on_services: formValues.add_on_services || [],
    });

    console.log("✅ Form values set:", {
      paymentMethods: formValues.payment_methods?.length || 0,
      addOnServices: formValues.add_on_services?.length || 0,
    });

    // Force re-render of child components by updating state
    setAllFormData(formValues);
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

      // Prepare form data with ID included in edit mode
      const formData = {
        ...submitData,
        // Include payment ID in edit mode
        ...(mode === "EDIT" && { id: paymentId }),
      };

      // In edit mode, ensure IDs are included in nested arrays
      if (mode === "EDIT") {
        // Payment methods with IDs
        formData.payment_methods = submitData.payment_methods?.map((method, index) => {
          const existingMethod = singlePayment?.payment_methods?.[index];
          return {
            ...method,
            // Include ID if it exists from the original data
            ...(existingMethod?.id && { id: existingMethod.id }),
          };
        });

        // Add-on services with IDs
        formData.add_on_services = submitData.add_on_services?.map((service, index) => {
          const existingService = singlePayment?.add_on_services?.[index];
          return {
            ...service,
            // Include ID if it exists from the original data
            ...(existingService?.id && { id: existingService.id }),
          };
        });
      }

      console.log("📤 Submit data:", formData);

      dispatch(setSelectedSubmitItem(formData));
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

        {/* Pass key to force re-render when draft is loaded */}
        <PaymentMethodTabs
          form={form}
          key={`payment-methods-${JSON.stringify(
            allFormData.payment_methods || []
          )}`}
        />
        <AddOnServicesForm
          form={form}
          key={`add-on-services-${JSON.stringify(
            allFormData.add_on_services || []
          )}`}
        />

        <Flex className="py-2" mobileFlex={false} justifyContent="flex-end">
          <DraftSystem
            form={form}
            formType="payment"
            mode={mode}
            titleField="name"
            excludeFromDraft={["id", "created_at"]}
            style={{ marginRight: 12, display: "inline-block" }}
            enableAutoSave={mode !== "EDIT"}
            onGetCompleteData={getCompleteFormData}
            onDraftLoaded={handleDraftLoaded}
          />
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
        addFunction={mode === "EDIT" ? editPayment : addPayment}
        navigationPath={`${APP_PREFIX_PATH}/payment/list`}
        responseMessage={responseMessage}
        mode={mode}
        form={form}
        formType={"payment"}
      />
    </>
  );
};

export default PaymentFormFields;