import React, { useEffect, useState } from "react";
import { Input, Row, Col, Card, Form, DatePicker, Upload, message, Button, InputNumber } from "antd";
import moment from "moment";
import { InboxOutlined, FileImageOutlined, PlayCircleOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAdBanners,
  setDraggedFile,
  setVideoPlayingStatus,
  setDraggedFileState
} from "store/slices/advertisementSlice";
import { ScheduleTimeSlots } from "views/schedule/components/ScheduleTimeSlotes";

const { Dragger } = Upload;

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

function AdScheduleFormFields({form}) {
  // const [form] = Form.useForm();
  const startDate = Form.useWatch('start_date', form);
  const dispatch = useDispatch();
  const videoRef = React.useRef(null);

  const { filteredAdBanner, draggedFile,
    isVideoPlaying, } = useSelector((state) => state.advertisement);

  useEffect(() => {
    dispatch(setDraggedFileState(null));
    dispatch(fetchAdBanners({ page: 1, size: 10 }));
  }, [dispatch]);


  const onDragStart = (file) => {
    dispatch(setDraggedFile(file));
  };

  const onDrop = () => {
    if (draggedFile) {
      form.setFieldsValue({
        advertisement_banner_id: draggedFile.id,
      });
      message.success(`${draggedFile.name} added to upload field.`);
    } else {
      message.error("Failed to add file to upload field.");
    }
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

  const renderMedia = (mediaPath) => {
    const isVideo = /\.(mp4|webm|ogg)$/i.test(mediaPath);
    return isVideo ? (
      <video
        src={mediaPath}
        style={{
          width: "60%",
          height: "60%",
          objectFit: "cover",
        }}
        muted
        playsInline
      />
    ) : (
      <img
        src={mediaPath}
        alt="Image Thumbnail"
        style={{
          width: "60%",
          height: "60%",
          objectFit: "cover",
        }}
      />
    );
  };

  const renderPreview = () => {
    if (!draggedFile) return null;

    const isVideo = /\.(mp4|webm|ogg)$/i.test(draggedFile.media_path);

    return (
      <div className="mt-4 flex justify-center items-center">
        <div className="relative" style={{ maxWidth: '100%', maxHeight: '300px' }}>
          {isVideo ? (
            <>
              <video
                ref={videoRef}
                src={draggedFile.media_path}
                style={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: '300px',
                  objectFit: 'contain'
                }}
                controls={false}
                muted
                playsInline
                onEnded={() => dispatch(setVideoPlayingStatus(false))}
              />
              <Button
                type="primary"
                icon={isVideoPlaying  ? null : <PlayCircleOutlined />}
                className="absolute bottom-2 left-1/2 transform -translate-x-1/2"
                onClick={toggleVideoPlayback}
              >
                {isVideoPlaying  ? 'Pause' : 'Play'}
              </Button>
            </>
          ) : (
            <img
              src={draggedFile.media_path}
              alt="Preview"
              style={{
                width: '100%',
                height: 'auto',
                maxHeight: '300px',
                objectFit: 'contain'
              }}
            />
          )}
        </div>
      </div>
    );
  };

  // Custom click handler to prevent file selection dialog
  const preventDefault = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <Row gutter={16}>
      {/* File Gallery */}
      <Col xs={24} sm={12}>
        <Card title="File Gallery" className="h-full">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
              gap: "16px",
            }}
          >
            {filteredAdBanner.map((banner) => (
              <div
                key={banner.id}
                draggable
                onDragStart={() => onDragStart(banner)}
                className="p-2 border rounded cursor-move hover:bg-gray-50"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div className="d-flex align-items-center mb-2">
                  <FileImageOutlined className="me-2" />
                  <span className="text-sm">{banner.name}</span>
                </div>
                {renderMedia(banner.media_path)}
              </div>
            ))}
          </div>
        </Card>
      </Col>

      {/* Form Section */}
      <Col xs={24} sm={12}>
        <Card >
          <Form layout="vertical" form={form}>
            <Form.Item name="name" label="Schedule Name" rules={rules.name}>
              <Input placeholder="Enter Schedule Name" />
            </Form.Item>
            <Form.Item name="advertisement_banner_id" label="Upload File" valuePropName="fileList">
              <div
                onClick={preventDefault}
                onKeyDown={preventDefault}
              >
                <Dragger
                  className="h-48"
                  onDrop={onDrop}
                  beforeUpload={() => false}
                  showUploadList={false}
                  openFileDialogOnClick={false}
                >
                  {draggedFile ? (
                    renderPreview()
                  ) : (
                    <>
                      <p className="ant-upload-drag-icon">
                        <InboxOutlined />
                      </p>
                      <p className="ant-upload-text">Drag an ad banner from gallery</p>
                      <p className="ant-upload-hint">Only files from gallery are allowed</p>
                    </>
                  )}
                </Dragger>
              </div>
            </Form.Item>
            <ScheduleTimeSlots form={form} />
            <Form.Item
              name="duration"
              label="Duration"
              rules={[
                {
                  required: true,
                  message: "Please enter schedule duration",
                },
                {
                  type: 'number',
                  min: 1,
                  message: "Duration must be at least 1",
                },
              ]}
            >
              <InputNumber placeholder="Enter Schedule Duration" style={{ width: '100%' }} />
            </Form.Item>
          </Form>
        </Card>
      </Col>
    </Row>
  );
}

export default AdScheduleFormFields;