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
import { useNavigate, useLocation } from "react-router-dom";
import { addVenue, setSelectedPlace } from "store/slices/locationSlice";
import { createFooter, fetchFooterData } from "store/slices/footerSlice";
import { setSelectedSubmitItem } from "store/slices/modalSlice";
import { SubmitAndConfirmModal } from "components/util-components/ModalItems/SubmitConfirmModal";
import PlaceWithCountryForm from "components/util-components/FormItems/PlaceWithCountryForm";
import DiscardButton from "components/shared-components/Buttons/DiscardButton";
import WorkingPeriodForm from "./WorkingPeriodForm";
import PaymentLogoForm from "./PaymentLogoForm";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import dayjs from "dayjs";

const FooterFormFields = ({ mode }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [selectedPlaceId, setSelectedPlaceId] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoadingData, setIsLoadingData] = useState(false);
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

  const { footerData: allFooterData, loading: footerLoading } = useSelector(
    (state) => state.footer
  );

  // Get selected footer from location state (passed during navigation)
  const selectedFooterId = location.state?.footerId;

  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  // Fetch all footer data when in EDIT mode
  useEffect(() => {
    if (mode === "EDIT") {
      setIsLoadingData(true);
      dispatch(fetchFooterData()).finally(() => setIsLoadingData(false));
    }
  }, [mode, dispatch]);

  // Parse time string and return dayjs object
  const parseTime = (timeStr) => {
    if (!timeStr) return null;
    return dayjs(timeStr, "HH:mm");
  };

  // Parse days range and return start and end day
  const parseDayRange = (daysStr) => {
    if (!daysStr) return { start_day: "", end_day: "" };
    const [start, end] = daysStr
      .replace(/ to /gi, "-")
      .split("-")
      .map((d) => d.trim());
    return { start_day: start, end_day: end };
  };

  // Convert URL string to file object for Upload component
  const convertUrlToFileObject = (url, filename) => {
    if (!url) return null;
    return {
      uid: `-${Date.now()}`,
      name: filename || url.split("/").pop() || "image",
      status: "done",
      url: url,
      thumbUrl: url,
    };
  };

  // Populate form when selectedFooterId is available and data is loaded
  useEffect(() => {
    if (mode === "EDIT" && selectedFooterId && allFooterData) {
      populateFormWithData();
    }
  }, [mode, selectedFooterId, allFooterData]);

  const populateFormWithData = () => {
    if (!selectedFooterId) {
      message.error("No footer selected for editing");
      return;
    }

    try {
      const footerItem = allFooterData;

      if (!footerItem) {
        message.error("Footer data not found");
        return;
      }

      // Get the selected country key
      const countryKey = selectedFooterId;

      // Extract data for selected country
      const customerSupport = footerItem.customer_support?.[countryKey] || {};
      const contactUs = footerItem.contact_us?.[countryKey] || {};
      const supportHours = footerItem.support_hours?.[countryKey] || {};
      const paymentMethods =
        footerItem.accepted_payment_methods?.[countryKey] || [];

      // Parse days and times
      const { start_day, end_day } = parseDayRange(
        supportHours?.days_available || ""
      );
      const operatingHours = supportHours?.operating_hours || "00:00 - 00:00";
      const [startTimeStr, endTimeStr] = operatingHours
        .split("-")
        .map((t) => t.trim());

      // Convert app logo URL to file object
      const appLogoFile = footerItem.app_logo_url
        ? [convertUrlToFileObject(footerItem.app_logo_url, "app-logo")]
        : [];

      // Convert payment methods with logo URLs to file objects
      const paymentLogosForForm = paymentMethods.map((pm) => {
        const logoFileObj = pm.method_logo
          ? convertUrlToFileObject(pm.method_logo, pm.method_name)
          : null;
        return {
          method_name: pm.method_name || "",
          method_logo: logoFileObj ? [logoFileObj] : undefined,
        };
      });

      // Set form values
      form.setFieldsValue({
        footer_name: footerItem.footer_text || "",
        description: footerItem.platform_description || "",
        whatsapp_number: customerSupport?.whatsapp_contact || "",
        phone_number: customerSupport?.customer_support?.hotline_number || "",
        contact_heading: contactUs?.heading || "",
        contact_subheading: contactUs?.subheading || "",
        whatsapp_button_text: contactUs?.whatsapp_support?.button_text || "",
        whatsapp_enabled: contactUs?.whatsapp_support?.is_enabled !== false,
        start_day: start_day || "Monday",
        end_day: end_day || "Monday",
        start_time: parseTime(startTimeStr),
        end_time: parseTime(endTimeStr),
        app_logo: appLogoFile,
        payment_logos:
          paymentLogosForForm.length > 0 ? paymentLogosForForm : [],
      });

      // Set selected place if available in the key
      const placeIdMatch = countryKey.match(/_(\d+)$/);
      if (placeIdMatch) {
        setSelectedPlaceId(parseInt(placeIdMatch[1]));
        dispatch(setSelectedPlace(parseInt(placeIdMatch[1])));
      }
    } catch (err) {
      console.error("Error populating form:", err);
      message.error("Error loading footer data");
    }
  };

  const handlePlaceSelect = (id) => {
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
        availability: availability,
      };

      if (values?.payment_logos && values?.payment_logos?.length > 0) {
        data.payment_logos = values.payment_logos;
      }

      console.log("THIS IS THE DATA", data);

      let resultAction;
      if (mode === "EDIT") {
        data.footer_key = selectedFooterId;
        console.log("UPDATED DATA", data);

        message.success("Footer updated successfully");
      } else {
        resultAction = await dispatch(createFooter(data)).unwrap();
        message.success("Footer created successfully");
      }

      navigate(`${APP_PREFIX_PATH}/app/management/layout/footer/list`);
      dispatch(fetchFooterData());
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
          <Card
            title={mode === "EDIT" ? "Edit Footer Details" : "Footer Details"}
          >
            <PlaceWithCountryForm
              form={form}
              label={"Place (Optional)"}
              onSelect={handlePlaceSelect}
              disabled={mode === "EDIT"}
              rules={[{ required: false, message: "Please select a place" }]}
            />

            <Form.Item
              name="footer_name"
              label="Footer Name"
              rules={[
                { required: true, message: "Please enter the footer name" },
              ]}
            >
              <Input placeholder="Enter the footer name" />
            </Form.Item>

            <Form.Item
              name="description"
              label="Description"
              rules={[
                { required: true, message: "Please enter a description" },
              ]}
            >
              <Input placeholder="Enter the platform description" />
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
          </Card>
          <WorkingPeriodForm />
          <PaymentLogoForm />
          <Flex
            className="py-2"
            mobileFlex={false}
            justifyContent="space-between"
          >
            <DiscardButton form={form} />
            <Button
              type="primary"
              onClick={onFinish}
              loading={loading || isLoadingData}
            >
              {mode === "EDIT" ? "Update" : "Add"}
            </Button>
          </Flex>
        </Form>
      </Col>
    </Row>
  );
};

export default FooterFormFields;
