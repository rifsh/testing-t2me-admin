import React, { useEffect, useState } from "react";
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
  Switch,
  Upload,
} from "antd";
import {
  CheckOutlined,
  CloseOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import Flex from "components/shared-components/Flex";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { addVenue, setSelectedPlace } from "store/slices/locationSlice";
import { createFooter, fetchFooterData } from "store/slices/footerSlice";
import { setSelectedSubmitItem } from "store/slices/modalSlice";
import { SubmitAndConfirmModal } from "components/util-components/ModalItems/SubmitConfirmModal";
import PlaceWithCountryForm from "components/util-components/FormItems/PlaceWithCountryForm";
import DiscardButton from "components/shared-components/Buttons/DiscardButton";
import WorkingPeriodForm from "./WorkingPeriodForm";
import PaymentLogoForm from "./PaymentLogoForm";
import { APP_PREFIX_PATH } from "configs/AppConfig";

const FooterFormFields = ({ mode }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [selectedPlaceId, setSelectedPlaceId] = useState(null);
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
    // console.log("place", id);
    setSelectedPlaceId(id);
    dispatch(setSelectedPlace(id));
  };

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  useEffect(() => {
    form.setFieldsValue({
      whatsapp_enabled: true,
    });
  }, [form]);

  const onFinish = async () => {
    try {
      const values = await form.validateFields();
      console.log(JSON.stringify(values, null, 2), "THIS IS VALUES DATA");

      const days_available = `${values.start_day} to ${values.end_day}`;
      const operating_hours = `${values.start_time.format(
        "HH:mm"
      )} - ${values.end_time.format("HH:mm")}`;
      const availability = `${values.start_day.toUpperCase()} TO ${values.end_day.toUpperCase()}`;

      const data = {
        footer_text: values.footer_name,
        app_logo: values.app_logo,
        platform_description: values.description,
        customer_support_keys: `${values.place}_${String(selectedPlaceId)}`,
        whatsapp_contact: values.whatsapp_number,
        hotline_number: values.phone_number,
        payment_keys: `${values.place}_${String(selectedPlaceId)}`,
        contact_us_keys: `${values.place}_${String(selectedPlaceId)}`,
        contact_heading: values.contact_heading,
        contact_subheading: values.contact_subheading,
        whatsapp_button_text: values.whatsapp_button_text,
        whatsapp_enabled: values.whatsapp_enabled,
        support_hours_keys: `${values.place}_${String(selectedPlaceId)}`,
        days_available: days_available,
        operating_hours: operating_hours,
        availability: availability
      };

      console.log(values?.payment_logos?.length, "PAYMENT LOGO LENGTHI");

      if (values?.payment_logos && values?.payment_logos?.length > 0) {
        data.payment_logos = values.payment_logos;
      }

      console.log("THIS IS THE DATA", data);

      const resultAction = await dispatch(createFooter(data)).unwrap();
      navigate(`${APP_PREFIX_PATH}/app/management/layout/footer/list`);
      dispatch(fetchFooterData());
      message.success("INFO updated successfully");
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

            <Form.Item
              name="contact_heading"
              label="Contact Heading"
              rules={[
                { required: true, message: "Please enter the Contact Heading" },
              ]}
            >
              <Input placeholder="Enter contact heading" />
            </Form.Item>

            <Form.Item
              name="contact_subheading"
              label="Contact Sub Heading"
              rules={[
                {
                  required: true,
                  message: "Please enter the contact sub heading",
                },
              ]}
            >
              <Input placeholder="Enter contact sub heading" />
            </Form.Item>
            <Form.Item
              name="whatsapp_button_text"
              label="Whatsapp Button Text"
              rules={[
                {
                  required: true,
                  message: "Please enter the whatsapp button text",
                },
              ]}
            >
              <Input placeholder="Enter whatsapp button text" />
            </Form.Item>
            <Form.Item
              name="whatsapp_enabled"
              label="Whatsapp Enabled"
              valuePropName="checked"
            >
              <Switch
                checkedChildren={<CheckOutlined />}
                unCheckedChildren={<CloseOutlined />}
                defaultChecked
              />
            </Form.Item>
          </Card>{" "}
          <WorkingPeriodForm />
          <PaymentLogoForm />
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
    </Row>
  );
};

export default FooterFormFields;
