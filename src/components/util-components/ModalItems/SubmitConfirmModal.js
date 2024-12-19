import { message } from "antd";
import ResponseShowModal from "components/util-components/ModalItems/ResponseShowModal";
import { TextConstants } from "constants/TextConstant";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  setResponseDialogVisible,
  setModalLoading,
  resetStatusModalState,
} from "store/slices/modalSlice";
import { ActionType } from "utils/api/warning-submit-util";

export const SubmitAndConfirmModal = ({
  addFunction,
  navigationPath,
  responseData,
  onSubmitMessage = TextConstants.ItemAddedSuccessfully,
  onCloseMessage = TextConstants.ItemAddCanceled,
  responseMessage,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

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
          message.error(TextConstants.ErrorSubmittingItem);
        }
      });
    }
  }, [selectedItem, dispatch, addFunction]);

  const handleModalSubmit = async () => {
    try {
      if (!selectedItem) {
        message.error(TextConstants.NoItemSelected);
        return;
      }

      dispatch(setModalLoading(true));

      const resultAction = await dispatch(
        addFunction({ data: selectedItem, action: ActionType.CONFIRM })
      );

      if (addFunction.fulfilled.match(resultAction)) {
        message.success(onSubmitMessage);
        dispatch(resetStatusModalState());
        navigate(navigationPath);
      } else {
        message.error(TextConstants.FailedToConfirmItem);
      }
    } catch (error) {
      console.error(TextConstants.ConfirmationError, error);
      message.error(TextConstants.ConfirmationError);
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
      title={TextConstants.ConfirmItemDetails}
      jsonData={responseData}
      warningMessage={responseMessage}
      onSubmit={handleModalSubmit}
      onCancel={handleModalCancel}
      confirmText={TextConstants.ConfirmItem}
      cancelText={TextConstants.Cancel}
      loading={modalLoading}
    />
  );
};
