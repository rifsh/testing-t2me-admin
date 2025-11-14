import React, { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Space,
  Image,
  Button,
  Carousel,
  Form,
  message,
  Modal,
  Alert,
  Input,
  Tabs,
  Empty,
} from "antd";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { fetchEventDetails } from "store/slices/eventSlice";
import Loading from "components/shared-components/Loading";
import TabPane from "antd/es/tabs/TabPane";
import EventOverviewTab from "../components/EventOverviewTab";
import EventUsersTab from "../components/EventUsersTab";
import ServicesTab from "../components/ServicesTab ";
import FaqTab from "../components/FaqTab ";
import OffersCouponsTab from "../components/OffersCouponsTab ";
import ImagesTab from "../components/ImagesTab";
import { EnrollUser } from "store/slices/leadEventSlice";
import { UserAddOutlined } from "@ant-design/icons";
import { UserRoleConstants } from "constants/UserRoleConstant";
import { getCurrentUser } from "configs/UserAccessConfig";
import { CDN_PATH } from "configs/AppConfig";
import CDNImage from "components/layout-components/Image/CDNImage";

const { Title, Text } = Typography;
export const getUserRole = () => {
  const currentUser = getCurrentUser();
  switch (currentUser.role_id) {
    case UserRoleConstants.superAdminRoleId:
      return UserRoleConstants.superAdmin;
    case UserRoleConstants.eventSupportingTeamRoleId:
      return UserRoleConstants.eventSupportingTeam;
  }
};

const EventDetails = () => {
  const [activeTab, setActiveTab] = useState("1");
  const { eventId } = useParams();
  const dispatch = useDispatch();
  const { eventDetails, loading, error } = useSelector((state) => state.event);
  const mediaImages =
    eventDetails?.media?.map((item) => `${CDN_PATH}/${item.media_url}`) || [];
  const [form] = Form.useForm();
  const [enrollModalVisible, setEnrollModalVisible] = useState(false);
  const currentUser = getCurrentUser();

  // Check if thumbnail image is missing or contains a default value
  const isNoImage =
    !eventDetails?.thumbnail_image ||
    eventDetails?.thumbnail_image === "images" ||
    eventDetails?.thumbnail_image === "";

  useEffect(() => {
    if (eventId) {
      dispatch(fetchEventDetails(eventId));
    }
  }, [dispatch, eventId]);
  const handleEnrollUser = () => {
    setEnrollModalVisible(true);
  };
  const handleEnrollSubmit = async () => {
    try {
      const values = await form.validateFields();
      const data = {
        event_id: eventId,
        email: values.email,
      };

      const response = await dispatch(EnrollUser(data)).unwrap();
      message.success(
        response.status?.message || "User enrolled successfully!"
      );
      setEnrollModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error("Enrollment failed:", error);
    }
  };

  if (loading) return <Loading />;
  if (error) return <div>Error: {error}</div>;
  if (!eventDetails) return <div>No Event Details Found</div>;



  return (
    <div
      style={{
        margin: "0 auto",
        padding: "24px",
      }}
    >
      <Card
        bordered={false}
        className="event-header-card"
        style={{
          borderRadius: "12px",
          overflow: "hidden",
          marginBottom: "24px",
        }}
        cover={
          mediaImages?.length === 0 ? (
            <div
              style={{
                height: 400,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#f5f5f5",
                color: "#888",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "24px", marginBottom: "8px" }}>
                  No Image Available
                </div>
                <div>Event visual will appear here when uploaded</div>
              </div>
            </div>
          ) : (
            <div style={{ position: "relative", width: "100%" }}>
              <Carousel autoplay>
                {eventDetails?.media.map((item, index) => (
                  <div key={index}>
                    {item.media_type === "image" ? (
                      <CDNImage
                        src={item.media_url}
                        alt={item.caption || `media image ${index + 1}`}
                        height={400}
                        style={{ width: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <video
                        controls
                        style={{
                          width: "100%",
                          height: "400px",
                          objectFit: "cover",
                          backgroundColor: "#000",
                        }}
                      >
                        <source
                          src={CDN_PATH + "/" + item.media_url}
                          type="video/mp4"
                        />
                        Your browser does not support the video tag.
                      </video>
                    )}
                    {item.caption && (
                      <div
                        style={{
                          textAlign: "center",
                          marginTop: "10px",
                          padding: "10px",
                        }}
                      >
                        <Text type="secondary">{item.caption}</Text>
                      </div>
                    )}
                  </div>
                ))}
              </Carousel>
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: "linear-gradient(transparent, rgba(0,0,0,0.8))",
                  padding: "60px 24px 24px",
                  color: "white",
                }}
              >
                <Title level={2} style={{ margin: "0", color: "white" }}>
                  {eventDetails.event_name}
                </Title>
              </div>
            </div>
          )
        }
      >
        <div className="p-0 md:px-[8px] md:py-0">
          <Text style={{ fontSize: "16px", lineHeight: "1.6" }}>
            {eventDetails.description}
          </Text>
        </div>
      </Card>

      <Card
        bordered={false}
        style={{
          borderRadius: "12px",
          // boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
        }}
        bodyStyle={{ padding: "0" }}
      >
        <Tabs
          defaultActiveKey="1"
          onChange={setActiveTab}
          type="card"
          size="large"
          style={{ padding: "0 16px" }}
          tabBarStyle={{
            marginBottom: "0",
            borderBottom: "1px solid #f0f0f0",
            backgroundColor: "#fafafa",
            borderTopLeftRadius: "12px",
            borderTopRightRadius: "12px",
            padding: "8px 8px 0",
          }}
        >
          <TabPane
            tab={
              <span style={{ padding: "0 8px" }}>
                <span role="img" aria-label="info">
                  ℹ️
                </span>{" "}
                Overview
              </span>
            }
            key="1"
          >
            <EventOverviewTab
              isNoImage={isNoImage}
              eventDetails={eventDetails}
              mediaImages={mediaImages}
            />
          </TabPane>

          <TabPane
            tab={
              <span style={{ padding: "0 8px" }}>
                <span role="img" aria-label="team">
                  👥
                </span>{" "}
                Event Users
              </span>
            }
            key="2"
          >
            <div style={{ padding: "24px 24px 0" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "20px",
                }}
              >
                <Typography.Title level={4} style={{ margin: 0 }}>
                  Event Users
                </Typography.Title>
                {currentUser.role_id !==
                  UserRoleConstants.eventOrganizerRoleId && (
                    <Button
                      type="primary"
                      icon={<UserAddOutlined />}
                      onClick={handleEnrollUser}
                    >
                      Add User
                    </Button>
                  )}
              </div>

              {eventDetails.users?.length > 0 ? (
                <Row gutter={[24, 24]} justify="start">
                  {eventDetails?.users.map((user, index) => (
                    <EventUsersTab key={index} user={user} />
                  ))}
                </Row>
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="No Event Users associated with this event yet"
                  style={{ margin: "40px 0" }}
                />
              )}
            </div>
          </TabPane>

          <TabPane
            tab={
              <span style={{ padding: "0 8px" }}>
                <span role="img" aria-label="services">
                  🛍️
                </span>{" "}
                Services
              </span>
            }
            key="3"
          >
            <div style={{ padding: "24px" }}>
              <ServicesTab eventDetails={eventDetails} />
            </div>
          </TabPane>

          <TabPane
            tab={
              <span style={{ padding: "0 8px" }}>
                <span role="img" aria-label="faq">
                  ❓
                </span>{" "}
                FAQ
              </span>
            }
            key="4"
          >
            <div style={{ padding: "24px" }}>
              <FaqTab eventDetails={eventDetails} />
            </div>
          </TabPane>

          <TabPane
            tab={
              <span style={{ padding: "0 8px" }}>
                <span role="img" aria-label="offers">
                  🏷️
                </span>{" "}
                Offers & Coupons
              </span>
            }
            key="5"
          >
            <div style={{ padding: "24px" }}>
              <OffersCouponsTab eventDetails={eventDetails} />
            </div>
          </TabPane>

          <TabPane
            tab={
              <span style={{ padding: "0 8px" }}>
                <span role="img" aria-label="images">
                  🖼️
                </span>{" "}
                Images
              </span>
            }
            key="6"
          >
            <div style={{ padding: "24px" }}>
              <ImagesTab eventDetails={eventDetails} />
            </div>
          </TabPane>
        </Tabs>
      </Card>
      <Modal
        title="Enroll User to Event"
        open={enrollModalVisible}
        onCancel={() => setEnrollModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setEnrollModalVisible(false)}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={handleEnrollSubmit}>
            Enroll
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="email"
            label="User Email"
            rules={[
              { required: true, message: "Please enter the user's email" },
              { type: "email", message: "Please enter a valid email" },
            ]}
          >
            <Input placeholder="Enter user email" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default EventDetails;
