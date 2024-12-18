import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import WarningModal from "components/util-components/ModalItems/WarningModal";
import {
  setDialogVisible,
  setModalLoading,
} from "store/slices/statusModalSlice";
import { ActionType } from "utils/api/warning-submit-util";
import { message } from "antd";

const UpdateStatusModal = ({
  editFunction,
  getAllFunction,
  onSubmitMessage = "Status updated successfully.",
  onCloseMessage = "Status update canceled.",
  responseMessage,
}) => {
  const dispatch = useDispatch();
  const { dialogVisible, selectedItem, modalLoading } = useSelector(
    (state) => state.statusModal
  );

  useEffect(() => {
    if (dialogVisible && selectedItem) {
      dispatch(
        editFunction({ data: selectedItem, action: ActionType.WARNING })
      ).then((result) => {
        if (!editFunction.fulfilled.match(result)) {
            message.error('Error loading the item for editing.')
        //   alert("Error loading the item for editing.");
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
      message.success(onSubmitMessage);
    } else {
      message.error("Error updating the status.");
    }
  };

  const handleModalCancel = () => {
    dispatch(setDialogVisible(false));
    message.warning(onCloseMessage);
  };

  return (
    <WarningModal
      visible={dialogVisible}
      title="Confirm Action"
      details={responseMessage || "Are you sure you want to proceed?"}
      warningMessage="Do you want to continue?"
      onSubmit={handleModalSubmit}
      onCancel={handleModalCancel}
      confirmText="Proceed"
      cancelText="Back"
      loading={modalLoading}
    />
  );
};

export default UpdateStatusModal;
