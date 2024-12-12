import React, { useEffect, useState } from "react";
import {
  Input,
  Row,
  Col,
  Card,
  Form,
  DatePicker,
  Select,
  Typography,
  Tabs,
  Button,
  message,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import {
  toggleSelectedOffer,
  setSelectedItemForModal,
  toggleSelectedCoupon,
} from "store/slices/scheduleSlice";
import { fetchAllEvent, fetchEventDetails } from "store/slices/eventSlice";
import OfferDateModal from "./OfferDateModal";

const { Option } = Select;
const { Text } = Typography;
const { TabPane } = Tabs;

function ScheduleFormFields({ onNext, onPrev }) {
  const dispatch = useDispatch();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState("1");

  const { selectedOffers, selectedCoupons, selectedItemForModal } = useSelector(
    (state) => state.schedules
  );
  const { eventDetails, loading, filteredEvents } = useSelector(
    (state) => state.event
  );

  useEffect(() => {
    dispatch(fetchAllEvent());
  }, [dispatch]);

  const handleEventSelect = (eventId) => {
    dispatch(fetchEventDetails(eventId));
  };

  const handleOfferSelect = (offerId) => {
    const selectedOffer = eventDetails.event_offers.find(
      (offer) => offer.id === offerId
    );
    if (selectedOffer) {
      dispatch(toggleSelectedOffer(selectedOffer));
    }
  };

  const handleCouponSelect = (couponId) => {
    const selectedCoupon = eventDetails.event_coupons.find(
      (coupon) => coupon.coupons.id === couponId
    );
    if (selectedCoupon) {
      dispatch(toggleSelectedCoupon(selectedCoupon));
    }
  };

  const showItemDetails = (item) => {
    dispatch(setSelectedItemForModal(item));
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    dispatch(setSelectedItemForModal(null));
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  const handleSubmit = () => {
    form.validateFields()
      .then((values) => {
        // Logic for form submission (e.g., API call)
        message.success("Form submitted successfully!");
        // You can also trigger further actions or close the modal, if necessary
      })
      .catch((errorInfo) => {
        console.log("Form validation failed:", errorInfo);
        message.error("Please fill all required fields");
      });
  };

  return (
    <Tabs activeKey={activeTab} onChange={handleTabChange}>
      {/* Tab 1: Schedule Details */}
      <TabPane tab="Schedule Details" key="1">
        <Row gutter={16}>
          <Col xs={24} sm={24} md={17}>
            <Card title="Schedule Details">
              <Form form={form} layout="vertical">
                <Form.Item name="event" label="Event" rules={[{ required: true, message: "Please select an event" }] }>
                   
                    <Select loading={loading}
                      className="w-100"
                      placeholder="Choose a Category"
                      onSelect={(id) => handleEventSelect(id)}
                    >
                      {filteredEvents.map((elm) => (
                        <Option key={elm.id} value={elm.id}>
                          {elm.event_name}
                        </Option>
                      ))}
                    </Select>
                  
                </Form.Item>

                <Form.Item name="start_date" label="Start Time" rules={[{ required: true, message: "Please select start time" }]}>
                  <DatePicker
                    showTime
                    className="w-100"
                    placeholder="Select start time"
                  />
                </Form.Item>

                <Form.Item name="end_date" label="End Time" rules={[{ required: true, message: "Please select end time" }]}>
                  <DatePicker
                    showTime
                    className="w-100"
                    placeholder="Select end time"
                  />
                </Form.Item>
              </Form>
            </Card>
          </Col>
        </Row>
      </TabPane>

      {/* Tab 2: Offers and Coupons */}
      <TabPane tab="Offers & Coupons" key="2">
        <Row gutter={16}>
          <Col xs={24} sm={24} md={17}>
            <Card title="Offers & Coupons">
              <Form layout="vertical">
                <Form.Item name="offer" label="Offer" rules={[{ required: true, message: "Please select an offer" }]}>
                  <Select
                    loading={loading}
                    className="w-100"
                    placeholder="Select Offer"
                    onChange={(value) => handleOfferSelect(value)}
                  >
                    {eventDetails?.event_offers?.map((offer) => (
                      <Option key={offer.id} value={offer.id}>
                        {offer.offer.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item name="coupon" label="Coupon" rules={[{ required: true, message: "Please select a coupon" }]}>
                  <Select
                    loading={loading}
                    className="w-100"
                    placeholder="Select Coupon"
                    onChange={(value) => handleCouponSelect(value)}
                  >
                    {eventDetails?.event_coupons?.map((coupon) => (
                      <Option key={coupon.id} value={coupon.id}>
                        {coupon.coupons.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Form>
            </Card>
          </Col>

          <Col xs={24} sm={24} md={7}>
            <div style={{ marginBottom: 16, marginTop: 0 }}>
              {selectedOffers.length > 0 ? <Text>Selected Offers</Text> : null}
              {selectedOffers.map((offer) => (
                <Card
                  key={offer.id}
                  size="small"
                  onClick={() => showItemDetails(offer)}
                  style={{
                    cursor: "pointer",
                    marginBottom: "8px",
                    position: "relative",
                  }}
                >
                  <Row justify="space-between" align="middle" style={{ marginBottom: "8px" }}>
                    <Text strong>{offer.name}</Text>
                    <Text style={{ fontSize: "12px", color: "#8c8c8c" }}>
                      Max Uses: {offer.max_uses}
                    </Text>
                  </Row>
                  <Row justify="space-between">
                    <Text>{`Start: ${offer.start_date}`}</Text>
                    <Text>{`End: ${offer.end_date}`}</Text>
                  </Row>
                </Card>
              ))}
            </div>
          </Col>
        </Row>
      </TabPane>

      <OfferDateModal
        isModalVisible={isModalVisible}
        selectedItemForModal={selectedItemForModal}
        handleModalClose={handleModalClose}
      />

      {/* Buttons for navigating tabs and submitting the form */}
      <div style={{ marginTop: "20px" }}>
        <Button onClick={() => setActiveTab("1")} style={{ marginRight: "10px" }}>
          Previous
        </Button>
        <Button onClick={() => setActiveTab("2")} style={{ marginRight: "10px" }}>
          Next
        </Button>
        <Button onClick={handleSubmit} type="primary">
          Submit
        </Button>
      </div>
    </Tabs>
  );
}

export default ScheduleFormFields;
