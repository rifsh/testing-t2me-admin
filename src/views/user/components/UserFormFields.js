import React, { useEffect, useState } from "react";
import {
  Input,
  Row,
  Col,
  Card,
  Form,
  Select,
  Tooltip,
  Upload,
  Button,
  Typography,
  Radio,
  Flex,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllRoles, setSelectedRole } from "store/slices/userSlice";
import { fetchAllEvent } from "store/slices/eventSlice";
import { UserRoleConstants } from "constants/UserRoleConstant";
import { DotChartOutlined, InfoCircleOutlined, LineChartOutlined, UploadOutlined } from "@ant-design/icons";
import { userRules } from "../constants/RuleConstants";
import {
  SupportImageFormat,
  SupportFormatContent,
  ResolutionByServices,
} from "constants/SupportFileConstants";
import Utils from "utils/index";
import { getCurrentUser } from "configs/UserAccessConfig";
import GenericDropdown from "views/theater/components/GenericDropdown";
import { fetchDropdownTheaters, fetchTheaters } from "store/slices/theaterSlice";

const { Text } = Typography;
const { Option } = Select;

function UserFormFields({ mode, user }) {
  const dispatch = useDispatch();
  const { roles, loading, selectedRole } = useSelector((state) => state.users);
  const [value, setValue] = useState(1);
  const { filteredEvents, loading: eventLoading } = useSelector(
    (state) => state.event
  );
  const { response } = useSelector((state) => state.theater);


  useEffect(() => {
    dispatch(setSelectedRole(null));
    if (
      mode !== "EDIT" ||
      (mode === "EDIT" &&
        getCurrentUser().role_id === UserRoleConstants.superAdminRoleId)
    ) {
      dispatch(fetchAllRoles({}));
    }
  }, [dispatch, mode, user]);

  const handleSelectedRole = (role) => {
    dispatch(setSelectedRole(role));
    if (role === UserRoleConstants.eventOrganizerRoleId) {
      dispatch(fetchAllEvent({}));
      dispatch(fetchDropdownTheaters({}));
    }
  };

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  useEffect(() => {
    if (response) {
      console.log('theaterresponse', response?.items)
    }
  }, [response])

  const onRadioChange = (e) => {
    setValue(e.target.value);
  };

  const renderFormFields = () => {
    if (mode === "EDIT") {
      return (
        <>
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
            validateTrigger={["onChange", "onBlur"]}
            hasFeedback
          >
            <Input placeholder="Enter Username" maxLength={30} />
          </Form.Item>

          {getCurrentUser().role_id === UserRoleConstants.superAdminRoleId && (
            <Form.Item
              name="position_id"
              label="Role"
              validateTrigger={["onChange", "onBlur"]}
              hasFeedback
            >
              <Select
                className="w-100"
                placeholder="Select a Role"
                loading={loading}
                onChange={(value) => handleSelectedRole(value)}
              >
                {roles
                  .filter(
                    (role) =>
                      !(
                        getCurrentUser().role_id ===
                        UserRoleConstants.techAdminRoleId &&
                        (role.position_id === 1 || role.position_id === 2)
                      )
                  )
                  .map((role) => (
                    <Option key={role.position_id} value={role.position_id}>
                      {role.name}
                    </Option>
                  ))}
              </Select>
            </Form.Item>
          )}
          {(selectedRole === UserRoleConstants.eventOrganizerRoleId ||
            selectedRole === UserRoleConstants.eventSupportingTeamRoleId) && (
              <Form.Item
                name="event_ids"
                label={
                  <span>
                    Events&nbsp;
                    <Tooltip title="Please select your events">
                      <InfoCircleOutlined />
                    </Tooltip>
                  </span>
                }
                validateTrigger={["onChange"]}
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
          <div className="my-10">
            <GenericDropdown
              name="theatre_ids"
              label="Theaters"
              mode="multiple"
              rules={[{ required: false, message: 'Please select your theaters!' }]}
              fetchOptions={fetchDropdownTheaters}
              optionsData={response?.items}
              loading={loading}
              optionLabelKey="name"
              optionExtraLabel=""
              optionValueKey="id"
              searchParamKey="search"
              isInfoVisible={true}
            />
          </div>
          <Form.Item
            name="thumbnail_image"
            label="Thumbnail Image"
            valuePropName="fileList"
            getValueFromEvent={normFile}
            style={{ marginBottom: "0px", padding: "0px" }}
          >
            <Upload
              name="thumbnail_image"
              listType="picture"
              maxCount={1}
              beforeUpload={(file) =>
                Utils.handleBeforeUpload(file, ResolutionByServices.place)
              }
              accept={`.${SupportImageFormat.join(",.")}`}
            >
              <Button icon={<UploadOutlined />}>Click to upload</Button>
            </Upload>
          </Form.Item>
        </>
      );
    }

    // Show all fields for non-EDIT mode
    return (
      <>
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
          validateTrigger={["onChange", "onBlur"]}
          hasFeedback
        >
          <Input placeholder="Enter Username" maxLength={30} />
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
          validateTrigger={["onChange", "onBlur"]}
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
          validateTrigger={["onChange", "onBlur"]}
          hasFeedback
        >
          <Input.Password placeholder="Enter Password" maxLength={30} />
        </Form.Item>

        <Form.Item
          name="position_id"
          label="Role"
          validateTrigger={["onChange", "onBlur"]}
          hasFeedback
        >
          <Select
            className="w-100"
            placeholder="Select a Role"
            loading={loading}
            onChange={(value) => handleSelectedRole(value)}
          >
            {roles
              .filter(
                (role) =>
                  !(
                    getCurrentUser().role_id ===
                    UserRoleConstants.techAdminRoleId &&
                    (role.position_id === 1 || role.position_id === 2)
                  )
              )
              .map((role) => (
                <Option key={role.position_id} value={role.position_id}>
                  {role.name}
                </Option>
              ))}
          </Select>
        </Form.Item>

        {(selectedRole === UserRoleConstants.eventOrganizerRoleId ||
          selectedRole === UserRoleConstants.eventSupportingTeamRoleId) && (
            <>
              {/* <Radio.Group
                onChange={onRadioChange}
                className="mt-2"
                value={value}
                options={[
                  {
                    value: 1,
                    label: (
                      <Flex gap="small" justify="center" align="center" vertical>
                        Event Organizer
                      </Flex>
                    ),
                  },
                  {
                    value: 2,
                    label: (
                      <Flex gap="small" justify="center" align="center" vertical>
                        Theater Organizer
                      </Flex>
                    ),
                  },
                ]}
              />
              {value === 1 &&
                < Form.Item
                  name="event_ids"
                  className="my-10"
                  label={
                    <span>
                      Events&nbsp;
                      <Tooltip title="Please select your events">
                        <InfoCircleOutlined />
                      </Tooltip>
                    </span>
                  }
                  validateTrigger={["onChange"]}
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
                </Form.Item>}

              {value === 2 &&
              } */}
              < Form.Item
                name="event_ids"
                className="my-10"
                label={
                  <span>
                    Events&nbsp;
                    <Tooltip title="Please select your events">
                      <InfoCircleOutlined />
                    </Tooltip>
                  </span>
                }
                validateTrigger={["onChange"]}
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
              <div className="my-10">
                <GenericDropdown
                  name="theatre_ids"
                  label="Theaters"
                  mode="multiple"
                  rules={[{ required: false, message: 'Please select your theaters!' }]}
                  fetchOptions={fetchDropdownTheaters}
                  optionsData={response?.items}
                  loading={loading}
                  optionLabelKey="name"
                  optionExtraLabel=""
                  optionValueKey="id"
                  searchParamKey="search"
                  isInfoVisible={true}
                  hasFeedback={true}
                />
              </div>
            </>
          )
        }

        <Form.Item
          name="thumbnail_image"
          label="Thumbnail Image"
          valuePropName="fileList"
          getValueFromEvent={normFile}
          style={{ marginBottom: "0px", padding: "0px" }}
        >
          <Upload
            name="thumbnail_image"
            listType="picture"
            maxCount={1}
            beforeUpload={(file) =>
              Utils.handleBeforeUpload(file, ResolutionByServices.place)
            }
            accept={`.${SupportImageFormat.join(",.")}`}
          >
            <Button icon={<UploadOutlined />}>Click to upload</Button>
          </Upload>
        </Form.Item>
      </>
    );
  };

  return (
    <Row gutter={16}>
      <Col xs={24} sm={24} md={17}>
        <Card title="User Details">
          {renderFormFields()}
          <Text type="warning" style={{ padding: "0px 0px", fontSize: "11px" }}>
            {SupportFormatContent.join(",")}: {SupportImageFormat.join(", ")} &
            {" resolution "}
            {ResolutionByServices.place} pixels.{" "}
          </Text>
        </Card>
      </Col>
    </Row>
  );
}

export default UserFormFields;
