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

const { RangePicker } = DatePicker;

const VenueFormFields = ({ mode }) => {
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
          <Card>
            <h2 className="mb-3">
              {mode === "ADD" ? "Add Venue" : "Edit Venue"}
            </h2>

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

            {/* Working Dates and Times as Nested Design */}
            <Form.Item label="Working Period">
              <Input.Group compact>
                <Form.Item
                  name="start_day"
                  // label="Working Days"
                  rules={[
                    {
                      required: true,
                      message: "Please select the working days.",
                    },
                  ]}
                >
                  <Select
                    // mode=""
                    placeholder="Select End Day"
                    allowClear
                  >
                    {WEEK_DAYS.map((day) => (
                      <Option key={day} value={day}>
                        {day}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item
                  name="end_day"
                  // label="Working Days"
                  rules={[
                    {
                      required: true,
                      message: "Please select the working days.",
                    },
                  ]}
                >
                  <Select
                    // mode=""
                    placeholder="Select Start Day"
                    allowClear
                  >
                    {WEEK_DAYS.map((day) => (
                      <Option key={day} value={day}>
                        {day}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item
                  name="start_time"
                  noStyle
                  rules={[
                    { required: true, message: "Please select start time" },
                  ]}
                >
                  <TimePicker
                    className="w-25"
                    format="HH:mm"
                    placeholder="Start Time"
                  />
                </Form.Item>
                <Form.Item
                  name="end_time"
                  noStyle
                  rules={[
                    { required: true, message: "Please select end time" },
                  ]}
                >
                  <TimePicker
                    className="w-25"
                    format="HH:mm"
                    placeholder="End Time"
                  />
                </Form.Item>
              </Input.Group>
            </Form.Item>

            {/* App Logo */}
            <Form.Item
              name="app_logo"
              label="App Logo"
              valuePropName="fileList"
              getValueFromEvent={normFile}
            >
              <Upload
                name="app_logo"
                listType="picture"
                maxCount={1}
                beforeUpload={() => false}
              >
                <Button icon={<UploadOutlined />}>Upload App Logo</Button>
              </Upload>
            </Form.Item>

            {/* Payment Logos */}
            <Form.List name="payment_logos">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, fieldKey, ...restField }) => (
                    <div key={key} style={{ display: "flex", marginBottom: 8 }}>
                      <Form.Item
                        {...restField}
                        name={[name, "logo"]}
                        fieldKey={[fieldKey, "logo"]}
                        valuePropName="fileList"
                        getValueFromEvent={normFile}
                        rules={[{ required: true, message: "Upload required" }]}
                        style={{ flex: 2 }}
                      >
                        <Upload
                          name="payment_logo"
                          listType="picture"
                          maxCount={1}
                          beforeUpload={() => false}
                        >
                          <Button icon={<UploadOutlined />}>Upload Logo</Button>
                        </Upload>
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, "name"]}
                        fieldKey={[fieldKey, "name"]}
                        rules={[
                          { required: true, message: "Enter payment name" },
                        ]}
                        style={{ flex: 1, marginLeft: "8px" }}
                      >
                        <Input placeholder="Payment Name" />
                      </Form.Item>
                      <Button type="link" danger onClick={() => remove(name)}>
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button type="dashed" onClick={() => add()} block>
                    Add Payment Logo
                  </Button>
                </>
              )}
            </Form.List>

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
          </Card>
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

export default VenueFormFields;
