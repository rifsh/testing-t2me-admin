import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import WarningModal from "components/util-components/ModalItems/WarningModal";
import {
  resetStatusModalState,
  setDialogVisible,
  setModalLoading,
} from "store/slices/statusModalSlice";
import { ActionType } from "utils/api/warning-submit-util";
import { message } from "antd";
import { TextConstants } from "constants/TextConstant";

const UpdateStatusModal = ({
  editFunction,
  getAllFunction,
  onSubmitMessage = TextConstants.StatusUpdatedSuccess,
  onCloseMessage = TextConstants.StatusUpdateCanceled,
  responseMessage,
}) => {
  const dispatch = useDispatch();
  const { dialogVisible, selectedItem, modalLoading } = useSelector(
    (state) => state.statusModal
  );

  useEffect(() => {
    if (selectedItem) {
      dispatch(
        editFunction({ data: selectedItem, action: ActionType.WARNING })
      ).then((result) => {
        if (editFunction.fulfilled.match(result)) {
          dispatch(setDialogVisible(true));
        } else {
          dispatch(resetStatusModalState());

          dispatch(setDialogVisible(false));
          message.error(TextConstants.ErrorLoadingItem);
        }
      });
    }
  }, [dialogVisible, dispatch, editFunction, selectedItem]);

  const handleModalSubmit = async () => {
    dispatch(setModalLoading(true));
    const result = await dispatch(
      editFunction({ data: selectedItem, action: ActionType.SUBMIT })
    );
    dispatch(setModalLoading(false));
    dispatch(setDialogVisible(false));
    if (editFunction.fulfilled.match(result)) {
      dispatch(getAllFunction());
      dispatch(resetStatusModalState());

      message.success(onSubmitMessage);
    } else {
      message.error(TextConstants.StatusUpdateError);
    }
  };

  const handleModalCancel = () => {
    dispatch(setDialogVisible(false));
    message.warning(onCloseMessage);
  };

  return (
    <WarningModal
      visible={dialogVisible}
      title={TextConstants.Confirm_Action}
      details={responseMessage || TextConstants.WantToProceed}
      warningMessage={TextConstants.WantToProceed}
      onSubmit={handleModalSubmit}
      onCancel={handleModalCancel}
      confirmText={TextConstants.ProceedButton}
      cancelText={TextConstants.BackButton}
      loading={modalLoading}
    />
  );
};

export default UpdateStatusModal;
