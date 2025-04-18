import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Select,
  TimePicker,
  Typography,
  Space,
  Tag,
  Divider,
  Row,
  Col,
  Form,
  Avatar,
  Badge,
  Card,
  Image,
} from "antd";
import {
  ClockCircleOutlined,
  SaveOutlined,
  DeleteOutlined,
  TagOutlined,
  DollarOutlined,
  StarOutlined,
  CalendarOutlined,
  GlobalOutlined,
  MinusSquareOutlined,
} from "@ant-design/icons";
import { formatMinutes } from "./utils";
import dayjs from "dayjs";
import { ChairOutlined } from "@mui/icons-material";
import { useDispatch } from "react-redux";
import { DEFAULT_PAGE_SIZE } from "constants/PageConstants";
import { getAllSeatStructures } from "store/slices/movieSeatSlice";

const { Option } = Select;
const { Title, Text } = Typography;

export const MovieDetail = ({
  movie,
  onUpdate,
  onClose,
  coupons,
  offers,
  seats,
  onDelete,
  visible = true,
  screens,
  form,
}) => {
  const initialCoupon = movie.coupon || "";
  const dispatch = useDispatch();

  const [editedMovie, setEditedMovie] = useState(movie);
  const [selectedSeats, setSelectedSeats] = useState();
  const [couponCode, setCouponCode] = useState(initialCoupon);

  useEffect(() => {
    dispatch(
      getAllSeatStructures({
        ...DEFAULT_PAGE_SIZE,
        active: true,
        screen_id: editedMovie.screen?.id,
      })
    );
    form.setFieldsValue({
      screen: editedMovie.screen?.id,
      offer: editedMovie.offer,
      coupons: couponCode,
    });
  }, [editedMovie, couponCode, form]);

  const handleTimeChange = (time) => {
    if (time) {
      const totalMinutes = time.hour() * 60 + time.minute();
      setEditedMovie({
        ...editedMovie,
        startMinutes: totalMinutes,
        endMinutes: totalMinutes + movie.duration,
      });
    }
  };

  const handleScreenChange = (value) => {
    const selectedScreen = screens.find((screen) => screen.id === value);
    setEditedMovie({ ...editedMovie, screen: selectedScreen });
    dispatch(
      getAllSeatStructures({
        ...DEFAULT_PAGE_SIZE,
        active: true,
        screen_id: value,
      })
    );
  };

  const handleSeatChange = (seats) => {
    setSelectedSeats(seats);
  };

  const handleSave = () => {
    form.validateFields().then((values) => {
      const selectedScreen = screens.find(
        (screen) => screen.id === values.screen
      );
      onUpdate({
        ...editedMovie,
        coupon: values.coupons,
        offer: values.offer,
        selectedSeats: selectedSeats,
        screen: selectedScreen,
      });
    });
  };

  const handleOfferSelect = (value) => {
    setEditedMovie({ ...editedMovie, offer: value });
  };

  const handleCouponSelect = (value) => {
    setCouponCode(value);
  };

  const minutesToTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return dayjs().hour(hours).minute(mins).second(0);
  };

  // Format time for display
  const formatTimeFromMinutes = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      width="100%"
      style={{ top: 20 }}
      footer={
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => onDelete(editedMovie.id)}
          >
            Delete Movie
          </Button>
          <Space>
            <Button onClick={onClose}>Cancel</Button>
            <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>
              Save Changes
            </Button>
          </Space>
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          screen: editedMovie.screen,
          offer: editedMovie.offer,
          coupons: couponCode,
        }}
      >
        <Row gutter={[24, 24]}>
          <Col xs={24} md={8}>
            <div style={{ width: "300px", height: "450px" }}>
              <Image
                src={movie.thumbnail_image || movie.image}
                alt={movie.title}
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "8px",
                  objectFit: "cover",
                }}
                fallback="data:image/png;base64,..."
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <Title level={3} style={{ margin: 0 }}>
                {movie.title}
              </Title>
              <Space
                direction="vertical"
                style={{ width: "100%" }}
                size="small"
              >
                <Space>
                  <ClockCircleOutlined />
                  <Text>{formatMinutes(movie.duration)}</Text>
                </Space>

                {movie.director && (
                  <div>
                    <Text strong>Director:</Text> {movie.director}
                  </div>
                )}
              </Space>
            </div>
          </Col>

          <Col xs={24} md={16}>
            <Card
              title="Schedule Management"
              bordered={false}
              style={{ marginBottom: "20px" }}
            >
              <Row gutter={[24, 24]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="screen"
                    label="Screen"
                    rules={[
                      { required: true, message: "Please select a screen" },
                    ]}
                  >
                    <Select
                      style={{ width: "100%" }}
                      onChange={handleScreenChange}
                      placeholder="Select screen"
                      value={editedMovie.screen?.id}
                    >
                      {screens.map((screen) => (
                        <Option key={screen.id} value={screen.id}>
                          {screen.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item
                    label="Start Time"
                    rules={[
                      { required: true, message: "Please select a time" },
                    ]}
                  >
                    <TimePicker
                      style={{ width: "100%" }}
                      value={minutesToTime(editedMovie.startMinutes)}
                      onChange={handleTimeChange}
                      format="HH:mm"
                      minuteStep={15}
                    />
                  </Form.Item>

                  <Badge.Ribbon text="Scheduled Time" color={movie.color}>
                    <Card size="small">
                      <Text>
                        {formatTimeFromMinutes(editedMovie.startMinutes)} -{" "}
                        {formatTimeFromMinutes(editedMovie.endMinutes)}
                      </Text>
                    </Card>
                  </Badge.Ribbon>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item label="Select Seats Structure">
                    <Select
                      style={{ width: "100%" }}
                      placeholder="Select a seats structure"
                      value={selectedSeats}
                      onChange={handleSeatChange}
                      maxTagCount={5}
                      showSearch
                      allowClear
                    >
                      {seats.map((item) => (
                        <Option key={item.id || item.name} value={item.name}>
                          <Space>
                            <MinusSquareOutlined />
                            {item.name}
                          </Space>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* Promotions & Offers */}
            <Card title="Promotions & Offers" bordered={false}>
              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <Form.Item name="offer" label="Apply Offer">
                    <Select
                      placeholder="Select an offer"
                      onChange={handleOfferSelect}
                      allowClear
                    >
                      {offers &&
                        offers.map((offer) => (
                          <Option key={offer.id} value={offer.id}>
                            <Space>
                              <TagOutlined />
                              {offer.name}
                            </Space>
                          </Option>
                        ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item name="coupons" label="Apply Coupon">
                    <Select
                      placeholder="Select a coupon"
                      onChange={handleCouponSelect}
                      allowClear
                    >
                      {coupons &&
                        coupons.map((coupon) => (
                          <Option key={coupon.id} value={coupon.id}>
                            <Space>
                              <DollarOutlined />
                              {coupon.name}
                            </Space>
                          </Option>
                        ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};
