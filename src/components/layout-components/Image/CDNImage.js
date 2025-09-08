import React, { useState } from "react";
import { Image as AntImage } from "antd";
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
    const imageUrl = src && src !== "images" ? `${CDN_PATH}/${src}` : null;

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
            className={className}
        >
            No Image
        </div>
    );

    // Use custom fallback if provided, otherwise use default
    const fallbackUI = fallbackElement || defaultFallback;

    if (shouldShowFallback && showFallbackOnError) {
        return fallbackUI;
    }

    return (
        <>
            {isLoading && fallbackUI}
            <AntImage
                alt={alt}
                src={imageUrl}
                height={height}
                width={width}
                style={{
                    objectFit: "cover",
                    display: isLoading ? "none" : "block",
                    ...style,
                }}
                className={className}
                onError={handleError}
                onLoad={handleLoad}
                {...imageProps}
            />
        </>
    );
};

export default CDNImage;