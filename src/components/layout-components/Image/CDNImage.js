import React, { useState } from "react";
import { Image as AntImage, Spin, Skeleton } from "antd";
import { CDN_PATH } from "configs/AppConfig";

const CDNImage = ({
  src,
  alt = "Image",
  height = 300,
  width,
  style = {},
  className = "",
  fallbackElement = null,
  showFallbackOnError = true,
  preview = false,
  loadingIndicator = "shimmer",
  ...imageProps
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Determine if we should show fallback
  const shouldShowFallback = !src || src === "images" || hasError;

  // Handle image loading errors
  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  // Handle successful image load
  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  // Generate the full image URL if we have a valid source
  const imageUrl =
    src && src !== "images"
      ? src.includes("cdn-media")
        ? src
        : `${CDN_PATH}/${src}`
      : null;
  // Loading indicators
  const renderLoadingIndicator = () => {
    switch (loadingIndicator) {
      case "spinner":
        return (
          <div
            className="flex items-center justify-center bg-gray-100"
            style={{ height, width, ...style }}
          >
            <Spin size="large" />
          </div>
        );

      case "skeleton":
        return (
          <Skeleton.Image
            active
            style={{
              height,
              width,
              ...style,
            }}
            className={className}
          />
        );

      case "shimmer":
      default:
        return (
          <div
            className="animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer"
            style={{ height, width, ...style }}
          />
        );
    }
  };

  // Default fallback UI
  const defaultFallback = (
    <div
      style={{
        height,
        width,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f0f0f0",
        color: "#888",
        ...style,
      }}
      className={`${className} rounded-lg`}
    >
      <div className="flex flex-col items-center">
        <div
          style={{
            height,
            width,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#f0f0f0",
            color: "#888",
            ...style,
          }}
          className={className}
        >
          No Image
        </div>
      </div>
    </div>
  );

  // Use custom fallback if provided, otherwise use default
  const fallbackUI = fallbackElement || defaultFallback;

  if (shouldShowFallback && showFallbackOnError) {
    return fallbackUI;
  }

  return (
    <div className="relative overflow-hidden" style={{ height, width }}>
      {isLoading && (
        <div className="absolute inset-0 z-10">{renderLoadingIndicator()}</div>
      )}

      <AntImage
        alt={alt}
        src={imageUrl}
        height={height}
        width={width}
        preview={preview}
        style={{
          objectFit: "cover",
          opacity: isLoading ? 0 : 1,
          transition: "opacity 0.3s ease-in-out",
          ...style,
        }}
        className={`${className} ${isLoading ? "invisible" : "visible"}`}
        onError={handleError}
        onLoad={handleLoad}
        {...imageProps}
      />
    </div>
  );
};

export default CDNImage;
