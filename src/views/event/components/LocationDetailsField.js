import { Card, Col, Form } from "antd";
import PlaceWithCountryForm from "components/util-components/FormItems/PlaceWithCountryForm";
import VenueListForm from "components/util-components/FormItems/VenueList";
import { useDispatch } from "react-redux";
import { getVenues } from "store/slices/locationSlice";
import { RulesMessageConstants } from "constants/RulesConstant";

const LocationDetailsField = ({ form }) => {
  const dispatch = useDispatch();

  const rules = {
    place: [{ required: true, message: RulesMessageConstants.PLACE }],
    venue: [{ required: true, message: RulesMessageConstants.VENUE }],
  };

  return (
    <Col xs={24} sm={24} md={17}>
      <Card title="Location Details" >
        <PlaceWithCountryForm
          
          form={form}
          label="Place"
          onSelect={(id) => {
            dispatch(getVenues(id));
            form.setFieldsValue({ venue_id: null }); 
          }}
          rules={rules.place}
        />

       
        <VenueListForm
          form={form}
          label="Venue"
          rules={rules.venue}
        />
      </Card>
    </Col>
  );
};

export default LocationDetailsField;
