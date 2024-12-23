import { Card, Col, Form, Select } from "antd";
import PlaceWithCountryForm from "components/util-components/FormItems/PlaceWithCountryForm";
import VenueListForm from "components/util-components/FormItems/VenueList";
import { useDispatch, useSelector } from "react-redux";
import { getVenues } from "store/slices/locationSlice";
import { RulesMessageConstants } from "constants/RulesConstant";
import { resetTicketSelection } from "store/slices/ticketSlice";
import { fetchAllTax } from "store/slices/taxSlice";
import { useEffect } from "react";

const TaxField = ({ form }) => {
  const dispatch = useDispatch();
  const { Option } = Select;
  const rules = {
    place: [{ required: true, message: RulesMessageConstants.PLACE }],
    venue: [{ required: true, message: RulesMessageConstants.VENUE }],
  };

  const { allTax, loading } = useSelector((state) => state.tax);
  useEffect(() => {
    dispatch(fetchAllTax({place_id:form.getFieldValue("place_id")}));
  }, [dispatch]);
  return (
    <Col xs={24} sm={24} md={17}>
      <Card title="Tax (Optional)">
        <Form.Item name="offer" label="Tax">
          <Select
            loading={loading}
            style={{ width: "100%" }}
            placeholder="Please select"
           
          >
            {allTax.map((offer) => (
              <Option key={offer.id} value={offer.id}>
                {offer.tax_name}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Card>
    </Col>
  );
};

export default TaxField;
