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
  setLocationDialogVisible,
  setLocationModalLoading,
  setSelectedPlace,
} from "store/slices/locationSlice";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import { ActionType } from "utils/api/warning-submit-util";
import WarningModal from "components/util-components/ModalItems/WarningModal";
import {
  setSelectedItem,
  setSelectedSubmitItem,
} from "store/slices/modalSlice";
import { SubmitAndConfirmModal } from "components/util-components/ModalItems/SubmitConfirmModal";

const CountryForm = ({ placeId }) => {
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
    modalLoading,
    selectedPlace,
    filteredPlaces,
    message: warningMessage,
  } = useSelector((state) => state.locations);

  useEffect(() => {
    if (placeId && filteredPlaces && filteredPlaces.length > 0) {
      const numericPlaceId = parseInt(placeId, 10);
      const place = filteredPlaces.find((p) => p.id === numericPlaceId);

      if (place) {
        form.setFieldsValue({
          country_id: place.country_id,
          name: place.name,
        });
      } else {
        console.warn(`No place found with ID: ${numericPlaceId}`);
      }
    }
  }, [placeId, filteredPlaces, form]);

  useEffect(() => {
    if (error) {
      antdMessage.error(error);
    }
  }, [error]);

  const onFinish = async () => {
    try {
      const values = await form.validateFields();

      if (!placeId) {
        dispatch(setSelectedSubmitItem(values));
        // form.resetFields();
        // const resultAction = await dispatch(
        //   createPlace({ placeData: values, action: ActionType.SUBMIT })
        // );

        // if (createPlace.fulfilled.match(resultAction)) {
        //   message.success(`Place ${values.name} added successfully`);
        //   navigate(`${APP_PREFIX_PATH}/place/list`);
        // }
      } else {
        // Editing an existing place
        // if (!selectedPlace) {
        //   console.error("No selected place found for editing.");
        //   antdMessage.error(
        //     "Unable to find the selected place. Please try again."
        //   );
        //   return;
        // }

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

  const handleModalSubmit = async () => {
    dispatch(setLocationModalLoading(true));
    const resultAction = await dispatch(
      editPlace({ data: selectedPlace, action: ActionType.SUBMIT })
    );
    dispatch(setLocationModalLoading(false));
    dispatch(setLocationDialogVisible(false));
    dispatch(getPlaces());
    if (editPlace.fulfilled.match(resultAction)) {
      antdMessage.success(`Event ${selectedPlace.name} updated successfully`);
      form.resetFields();
      navigate(`${APP_PREFIX_PATH}/place/list`);
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
              <h2 className="mb-3">
                {!placeId ? "Add New Place" : `Edit Place`}{" "}
              </h2>
              <div className="mb-3">
                <Button className="mr-2">Discard</Button>
                <Button
                  type="primary"
                  onClick={onFinish}
                  htmlType="submit"
                  loading={loading}
                >
                  {!placeId ? "Add" : `Save`}
                </Button>
              </div>
            </Flex>
          </div>
        </PageHeaderAlt>
        <div className="container">
          <Tabs
            defaultActiveKey="1"
            style={{ marginTop: 30 }}
            items={[
              {
                label: "General",
                key: "1",
                children: <CountryFormFields />,
              },
            ]}
          />
        </div>
      </Form>
      <WarningModal
        visible={dialogVisible}
        title="Confirm Action"
        details={warningMessage}
        warningMessage="Do you want to continue?"
        onSubmit={handleModalSubmit}
        onCancel={handleModalCancel}
        confirmText="Proceed"
        cancelText="Back"
        loading={modalLoading}
      />
      <SubmitAndConfirmModal
        responseData={responseData}
        addFunction={createPlace}
        navigationPath={`${APP_PREFIX_PATH}/place/list`}
        responseMessage={responseMessage}
      />
    </>
  );
};

export default CountryForm;
