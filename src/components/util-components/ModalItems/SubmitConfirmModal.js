import { message } from "antd";
import ResponseShowModal from "components/util-components/ModalItems/ResponseShowModal";
import { TextConstants } from "constants/TextConstant";
import { useDraft } from "drafts/hooks/useDraftManager";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  setResponseDialogVisible,
  setModalLoading,
  resetStatusModalState,
} from "store/slices/modalSlice";
import { ActionType } from "utils/api/warning-submit-util";
import {
  uploadImagesAfterConfirm,
  prepareConfirmationData,
} from "utils/s3UploadUtil";

export const SubmitAndConfirmModal = ({
  addFunction,
  navigationPath,
  responseData,
  onSubmitMessage = TextConstants.ItemAddedSuccessfully,
  onCloseMessage = TextConstants.ItemAddCanceled,
  responseMessage,
  pagination,
  recordId,
  formType,
  form,
  mode,
  setIsUploading,
  fieldsToConfirm = [],
  uploadFieldConfigs = [],
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadFailed, setUploadFailed] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const { deleteDraft } = useDraft({
    form,
    formType: formType,
    mode,
    recordId: recordId,
  });

  const {
    responseDialogVisible,
    selectedSubmitItem,
    modalLoading,
    originalFiles,
  } = useSelector((state) => state.modalSlice);

  // Debug: Monitor uploadFailed state changes
  useEffect(() => {
    console.log("=== UPLOAD FAILED STATE CHANGED ===", {
      uploadFailed,
      uploadError,
      responseDialogVisible,
      hasOriginalFiles: !!originalFiles,
      hasUploadConfigs: uploadFieldConfigs.length > 0,
    });
  }, [uploadFailed, uploadError, responseDialogVisible]);

  // Reset upload failed state when modal closes
  useEffect(() => {
    console.log("=== MODAL VISIBILITY CHANGED ===", {
      responseDialogVisible,
      uploadFailed,
      isProcessing,
    });

    if (!responseDialogVisible) {
      console.log("Modal closed - resetting states");
      setUploadFailed(false);
      setUploadError(null);
      setIsProcessing(false);
    }
  }, [responseDialogVisible]);

  useEffect(() => {
    if (selectedSubmitItem) {
      dispatch(
        addFunction({ data: selectedSubmitItem, action: ActionType.SUBMIT })
      )
        .then((result) => {
          if (addFunction.fulfilled?.match(result)) {
            dispatch(setResponseDialogVisible(true));
          } else {
            dispatch(resetStatusModalState());
            message.error(TextConstants.ErrorSubmittingItem);
          }
        })
        .catch((err) => {
          console.error("Submit error:", err);
          message.error(TextConstants.ErrorSubmittingItem);
        });
    }
  }, [selectedSubmitItem, dispatch, addFunction]);

  const handleSubmitPagination = (page, size) => {
    if (selectedSubmitItem) {
      dispatch(
        addFunction({
          data: selectedSubmitItem,
          action: ActionType.SUBMIT,
          pageData: { page: page, size: size },
        })
      );
    }
  };

  const handleS3Upload = async () => {
    if (originalFiles && responseData && uploadFieldConfigs.length > 0) {
      const hideLoading = message.loading("Uploading images to S3...", 0);

      try {
        console.log("Starting S3 upload with:", {
          originalFiles,
          uploadFieldConfigs,
          responseData,
        });

        await uploadImagesAfterConfirm(
          responseData,
          originalFiles,
          uploadFieldConfigs
        );

        hideLoading();
        console.log("All images uploaded successfully to S3");

        // Reset failure states on success
        setUploadFailed(false);
        setUploadError(null);

        return true;
      } catch (uploadError) {
        hideLoading();
        console.error("S3 Upload error:", uploadError);
        console.log("Setting uploadFailed to true");

        // Set failure states
        setUploadFailed(true);
        setUploadError(uploadError.message || "Upload failed");

        // Re-throw to let caller handle it
        throw uploadError;
      }
    }
    console.log("No files to upload, skipping S3 upload");
    return true;
  };

  const handleRetryUpload = async () => {
    try {
      setIsRetrying(true);
      if (setIsUploading) {
        setIsUploading(true);
      }

      // Try to upload - this will throw if it fails
      await handleS3Upload();

      // Only reach here if upload was successful
      message.success("Images uploaded successfully!");
      setUploadFailed(false);
      setUploadError(null);

      // Navigate after successful retry
      deleteDraft();
      dispatch(resetStatusModalState());
      navigate(navigationPath);
    } catch (error) {
      console.error("Retry upload failed:", error);

      // Keep uploadFailed as true
      setUploadFailed(true);
      setUploadError(error.message || "Upload failed. Please try again.");

      // Show error message
      message.error("Retry failed. Please try again.");

      // CRITICAL: Don't navigate, keep modal open for another retry
    } finally {
      setIsRetrying(false);
      if (setIsUploading) {
        setIsUploading(false);
      }
    }
  };

  const handleModalSubmit = async () => {
    // Prevent multiple submissions
    if (isProcessing) {
      console.log("Already processing, ignoring submit");
      return;
    }

    try {
      if (!selectedSubmitItem) {
        message.error(TextConstants.NoItemSelected);
        return;
      }

      setIsProcessing(true);
      dispatch(setModalLoading(true));

      if (setIsUploading) {
        setIsUploading(true);
      }

      // Prepare confirmation data with specified fields
      const confirmationData = prepareConfirmationData(
        responseData,
        fieldsToConfirm
      );

      console.log("Confirmation Data:", confirmationData);

      // Send confirmation request FIRST
      const resultAction = await dispatch(
        addFunction({ data: confirmationData, action: ActionType.CONFIRM })
      );

      if (addFunction.fulfilled.match(resultAction)) {
        // After successful confirmation, upload images to S3
        try {
          console.log("=== STARTING POST-CONFIRMATION UPLOAD ===");
          const uploadResult = await handleS3Upload();
          console.log("=== POST-CONFIRMATION UPLOAD SUCCESS ===", uploadResult);

          // Success path - clear failure states, close modal and navigate
          setUploadFailed(false);
          setUploadError(null);

          message.success(onSubmitMessage);
          deleteDraft();
          dispatch(resetStatusModalState());
          navigate(navigationPath);
        } catch (uploadError) {
          // Upload failed - keep modal open with retry button
          console.log("=== POST-CONFIRMATION UPLOAD FAILED ===", uploadError);
          console.log("Error message:", uploadError?.message);

          // Set upload failed state BEFORE resetting loading states
          setUploadFailed(true);
          setUploadError(uploadError.message || "Upload failed");

          // Reset loading states but keep modal open
          setIsProcessing(false);
          dispatch(setModalLoading(false));

          if (setIsUploading) {
            setIsUploading(false);
          }

          // Show warning message
          message.warning(
            "Record created successfully, but image upload failed. Use retry button to upload images.",
            5
          );

          // CRITICAL: Return early to prevent modal from closing
          return;
        }
      } else {
        message.error(TextConstants.FailedToConfirmItem);
        // Reset on failure
        setIsProcessing(false);
        dispatch(setModalLoading(false));
        if (setIsUploading) {
          setIsUploading(false);
        }
      }
    } catch (error) {
      console.error(TextConstants.ConfirmationError, error);
      message.error(TextConstants.ConfirmationError);

      // Reset on error
      setIsProcessing(false);
      dispatch(setModalLoading(false));
      dispatch(setResponseDialogVisible(false));
      dispatch(resetStatusModalState());

      if (setIsUploading) {
        setIsUploading(false);
      }
    }
  };

  const handleModalCancel = () => {
    if (uploadFailed) {
      // If upload failed but record was created, allow navigation
      const confirmLeave = window.confirm(
        "Images were not uploaded. Are you sure you want to leave? You can retry uploading later."
      );
      if (confirmLeave) {
        setUploadFailed(false);
        setUploadError(null);
        deleteDraft();
        dispatch(resetStatusModalState());
        navigate(navigationPath);
      }
    } else {
      dispatch(resetStatusModalState());
      message.warning(onCloseMessage);
    }
  };

  return (
    <ResponseShowModal
      visible={responseDialogVisible}
      title={uploadFailed ? "Upload Failed" : TextConstants.ConfirmItemDetails}
      jsonData={responseData}
      warningMessage={uploadFailed ? uploadError : responseMessage}
      onSubmit={handleModalSubmit}
      onCancel={handleModalCancel}
      confirmText={TextConstants.ConfirmItem}
      cancelText={uploadFailed ? "Skip & Continue" : TextConstants.Cancel}
      loading={modalLoading || isProcessing}
      pagination={pagination}
      onPaginationChange={handleSubmitPagination}
      // Add retry button when upload fails
      showRetry={uploadFailed}
      onRetry={handleRetryUpload}
      retryLoading={isRetrying}
    />
  );
};
