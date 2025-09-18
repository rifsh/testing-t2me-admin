import React, { useEffect } from "react";
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
  const isEdit = mode === "EDITLEAD";

  const rules = {
    place_id: isEdit
      ? []
      : [{ required: true, message: RulesMessageConstants.PLACE }],
    venue_id: isEdit
      ? []
      : [{ required: true, message: RulesMessageConstants.VENUE }],
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
    selectedTax,
    taxValidationDialogVisible,
    message: taxMessage,
    ValidateData: taxErrors,
  } = useSelector((state) => state.tax);

  useEffect(() => {
    const placeId = form.getFieldValue("place_id");
    if (placeId) {
      dispatch(fetchAllTax({ place_id: placeId }));
    }
  }, [dispatch, form]);

  const onPlaceSelect = (placeId) => {
    // First, set the place_id value
    form.setFieldValue("place_id", placeId);

    // Then reset dependent fields
    form.resetFields(["venue_id", "tax_ids"]);

    const cleanFormData = {
      place_id: placeId, // Include the selected place
      selected_ticket_types: {},
      selected_seats: {},
      ticket_sets: {},
      ticket_quantities: {},
    };

    form.setFieldsValue(cleanFormData);
    dispatch(setEventFormData(cleanFormData));
    dispatch(getVenues({ place_id: placeId }));
  };

  const onVenueChange = (selectedVenueIds) => {
    form.resetFields(["tax_ids"]);
  };

  const onTaxChange = (ids) => {
    const selected = allTax.filter((tax) => ids.includes(tax.id));
  };

  const closePlaceModal = () =>
    dispatch(setPlaceValidationDialogVisible(false));
  const closeTaxModal = () => dispatch(setTaxValidationDialogVisible(false));

  const selectedPlaceId = form.getFieldValue("place_id");
  const selectedVenueIds = form.getFieldValue("venue_id") || [];

  const selectedVenues = filteredVenues.filter((v) =>
    Array.isArray(selectedVenueIds)
      ? selectedVenueIds.includes(v.id)
      : v.id === selectedVenueIds
  );

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
                    <PlaceWithCountryForm
                      form={form}
                      onSelect={onPlaceSelect}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="venue_id"
                    label="Venue"
                    rules={rules.venue_id}
                  >
                    <VenueListForm
                      form={form}
                      mode="multiple"
                      disabled={!filteredVenues.length}
                      loading={venueLoading}
                      onChange={onVenueChange}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item name="tax_ids" label="Tax (Optional)">
                <Select
                  mode="multiple"
                  loading={taxLoading}
                  placeholder="Select tax"
                  onChange={onTaxChange}
                  notFoundContent={taxLoading ? "Loading..." : "No taxes"}
                >
                  {allTax.map((tax) => (
                    <Option key={tax.id} value={tax.id}>
                      {tax.tax_name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card title="Selection Summary" bordered style={{ marginBottom: 16 }}>
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <div>
                <Text strong>Selected Place:</Text>
                <div>
                  {selectedPlaceId || (
                    <Text type="secondary">None selected</Text>
                  )}
                </div>
              </div>

              <div>
                <Text strong>Selected Venues:</Text>
                {selectedVenues.length > 0 ? (
                  <List
                    size="small"
                    dataSource={selectedVenues}
                    renderItem={(venue) => <List.Item>{venue.name}</List.Item>}
                  />
                ) : (
                  <Text type="secondary">No venues selected</Text>
                )}
              </div>

              <div>
                <Text strong>Selected Taxes:</Text>
                {selectedTax && selectedTax.length > 0 ? (
                  <List
                    size="small"
                    dataSource={selectedTax}
                    renderItem={(tax) => (
                      <List.Item>
                        {tax.tax_name} - {tax.percentage}%
                      </List.Item>
                    )}
                  />
                ) : (
                  <Text type="secondary">No taxes selected</Text>
                )}
              </div>
            </Space>
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
