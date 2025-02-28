import React, { useState, useRef, useEffect } from "react";
import { Modal, Button, Slider, Divider, Typography } from "antd";

const { Text } = Typography;

/**
 * A reusable image cropper component that can be used throughout the application
 * @param {Object} props Component props
 * @param {boolean} props.visible Whether the cropper modal is visible
 * @param {string} props.image Source of the image to crop (data URL or object URL)
 * @param {Function} props.onCancel Callback when cropping is canceled
 * @param {Function} props.onCrop Callback when cropping is completed, passes the cropped image file
 * @param {Object} props.targetResolution Target resolution for the cropped image {width, height}
 * @param {string} props.outputFormat Output format of the cropped image (default: 'image/png')
 * @param {string} props.fileName Custom filename for the cropped image (default: original filename)
 */
const ImageCropper = ({
  visible,
  image,
  onCancel,
  onCrop,
  targetResolution = { width: 1080, height: 1080 },
  outputFormat = "image/png",
  fileName = null,  
}) => {
  const [cropData, setCropData] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspectRatio, setAspectRatio] = useState(
    targetResolution.width / targetResolution.height
  );
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const cropBoxRef = useRef(null);

  // Update aspect ratio when target resolution changes
  useEffect(() => {
    setAspectRatio(targetResolution.width / targetResolution.height);
  }, [targetResolution]);

  // Initialize image dimensions when it loads
  useEffect(() => {
    if (image && visible && imageRef.current) {
      const img = imageRef.current;

      // Wait for the image to load to get its natural dimensions
      const handleImageLoad = () => {
        setImageSize({
          width: img.width,
          height: img.height,
        });

        // Initialize crop area after image is loaded
        initializeCropArea();

        // Remove event listener after it's fired
        img.removeEventListener("load", handleImageLoad);
      };

      if (img.complete) {
        handleImageLoad();
      } else {
        img.addEventListener("load", handleImageLoad);
      }

      return () => {
        img.removeEventListener("load", handleImageLoad);
      };
    }
  }, [image, visible]);

  // Initialize the crop area with the correct aspect ratio
  const initializeCropArea = () => {
    if (!containerRef.current || !imageRef.current) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const containerWidth = rect.width;
    const containerHeight = rect.height;

    // Calculate the maximum size the crop box can be while maintaining aspect ratio
    let cropWidth, cropHeight;

    if (aspectRatio >= 1) {
      // Wider than tall
      cropWidth = Math.min(containerWidth * 0.8, imageRef.current.width * zoom);
      cropHeight = cropWidth / aspectRatio;

      // Ensure height fits within container
      if (cropHeight > containerHeight * 0.8) {
        cropHeight = containerHeight * 0.8;
        cropWidth = cropHeight * aspectRatio;
      }
    } else {
      // Taller than wide
      cropHeight = Math.min(
        containerHeight * 0.8,
        imageRef.current.height * zoom
      );
      cropWidth = cropHeight * aspectRatio;

      // Ensure width fits within container
      if (cropWidth > containerWidth * 0.8) {
        cropWidth = containerWidth * 0.8;
        cropHeight = cropWidth / aspectRatio;
      }
    }

    // Center the crop area
    const x = (containerWidth - cropWidth) / 2;
    const y = (containerHeight - cropHeight) / 2;

    setCropData({
      x,
      y,
      width: cropWidth,
      height: cropHeight,
    });
  };

  // Handle zoom change
  const handleZoomChange = (newZoom) => {
    setZoom(newZoom);

    // Recalculate crop box position to keep it centered when zooming
    if (cropData.width > 0 && cropData.height > 0) {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const containerCenter = {
        x: rect.width / 2,
        y: rect.height / 2,
      };

      // Calculate the center of the current crop box
      const cropBoxCenter = {
        x: cropData.x + cropData.width / 2,
        y: cropData.y + cropData.height / 2,
      };

      // Calculate the new position that keeps the crop box centered
      const newX = cropBoxCenter.x - cropData.width / 2;
      const newY = cropBoxCenter.y - cropData.height / 2;

      setCropData((prev) => ({
        ...prev,
        x: newX,
        y: newY,
      }));
    }
  };

  // Start crop selection
  const handleMouseDown = (e) => {
    if (!image) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setStartPoint({ x, y });

    // If we're clicking inside the existing crop box, we'll move it instead of creating a new one
    const cropBox = cropBoxRef.current;
    if (cropBox) {
      const isInside =
        x >= cropData.x &&
        x <= cropData.x + cropData.width &&
        y >= cropData.y &&
        y <= cropData.y + cropData.height;

      if (isInside) {
        // Moving existing box
        setIsDragging("move");
      } else {
        // Creating new box
        setIsDragging("create");
        setCropData({
          x,
          y,
          width: 0,
          height: 0,
        });
      }
    } else {
      // No existing box, so create one
      setIsDragging("create");
      setCropData({
        x,
        y,
        width: 0,
        height: 0,
      });
    }
  };

  // Update crop selection while dragging
  const handleMouseMove = (e) => {
    if (!isDragging || !image) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const currentX = Math.max(
      0,
      Math.min(e.clientX - rect.left, container.offsetWidth)
    );
    const currentY = Math.max(
      0,
      Math.min(e.clientY - rect.top, container.offsetHeight)
    );

    if (isDragging === "create") {
      // Calculate width and height of selection
      let width = currentX - startPoint.x;
      let height = width / aspectRatio;

      // If dragging up/left, adjust the starting point
      const x = width >= 0 ? startPoint.x : startPoint.x + width;
      const y = height >= 0 ? startPoint.y : startPoint.y + height;

      // Use absolute values for width and height
      width = Math.abs(width);
      height = Math.abs(height);

      // Ensure the crop box stays within container bounds
      const adjustedX = Math.max(0, Math.min(x, container.offsetWidth - width));
      const adjustedY = Math.max(
        0,
        Math.min(y, container.offsetHeight - height)
      );

      setCropData({
        x: adjustedX,
        y: adjustedY,
        width,
        height,
      });
    } else if (isDragging === "move") {
      // Moving the existing crop box
      const dx = currentX - startPoint.x;
      const dy = currentY - startPoint.y;

      // Calculate new position with bounds checking
      let newX = cropData.x + dx;
      let newY = cropData.y + dy;

      // Keep the crop box within the container boundaries
      newX = Math.max(
        0,
        Math.min(newX, container.offsetWidth - cropData.width)
      );
      newY = Math.max(
        0,
        Math.min(newY, container.offsetHeight - cropData.height)
      );

      setCropData((prev) => ({
        ...prev,
        x: newX,
        y: newY,
      }));

      setStartPoint({ x: currentX, y: currentY });
    }
  };

  // End crop selection
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle crop button click
  const handleCrop = () => {
    if (!image || !cropData.width || !cropData.height) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = imageRef.current;

    // Get the image's natural dimensions
    const imgNaturalWidth = img.naturalWidth;
    const imgNaturalHeight = img.naturalHeight;

    // Get the displayed image dimensions
    const displayedWidth = img.width * zoom;
    const displayedHeight = img.height * zoom;

    // Calculate scaling factor between natural and displayed sizes
    const scaleX = imgNaturalWidth / displayedWidth;
    const scaleY = imgNaturalHeight / displayedHeight;

    // Calculate the image offset from container center
    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const containerCenterX = containerRect.width / 2;
    const containerCenterY = containerRect.height / 2;

    // Calculate where the image is positioned within the container
    const imgLeft = containerCenterX - displayedWidth / 2;
    const imgTop = containerCenterY - displayedHeight / 2;

    // Calculate the crop coordinates in terms of the original image
    const cropX = (cropData.x - imgLeft) * scaleX;
    const cropY = (cropData.y - imgTop) * scaleY;
    const cropWidth = cropData.width * scaleX;
    const cropHeight = cropData.height * scaleY;

    // Set canvas size to the target resolution
    canvas.width = targetResolution.width;
    canvas.height = targetResolution.height;

    // Draw the cropped portion to the canvas, scaled to the target resolution
    ctx.drawImage(
      img,
      Math.max(0, cropX),
      Math.max(0, cropY),
      cropWidth,
      cropHeight,
      0,
      0,
      targetResolution.width,
      targetResolution.height
    );

    // Convert canvas to data URL
    const croppedImageDataUrl = canvas.toDataURL(outputFormat);

    // Use the original filename if provided, otherwise generate a unique name
    const outputFileName =
      fileName || `cropped_${Date.now()}.${outputFormat.split("/")[1]}`;

    // Convert base64 to file
    fetch(croppedImageDataUrl)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], outputFileName, {
          type: outputFormat,
        });
        onCrop(file);
      });
  };

  return (
    <Modal
      title="Crop Image"
      open={visible}
      onCancel={onCancel}
      width={800}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button
          key="crop"
          type="primary"
          disabled={!cropData.width || !cropData.height}
          onClick={handleCrop}
        >
          Crop & Save
        </Button>,
      ]}
    >
      <div className="mb-4">
        <Text>Zoom: {zoom.toFixed(1)}x</Text>
        <Slider
          min={1}
          max={3}
          step={0.1}
          value={zoom}
          onChange={handleZoomChange}
        />
      </div>

      <div>
        <Text type="secondary">
          Target Resolution: {targetResolution.width} x{" "}
          {targetResolution.height}
        </Text>
      </div>

      <Divider />

      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          height: "400px",
          width: "100%",
          position: "relative",
          overflow: "hidden",
          background: "#f0f0f0",
          border: "1px solid #d9d9d9",
          borderRadius: "2px",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          {image && (
            <img
              ref={imageRef}
              src={image}
              alt="Original"
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: "center",
                maxHeight: "380px",
                maxWidth: "100%",
              }}
            />
          )}
        </div>

        {cropData.width > 0 && cropData.height > 0 && (
          <div
            ref={cropBoxRef}
            style={{
              position: "absolute",
              border: "2px solid #1890ff",
              background: "rgba(24, 144, 255, 0.2)",
              left: `${cropData.x}px`,
              top: `${cropData.y}px`,
              width: `${cropData.width}px`,
              height: `${cropData.height}px`,
              cursor: isDragging === "move" ? "move" : "crosshair",
            }}
          />
        )}
      </div>
    </Modal>
  );
};

export default ImageCropper;
