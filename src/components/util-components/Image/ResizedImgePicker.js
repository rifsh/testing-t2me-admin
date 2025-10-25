import React, { useState, useEffect } from "react";
import { Button, Upload, message, Modal } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import {
  SupportImageFormat,
  ResolutionByServices,
} from "constants/SupportFileConstants";
import Utils from "utils/index";
import ImageCropper from "components/util-components/Image/ImageCroping";

const ResizedImgePicker = ({
  value,
  onChange,
  form,
  targetResolution = { width: 1000, height: 1000 },
  maxCount = 1,
  square = true,
  onDelete,
}) => {
  const [cropperVisible, setCropperVisible] = useState(false);
  const [imageToProcess, setImageToProcess] = useState(null);
  const [currentFileName, setCurrentFileName] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [hoveredItem, setHoveredItem] = useState(null);

  useEffect(() => {
    if (value) {
      setFileList(Array.isArray(value) ? value : [value]);
    } else {
      setFileList([]);
    }
  }, [value]);

  const beforeUpload = (file) => {
    if (fileList.length >= maxCount) {
      message.warning(`You can only upload a maximum of ${maxCount} images.`);
      return Upload.LIST_IGNORE;
    }

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
      id: null, // New upload, no id yet
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

    // Check if file has an id (from database)
    if (file.id && onDelete) {
      // Call parent's delete handler with callback
      onDelete(file, () => {
        // Remove from UI after successful deletion
        const newFileList = fileList.filter((item) => item.uid !== file.uid);
        setFileList(newFileList);
        if (onChange) {
          onChange(newFileList);
        }
      });
    } else {
      // For new uploads without id, just remove from list
      const newFileList = fileList.filter((item) => item.uid !== file.uid);
      setFileList(newFileList);
      if (onChange) {
        onChange(newFileList);
      }
    }
  };

  const uploadButton = (
    <div className="ant-upload-button">
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  return (
    <div>
      <Upload
        listType={square ? "picture-card" : "picture"}
        fileList={fileList}
        beforeUpload={beforeUpload}
        onRemove={() => false} // Disable default remove
        accept={`.${SupportImageFormat.join(",.")}`}
        maxCount={maxCount}
        multiple={maxCount > 1}
        showUploadList={{
          showPreviewIcon: false,
          showRemoveIcon: false,
        }}
        itemRender={(originNode, file) => {
          const isHovered = hoveredItem === file.uid;

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
            >
              <img
                src={file.url || file.thumbUrl}
                alt={file.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
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
                  >
                    {/* {file.id ? "Delete from DB" : "Remove"} */}
                  </Button>
                </div>
              )}
              {/* Show indicator if image is from database */}
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

export default ResizedImgePicker;
