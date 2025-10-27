import { useDispatch } from "react-redux";
import { Modal, message } from "antd";
import { deleteS3Image } from "store/slices/s3CloudflareSlice";

/**
 * Custom hook for handling S3 image deletion with confirmation
 * @param {string} moduleName - The module name for the image (e.g., 'event', 'place', 'venue')
 * @returns {Function} handleDeleteImage - Function to delete an image
 */
export const useS3ImageDelete = (moduleName = "event") => {
  const dispatch = useDispatch();

  /**
   * Handle image deletion with confirmation modal
   * @param {Object} file - The file object containing id, name, etc.
   * @param {Function} onSuccess - Callback function to execute after successful deletion
   * @param {Object} options - Additional options
   * @param {string} options.title - Custom modal title
   * @param {string} options.content - Custom modal content
   * @param {string} options.successMessage - Custom success message
   * @param {Function} options.onError - Custom error handler
   */
  const handleDeleteImage = (file, onSuccess, options = {}) => {
    const {
      title = "Delete Image",
      content = "Are you sure you want to delete this image? This will permanently remove it from the database and cannot be undone.",
      successMessage = "Image deleted successfully from database",
      onError,
    } = options;

    // If file has no id (newly uploaded, not yet saved), just remove from UI
    if (!file.id) {
      if (onSuccess) {
        onSuccess();
      }
      return Promise.resolve();
    }

    // Show confirmation modal for database images
    return new Promise((resolve, reject) => {
      Modal.confirm({
        title,
        content,
        okText: "Yes, Delete",
        okType: "danger",
        cancelText: "Cancel",
        onOk: () => {
          return dispatch(
            deleteS3Image({
              id: file.id,
              module_name: moduleName,
            })
          )
            .unwrap()
            .then(() => {
              message.success(successMessage);
              if (onSuccess) {
                onSuccess();
              }
              resolve();
            })
            .catch((error) => {
              const errorMessage = error?.message || "Failed to delete image";
              message.error(errorMessage);
              console.error("Delete error:", error);

              if (onError) {
                onError(error);
              }
              reject(error);
            });
        },
        onCancel: () => {
          reject(new Error("Deletion cancelled"));
        },
      });
    });
  };

  return { handleDeleteImage };
};

export default useS3ImageDelete;
