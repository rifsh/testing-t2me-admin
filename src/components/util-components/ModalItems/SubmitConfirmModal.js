import { message } from "antd";
import ResponseShowModal from "components/util-components/ModalItems/ResponseShowModal";
import { TextConstants } from "constants/TextConstant";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  setResponseDialogVisible,
  setModalLoading,
} from "store/slices/modalSlice";
import { resetStatusModalState } from "store/slices/modalSlice";
import { ActionType } from "utils/api/warning-submit-util";
export const SubmitAndConfirmModal = ({
  addFunction,
  navigationPath,
  responseData,
  onCloseMessage,
  responseMessage,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Corrected: Access the right slice of the state
  const { responseDialogVisible, selectedItem, modalLoading } = useSelector(
    (state) => state.modalSlice
  );

  useEffect(() => {
    if (selectedItem) {
      dispatch(
        addFunction({ data: selectedItem, action: ActionType.SUBMIT })
      ).then((result) => {
        if (addFunction.fulfilled.match(result)) {
          dispatch(setResponseDialogVisible(true));
        } else {
          dispatch(resetStatusModalState());
          message.error("Error submitting the item. Please try again.");
        }
      });
    }
  }, [selectedItem, dispatch, addFunction]);

  const handleModalSubmit = async () => {
    try {
      if (!selectedItem) {
        message.error("No item selected for confirmation.");
        return;
      }

      dispatch(setModalLoading(true));

      const resultAction = await dispatch(
        addFunction({ data: selectedItem, action: ActionType.CONFIRM })
      );

      if (addFunction.fulfilled.match(resultAction)) {
        message.success("Item successfully added.");
        dispatch(resetStatusModalState());
        navigate(navigationPath);
      } else {
        message.error("Failed to confirm the item.");
      }
    } catch (error) {
      console.error("Error during confirmation:", error);
      message.error("An error occurred during confirmation.");
    } finally {
      dispatch(setModalLoading(false));
      dispatch(setResponseDialogVisible(false));
    }
  };

  const handleModalCancel = () => {
    dispatch(setResponseDialogVisible(false));
    message.warning(onCloseMessage);
  };

  return (
    <ResponseShowModal
      visible={responseDialogVisible}
      title="Confirm Item Details"
      jsonData={responseData}
      warningMessage={responseMessage}
      onSubmit={handleModalSubmit}
      onCancel={handleModalCancel}
      confirmText="Confirm Item"
      cancelText="Cancel"
      loading={modalLoading}
    />
  );
};
