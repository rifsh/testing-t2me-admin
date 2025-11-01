import { message } from "antd";
import ResponseShowModal from "components/util-components/ModalItems/ResponseShowModal";
import { TextConstants } from "constants/TextConstant";
import { useDispatch, useSelector } from "react-redux";
import { resetNormalStatus } from "store/slices/fliterSlice";
import {
  setResponseDialogVisible,
  setModalLoading,
  resetStatusModalState,
  setSelectedItem,
} from "store/slices/modalSlice";
import { ActionType } from "utils/api/warning-submit-util";

export const StatusSubmitAndConfirmModal = ({
  editFunction,
  getAllFunction,
  responseData,
  responseMessage,
  pageData = { page: 1, size: 10 },
  onSubmitMessage = TextConstants.StatusUpdatedSuccess,
  onCloseMessage = TextConstants.StatusUpdateCanceled,
}) => {
  const dispatch = useDispatch();

  const { responseDialogVisible, selectedItem, modalLoading } = useSelector(
    (state) => state.modalSlice
  );


  const handleModalSubmit = async () => {
    console.log('sample oneeeeee');
    if (!selectedItem) {
      message.error(TextConstants.NoItemSelected);
      return;
    }

    dispatch(setModalLoading(true));

    try {
      const result = await dispatch(
        editFunction({
          data: selectedItem,
          action: ActionType.CONFIRM,
        })
      );

      if (editFunction.fulfilled.match(result)) {
        // Update the list with new data
        await dispatch(getAllFunction(pageData));

        // Show success message and clean up
        message.success(onSubmitMessage);
        dispatch(resetStatusModalState());
        dispatch(setResponseDialogVisible(false));
        dispatch(resetNormalStatus(TextConstants.ResetStatus));
      } else {
        throw new Error(
          result.error?.message || TextConstants.FailedToConfirmItem
        );
      }
    } catch (error) {
      console.error("Status confirmation error:", error);
      message.error(TextConstants.ConfirmationError);
    } finally {
      dispatch(setModalLoading(false));
      dispatch(setSelectedItem(null));
    }
  };

  const handleModalCancel = () => {
    // Clean up modal state
    dispatch(resetStatusModalState());
    dispatch(setResponseDialogVisible(false));
    dispatch(setSelectedItem(null));
    message.warning(onCloseMessage);
  };

  return (
    <ResponseShowModal
      visible={responseDialogVisible}
      title={TextConstants.ConfirmStatusUpdate}
      jsonData={responseData}
      warningMessage={responseMessage}
      onSubmit={handleModalSubmit}
      onCancel={handleModalCancel}
      confirmText={TextConstants.ConfirmStatus}
      cancelText={TextConstants.Cancel}
      loading={modalLoading}
    />
  );
};

export default StatusSubmitAndConfirmModal;
