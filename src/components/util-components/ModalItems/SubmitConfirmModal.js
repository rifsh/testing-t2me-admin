import { message } from "antd";
import ResponseShowModal from "components/util-components/ModalItems/ResponseShowModal";
import { TextConstants } from "constants/TextConstant";
import { useDraft } from "drafts/hooks/useDraftManager";
import { useEffect, useState, useRef } from "react";
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
  extraFieldsFromResponse = [], // NEW PROP: Fields to extract from submit response
  uploadFieldConfigs = [],
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadFailed, setUploadFailed] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [isRetrying, setIsRetrying] = useState(false);

  // ===== CRITICAL: Store original data before any API calls =====
  const originalDataRef = useRef(null);
  // Store submit response data for extracting extra fields
  const submitResponseRef = useRef(null);

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
      // Clear original data ref when modal closes
      originalDataRef.current = null;
      submitResponseRef.current = null;
    }
  }, [responseDialogVisible]);

  // ===== CRITICAL: Store original data when selectedSubmitItem changes =====
  useEffect(() => {
    if (selectedSubmitItem && !originalDataRef.current) {
      // Deep clone to preserve original data
      const clonedData = JSON.parse(JSON.stringify(selectedSubmitItem));
      originalDataRef.current = clonedData;
      console.log("=== ORIGINAL DATA STORED ===", originalDataRef.current);

      // Call submit with ORIGINAL data
      dispatch(addFunction({ data: clonedData, action: ActionType.SUBMIT }))
        .then((result) => {
          if (addFunction.fulfilled?.match(result)) {
            // ===== STORE SUBMIT RESPONSE for extracting extra fields =====
            submitResponseRef.current = result.payload;
            console.log(
              "=== SUBMIT RESPONSE STORED ===",
              submitResponseRef.current
            );

            dispatch(setResponseDialogVisible(true));
          } else {
            dispatch(resetStatusModalState());
            console.error(TextConstants.ErrorSubmittingItem);
            message.error(TextConstants.ErrorSubmittingItem);
            // Clear original data on error
            originalDataRef.current = null;
            submitResponseRef.current = null;
          }
        })
        .catch((err) => {
          console.error("Submit error:", err);
          message.error(TextConstants.ErrorSubmittingItem);
          // Clear original data on error
          originalDataRef.current = null;
          submitResponseRef.current = null;
        });
    }
  }, [selectedSubmitItem, dispatch, addFunction]);

  const handleSubmitPagination = (page, size) => {
    // ===== USE ORIGINAL DATA for pagination =====
    if (originalDataRef.current) {
      dispatch(
        addFunction({
          data: originalDataRef.current,
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
      originalDataRef.current = null; // Clear original data
      submitResponseRef.current = null;
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
      if (!originalDataRef.current) {
        message.error(TextConstants.NoItemSelected);
        return;
      }

      setIsProcessing(true);
      dispatch(setModalLoading(true));

      if (setIsUploading) {
        setIsUploading(true);
      }

      // ===== CRITICAL: Build confirmation data from ORIGINAL + RESPONSE =====
      const originalData = originalDataRef.current;
      const submitResponse = submitResponseRef.current;
      const recordId = originalData.id;

      console.log("=== BUILDING CONFIRM DATA ===", {
        originalData,
        submitResponse,
        recordId,
        fieldsToConfirm,
        extraFieldsFromResponse,
      });

      // Step 1: Extract fields from ORIGINAL data
      let confirmationData = {};

      if (fieldsToConfirm && fieldsToConfirm.length > 0) {
        // If specific fields are requested, filter them from original data
        fieldsToConfirm.forEach((field) => {
          if (originalData.hasOwnProperty(field)) {
            confirmationData[field] = originalData[field];
          }
        });
      } else {
        // If no specific fields, use all original data
        confirmationData = { ...originalData };
      }

      // Step 2: Extract extra fields from SUBMIT RESPONSE
      if (
        extraFieldsFromResponse &&
        extraFieldsFromResponse.length > 0 &&
        submitResponse
      ) {
        // Navigate through response data structure
        let responseDataObj =
          submitResponse?.data?.data || submitResponse?.data || submitResponse;

        console.log("=== EXTRACTING EXTRA FIELDS FROM RESPONSE ===", {
          responseDataObj,
          extraFieldsFromResponse,
        });

        extraFieldsFromResponse.forEach((field) => {
          if (responseDataObj.hasOwnProperty(field)) {
            confirmationData[field] = responseDataObj[field];
            console.log(`Added extra field: ${field}`, responseDataObj[field]);
          }
        });
      }

      // Step 3: Always include ID
      if (recordId) {
        confirmationData.id = recordId;
      }

      console.log("=== FINAL CONFIRMATION DATA ===", confirmationData);

      // Send confirmation request
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
          originalDataRef.current = null; // Clear original data
          submitResponseRef.current = null;
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
      originalDataRef.current = null; // Clear original data
      submitResponseRef.current = null;

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
        originalDataRef.current = null; // Clear original data
        submitResponseRef.current = null;
        navigate(navigationPath);
      }
    } else {
      dispatch(resetStatusModalState());
      originalDataRef.current = null; // Clear original data
      submitResponseRef.current = null;
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
