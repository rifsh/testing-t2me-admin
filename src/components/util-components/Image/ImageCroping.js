import React, { useState } from "react";
import { Modal, Button, Slider } from "antd";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { message } from "antd";

// Common resolutions for different use cases
export const RESOLUTIONS = {
  THUMBNAIL: {
    SMALL: "100x100",
    MEDIUM: "200x150",
    LARGE: "300x200",
  },
  BANNER: {
    SMALL: "600x200",
    MEDIUM: "800x300",
    LARGE: "1200x400",
  },
  SQUARE: {
    SMALL: "200x200",
    MEDIUM: "400x400",
    LARGE: "600x600",
  },
  COUPON: {
    SMALL: "200x100",
    MEDIUM: "400x200",
    LARGE: "600x300",
  },
  PROFILE: {
    SMALL: "150x150",
    MEDIUM: "300x300",
    LARGE: "500x500",
  },
};

// Utility function to validate image dimensions
export const validateImageDimensions = (
  file,
  requiredWidth,
  requiredHeight
) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;
      img.onload = () => {
        const { width, height } = img;
        if (width === requiredWidth && height === requiredHeight) {
          resolve(true);
        } else {
          message.error(
            `Image must be exactly ${requiredWidth}x${requiredHeight} pixels`
          );
          reject(false);
        }
      };
    };
  });
};

// Utility function to check file size
export const validateFileSize = (file, maxSize) => {
  const isLessThanMaxSize = file.size / 1024 / 1024 < maxSize; // Convert to MB
  if (!isLessThanMaxSize) {
    message.error(`File must be smaller than ${maxSize}MB`);
  }
  return isLessThanMaxSize;
};

// Utility function to check file type
export const validateFileType = (file, supportedFormats) => {
  const isValidType = supportedFormats.some(
    (format) =>
      file.type === `image/${format}` ||
      file.type === `image/${format.toLowerCase()}`
  );
  if (!isValidType) {
    message.error(`Supported formats: ${supportedFormats.join(", ")}`);
  }
  return isValidType;
};

// Main utility function to handle image upload with crop option
export const handleImageUpload = (file, options = {}) => {
  const {
    maxSize = 2, // Default max size: 2MB
    supportedFormats = ["jpeg", "jpg", "png", "gif"],
    requiredResolution = null, // If exact size is required (without cropping)
    showCropper = true,
    onSuccess,
    onError,
    resolutionOptions = [
      RESOLUTIONS.THUMBNAIL.MEDIUM,
      RESOLUTIONS.SQUARE.MEDIUM,
      RESOLUTIONS.COUPON.MEDIUM,
    ],
    defaultResolution = RESOLUTIONS.SQUARE.MEDIUM,
  } = options;

  // Check file type and size first
  if (
    !validateFileType(file, supportedFormats) ||
    !validateFileSize(file, maxSize)
  ) {
    if (onError) onError(file);
    return false;
  }

  // If exact resolution is required and no cropper should be shown
  if (requiredResolution && !showCropper) {
    const [width, height] = requiredResolution.split("x").map(Number);
    validateImageDimensions(file, width, height)
      .then(() => {
        if (onSuccess) onSuccess(file);
      })
      .catch(() => {
        if (onError) onError(file);
      });
    return false;
  }

  // Create URL for the image to display in cropper
  const fileUrl = URL.createObjectURL(file);

  // Return data needed for cropper
  return {
    file,
    fileUrl,
    resolutionOptions,
    defaultResolution,
  };
};

// Convert dataURL to File
export const dataURLtoFile = (dataUrl, filename) => {
  const arr = dataUrl.split(",");
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], filename, { type: mime });
};
const ImageCropper = ({
  visible,
  imageUrl,
  onCancel,
  onCrop,
  aspectRatio = 1,
  resolutionOptions,
  defaultResolution,
}) => {
  const [crop, setCrop] = useState({
    unit: "%",
    width: 50,
    height: 50,
    x: 25,
    y: 25,
    aspect: aspectRatio,
  });
  const [completedCrop, setCompletedCrop] = useState(null);
  const [imageRef, setImageRef] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [selectedResolution, setSelectedResolution] = useState(
    defaultResolution || resolutionOptions[0]
  );

  const onImageLoaded = (img) => {
    setImageRef(img);
    return false;
  };

  const handleResolutionChange = (resolution) => {
    setSelectedResolution(resolution);
    // Update aspect ratio based on selected resolution
    const [width, height] = resolution.split("x").map(Number);
    setCrop({
      ...crop,
      aspect: width / height,
    });
  };

  const handleComplete = (crop) => {
    setCompletedCrop(crop);
  };

  const handleCropImage = () => {
    if (imageRef && completedCrop) {
      const [targetWidth, targetHeight] = selectedResolution
        .split("x")
        .map(Number);

      // Create canvas
      const canvas = document.createElement("canvas");
      const scaleX = imageRef.naturalWidth / imageRef.width;
      const scaleY = imageRef.naturalHeight / imageRef.height;
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const ctx = canvas.getContext("2d");

      // Set background to white (for transparent images)
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw the crop
      ctx.drawImage(
        imageRef,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        targetWidth,
        targetHeight
      );

      // Convert to blob
      canvas.toBlob((blob) => {
        if (blob) {
          const croppedFile = new File([blob], "cropped-image.png", {
            type: "image/png",
          });
          onCrop(croppedFile, selectedResolution);
        }
      }, "image/png");
    }
  };

  return (
    <Modal
      title="Crop Image"
      open={visible}
      onCancel={onCancel}
      width={800}
      footer={[
        <Button key="back" onClick={onCancel}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={handleCropImage}>
          Crop
        </Button>,
      ]}
    >
      <div className="crop-container">
        <div className="resolution-options">
          <span>Select Resolution: </span>
          {resolutionOptions.map((option) => (
            <Button
              key={option}
              type={selectedResolution === option ? "primary" : "default"}
              onClick={() => handleResolutionChange(option)}
              style={{ margin: "0 5px" }}
            >
              {option}
            </Button>
          ))}
        </div>

        <div className="zoom-control" style={{ margin: "10px 0" }}>
          <span>Zoom: </span>
          <Slider
            min={0.5}
            max={3}
            step={0.1}
            value={zoom}
            onChange={setZoom}
            style={{
              width: "200px",
              display: "inline-block",
              margin: "0 10px",
            }}
          />
        </div>

        <div
          className="crop-area"
          style={{ overflow: "hidden", maxHeight: "500px" }}
        >
          <ReactCrop
            src={imageUrl}
            crop={crop}
            onChange={setCrop}
            onComplete={handleComplete}
            onImageLoaded={onImageLoaded}
            style={{ transform: `scale(${zoom})`, transformOrigin: "center" }}
          />
        </div>

        <div className="crop-info" style={{ marginTop: "10px" }}>
          <p>Selected Resolution: {selectedResolution}</p>
          <p>
            Drag to position and resize the crop area. Use zoom to adjust view
            if needed.
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default ImageCropper;
