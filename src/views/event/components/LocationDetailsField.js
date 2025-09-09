import { Card, Col, Form } from "antd";
import PlaceWithCountryForm from "components/util-components/FormItems/PlaceWithCountryForm";
import VenueListForm from "components/util-components/FormItems/VenueList";
import { useDispatch, useSelector } from "react-redux";
import { getVenues, setSelectedVenueList } from "store/slices/locationSlice";
import { RulesMessageConstants } from "constants/RulesConstant";
import { setPlaceValidationDialogVisible } from "store/slices/locationSlice";
import ValidationModal from "components/util-components/ModalItems/ValidationModal";
import { resetTicketSelection } from "store/slices/ticketSlice";

const LocationDetailsField = ({ form }) => {
  const dispatch = useDispatch();

  const rules = {
    place: [{ required: true, message: RulesMessageConstants.PLACE }],
    venue: [{ required: true, message: RulesMessageConstants.VENUE }],
  };

  const {
    message: venueValidationMessage,
    ValidateData,
    filteredVenues,
    placeValidationDialogVisible,
  } = useSelector((state) => state.locations);

  const handlePlaceSelect = (id) => {
    dispatch(getVenues({ place_id: id }));
    form.resetFields([
      "available_types",
      "seat_structure_id",
      "ticket_structure_id",
      "ticket_set",
      "venue_id",
    ]);

    dispatch(resetTicketSelection());
    dispatch(setSelectedVenueList("clear"));
  };

  const handleVenueSelect = (value) => {
    const venue = filteredVenues.find((venue) => venue.id === value);

    if (venue) {
      dispatch(setSelectedVenueList([venue]));
    }

    form.setFieldsValue({
      available_types: null,
      seat_structure_id: null,
      ticket_structure_id: null,
      ticket_set: null,
    });

    dispatch(resetTicketSelection());
  };

  const handleVenueDeselect = (value) => {
    // Get current selected venues from state
    const venue = filteredVenues.find((venue) => venue.id === value);
    if (venue) {
      dispatch(setSelectedVenueList([venue]));
    }

    form.setFieldsValue({
      venues: null,
      available_types: null,
      seat_structure_id: null,
      ticket_structure_id: null,
      ticket_set: null,
    });

    dispatch(resetTicketSelection());
  };

  const handleValidationModalCancel = () => {
    dispatch(setPlaceValidationDialogVisible(false));
  };

  return (
    <Col xs={24} sm={24} md={17}>
      <Card title="Location Details">
        <PlaceWithCountryForm
          form={form}
          label="Place"
          onSelect={handlePlaceSelect}
          rules={rules.place}
        />
        <VenueListForm
          form={form}
          mode={"multiple"}
          label="Venue"
          rules={rules.venue}
          onSelect={(value) => handleVenueSelect(value)}
          onDeselect={handleVenueDeselect}
        />
      </Card>
      <ValidationModal
        visible={placeValidationDialogVisible}
        data={ValidateData?.errors}
        statusMessage={venueValidationMessage}
        onClose={handleValidationModalCancel}
      />
    </Col>
  );
};

export default LocationDetailsField;
