import React, { useEffect, useState } from "react";
import * as antd from "antd";
import {
  getVenues,
  setPlaceValidationDialogVisible,
  fetchPlaceWithCountry,
} from "store/slices/locationSlice";
import {
  fetchAllTax,
  setTaxValidationDialogVisible,
} from "store/slices/taxSlice";
import { useDispatch, useSelector } from "react-redux";
import { RulesMessageConstants } from "constants/RulesConstant";
import ValidationModal from "components/util-components/ModalItems/ValidationModal";
import { setEventFormData } from "store/slices/eventSlice";

const { Row, Col, Card, Form, Select, Typography } = antd;
const { Option } = Select;
const { Text } = Typography;

const LocationDetailsField = ({ mode, form }) => {
  const isEdit = mode === "EDIT" || mode === "EDITLEAD";
  const [searchPlace, setSearchPlace] = useState("");
  const [searchVenue, setSearchVenue] = useState("");

  const rules = {
    place_id: isEdit ? [] : [{ required: true, message: RulesMessageConstants.PLACE }],
    venue_id: isEdit ? [] : [{ required: true, message: RulesMessageConstants.VENUE }],
    tax_ids: [],
  };

  const dispatch = useDispatch();

  const {
    filteredVenues,
    loading: venueLoading,
    placeValidationDialogVisible,
    message: placeMessage,
    ValidateData: placeErrors,
    placeWithCountryList,
    loading: placeLoading,
  } = useSelector((state) => state.locations);

  const {
    allTax,
    loading: taxLoading,
    taxValidationDialogVisible,
    message: taxMessage,
    ValidateData: taxErrors,
  } = useSelector((state) => state.tax);

  // Load places on mount
  useEffect(() => {
    dispatch(fetchPlaceWithCountry({ place: "", active: true }));
  }, [dispatch]);

  // Load venues and taxes when place_id exists (for EDIT mode)
  useEffect(() => {
    const placeId = form.getFieldValue("place_id");
    
    if (placeId && isEdit) {
      console.log("📍 EDIT mode - Loading data for place_id:", placeId);
      dispatch(getVenues({ place_id: placeId, search: "" }));
      dispatch(fetchAllTax({ place_id: placeId }));
    }
  }, [dispatch, form, isEdit]);

  const onPlaceChange = (placeId) => {
    console.log("🏙️ Place changed to:", placeId);
    
    // Reset dependent fields
    form.setFieldsValue({
      place_id: placeId,
      venue_id: [],
      tax_ids: [],
    });

    const cleanFormData = {
      place_id: placeId,
      venue_id: [],
      tax_ids: [],
      selected_ticket_types: {},
      selected_seats: {},
      ticket_sets: {},
      ticket_quantities: {},
    };

    dispatch(setEventFormData(cleanFormData));
    
    // Load new data
    if (placeId) {
      dispatch(getVenues({ place_id: placeId, search: "" }));
      dispatch(fetchAllTax({ place_id: placeId }));
    }
  };

  const onVenueChange = (selectedVenueIds) => {
    console.log("🏢 Venues changed:", selectedVenueIds);
    form.setFieldValue("venue_id", selectedVenueIds);
  };

  const onTaxChange = (ids) => {
    console.log("💰 Taxes changed:", ids);
    form.setFieldValue("tax_ids", ids);
  };

  const handlePlaceSearch = (value) => {
    setSearchPlace(value);
    dispatch(fetchPlaceWithCountry({ place: value.trim(), active: true }));
  };

  const handleVenueSearch = (value) => {
    setSearchVenue(value);
    const placeId = form.getFieldValue("place_id");
    if (placeId) {
      dispatch(getVenues({ place_id: placeId, search: value.trim() }));
    }
  };

  const closePlaceModal = () => dispatch(setPlaceValidationDialogVisible(false));
  const closeTaxModal = () => dispatch(setTaxValidationDialogVisible(false));

  // Get current form values
  const selectedPlaceId = form.getFieldValue("place_id");
  const selectedVenueIds = form.getFieldValue("venue_id") || [];
  const selectedTaxIds = form.getFieldValue("tax_ids") || [];

  console.log("📊 Current LocationDetailsField state:", {
    selectedPlaceId,
    selectedVenueIds,
    selectedTaxIds,
    filteredVenues: filteredVenues.length,
    allTax: allTax.length,
    mode,
  });

  return (
    <>
      <Row gutter={24}>
        <Col xs={24} lg={14}>
          <Card title="Location Details" bordered>
            <Form form={form} layout="vertical" size="large">
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item 
                    name="place_id" 
                    label="Place" 
                    rules={rules.place_id}
                  >
                    <Select
                      showSearch
                      placeholder="Select a place"
                      loading={placeLoading}
                      onSearch={handlePlaceSearch}
                      onChange={onPlaceChange}
                      filterOption={false}
                      allowClear
                      notFoundContent={placeLoading ? "Loading..." : "No places available"}
                    >
                      {placeWithCountryList.map((place) => (
                        <Option key={place.id} value={place.id}>
                          {place.name}, {place.country?.name || ""}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                
                <Col xs={24} sm={12}>
                  <Form.Item 
                    name="venue_id" 
                    label="Venue" 
                    rules={rules.venue_id}
                  >
                    <Select
                      mode="multiple"
                      placeholder="Select venues"
                      showSearch
                      loading={venueLoading}
                      onSearch={handleVenueSearch}
                      onChange={onVenueChange}
                      filterOption={false}
                      disabled={!selectedPlaceId}
                      notFoundContent={
                        venueLoading 
                          ? "Loading venues..." 
                          : "No venues available"
                      }
                    >
                      {filteredVenues.map((venue) => (
                        <Option key={venue.id} value={venue.id}>
                          {venue.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                  {!selectedPlaceId && (
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Please select a place first
                    </Text>
                  )}
                </Col>
              </Row>
              
              <Form.Item name="tax_ids" label="Tax (Optional)">
                <Select
                  mode="multiple"
                  loading={taxLoading}
                  placeholder="Select tax"
                  onChange={onTaxChange}
                  notFoundContent={taxLoading ? "Loading..." : "No taxes available"}
                  disabled={!selectedPlaceId || taxLoading}
                >
                  {allTax.map((tax) => (
                    <Option key={tax.id} value={tax.id}>
                      {tax.tax_name} - {tax.percentage}%
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>

      <ValidationModal
        visible={placeValidationDialogVisible}
        data={placeErrors?.errors}
        statusMessage={placeMessage}
        onClose={closePlaceModal}
      />
      <ValidationModal
        visible={taxValidationDialogVisible}
        data={taxErrors?.errors}
        statusMessage={taxMessage}
        onClose={closeTaxModal}
      />
    </>
  );
};

export default LocationDetailsField;
