// utils/s3UploadUtil.js

/**
 * Uploads a file to S3 using a presigned URL with retry logic
 * @param {string} presignedUrl - The presigned URL for S3 upload
 * @param {File} file - The file object to upload
 * @param {number} maxRetries - Maximum number of retry attempts
 * @returns {Promise<boolean>} - Returns true if upload is successful
 */
export const uploadToS3 = async (presignedUrl, file, maxRetries = 3) => {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Upload attempt ${attempt}/${maxRetries} for ${file.name}`);

      const response = await fetch(presignedUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type || "application/octet-stream",
        },
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status: ${response.status}`);
      }

      console.log(`Successfully uploaded ${file.name}`);
      return true;
    } catch (error) {
      lastError = error;
      console.error(`Attempt ${attempt} failed for ${file.name}:`, error);

      // Wait before retrying (exponential backoff)
      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        console.log(`Waiting ${delay}ms before retry...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw new Error(
    `Failed to upload ${file.name} after ${maxRetries} attempts: ${lastError.message}`
  );
};

/**
 * Uploads multiple files to S3 using presigned URLs with individual retry logic
 * @param {Array} uploadData - Array of objects containing {upload_url, file}
 * @returns {Promise<Object>} - Returns object with success/failure results
 */
export const uploadMultipleToS3 = async (uploadData) => {
  const results = {
    successful: [],
    failed: [],
  };

  for (const { upload_url, file, type, index } of uploadData) {
    try {
      await uploadToS3(upload_url, file);
      results.successful.push({ file: file.name, type, index });
    } catch (error) {
      console.error(`Failed to upload ${file.name}:`, error);
      results.failed.push({
        file: file.name,
        type,
        index,
        error: error.message,
      });
    }
  }

  if (results.failed.length > 0) {
    const errorMsg = `Failed to upload ${
      results.failed.length
    } file(s): ${results.failed.map((f) => f.file).join(", ")}`;
    throw new Error(errorMsg);
  }

  return results;
};

/**
 * Processes response data and uploads images to S3 AFTER CONFIRMATION
 * @param {Object} responseData - The response data from submit API
 * @param {Object} originalFiles - Object containing original file objects
 * @param {Array} uploadFields - Array of field configurations to upload
 * @returns {Promise<Object>} - Returns upload results
 */
export const uploadImagesAfterConfirm = async (
  responseData,
  originalFiles,
  uploadFields = []
) => {
  try {
    const uploads = [];
    const data = responseData?.data || responseData;

    // Process each upload field configuration
    uploadFields.forEach((config) => {
      const { dataField, uploadUrlField, fileField, isArray = false } = config;

      if (isArray) {
        // Handle array of files (like banner_images)
        const uploadUrlsArray = data[uploadUrlField];
        const filesArray = originalFiles[fileField];

        if (Array.isArray(uploadUrlsArray) && Array.isArray(filesArray)) {
          uploadUrlsArray.forEach((uploadInfo, index) => {
            if (uploadInfo?.upload_url && filesArray[index]) {
              uploads.push({
                upload_url: uploadInfo.upload_url,
                file: filesArray[index],
                type: dataField,
                index,
              });
            }
          });
        }
      } else {
        // Handle single file (like thumbnail_image)
        const uploadUrlData = data[uploadUrlField];
        const fileData = originalFiles[fileField];

        if (uploadUrlData?.upload_url && fileData) {
          uploads.push({
            upload_url: uploadUrlData.upload_url+"afsdafafsfasdaf",
            file: fileData,
            type: dataField,
          });
        }
      }
    });

    // Upload all files to S3
    if (uploads.length > 0) {
      console.log(`Starting upload of ${uploads.length} file(s) to S3`);
      const results = await uploadMultipleToS3(uploads);
      console.log("Upload results:", results);
      return results;
    }

    return { successful: [], failed: [] };
  } catch (error) {
    console.error("Error uploading images after confirmation:", error);
    throw error;
  }
};

/**
 * Prepares confirmation data with specified fields
 * @param {Object} responseData - The response data from submit API
 * @param {Array} fieldsToInclude - Array of field names to include in confirmation
 * @returns {Object} - Cleaned data for confirmation
 */
export const prepareConfirmationData = (responseData, fieldsToInclude = []) => {
  const data = responseData?.data || responseData;

  if (fieldsToInclude.length === 0) {
    return { ...data };
  }

  const confirmationData = {};
  fieldsToInclude.forEach((field) => {
    if (data.hasOwnProperty(field)) {
      confirmationData[field] = data[field];
    }
  });

  return confirmationData;
};

/**
 * Extracts file objects from form data
 * @param {Object} formValues - Form values from Ant Design form
 * @returns {Object} - Object containing file objects
 */
export const extractFileObjects = (formValues) => {
  const files = {
    thumbnail_image: null,
    banner_images: [],
  };

  if (formValues.thumbnail_image?.[0]?.originFileObj) {
    files.thumbnail_image = formValues.thumbnail_image[0].originFileObj;
  }

  if (Array.isArray(formValues.banner_images)) {
    files.banner_images = formValues.banner_images
      .map((img) => img.originFileObj)
      .filter(Boolean);
  }

  return files;
};

/**
 * Default upload field configurations for common scenarios
 */
export const UPLOAD_FIELD_CONFIGS = {
  PLACE: [
    {
      dataField: "thumbnail_image",
      uploadUrlField: "thumbnail_image_upload_url",
      fileField: "thumbnail_image",
      isArray: false,
    },
    {
      dataField: "banner_images",
      uploadUrlField: "banner_images_upload_url",
      fileField: "banner_images",
      isArray: true,
    },
  ],
  EVENT: [
    {
      dataField: "event_image",
      uploadUrlField: "event_image_upload_url",
      fileField: "event_image",
      isArray: false,
    },
  ],
};
