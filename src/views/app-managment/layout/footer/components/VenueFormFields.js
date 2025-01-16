import React, { useEffect } from "react";
import {
  Input,
  Row,
  Col,
  Card,
  Form,
  Select,
  Button,
  message,
  DatePicker,
  TimePicker,
  Upload,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import Flex from "components/shared-components/Flex";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { addVenue, setSelectedPlace } from "store/slices/locationSlice";
import { setSelectedSubmitItem } from "store/slices/modalSlice";
import { SubmitAndConfirmModal } from "components/util-components/ModalItems/SubmitConfirmModal";
import PlaceWithCountryForm from "components/util-components/FormItems/PlaceWithCountryForm";
import DiscardButton from "components/shared-components/Buttons/DiscardButton";
import WorkingPeriodForm from "./WorkingPeriodForm";
import PaymentLogoForm from "./PaymentLogoForm";

const FooterFormFields = ({ mode }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { Option } = Select;

  const WEEK_DAYS = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const {
    coordinates,
    loading,
    error,
    responseData,
    responseMessage,
    selectedPlace,
  } = useSelector((state) => state.locations);

  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  const handlePlaceSelect = (id) => {
    dispatch(setSelectedPlace(id));
  };

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  const onFinish = async () => {
    try {
      const values = await form.validateFields();
      if (!selectedPlace) {
        message.error("Place ID is missing. Please select a place.");
        return;
      }

      dispatch(setSelectedSubmitItem({ ...values, place_id: selectedPlace }));
    } catch (errorInfo) {
      console.error("Validation Failed:", errorInfo);
    }
  };

  return (
    <Row gutter={16}>
      <Col xs={24} sm={24} md={17}>
        <Form
          layout="vertical"
          form={form}
          name="venue_form"
          className="ant-advanced-search-form"
        >
          <Card title="Footer Details">

            <PlaceWithCountryForm
              form={form}
              label={"Place (Optional)"}
              onSelect={handlePlaceSelect}
              rules={[{ required: false, message: "Please select a place" }]}
            />

            <Form.Item
              name="footer_name"
              label="Footer Name"
              rules={[{ required: true, message: "Please enter the address" }]}
            >
              <Input placeholder="Enter the address" />
            </Form.Item>

            <Form.Item
              name="description"
              label="Description"
              rules={[
                { required: true, message: "Please enter a description" },
              ]}
            >
              <Input placeholder="Enter the venue name" />
            </Form.Item>

            <Form.Item
              name="whatsapp_number"
              label="WhatsApp Number"
              rules={[{ required: true, message: "Please enter the number" }]}
            >
              <Input type="number" placeholder="Enter WhatsApp number" />
            </Form.Item>

            <Form.Item
              name="phone_number"
              label="Phone Number"
              rules={[{ required: true, message: "Please enter the number" }]}
            >
              <Input type="number" placeholder="Enter phone number" />
            </Form.Item>
          </Card> <WorkingPeriodForm />
          <PaymentLogoForm/>
          <Flex
              className="py-2"
              mobileFlex={false}
              justifyContent="space-between"
            >
              <DiscardButton form={form} />
              <Button type="primary" onClick={onFinish} loading={loading}>
                {mode === "ADD" ? "Add" : "Save"}
              </Button>
            </Flex>
        </Form>
      </Col>
      <SubmitAndConfirmModal
        responseData={responseData}
        addFunction={addVenue}
        navigationPath="/venue/list"
        responseMessage={responseMessage}
      />
    </Row>
  );
};

export default FooterFormFields;
