import React, { useEffect } from "react";
import {
  Input,
  Row,
  Col,
  Card,
  Form,
  DatePicker,
  Upload,
  message,
  Button,
  InputNumber,
  Typography,
} from "antd";
import moment from "moment";
import {
  InboxOutlined,
  FileImageOutlined,
  PlayCircleOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import SearchBarWithStatus from "components/util-components/Search/SearchBarWithStatus";
import FileGallery from "./FilegalleryComponent";
import {
  fetchAdBanners,
  setDraggedFile,
  setVideoPlayingStatus,
  setDraggedFileState,
  setSelectedDroppedFile,
  filterBanner,
} from "store/slices/advertisementSlice";
import { ScheduleTimeSlots } from "views/schedule/event/components/ScheduleTimeSlotes";

const { Dragger } = Upload;
const { Title, Text, Paragraph } = Typography;
const { Search } = Input;

const rules = {
  name: [
    {
      required: true,
      message: "Please enter schedule name",
    },
  ],
  startDate: [
    {
      required: true,
      message: "Please select the start date",
    },
  ],
  endDate: [
    {
      required: true,
      message: "Please select the end date",
    },
  ],
};

function AdScheduleFormFields({ form }) {
  //const [form] = Form.useForm();
  const startDate = Form.useWatch("start_date", form);
  const dispatch = useDispatch();
  const videoRef = React.useRef(null);

  const { filteredAdBanner, draggedFile, selectedDroppedFile, isVideoPlaying } =
    useSelector((state) => state.advertisement);

  useEffect(() => {
    dispatch(setDraggedFileState(null));
    dispatch(setSelectedDroppedFile(null));
    dispatch(fetchAdBanners({ page: 1, size: 10 }));
  }, []);

  const onDragStart = (e, file) => {
    e.stopPropagation();
    dispatch(setDraggedFile(file));
  };

  const onDragEnd = (e) => {
    // Clear the dragged file if drop wasn't successful
    const dropTarget = document.querySelector(".ant-upload-drag");
    if (
      !dropTarget ||
      !dropTarget.contains(document.elementFromPoint(e.clientX, e.clientY))
    ) {
      dispatch(setDraggedFile(null));
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const dropTarget = document.querySelector(".ant-upload-drag");
    if (
      draggedFile &&
      dropTarget &&
      dropTarget.contains(document.elementFromPoint(e.clientX, e.clientY))
    ) {
      form.setFieldsValue({
        advertisement_banner_id: draggedFile.id,
      });
      dispatch(setSelectedDroppedFile(draggedFile));
      message.success(`${draggedFile.name} added to upload field.`);
    } else {
      dispatch(setDraggedFile(null)); // Clear dragged file if drop was unsuccessful
      message.error("Failed to add file to upload field.");
    }
  };

  const onDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const toggleVideoPlayback = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      dispatch(setVideoPlayingStatus(!isVideoPlaying));
    }
  };

  const renderPreview = () => {
    if (!selectedDroppedFile) return null;

    const isVideo = /\.(mp4|webm|ogg)$/i.test(selectedDroppedFile.media_path);

    return (
      <div className="mt-4 flex justify-center items-center">
        <div
          className="relative"
          style={{ maxWidth: "100%", maxHeight: "300px" }}
        >
          {isVideo ? (
            <>
              <video
                ref={videoRef}
                src={selectedDroppedFile.media_path}
                style={{
                  width: "100%",
                  height: "auto",
                  maxHeight: "300px",
                  objectFit: "contain",
                }}
                controls={false}
                muted
                playsInline
                onEnded={() => dispatch(setVideoPlayingStatus(false))}
              />
              <Button
                type="primary"
                icon={isVideoPlaying ? null : <PlayCircleOutlined />}
                className="absolute bottom-2 left-1/2 transform -translate-x-1/2"
                onClick={toggleVideoPlayback}
              >
                {isVideoPlaying ? "Pause" : "Play"}
              </Button>
            </>
          ) : (
            <img
              src={selectedDroppedFile.media_path}
              alt="Preview"
              style={{
                width: "100%",
                height: "auto",
                maxHeight: "300px",
                objectFit: "contain",
              }}
            />
          )}
        </div>
      </div>
    );
  };
  const renderBannerDetails = () => {
    if (!selectedDroppedFile) return null;

    return (
      <Card style={{ marginTop: 16 }}>
        {/* <Title level={4}>Event Information</Title> */}
        <Row gutter={[24, 24]}>
          <Col xs={24} md={8}>
            <Text type="secondary">Category Name</Text>
            <div>
              <Text strong>
                {selectedDroppedFile.banner_category?.name ?? "N/A"}
              </Text>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <Text type="secondary">Place Name</Text>
            <div>
              <Text strong>{selectedDroppedFile.place?.name ?? "N/A"}</Text>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <Text type="secondary">Event Name</Text>
            <div>
              {/* <Text strong>{IssueDetails?.issue_status?.charAt(0).toUpperCase() + IssueDetails?.issue_status?.slice(1)}</Text> */}
              <Text strong>
                {selectedDroppedFile.event?.event_name ?? "N/A"}
              </Text>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <Text type="secondary">Country Name</Text>
            <div>
              <Text strong>
                {selectedDroppedFile.place?.country?.name ?? "N/A"}
              </Text>
            </div>
          </Col>
        </Row>
      </Card>
    );
  };

  const preventDefault = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <Row gutter={16}>
      {/* File Gallery */}
      <Col xs={24} sm={12}>
        <FileGallery onDragStart={onDragStart} onDragEnd={onDragEnd} />
      </Col>

      {/* Form Section */}
      <Col xs={24} sm={12}>
        <Card>
          <Form layout="vertical" form={form}>
            <Form.Item name="name" label="Schedule Name" rules={rules.name}>
              <Input placeholder="Enter Schedule Name" />
            </Form.Item>
            <Form.Item
              name="advertisement_banner_id"
              label="Upload File"
              valuePropName="fileList"
            >
              <div onClick={preventDefault} onKeyDown={preventDefault}>
                <Dragger
                  className="h-48"
                  onDrop={(e) => onDrop(e)}
                  onDragOver={(e) => onDragOver(e)}
                  beforeUpload={() => false}
                  showUploadList={false}
                  openFileDialogOnClick={false}
                >
                  {selectedDroppedFile ? (
                    renderPreview()
                  ) : (
                    <>
                      <p className="ant-upload-drag-icon">
                        <InboxOutlined />
                      </p>
                      <p className="ant-upload-text">
                        Drag an ad banner from gallery
                      </p>
                      <p className="ant-upload-hint">
                        Only files from gallery are allowed
                      </p>
                    </>
                  )}
                </Dragger>
              </div>
            </Form.Item>
            {renderBannerDetails()}
            <Card style={{ marginTop: 16 }}>
              <Row gutter={[16, 16]}>
                {/* Start Date */}
                <Col xs={24} md={12}>
                  <Form.Item
                    name="start_date"
                    label="Start Date"
                    rules={rules.startDate}
                  >
                    <DatePicker
                      style={{ width: "100%" }}
                      placeholder="Select Start Date"
                      disabledDate={(current) =>
                        current && current < moment().startOf("day")
                      }
                    />
                  </Form.Item>
                </Col>

                {/* Start Time */}
                <Col xs={24} md={12}>
                  <Form.Item
                    name="start_time"
                    label="Start Time"
                    rules={[
                      {
                        required: true,
                        message: "Please select the start time",
                      },
                    ]}
                  >
                    <DatePicker.TimePicker
                      style={{ width: "100%" }}
                      placeholder="Select Start Time"
                      format="HH:mm"
                    />
                  </Form.Item>
                </Col>

                {/* End Date */}
                <Col xs={24} md={12}>
                  <Form.Item
                    name="end_date"
                    label="End Date"
                    rules={rules.endDate}
                  >
                    <DatePicker
                      style={{ width: "100%" }}
                      placeholder="Select End Date"
                      disabledDate={(current) =>
                        current && current < moment(startDate).startOf("day")
                      }
                    />
                  </Form.Item>
                </Col>

                {/* End Time */}
                <Col xs={24} md={12}>
                  <Form.Item
                    name="end_time"
                    label="End Time"
                    rules={[
                      {
                        required: true,
                        message: "Please select the end time",
                      },
                    ]}
                  >
                    <DatePicker.TimePicker
                      style={{ width: "100%" }}
                      placeholder="Select End Time"
                      format="HH:mm"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Form.Item
              name="duration"
              label="Duration"
              rules={[
                {
                  required: true,
                  message: "Please enter schedule duration",
                },
                {
                  type: "number",
                  min: 1,
                  message: "Duration must be at least 1",
                },
              ]}
            >
              <InputNumber
                placeholder="Enter Schedule Duration"
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Form>
        </Card>
      </Col>
    </Row>
  );
}

export default AdScheduleFormFields;
