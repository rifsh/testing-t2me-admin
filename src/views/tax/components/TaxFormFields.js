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
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import {
  addVenue,
  fetchAllCountires,
  getCoutryDetails,
  getPlaces,
  setSelectedPlace,
} from "store/slices/locationSlice";
import { setSelectedSubmitItem } from "store/slices/modalSlice";

import Flex from "components/shared-components/Flex";
import DiscardButton from "components/shared-components/Buttons/DiscardButton";
import PlaceWithCountryForm from "components/util-components/FormItems/PlaceWithCountryForm";
import { SubmitAndConfirmModal } from "components/util-components/ModalItems/SubmitConfirmModal";

import { RulesMessageConstants } from "constants/RulesConstant";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import { addTax, fetchAvailableCategory } from "store/slices/taxSlice";

const { Option } = Select;

const TaxFormFields = ({ mode }) => {
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
  } = locationState;

  const {
    loading,
    error,
    responseData,
    responseMessage,
    availableTaxCategory = [],
  } = taxState;

  useEffect(() => {
    dispatch(getCoutryDetails());
    dispatch(fetchAvailableCategory());
  }, [dispatch]);
  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  const handleCountrySelect = (id) => {
    form.setFieldValue("place_id", null);
    // dispatch(getPlaces(form.getFieldValue("country_id")));
    dispatch(getPlaces(id));
  };

  const handleCheckboxChange = (e) => {
    setIsLocationBased(e.target.checked);
  };

  const onFinish = async () => {
    try {
      const values = await form.validateFields();
      if (!form.getFieldValue("place_id") && isLocationBased) {
        message.error("Place ID is missing. Please select a place.");
        return;
      }

      dispatch(setSelectedSubmitItem(values));
    } catch (errorInfo) {
      console.error("Validation Failed:", errorInfo);
    }
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
            <h2 className="mb-3">Add Tax</h2>

            <Form.Item name="country_id" label="Country name">
              <Select
                className="w-100"
                placeholder="Choose a Country"
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
            </Form.Item>

            <Form.Item name="islocationbased" valuePropName="checked">
              <Checkbox onChange={handleCheckboxChange}>
                Is Location Based
              </Checkbox>
            </Form.Item>

            {isLocationBased && (
              <Form.Item name="place_id" label="Place name">
                <Select
                  className="w-100"
                  placeholder="Choose a Country"
                  loading={locationLoading}
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
              // <PlaceWithCountryForm
              //   form={form}
              //   label="Place"
              //   onSelect={handlePlaceSelect}
              //   rules={[
              //     { required: true, message: RulesMessageConstants.PLACE },
              //   ]}
              // />
            )}
            <Form.Item name="available_category" label="Tax Category">
              <Select
                className="w-100"
                placeholder="Choose a Country"
                loading={loading}
              >
                {availableTaxCategory && availableTaxCategory.length > 0 ? (
                  availableTaxCategory.map((country) => (
                    <Option key={country.id} value={country.id}>
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
              ]}
            >
              <Input type="number" placeholder="Enter percentage" />
            </Form.Item>

            <Flex
              className="py-2"
              mobileFlex={false}
              justifyContent="space-between"
            >
              <DiscardButton form={form} />
              <Button type="primary" onClick={onFinish} loading={loading}>
                {mode === "ADD" ? "Add" : "Save"}
              </Button>
            </Flex>
          </Card>
        </Form>
      </Col>
      <SubmitAndConfirmModal
        responseData={responseData}
        addFunction={addTax}
        navigationPath={`${APP_PREFIX_PATH}/tax/list`}
        responseMessage={responseMessage}
      />
    </Row>
  );
};

export default TaxFormFields;
