export const SupportImageFormat = ["JPEG", "JPG", "PNG", "GIF"];

export const SupportVideoFormat = ["MKV", "MP4", "AVI", "WEBM"];
export const SupportFormatContent = ["Please upload supported format file"];
export const FileTypeImageOptions = [
  { value: "jpg", label: "JPG" },
  { value: "jpeg", label: "JPEG" },
  { value: "png", label: "PNG" },
  { value: "gif", label: "GIF" },
];
export const FileTypeVideoOptions = [
  { value: "mkv", label: "MKV" },
  { value: "mp4", label: "MP4" },
  { value: "avi", label: "AVI" },
  { value: "webm", label: "WEBM" },
];
export const ResolutionByServices = {
  place: "1600x615",
  venue: "232X323",
};

export const SmallThumbnailresolution = ["400X400"];

export const FileTypeResolutions = [
  { key: "small-thumbnail", resolution: "150X150" },
  { key: "medium-thumbnail", resolution: "300X300" },
  { key: "large-thumbnail", resolution: "600X600" },
  { key: "profile-picture", resolution: "400X400" },
  { key: "banner-image", resolution: "1920X1080" },
  { key: "fullscreen-background", resolution: "2560X1440" },
  { key: "mobile-header", resolution: "1080X1920" },
];

/**
 * Converts size strings (e.g., "200MB") to bytes.
 * @param {string} size - Size string (e.g., "200MB").
 * @returns {number} - Size in bytes.
 */
export const parseSizeToBytes = (size) => {
  if (!size) return 0;

  const units = { KB: 1024, MB: 1024 * 1024, GB: 1024 * 1024 * 1024 };
  const regex = /(\d+)\s*(KB|MB|GB)/i;
  const match = size.match(regex);

  if (match) {
    const [, value, unit] = match;
    return value * units[unit.toUpperCase()];
  }

  return 0; // Default to 0 if parsing fails
};

export const ThumbnailImageResolutions = {
  PLACE: { width: 1080, height: 720 },
  VENUE: { width: 1080, height: 720 },
  EVENT_BANNER: { width: 2000, height: 720 },
  EVENT: { width: 1080, height: 720 },
  CATEGORY: { width: 1080, height: 720 },
  OFFER: { width: 1080, height: 1080 },
  COUPON: { width: 1080, height: 1080 },
};
