import React, { useEffect, useState } from "react";
import * as antd from "antd";
import PlaceWithCountryForm from "components/util-components/FormItems/PlaceWithCountryForm";
import VenueListForm from "components/util-components/FormItems/VenueList";
import {
  getVenues,
  setPlaceValidationDialogVisible,
} from "store/slices/locationSlice";
import {
  fetchAllTax,
  setTaxValidationDialogVisible,
} from "store/slices/taxSlice";
import { useDispatch, useSelector } from "react-redux";
import { RulesMessageConstants } from "constants/RulesConstant";
import ValidationModal from "components/util-components/ModalItems/ValidationModal";
import { setEventFormData } from "store/slices/eventSlice";

const { Row, Col, Card, Form, Select, Typography, List, Space } = antd;
const { Option } = Select;
const { Text } = Typography;

const LocationDetailsField = ({ mode, form }) => {
  const isEdit = mode === "EDIT" || mode === "EDITLEAD";
  const [isInitialLoad, setIsInitialLoad] = useState(true);

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
  } = useSelector((state) => state.locations);

  const {
    allTax,
    loading: taxLoading,
    taxValidationDialogVisible,
    message: taxMessage,
    ValidateData: taxErrors,
  } = useSelector((state) => state.tax);

  // Initial load - fetch venues and taxes based on current form values
  useEffect(() => {
    if (isEdit && isInitialLoad) {
      const placeId = form.getFieldValue("place_id");
      console.log("🔄 LocationDetailsField initial load - place_id:", placeId);
      
      if (placeId) {
        console.log("Loading initial venues and taxes for place:", placeId);
        dispatch(getVenues({ place_id: placeId }));
        dispatch(fetchAllTax({ place_id: placeId }));
      }
      
      setIsInitialLoad(false);
    }
  }, [isEdit, isInitialLoad, form, dispatch]);

  // Watch for place_id changes
  useEffect(() => {
    const placeId = form.getFieldValue("place_id");
    
    if (placeId && !isInitialLoad) {
      console.log("Place ID changed, fetching related data:", placeId);
      dispatch(fetchAllTax({ place_id: placeId }));
    }
  }, [dispatch, form, isInitialLoad]);

  const onPlaceSelect = (placeId) => {
    console.log("🏙️ Place selected:", placeId);
     form.setFieldValue('placeid', placeId);
  form.resetFields(['venueid', 'taxids']);
    // Set place_id
    form.setFieldValue("place_id", placeId);

    // Reset dependent fields
    form.resetFields(["venue_id", "tax_ids"]);

    const cleanFormData = {
      place_id: placeId,
      venue_id: [],
      tax_ids: [],
      selected_ticket_types: {},
      selected_seats: {},
      ticket_sets: {},  placeid: placeId,
    venueid: [],
    taxids: [],
      ticket_quantities: {},
    };

    form.setFieldsValue(cleanFormData);
    dispatch(setEventFormData(cleanFormData));
    
    // Load new data
    console.log("Loading venues and taxes for new place:", placeId);
    dispatch(getVenues({ place_id: placeId }));
    dispatch(fetchAllTax({ place_id: placeId }));
  };

  const onVenueChange = (selectedVenueIds) => {
    console.log("🏢 Venues changed:", selectedVenueIds);
    // Don't reset tax_ids when venue changes in edit mode
    if (!isEdit) {
      form.resetFields(["tax_ids"]);
    }
  };

  const onTaxChange = (ids) => {
    console.log("💰 Taxes changed:", ids);
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
    venueLoading,
    taxLoading,
  });

  // Ensure arrays
  const venueIdsArray = Array.isArray(selectedVenueIds) 
    ? selectedVenueIds 
    : (selectedVenueIds ? [selectedVenueIds] : []);

  const selectedVenues = filteredVenues.filter((v) => venueIdsArray.includes(v.id));
  const selectedTaxObjects = allTax.filter((tax) => selectedTaxIds.includes(tax.id));

  return (
    <>
      <Row gutter={24}>
        <Col xs={24} lg={14}>
          <Card title="Location Details" bordered>
            <Form form={form} layout="vertical" size="large">
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item name="place_id" label="Place" rules={rules.place_id}>
                    <PlaceWithCountryForm
                      form={form}
                      onSelect={onPlaceSelect}
                      disabled={false}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="venue_id" label="Venue" rules={rules.venue_id}>
                    <VenueListForm
                    key={`venue-list-${form.getFieldValue('placeid')}`} 
                      form={form}
                      mode="multiple"
                      disabled={!selectedPlaceId || venueLoading}
                      loading={venueLoading}
                      onChange={onVenueChange}
                    />
                  </Form.Item>
                  {!selectedPlaceId && (
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Please select a place first
                    </Text>
                  )}
                  {selectedPlaceId && filteredVenues.length === 0 && !venueLoading && (
                    <Text type="warning" style={{ fontSize: 12 }}>
                      No venues available for this place
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