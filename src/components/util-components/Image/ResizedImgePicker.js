import React, { useState, useEffect } from "react";
import { Button, Upload, message, Avatar } from "antd";
import { UploadOutlined, PlusOutlined } from "@ant-design/icons";
import {
  SupportImageFormat,
  ResolutionByServices,
} from "constants/SupportFileConstants";
import Utils from "utils/index";
import ImageCropper from "components/util-components/Image/ImageCroping";

/**
 * A reusable image picker component with cropping functionality
 * @param {Object} props Component props
 * @param {Array} props.value Current file list
 * @param {Function} props.onChange Callback when file list changes
 * @param {Object} props.form Form instance
 * @param {Object} props.targetResolution Target resolution for the cropped image {width, height}
 * @param {number} props.maxCount Maximum number of images allowed (default: 1)
 * @param {boolean} props.square Whether to display images in square shape (default: true)
 */
const ResizedImgePicker = ({
  value,
  onChange,
  form,
  targetResolution = { width: 1000, height: 1000 },
  maxCount = 1,
  square = true,
}) => {
  // States for the image cropper
  const [cropperVisible, setCropperVisible] = useState(false);
  const [imageToProcess, setImageToProcess] = useState(null);
  const [currentFileName, setCurrentFileName] = useState(null);
  const [fileList, setFileList] = useState([]);

  // Sync fileList with value from form
  useEffect(() => {
    if (value) {
      setFileList(Array.isArray(value) ? value : [value]);
    } else {
      setFileList([]);
    }
  }, [value]);

  // Image handling functions
  const beforeUpload = (file) => {
    // Check file size and format using Utils helper
    const isValidFile = Utils.handleBeforeUpload(
      file,
      ResolutionByServices.place
    );

    if (!isValidFile) {
      return Upload.LIST_IGNORE;
    }

    // Store the original filename
    setCurrentFileName(file.name);

    // Create a temporary URL for the file to be used in the cropper
    const objectUrl = URL.createObjectURL(file);
    setImageToProcess(objectUrl);
    setCropperVisible(true);

    // Prevent default upload behavior
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

    // Create a new file with the cropped image
    const newFile = {
      uid: Date.now().toString(),
      name: currentFileName || croppedFile.name,
      status: "done",
      url: URL.createObjectURL(croppedFile),
      originFileObj: croppedFile,
    };

    // Update file list based on maxCount
    let newFileList;
    if (maxCount === 1) {
      newFileList = [newFile];
    } else {
      newFileList = [...fileList];
      if (newFileList.length >= maxCount) {
        // Replace the first item if we've reached the max count
        newFileList[0] = newFile;
      } else {
        newFileList.push(newFile);
      }
    }

    setFileList(newFileList);
    setCurrentFileName(null);

    // Call the onChange prop to update the form
    if (onChange) {
      onChange(newFileList);
    }

    message.success("Image cropped successfully");
  };

  const handleRemoveImage = (file) => {
    const newFileList = fileList.filter((item) => item.uid !== file.uid);
    setFileList(newFileList);

    // Call the onChange prop to update the form
    if (onChange) {
      onChange(newFileList);
    }
  };

  // Custom upload button based on whether we have images and maxCount
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
        onRemove={handleRemoveImage}
        accept={`.${SupportImageFormat.join(",.")}`}
        maxCount={maxCount}
        multiple={maxCount > 1}
        showUploadList={{
          showPreviewIcon: true,
          showRemoveIcon: true,
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
