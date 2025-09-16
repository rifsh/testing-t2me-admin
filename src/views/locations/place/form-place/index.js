import React, { useEffect } from "react";
import PageHeaderAlt from "components/layout-components/PageHeaderAlt";
import { Tabs, Form, Button, message as antdMessage, message } from "antd";
import Flex from "components/shared-components/Flex";
import CountryFormFields from "../components/CountryFormFields";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  createPlace,
  editPlace,
  getPlaces,
  setLoading,
  setLocationDialogVisible,
  setLocationModalLoading,
  setSelectedPlace,
  getSinglePlace,
} from "store/slices/locationSlice";
import { APP_PREFIX_PATH, CDN_PATH } from "configs/AppConfig";
import { ActionType } from "utils/api/warning-submit-util";
import WarningModal from "components/util-components/ModalItems/WarningModal";
import {
  setSelectedItem,
  setSelectedSubmitItem,
} from "store/slices/modalSlice";
import { SubmitAndConfirmModal } from "components/util-components/ModalItems/SubmitConfirmModal";
import DiscardButton from "components/shared-components/Buttons/DiscardButton";
import LoadingOverlay from "components/util-components/Loader/index";
import DraftSystem from "drafts/components/DraftSystem";
import { useDraft } from "drafts/hooks/useDraftManager";

// Update with actual path
import BackButton from "components/Buttons/BackPageButoon";

const CountryForm = ({ mode, placeId }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    loading,
    error,
    detailedCountryList,
    dialogVisible,
    responseData,
    responseMessage,
    createPlaceLoading,
    modalLoading,
    warningPagination,
    selectedPlace,
    filteredPlaces,
    responseImpactData,
    editable_status,
    singlePlace,
    message: warningMessage,
  } = useSelector((state) => state.locations);

  useEffect(() => {
    console.log("FETCHING SINGLE PLACE");

    if (placeId) {
      dispatch(getSinglePlace(placeId));
    }
  }, [dispatch, placeId]);

  useEffect(() => {
    console.log(singlePlace, "_________________single place");

    if (singlePlace) {
      console.log(singlePlace, "PLACEEEEEEEEEEEEsss");

      if (mode === "EDIT") {
        form.setFieldsValue({
          country_id: singlePlace.country.name,
          name: singlePlace.name,
          banner_images: singlePlace?.media
            ? singlePlace?.media?.map((banner, index) => ({
                uid: `-banner-${index}`,
                name: banner?.media_url.split("/").pop(),
                status: "done",
                url: banner?.media_url,
              }))
            : [],
          thumbnail_image:
            singlePlace.thumbnail_image &&
            singlePlace.thumbnail_image !== "images"
              ? [
                  {
                    uid: "-1",
                    name: singlePlace.thumbnail_image.split("/").pop(),
                    status: "done",
                    url: `${CDN_PATH}/${singlePlace.thumbnail_image}`,
                  },
                ]
              : [],
          description: singlePlace.description,
        });
      }
    } else {
      console.warn(`No place found with ID: ${placeId}`);
    }
  }, [singlePlace, form]);

  useEffect(() => {
    if (error) {
      antdMessage.error(error);
    }
  }, [error]);

  const onFinish = async () => {
    try {
      const values = await form.validateFields();
      console.log({ values });

      const data = {
        ...values,
      };

      console.log(data, "THIS IS THE DATA");

      if (!placeId) {
        dispatch(setSelectedSubmitItem(values));
        const resultAction = await dispatch(
          createPlace({ values, action: ActionType.SUBMIT })
        );

        if (createPlace.fulfilled.match(resultAction)) {
          antdMessage.success(`Place ${values.name} added successfully`);
          navigate(`${APP_PREFIX_PATH}/place/list`);
        }
      } else {
        console.log("ITS AN EDITTTTTTTTTTTTT");

        // If placeId exists, it's an edit (Edit mode)
        const data = {
          ...values,
          id: placeId,
        };
        console.log("Edit Data:", data);

        const resultAction = await dispatch(
          editPlace({ data, action: ActionType.WARNING })
        );

        if (editPlace.fulfilled.match(resultAction)) {
          dispatch(setSelectedPlace(data));
          dispatch(setLocationDialogVisible(true));
        }
      }
    } catch (errorInfo) {
      console.error("Validation Failed:", errorInfo);
    }
  };
  const handleWarningPagination = (page, size) => {
    console.log("------------------------");

    console.log("CHANIGN...........");

    dispatch(
      editPlace({
        data: selectedPlace,
        action: ActionType.WARNING,
        pageData: { page: page, size: size },
      })
    );
  };

  const handleModalSubmit = async () => {
    dispatch(setLocationModalLoading(true));
    const resultAction = await dispatch(
      editPlace({ data: selectedPlace, action: ActionType.SUBMIT })
    );

    dispatch(setLocationModalLoading(false));
    dispatch(setLocationDialogVisible(false));
    if (editPlace.fulfilled.match(resultAction)) {
      dispatch(setSelectedSubmitItem(selectedPlace));
    }
  };

  const handleModalCancel = () => {
    dispatch(setLocationDialogVisible(false));
  };

  return (
    <>
      <Form
        layout="vertical"
        form={form}
        name="country_form"
        className="ant-advanced-search-form"
        initialValues={{
          heightUnit: "cm",
          widthUnit: "cm",
          weightUnit: "kg",
        }}
      >
        <PageHeaderAlt className="border-bottom" overlap>
          <div className="container">
            <Flex
              className="py-2"
              mobileFlex={false}
              justifyContent="space-between"
              alignItems="center"
            >
              <h2 className="mb-3 font-semibold">
                {!placeId ? "Add New Place" : `Edit Place`}{" "}
              </h2>
              <div className="mb-3 flex">
                {/* Add Draft Integration Component */}
                <DraftSystem
                  form={form}
                  formType="place"
                  mode={mode}
                  titleField="name"
                  excludeFromDraft={["id", "created_at"]}
                  style={{ marginRight: 12, display: "inline-block" }}
                  enableAutoSave={mode !== "EDIT"}
                />

                <DiscardButton form={form} />
                <Button
                  type="primary"
                  onClick={onFinish}
                  htmlType="submit"
                  loading={createPlaceLoading}
                >
                  {!placeId ? "Add" : `Save`}
                </Button>
              </div>
            </Flex>
          </div>
        </PageHeaderAlt>
        <div className="container pt-20">
          <CountryFormFields mode={mode} form={form} />,
        </div>
      </Form>
      <LoadingOverlay loading={createPlaceLoading} />

      <WarningModal
        visible={dialogVisible}
        title="Confirm Action"
        details={warningMessage}
        responseData={responseImpactData}
        warningMessage="Do you want to continue?"
        onSubmit={handleModalSubmit}
        onCancel={handleModalCancel}
        confirmText="Proceed"
        cancelText="Back"
        loading={loading}
        tableConfig={{
          title: "Active Schedules",
          dataKey: "items",
        }}
        editable_status={editable_status}
        pagination={warningPagination}
        onPaginationChange={handleWarningPagination}
      />
      <SubmitAndConfirmModal
        responseData={responseData}
        addFunction={mode === "EDIT" ? editPlace : createPlace}
        navigationPath={`${APP_PREFIX_PATH}/place/list`}
        responseMessage={responseMessage}
        mode={mode}
        form={form}
        formType={"place"}
      />
    </>
  );
};

export default CountryForm;
