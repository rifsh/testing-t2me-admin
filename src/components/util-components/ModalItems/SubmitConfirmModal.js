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
  pagination,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { responseDialogVisible, selectedSubmitItem, modalLoading } =
    useSelector((state) => state.modalSlice);

  useEffect(() => {
    if (selectedSubmitItem) {
      dispatch(
        addFunction({ data: selectedSubmitItem, action: ActionType.SUBMIT })
      ).then((result) => {
        if (addFunction.fulfilled?.match(result)) {
          dispatch(setResponseDialogVisible(true));
        } else {
          dispatch(resetStatusModalState());
          message.error(TextConstants.ErrorSubmittingItem);
        }
      }).catch((err) => {
        console.log("ssss", err);
      });
    }
  }, [selectedSubmitItem, dispatch, addFunction]);

  const handleSubmitPagination = (page, size) => {
    console.log("------------------------");
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

  const handleModalSubmit = async () => {
    try {
      if (!selectedSubmitItem) {
        message.error(TextConstants.NoItemSelected);
        return;
      }

      dispatch(setModalLoading(true));

      const resultAction = await dispatch(
        addFunction({ data: selectedSubmitItem, action: ActionType.CONFIRM })
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
      dispatch(resetStatusModalState());
      dispatch(setModalLoading(false));
      dispatch(setResponseDialogVisible(false));
    }
  };

  const handleModalCancel = () => {
    dispatch(resetStatusModalState());
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
      pagination={pagination}
      onPaginationChange={handleSubmitPagination}
    />
  );
};
