import React, { useEffect, useState } from "react";
import {
  Input,
  Row,
  Col,
  Card,
  Form,
  Select,
  Button,
  message,
  Checkbox,
  InputNumber,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { EditWarningAlert } from "components/util-components/EditWarningComponent/index";
import { ActionType } from "utils/api/warning-submit-util";
import {
  addVenue,
  fetchAllCountires,
  getCoutryDetails,
  getPlaces,
  setSelectedPlace,
  validatePlace,
  setPlaceValidationDialogVisible,
  validateCountry,
} from "store/slices/locationSlice";
import { setSelectedSubmitItem } from "store/slices/modalSlice";

import Flex from "components/shared-components/Flex";
import DiscardButton from "components/shared-components/Buttons/DiscardButton";
import PlaceWithCountryForm from "components/util-components/FormItems/PlaceWithCountryForm";
import { SubmitAndConfirmModal } from "components/util-components/ModalItems/SubmitConfirmModal";
import { RulesMessageConstants } from "constants/RulesConstant";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import {
  addTax,
  fetchAvailableCategory,
  editTax,
  setSelectedTaxDetails,
  setTaxDialogVisible,
  setTaxModalLoading,
} from "store/slices/taxSlice";
import LoadingOverlay from "components/util-components/Loader/index";
import WarningModal from "components/util-components/ModalItems/WarningModal";
import ValidationModal from "components/util-components/ModalItems/ValidationModal";
import { filterOption } from "components/util-components/FormItems/dropDownSearch";
import BackButton from "components/Buttons/BackPageButoon";

const { Option } = Select;

const TaxFormFields = ({ mode, tax }) => {
  console.log("TAX DATA FOR EDIT -----------", tax);

  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isLocationBased, setIsLocationBased] = useState(false);
  const locationState = useSelector((state) => state?.locations) || {};
  const taxState = useSelector((state) => state?.tax) || {};

  const {
    loading: locationLoading,
    detailedCountryList,
    filteredPlaces,
    message,
    ValidateData,
    validationStatus,
    placeValidationDialogVisible,
  } = locationState;

  const {
    loading,
    error,
    responseData,
    responseMessage,
    selectedTax,
    dialogVisible,
    warningPagination,
    responseImpactData,

    message: warningMessage,
    modalLoading,
    editable_status,
    availableTaxCategory = [],
  } = taxState;

  useEffect(() => {
    dispatch(getCoutryDetails());
    dispatch(fetchAvailableCategory());
  }, []);

  // useEffect(() => {
  //   if (error) {
  //     message.error(error);
  //   }
  // }, [error]);

  useEffect(() => {
    console.log("taxxxxxxxxxxxx", tax);

    if (tax && mode === "EDIT") {
      const formData = {
        country_id: tax.country?.id,
        available_category: tax.available_category,
        tax_name: tax.tax_name,
        code: tax.code,
        percentage: tax.percentage,
      };

      if (tax.place_id) {
        setIsLocationBased(true);
        dispatch(getPlaces({ country_id: tax.country?.id }));
        formData.place_id = tax.place_id;
      }

      form.setFieldsValue(formData);
    }
  }, [form, tax, mode]);

  useEffect(() => {
    if (isLocationBased) {
      dispatch(getPlaces({}));
    }
  }, [isLocationBased]);

  const handleCountrySelect = (id) => {
    form.setFieldValue("place_id", null);
    dispatch(getPlaces({ country_id: id }));
  };

  const handleCheckboxChange = (e) => {
    setIsLocationBased(e.target.checked);
  };

  const onFinish = async () => {
    const values = await form.validateFields();

    if (mode === "EDIT") {
      console.log("ITS AN EDITTTTTTTTTTTTT TAXXXXXXX");
      if (!form.getFieldValue("place_id") && isLocationBased) {
        message.error("Place ID is missing. Please select a place.");
        return;
      }

      const data = {
        ...values,
        id: tax.id,
      };
      console.log("Edit Data:", data);

      if (isLocationBased) {
        const resultAction = await dispatch(validatePlace(values.place_id));
        if (validatePlace.fulfilled.match(resultAction)) {
          const response = resultAction.payload;
          if (response.message === "warning") {
            dispatch(setPlaceValidationDialogVisible(true));
          } else if (response.data && response.data[0]?.validation_status) {
            const resultAction = await dispatch(
              editTax({
                data,
                action: ActionType.WARNING,
                pageData: { page: 1, size: 10 },
              })
            );

            if (editTax.fulfilled.match(resultAction)) {
              dispatch(setSelectedTaxDetails(data));
              dispatch(setTaxDialogVisible(true));
            }
          }
        }
      } else {
        const resultAction = await dispatch(validateCountry(values.country_id));
        if (validateCountry.fulfilled.match(resultAction)) {
          const response = resultAction.payload;
          if (response.message === "warning") {
            dispatch(setPlaceValidationDialogVisible(true));
          } else if (response.data && response.data[0]?.validation_status) {
            const resultAction = await dispatch(
              editTax({
                data,
                action: ActionType.WARNING,
                pageData: { page: 1, size: 10 },
              })
            );

            if (editTax.fulfilled.match(resultAction)) {
              dispatch(setSelectedTaxDetails(data));
              dispatch(setTaxDialogVisible(true));
            }
          }
        }
      }
    } else {
      try {
        if (!form.getFieldValue("place_id") && isLocationBased) {
          message.error("Place ID is missing. Please select a place.");
          return;
        }

        if (isLocationBased) {
          const resultAction = await dispatch(validatePlace(values.place_id));
          if (validatePlace.fulfilled.match(resultAction)) {
            const response = resultAction.payload;
            if (response.message === "warning") {
              dispatch(setPlaceValidationDialogVisible(true));
            } else if (response.data && response.data[0]?.validation_status) {
              dispatch(setSelectedSubmitItem(values));
            }
          }
        } else {
          dispatch(setSelectedSubmitItem(values));
          dispatch(setPlaceValidationDialogVisible(true));
          // const resultAction = await dispatch(
          //   validateCountry(values.country_id)
          // );
          // if (validateCountry.fulfilled.match(resultAction)) {
          //   const response = resultAction.payload;
          //   if (response.message === "warning") {
          //   } else if (response.data && response.data[0]?.validation_status) {
          //   }
          // }
        }
      } catch (errorInfo) {
        console.error("Validation Failed:", errorInfo);
      }
    }
  };

  const handleWarningPagination = (page, size) => {
    dispatch(
      editTax({
        data: selectedTax,
        action: ActionType.WARNING,
        pageData: { page: page, size: size },
      })
    );
  };

  const handleValidationModalCancel = () => {
    dispatch(setPlaceValidationDialogVisible(false));
  };

  const handleModalSubmit = async () => {
    dispatch(setTaxModalLoading(true));
    const resultAction = await dispatch(
      editTax({ data: selectedTax, action: ActionType.SUBMIT })
    );
    dispatch(setTaxModalLoading(false));
    dispatch(setTaxDialogVisible(false));
    if (editTax.fulfilled.match(resultAction)) {
      dispatch(setSelectedSubmitItem(selectedTax));
    }
  };

  const handleModalCancel = () => {
    dispatch(setTaxDialogVisible(false));
  };

  return (
    <Row gutter={16}>
      <Col xs={24} sm={24} md={17}>
        <Form
          layout="vertical"
          form={form}
          name="venue_form"
          className="ant-advanced-search-form"
        >
          <Card>
            <h2 className="mb-3">
              {" "}
              {mode === "EDIT" ? "Edit Tax" : "Add Tax"}
            </h2>

            {/* <Form.Item name="country_id" label="Country Name">
              <Select
                className="w-100"
                placeholder="Choose a Country"
                showSearch
                filterOption={filterOption}
                loading={locationLoading}
                onChange={(id) => handleCountrySelect(id)}
              >
                {detailedCountryList && detailedCountryList.length > 0 ? (
                  detailedCountryList.map((place) => (
                    <Option key={place.id} value={place.id}>
                      {place.name}
                    </Option>
                  ))
                ) : (
                  <Option disabled>No countries available</Option>
                )}
              </Select>
            </Form.Item> */}

            <Form.Item name="islocationbased" valuePropName="checked">
              <Checkbox onChange={handleCheckboxChange}>
                Is Location Based
              </Checkbox>
            </Form.Item>

            {isLocationBased && (
              <Form.Item name="place_id" label="Place name">
                <Select
                  className="w-100"
                  placeholder="Choose a Tax"
                  loading={locationLoading}
                  showSearch
                  filterOption={filterOption}
                >
                  {filteredPlaces && filteredPlaces.length > 0 ? (
                    filteredPlaces.map((country) => (
                      <Option key={country.id} value={country.id}>
                        {country.name}
                      </Option>
                    ))
                  ) : (
                    <Option disabled>No countries available</Option>
                  )}
                </Select>
              </Form.Item>
            )}
            <Form.Item name="available_category" label="Tax Category">
              <Select
                className="w-100"
                placeholder="Choose a Category"
                loading={loading}
                showSearch
                filterOption={filterOption}
              >
                {availableTaxCategory && availableTaxCategory.length > 0 ? (
                  availableTaxCategory.map((country) => (
                    <Option
                      key={country.id}
                      value={mode === "EDIT" ? country.name : country.id}
                    >
                      {country.name}
                    </Option>
                  ))
                ) : (
                  <Option disabled>No Category available</Option>
                )}
              </Select>
            </Form.Item>
            <Form.Item
              name="tax_name"
              label="Tax Name"
              rules={[{ required: true, message: "Please enter the tax name" }]}
            >
              <Input placeholder="Enter the tax name" />
            </Form.Item>

            <Form.Item
              name="code"
              label="Tax Code"
              rules={[{ required: true, message: RulesMessageConstants.VENUE }]}
            >
              <Input placeholder="Enter the tax code" />
            </Form.Item>

            <Form.Item
              name="percentage"
              label="Percentage (%)"
              rules={[
                { required: true, message: RulesMessageConstants.CAPACITY },
                {
                  type: "number",
                  min: 0,
                  max: 100,
                  message: "Enter a value between 0 and 100",
                },
              ]}
            >
              <InputNumber
                min={0}
                max={100}
                style={{ width: "100%" }}
                placeholder="Enter percentage"
                onWheel={(e) => e.currentTarget.blur()}
                parser={(value) => value && value.toString().slice(0, 3)}
                formatter={(value) => (value ? `${value}` : "")}
              />
            </Form.Item>

            <Flex
              className="py-2"
              mobileFlex={false}
              justifyContent="space-between"
            >
              <div className="flex ">
                <BackButton />
                <DiscardButton form={form} />
              </div>
              <Button type="primary" onClick={onFinish} loading={loading}>
                {mode === "ADD" ? "Add" : "Save"}
              </Button>
            </Flex>
          </Card>
          {mode === "EDIT" && <EditWarningAlert />}
        </Form>
      </Col>

      <LoadingOverlay loading={loading} />
      <ValidationModal
        visible={placeValidationDialogVisible}
        data={ValidateData?.errors}
        statusMessage={message}
        onClose={handleValidationModalCancel}
      />
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
        addFunction={mode === "EDIT" ? editTax : addTax}
        navigationPath={`${APP_PREFIX_PATH}/tax/list`}
        responseMessage={responseMessage}
      />
    </Row>
  );
};

export default TaxFormFields;
