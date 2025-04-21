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
  InputNumber,
  message,
  DatePicker,
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
  FieldTimeOutlined,
} from "@ant-design/icons";
import { formatMinutes } from "./utils";
import dayjs from "dayjs";
import { ChairOutlined } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
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
  const dispatch = useDispatch();
  const { initialBookingStartDate } = useSelector(
    (state) => state.movieScheduleSlice
  );

  const initialCoupons = movie.coupons || [];
  const initialOffers = movie.offers || [];
  const initialSeatStructure = movie.seatStructureId || null;
  const initialIntervalTime = movie.intervalTime || 15;
  const initialBookingDate = movie.bookingStartDate
    ? dayjs(movie.bookingStartDate)
    : initialBookingStartDate
    ? initialBookingStartDate
    : dayjs();

  const [editedMovie, setEditedMovie] = useState(movie);
  const [selectedSeatStructureId, setSelectedSeatStructureId] =
    useState(initialSeatStructure);
  const [selectedCouponIds, setSelectedCouponIds] = useState(initialCoupons);
  const [selectedOfferIds, setSelectedOfferIds] = useState(initialOffers);
  const [intervalTime, setIntervalTime] = useState(initialIntervalTime);
  const [bookingStartDate, setBookingStartDate] = useState(initialBookingDate);

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
      offers: selectedOfferIds,
      coupons: selectedCouponIds,
      seatStructure: selectedSeatStructureId,
      intervalTime: intervalTime,
      booking_start_date: bookingStartDate,
    });
  }, []);

  useEffect(() => {
    form.setFieldsValue({
      screen: editedMovie.screen?.id,
      offers: selectedOfferIds,
      coupons: selectedCouponIds,
      seatStructure: selectedSeatStructureId,
      intervalTime: intervalTime,
      booking_start_date: bookingStartDate,
    });
  }, [
    editedMovie.screen?.id,
    selectedCouponIds,
    selectedOfferIds,
    selectedSeatStructureId,
    intervalTime,
    bookingStartDate,
  ]);

  const handleTimeChange = (time) => {
    if (time) {
      const totalMinutes = time.hour() * 60 + time.minute();
      setEditedMovie({
        ...editedMovie,
        startMinutes: totalMinutes,
        endMinutes: totalMinutes + movie.duration + intervalTime, // Include interval time
      });
    }
  };
  const handleBookingStartDateChange = (date) => {
    setBookingStartDate(date);
  };
  const handleScreenChange = (value) => {
    const selectedScreen = screens.find((screen) => screen.id === value);

    // Reset seat structure data
    setSelectedSeatStructureId(null);

    // Update edited movie with new screen and clear seat structure
    setEditedMovie({
      ...editedMovie,
      screen: selectedScreen,
      seatStructureId: null,
    });

    // Reset the form field
    form.setFieldsValue({
      seatStructure: null,
    });

    // Fetch new seat structures for selected screen
    dispatch(
      getAllSeatStructures({
        ...DEFAULT_PAGE_SIZE,
        active: true,
        screen_id: value,
      })
    );
  };
  const handleSeatStructureChange = (value) => {
    setSelectedSeatStructureId(value);
  };

  const handleIntervalTimeChange = (value) => {
    setIntervalTime(value);
    // Update end time when interval changes
    if (editedMovie.startMinutes) {
      setEditedMovie({
        ...editedMovie,
        endMinutes: editedMovie.startMinutes + movie.duration + value,
      });
    }
  };

  const handleSave = () => {
    form
      .validateFields()
      .then((values) => {
        const selectedScreen = screens.find(
          (screen) => screen.id === values.screen
        );
        onUpdate({
          ...editedMovie,
          coupons: values.coupons,
          offers: values.offers,
          seatStructureId: values.seatStructure,
          intervalTime: values.intervalTime,
          screen: selectedScreen,
          bookingStartDate: values.booking_start_date
            ? values.booking_start_date.toISOString()
            : null,

          endMinutes:
            editedMovie.startMinutes + movie.duration + values.intervalTime,
        });
      })
      .catch((error) => {
        message.error("Please fill all required fields");
      });
  };

  const handleOffersSelect = (value) => {
    setSelectedOfferIds(value);
  };

  const handleCouponsSelect = (value) => {
    setSelectedCouponIds(value);
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
          screen: editedMovie.screen?.id,
          offers: selectedOfferIds,
          coupons: selectedCouponIds,
          seatStructure: selectedSeatStructureId,
          intervalTime: intervalTime,
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

                {movie.language && (
                  <div>
                    <Text strong>Language:</Text> {movie.language}
                  </div>
                )}

                {movie.genre && (
                  <div>
                    <Space>
                      <TagOutlined />
                      <Text>{movie.genre}</Text>
                    </Space>
                  </div>
                )}

                {movie.rating && (
                  <div>
                    <Space>
                      <StarOutlined style={{ color: "#faad14" }} />
                      <Text>{movie.rating}/10</Text>
                    </Space>
                  </div>
                )}

                {movie.release_date && (
                  <div>
                    <Space>
                      <CalendarOutlined />
                      <Text>{movie.release_date}</Text>
                    </Space>
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

                  <Card
                    size="small"
                    title="Showing Time"
                    extra={<Tag color={movie.color}>Scheduled</Tag>}
                    style={{ marginBottom: "16px" }}
                  >
                    <Row align="middle">
                      <Col span={24}>
                        <Space direction="vertical" style={{ width: "100%" }}>
                          <Space>
                            <ClockCircleOutlined />
                            <Text strong>Show Time:</Text>
                            <Text>
                              {formatTimeFromMinutes(editedMovie.startMinutes)}{" "}
                              - {formatTimeFromMinutes(editedMovie.endMinutes)}
                            </Text>
                          </Space>
                          {intervalTime > 0 && (
                            <Space>
                              <FieldTimeOutlined />
                              <Text strong>Interval:</Text>
                              <Text>{intervalTime} minutes</Text>
                            </Space>
                          )}
                          <Space>
                            <GlobalOutlined />
                            <Text strong>Duration:</Text>
                            <Text>{formatMinutes(movie.duration)}</Text>
                          </Space>
                        </Space>
                      </Col>
                    </Row>
                  </Card>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    name="seatStructure"
                    label="Select Seats Structure"
                    rules={[
                      {
                        required: true,
                        message: "Please select a seat structure",
                      },
                    ]}
                  >
                    <Select
                      style={{ width: "100%" }}
                      placeholder="Select a seats structure"
                      onChange={handleSeatStructureChange}
                      showSearch
                      allowClear
                    >
                      {seats.map((item) => (
                        <Option key={item.id} value={item.id}>
                          <Space>
                            <MinusSquareOutlined />
                            {item.name}
                          </Space>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item
                    name="intervalTime"
                    label="Interval Time (minutes)"
                    rules={[
                      { required: true, message: "Please enter interval time" },
                    ]}
                  >
                    <InputNumber
                      style={{ width: "100%" }}
                      min={0}
                      max={60}
                      onChange={handleIntervalTimeChange}
                      addonAfter={<FieldTimeOutlined />}
                      placeholder="Enter interval time in minutes"
                    />
                  </Form.Item>
                  <Form.Item
                    label="Booking Start Date"
                    name="booking_start_date"
                    tooltip="Select when users can start booking this show"
                  >
                    <DatePicker
                      style={{ width: "100%" }}
                      value={bookingStartDate}
                      onChange={handleBookingStartDateChange}
                      placeholder="Select booking start date"
                      showTime={true}
                      showSecond={false}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Card title="Promotions & Offers" bordered={false}>
              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <Form.Item name="offers" label="Apply Offers">
                    <Select
                      placeholder="Select offers"
                      onChange={handleOffersSelect}
                      mode="multiple"
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
                  <Form.Item name="coupons" label="Apply Coupons">
                    <Select
                      placeholder="Select coupons"
                      onChange={handleCouponsSelect}
                      mode="multiple"
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
