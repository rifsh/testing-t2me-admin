// utils/formApiUtils.js
import { message } from "antd";
import { ADD, EDIT, ApiActions } from "constants/AppConstants";
import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Utils from "utils";

/**
 * Creates default API configuration for forms with smart defaults
 * @param {Function} dispatch - Redux dispatch function
 * @param {Function} navigate - React Router navigate function
 * @param {Function} apiAction - API action creator
 * @param {string} mode - Form mode (ADD/EDIT)
 * @param {Object} options - Override options
 * @returns {Object} API configuration object
 */
export const createFormApiConfig = (
  dispatch,
  navigate,
  apiAction,
  mode,
  options = {}
) => {
  const {
    // Override options
    successMessage,
    errorMessage,
    skipValidation = false,
    customValidation,
    customSubmit,
    onSuccessCallback,
    onErrorCallback,
    resetOnSuccess,

    // Modal options
    warningModalTitle,
    responseModalTitle,
    confirmText = "Confirm",
    cancelText = "Cancel",

    // Navigation
    navigateBack = true,
    navigationPath,

    // Entity name for default messages
    entityName = "Item",
  } = options;

  return {
    validateBeforeSubmit: skipValidation
      ? null
      : async (formData, currentMode) => {
          try {
            console.log(`Validating ${entityName.toLowerCase()}:`, {
              formData,
              currentMode,
            });

            const apiResponsePayload = await dispatch(
              apiAction({
                data: formData,
                params: { action: ApiActions.SUBMIT },
              })
            );

            const apiResponse = apiResponsePayload?.payload;

            if (apiResponse?.status) {
              const {
                status_code,
                message: responseMessage,
                timer,
              } = apiResponse.status;

              if (status_code === "00000") {
                return {
                  showWarning: true,
                  warningMessage: responseMessage,
                  warningTitle:
                    warningModalTitle || `Confirm ${entityName} Operation`,
                  apiResponseData: apiResponse.data,
                  timer: timer || null,
                  apiResponse: apiResponse,
                  originalFormData: formData,
                };
              } else {
                throw new Error(responseMessage || "Validation failed");
              }
            }

            return { showWarning: false, warningMessage: null };
          } catch (error) {
            console.error(`${entityName} validation failed:`, error);
            throw extractErrorMessage(error);
          }
        },

    submitFunction:
      customSubmit ||
      (async (formData, currentMode) => {
        try {
          const apiResponse = await Utils.getStatusResponse(
            dispatch,
            apiAction,
            {
              actionPayload: {
                data: formData,
                params: {
                  action: ApiActions.CONFIRM,
                  ...(currentMode === EDIT &&
                    formData.id && { id: formData.id }),
                },
              },
            }
          );
          if (
            apiResponse?.error?.status?.status_code &&
            apiResponse.error?.status.status_code !== "00000"
          ) {
            console.warn(apiResponse, "apiresonsadfafafa");
            throw new Error(
              apiResponse.error?.status?.message || "Operation failed"
            );
          }

          return apiResponse;
        } catch (error) {
          console.error(`${entityName} submission failed:`, error);
          throw extractErrorMessage(error);
        }
      }),

    onSuccess: (apiResponse, currentMode) => {
      console.log(`${entityName} operation completed successfully:`, {
        apiResponse,
        currentMode,
      });

      if (navigateBack) {
        if (navigationPath) {
          navigate(navigationPath);
        } else {
          navigate(-1);
        }
      }

      const defaultSuccessMessage = `${entityName} ${
        currentMode === ADD ? "added" : "updated"
      } successfully`;
      const finalSuccessMessage =
        successMessage ||
        apiResponse?.status?.message ||
        apiResponse?.message ||
        defaultSuccessMessage;

      message.success(finalSuccessMessage);

      if (onSuccessCallback) {
        onSuccessCallback(apiResponse, currentMode);
      }
    },

    onError: (error, currentMode, apiResponse = null) => {
      console.error(`${entityName} operation failed:`, error);

      if (onErrorCallback) {
        onErrorCallback(error, currentMode, apiResponse);
      }
    },

    // Modal configuration
    warningModalTitle: warningModalTitle || `Confirm ${entityName} Operation`,
    responseModalTitle: responseModalTitle || `Confirm ${entityName} Details`,
    warningConfirmText: confirmText,
    warningCancelText: cancelText,
    responseConfirmText: `${confirmText} & Save`,
    responseCancelText: "Review Again",

    resetOnSuccess:
      resetOnSuccess !== undefined ? resetOnSuccess : mode === ADD,
  };
};

/**
 * Extracts meaningful error message from different error response structures
 * @param {Error|Object} error - Error object or API response
 * @returns {Error} Error object with meaningful message
 */
const extractErrorMessage = (error) => {
  let errorMessage = "Operation faileed";

  if (error?.message) {
    return new Error(error.message);
  }

  const errorData = error?.response?.data || error?.payload;
  if (errorData) {
    if (errorData.status?.message) {
      errorMessage = errorData.status.message;
    } else if (errorData.server_error) {
      errorMessage = errorData.server_error;
    } else if (errorData.error) {
      errorMessage = errorData.error;
    }
  }

  return new Error(errorMessage);
};

/**
 * Hook for creating form API configuration
 * @param {Function} apiAction - API action creator
 * @param {Object} defaultOptions - Default options for this entity
 * @returns {Function} Function that creates API config for given mode
 */
export const useFormApiConfig = (apiAction, defaultOptions = {}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return useCallback(
    (mode, overrideOptions = {}) => {
      const finalOptions = { ...defaultOptions, ...overrideOptions };
      return createFormApiConfig(
        dispatch,
        navigate,
        apiAction,
        mode,
        finalOptions
      );
    },
    [dispatch, navigate, apiAction, defaultOptions]
  );
};

/**
 * Default form configuration presets
 */
export const FormConfigPresets = {
  // Basic CRUD form
  basic: {
    layout: "vertical",
    showHeader: true,
    showTabs: false,
    responsive: true,
    confirmOnCancel: true,
    validateOnChange: true,
    size: "default",
    gutter: 24,
    showWarningModal: true,
    showResponseModal: true,
  },

  // Tabbed form for complex entities
  tabbed: {
    layout: "vertical",
    showHeader: true,
    showTabs: true,
    tabType: "card",
    responsive: true,
    confirmOnCancel: true,
    validateOnChange: true,
    size: "default",
    gutter: 24,
    showWarningModal: true,
    showResponseModal: true,
  },

  // Compact form for quick operations
  compact: {
    layout: "horizontal",
    showHeader: false,
    showTabs: false,
    responsive: true,
    confirmOnCancel: false,
    validateOnChange: false,
    size: "small",
    gutter: 16,
    showWarningModal: false,
    showResponseModal: false,
  },
};
