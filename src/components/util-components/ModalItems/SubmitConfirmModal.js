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
    console.log("uploadFailed state changed:", uploadFailed);
    console.log("Current state:", {
      uploadFailed,
      uploadError,
      responseDialogVisible,
      originalFiles,
      uploadFieldConfigs,
    });
  }, [uploadFailed]);

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
        setUploadFailed(false);
        setUploadError(null);
        return true;
      } catch (uploadError) {
        hideLoading();
        console.error("S3 Upload error:", uploadError);
        console.log("Setting uploadFailed to true");
        setUploadFailed(true);
        setUploadError(uploadError.message || "Upload failed");
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

      await handleS3Upload();

      message.success("Images uploaded successfully!");
      setUploadFailed(false);
      setUploadError(null);

      // Navigate after successful retry
      deleteDraft();
      dispatch(resetStatusModalState());
      navigate(navigationPath);
    } catch (error) {
      message.error("Retry failed. Please try again.");
    } finally {
      setIsRetrying(false);
      if (setIsUploading) {
        setIsUploading(false);
      }
    }
  };

  const handleModalSubmit = async () => {
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
          await handleS3Upload();
          message.success(onSubmitMessage);
          deleteDraft();
          dispatch(resetStatusModalState());
          navigate(navigationPath);
        } catch (uploadError) {
          // Show warning with retry option
          console.log("Upload failed, setting uploadFailed to true");
          setUploadFailed(true);
          message.warning(
            "Record created successfully, but image upload failed. Use retry button to upload images.",
            5
          );
          // IMPORTANT: Don't reset modal state, keep it open for retry
          setIsProcessing(false);
          dispatch(setModalLoading(false));
          if (setIsUploading) {
            setIsUploading(false);
          }
          return; // Exit early, don't close modal
        }
      } else {
        message.error(TextConstants.FailedToConfirmItem);
      }
    } catch (error) {
      console.error(TextConstants.ConfirmationError, error);
      message.error(TextConstants.ConfirmationError);
    } finally {
      // Only reset if upload didn't fail
      if (!uploadFailed) {
        setIsProcessing(false);
        dispatch(setModalLoading(false));
        dispatch(setResponseDialogVisible(false));
        dispatch(resetStatusModalState());

        if (setIsUploading) {
          setIsUploading(false);
        }
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
