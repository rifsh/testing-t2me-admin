import React, { useEffect } from "react";
import {
  Input,
  Row,
  Col,
  Card,
  Form,
  Button,
  Upload,
  Select,
  message,
  Alert,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchOrganizerEvents,
  fetchEventSupportAvailable,
  fetchAllEvent,
} from "store/slices/eventSlice";
import { getCurrentUser } from "configs/UserAccessConfig";
import { AddNewIssue } from "store/slices/IssueSlice";
import { useNavigate } from "react-router-dom";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import { EVENT_TYPES } from "constants/PageConstants";

const { Option } = Select;

const rules = {
  subject: [
    {
      required: true,
      message: "Please enter the issue",
    },
  ],
  issue: [
    {
      required: true,
      message: "Please enter the issue description",
    },
  ],
  eventId: [
    {
      required: true,
      message: "Please select an event",
    },
  ],
  files: [
    {
      required: false,
      message: "Please upload at least one file",
    },
  ],
};

function IssueFormFields() {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { organizerEvents, eventsupport } = useSelector((state) => state.event);
  const {
    pagination,
    editable_status,
    filteredEvents,
    messages,
    loading,
    dialogVisible,
    modalLoading,
    warningPagination,
    editItemId,
    responseImpactData,
  } = useSelector((state) => state.event);

  const handleEventSingleDetails = (eventId) => {
    console.log("lll");
    dispatch(fetchEventSupportAvailable(eventId));
  };

  useEffect(() => {
    if (organizerEvents && organizerEvents.length == 0) {
      dispatch(
        fetchAllEvent({ event_type: EVENT_TYPES.event, organizer: false })
      );
    }
  }, [dispatch]);

  useEffect(() => {
    console.log("filteredEvents", filteredEvents);
  }, [filteredEvents]);

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  return (
    <Row gutter={16}>
      <Col xs={24} sm={24} md={17}>
        <Card title="Issue Details">
          {/* <Form form={form} layout="vertical" onFinish={handleSubmit}> */}
          {/* Issue Field */}
          <Form.Item name="subject" label="Issue" rules={rules.subject}>
            <Input placeholder="Enter Issue" />
          </Form.Item>

          {/* Description Field */}
          <Form.Item name="issue" label="Description" rules={rules.issue}>
            <Input.TextArea placeholder="Enter description" rows={4} />
          </Form.Item>

          {/* Event Selection */}
          <Form.Item name="event_id" label="Select Event" rules={rules.eventId}>
            <Select
              placeholder="Select an event"
              onChange={handleEventSingleDetails}
            >
              {filteredEvents &&
                filteredEvents.map((event) => (
                  <Option key={event.id} value={event.id}>
                    {event.event_name}
                  </Option>
                ))}
            </Select>
          </Form.Item>
          {eventsupport === false && (
            <Alert
              message="No event support available"
              description="The event will be assigned to Super Support."
              type="warning"
              showIcon
              closable
            />
          )}

          {/* Files Upload */}
          <Form.Item
            name="files"
            label="Upload Files"
            valuePropName="fileList"
            getValueFromEvent={normFile}
            rules={rules.files}
          >
            <Upload
              name="files"
              listType="picture"
              multiple
              beforeUpload={() => false}
            >
              <Button icon={<UploadOutlined />}>Click to upload files</Button>
            </Upload>
          </Form.Item>

          {/* Submit Button */}
          {/* <Form.Item>
              <Button type="primary" htmlType="submit" block>
                Submit
              </Button>
            </Form.Item> */}
          {/* </Form> */}
        </Card>
      </Col>
    </Row>
  );
}

export default IssueFormFields;
