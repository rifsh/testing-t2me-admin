import React, { useState, useEffect } from "react";
import { Button, Upload, message, Modal, Progress } from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import {
  SupportImageFormat,
  ResolutionByServices,
} from "constants/SupportFileConstants";
import Utils from "utils/index";
import ImageCropper from "components/util-components/Image/ImageCroping";

const ResizedMediaPicker = ({
  value,
  onChange,
  form,
  targetResolution = { width: 1000, height: 1000 },
  maxCount = 1,
  square = true,
  onDelete,
  allowVideo = false, // New prop to enable video uploads
  maxVideoSize = 100, // Max video size in MB
}) => {
  const [cropperVisible, setCropperVisible] = useState(false);
  const [imageToProcess, setImageToProcess] = useState(null);
  const [currentFileName, setCurrentFileName] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({});

  useEffect(() => {
    if (value) {
      setFileList(Array.isArray(value) ? value : [value]);
    } else {
      setFileList([]);
    }
  }, [value]);

  const isVideoFile = (file) => {
    return (
      file.type?.startsWith("video/") ||
      /\.(mp4|webm|ogg|mov|avi)$/i.test(file.name)
    );
  };

  const beforeUpload = (file) => {
    if (fileList.length >= maxCount) {
      message.warning(`You can only upload a maximum of ${maxCount} files.`);
      return Upload.LIST_IGNORE;
    }

    // Check if it's a video file
    if (isVideoFile(file)) {
      if (!allowVideo) {
        message.error("Video uploads are not allowed for this field.");
        return Upload.LIST_IGNORE;
      }

      // Validate video size
      const isLt100M = file.size / 1024 / 1024 < maxVideoSize;
      if (!isLt100M) {
        message.error(`Video must be smaller than ${maxVideoSize}MB!`);
        return Upload.LIST_IGNORE;
      }

      // Add video directly without cropping
      handleVideoUpload(file);
      return false;
    }

    // Handle image upload with cropping
    const isValidFile = Utils.handleBeforeUpload(
      file,
      ResolutionByServices.place
    );

    if (!isValidFile) {
      return Upload.LIST_IGNORE;
    }

    setCurrentFileName(file.name);
    const objectUrl = URL.createObjectURL(file);
    setImageToProcess(objectUrl);
    setCropperVisible(true);

    return false;
  };

  const handleVideoUpload = (file) => {
    // Create video thumbnail
    const video = document.createElement("video");
    const canvas = document.createElement("canvas");
    const objectUrl = URL.createObjectURL(file);

    video.preload = "metadata";
    video.src = objectUrl;

    video.onloadedmetadata = () => {
      video.currentTime = 0.5; // Capture frame at 0.5 seconds
    };

    video.onseeked = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const thumbnailUrl = canvas.toDataURL("image/jpeg");

      const newFile = {
        uid: Date.now().toString(),
        name: file.name,
        status: "done",
        url: objectUrl,
        thumbUrl: thumbnailUrl,
        originFileObj: file,
        type: "video",
        id: null,
      };

      const newFileList = [...fileList, newFile];
      setFileList(newFileList);

      if (onChange) {
        onChange(newFileList);
      }

      URL.revokeObjectURL(objectUrl);
      message.success("Video uploaded successfully");
    };

    video.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      message.error("Failed to process video");
    };
  };

  const handleCancelCrop = () => {
    setCropperVisible(false);
    if (imageToProcess) {
      URL.revokeObjectURL(imageToProcess);
    }
    setImageToProcess(null);
    setCurrentFileName(null);
  };

  const handleCropComplete = (croppedFile) => {
    setCropperVisible(false);
    if (imageToProcess) {
      URL.revokeObjectURL(imageToProcess);
    }
    setImageToProcess(null);

    const newFile = {
      uid: Date.now().toString(),
      name: currentFileName || croppedFile.name,
      status: "done",
      url: URL.createObjectURL(croppedFile),
      originFileObj: croppedFile,
      type: "image",
      id: null,
    };

    const newFileList = [...fileList, newFile];
    setFileList(newFileList);
    setCurrentFileName(null);

    if (onChange) {
      onChange(newFileList);
    }

    message.success("Image cropped successfully");
  };

  const handleDeleteClick = (file, e) => {
    e.stopPropagation();

    if (file.id && onDelete) {
      onDelete(file, () => {
        const newFileList = fileList.filter((item) => item.uid !== file.uid);
        setFileList(newFileList);
        if (onChange) {
          onChange(newFileList);
        }
      });
    } else {
      const newFileList = fileList.filter((item) => item.uid !== file.uid);
      setFileList(newFileList);
      if (onChange) {
        onChange(newFileList);
      }
    }
  };

  const handlePreview = (file) => {
    if (file.type === "video") {
      Modal.info({
        title: "Video Preview",
        width: 800,
        content: (
          <video
            controls
            style={{ width: "100%", maxHeight: "500px" }}
            src={file.url}
          >
            Your browser does not support the video tag.
          </video>
        ),
      });
    }
  };

  const uploadButton = (
    <div className="ant-upload-button">
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>
        Upload {allowVideo ? "Image/Video" : "Image"}
      </div>
    </div>
  );

  const acceptFormats = allowVideo
    ? `.${SupportImageFormat.join(",.")},.mp4,.webm,.ogg,.mov,.avi`
    : `.${SupportImageFormat.join(",.")}`;

  return (
    <div>
      <Upload
        listType={square ? "picture-card" : "picture"}
        fileList={fileList}
        beforeUpload={beforeUpload}
        onRemove={() => false}
        accept={acceptFormats}
        maxCount={maxCount}
        multiple={maxCount > 1}
        showUploadList={{
          showPreviewIcon: false,
          showRemoveIcon: false,
        }}
        itemRender={(originNode, file) => {
          const isHovered = hoveredItem === file.uid;
          const isVideo = file.type === "video";

          return (
            <div
              style={{
                position: "relative",
                width: "100%",
                height: "100%",
                borderRadius: "8px",
                overflow: "hidden",
              }}
              onMouseEnter={() => setHoveredItem(file.uid)}
              onMouseLeave={() => setHoveredItem(null)}
              onClick={() => isVideo && handlePreview(file)}
            >
              <img
                src={file.thumbUrl || file.url}
                alt={file.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />

              {/* Video play icon overlay */}
              {isVideo && (
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    fontSize: "32px",
                    color: "white",
                    opacity: 0.8,
                    pointerEvents: "none",
                  }}
                >
                  <PlayCircleOutlined />
                </div>
              )}

              {isHovered && (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "rgba(0, 0, 0, 0.5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    transition: "all 0.3s",
                  }}
                >
                  <Button
                    type="primary"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={(e) => handleDeleteClick(file, e)}
                    size="small"
                  />
                </div>
              )}

              {/* DB indicator */}
              {file.id && (
                <div
                  style={{
                    position: "absolute",
                    top: "4px",
                    right: "4px",
                    background: "rgba(0, 0, 0, 0.6)",
                    color: "white",
                    padding: "2px 6px",
                    borderRadius: "4px",
                    fontSize: "10px",
                  }}
                >
                  DB
                </div>
              )}

              {/* Video type indicator */}
              {isVideo && (
                <div
                  style={{
                    position: "absolute",
                    bottom: "4px",
                    left: "4px",
                    background: "rgba(0, 0, 0, 0.6)",
                    color: "white",
                    padding: "2px 6px",
                    borderRadius: "4px",
                    fontSize: "10px",
                  }}
                >
                  VIDEO
                </div>
              )}
            </div>
          );
        }}
      >
        {fileList.length >= maxCount ? null : uploadButton}
      </Upload>

      {imageToProcess && (
        <ImageCropper
          visible={cropperVisible}
          image={imageToProcess}
          onCancel={handleCancelCrop}
          onCrop={handleCropComplete}
          targetResolution={targetResolution}
          outputFormat="image/png"
          fileName={currentFileName}
        />
      )}
    </div>
  );
};

export default ResizedMediaPicker;
