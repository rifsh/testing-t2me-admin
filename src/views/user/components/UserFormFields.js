import React, { useEffect } from "react";
import { Input, Row, Col, Card, Form, Select, Tooltip, Upload, Button, Typography, message } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllRoles, setSelectedRole } from "store/slices/userSlice";
import { fetchAllEvent } from "store/slices/eventSlice";
import { UserRoleConstants } from "constants/UserRoleConstant";
import { InfoCircleOutlined, UploadOutlined } from '@ant-design/icons';
import { userRules } from "../constants/RuleConstants";
import { SupportImageFormat, SupportFormatContent } from "constants/SupportFileConstants";
import Utils from "utils/index";
import { getCurrentUser } from "configs/UserAccessConfig";

const { Text } = Typography;

const { Option } = Select;



function UserFormFields() {
  const dispatch = useDispatch();
  const { roles, loading, selectedRole } = useSelector((state) => state.users);
  const { filteredEvents, loading: eventLoading } = useSelector(
    (state) => state.event
  );

  useEffect(() => {
    dispatch(fetchAllRoles({}));
  }, [dispatch]);

  const handleSelectedRole = (role) => {
    dispatch(setSelectedRole(role));
    if (role === UserRoleConstants.eventOrganizerRoleId) {
      dispatch(fetchAllEvent({}));
    }
  };
  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };
  const handleBeforeUpload = Utils.handleBeforeUpload;

  return (
    <Row gutter={16}>
      <Col xs={24} sm={24} md={17}>
        <Card title="User Details">
          <Form.Item 
            name="username" 
            label={
              <span>
                Username&nbsp;
                <Tooltip title="Username must contain only letters, be 3-30 characters long, and not start/end with spaces">
                  <InfoCircleOutlined />
                </Tooltip>
              </span>
            }
            rules={userRules.username}
            validateTrigger={['onChange', 'onBlur']}
            hasFeedback
          >
            <Input 
              placeholder="Enter Username"
              maxLength={30}
            />
          </Form.Item>

          <Form.Item
            name="email"
            label={
              <span>
                Email Address&nbsp;
                <Tooltip title="Enter a valid email address (e.g., example@domain.com)">
                  <InfoCircleOutlined />
                </Tooltip>
              </span>
            }
            rules={userRules.email}
            validateTrigger={['onChange', 'onBlur']}
            hasFeedback
          >
            <Input placeholder="Enter Email Address" />
          </Form.Item>

          <Form.Item
            name="password"
            label={
              <span>
                Password&nbsp;
                <Tooltip title="Password must be 8-30 characters and include uppercase, lowercase, number, and special character">
                  <InfoCircleOutlined />
                </Tooltip>
              </span>
            }
            rules={userRules.password}
            validateTrigger={['onChange', 'onBlur']}
            hasFeedback
          >
            <Input.Password 
              placeholder="Enter Password"
              maxLength={30}
            />
          </Form.Item>

          <Form.Item 
            name="position_id" 
            label="Role" 
         
            validateTrigger={['onChange', 'onBlur']}
            hasFeedback
          >
            <Select
              className="w-100"
              placeholder="Select a Role"
              loading={loading}
              onChange={(value) => handleSelectedRole(value)}
            >
              {roles
            .filter((role) => 
              !(getCurrentUser().role_id === UserRoleConstants.techAdminRoleId && 
                (role.position_id === 1 || role.position_id === 2))
            )
            .map((role) => (
              <Option key={role.position_id} value={role.position_id}>
                {role.name}
              </Option>
            ))}
            </Select>
          </Form.Item>

          {(selectedRole === UserRoleConstants.eventOrganizerRoleId || selectedRole === UserRoleConstants.eventSupportingTeamRoleId) && (
          <Form.Item 
            name="event_ids" 
            label={
              <span>
                Events&nbsp;
                {/* <Tooltip title="You can select up to 5 events"> */}
                <Tooltip title="Please select your events">
                
                  <InfoCircleOutlined />
                </Tooltip>
              </span>
            }
              
              validateTrigger={['onChange']}
              hasFeedback
            >
              <Select
                mode="multiple"
                loading={eventLoading}
                style={{ width: "100%" }}
                placeholder="Please select your events"
                maxTagCount={5}
                showArrow
              >
                {filteredEvents.map((event) => (
                  <Option key={event.id} value={event.id}>
                    {event.event_name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}
           <Form.Item
              name="thumbnail_image"
              label="Thumbnail Image"
              valuePropName="fileList"
              getValueFromEvent={normFile}
            
            >
            <Upload name="thumbnail_image" listType="picture" maxCount={1} beforeUpload={handleBeforeUpload}
              accept={`.${SupportImageFormat.join(',.')}`}
            >
              <Button icon={<UploadOutlined />}>Click to upload</Button>
            </Upload>
            
          </Form.Item>
          <Text
              type="warning"
              style={{ padding: "00px 00px", fontSize: "11px" }}
            >
              {SupportFormatContent.join(",")}: {" "}
              {SupportImageFormat.join(", ")}.
              {" "}
            </Text>
        </Card>
      </Col>
    </Row>
  );
}

export default UserFormFields;