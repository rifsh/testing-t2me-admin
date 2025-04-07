import React, { useState } from "react";
import { Input, Row, Col, Card, Form, DatePicker, Select, Radio } from "antd";
import PlaceWithCountryForm from "components/util-components/FormItems/PlaceWithCountryForm";
import VenueListForm from "components/util-components/FormItems/VenueList";
import ScreenListForm from "components/util-components/FormItems/ScreenDropdownList";
import { getSingleVenues, getVenues, setSelectedPlace, setSelectedVenue, setSelectedVenueList } from "store/slices/locationSlice";
import { resetTicketSelection } from "store/slices/ticketSlice";
import { useDispatch } from "react-redux";
import { setSelectedScreenData } from "store/slices/screenSlice";

const { Option } = Select;

const rules = {
  venue: [
    {
      required: true,
      message: "Please select a venue",
    },
  ],
  section: [
    {
      required: true,
      message: "Please enter a section",
    },
  ],
  row: [
    {
      required: true,
      message: "Please enter a row",
    },
  ],
  seat_number: [
    {
      required: true,
      message: "Please enter a seat number",
    },
  ],
  price_modifier: [
    {
      required: true,
      message: "Please enter a price modifier",
    },
  ],
  is_available: [
    {
      required: true,
      message: "Please select availability",
    },
  ],
  is_accessible: [
    {
      required: true,
      message: "Please select accessibility",
    },
  ],
  book_status: [
    {
      required: true,
      message: "Please select booking status",
    },
  ],
  status: [
    {
      required: true,
      message: "Please select status",
    },
  ],
  last_cleaned: [
    {
      required: true,
      message: "Please select the last cleaned date",
    },
  ],
};

function MovieSeatDetailForm({form}) {
    const dispatch = useDispatch();
        const [selectedFields, setSelectedFields] = useState({
            selectedVenue: null,
            selectedScreen: null,
        })
    
    const handlePlaceSelect = (id) => {
           dispatch(getVenues({ place_id: id, is_indoor: true }));
           form.setFieldValue("venue_id", undefined);
           form.setFieldValue("screen_id", undefined);
           dispatch(resetTicketSelection());
           setSelectedFields({ selectedScreen: null, selectedVenue: null });
           dispatch(setSelectedPlace(id));
           dispatch(setSelectedVenueList("clear"));
           form.resetFields('venue_id')
       };
   
       const handleVenueSelect = (venue) => {
           form.setFieldValue("screen_id", undefined);
           setSelectedFields({ selectedScreen: null, selectedVenue: venue });
           dispatch(setSelectedVenue(venue));
           dispatch(getSingleVenues(venue));
       };
   
       const handleScreenSelect = (screen) => {
           setSelectedFields({ ...selectedFields, selectedScreen: screen });
           dispatch(setSelectedScreenData(screen))
   
       }
  return (
    <Row gutter={16}>
      <Col xs={24} sm={24} md={17}>
        <Card title="Seat Details">
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <PlaceWithCountryForm
                form={form}
                label="Choose a Place"
                onSelect={handlePlaceSelect}
              />
            </Col>
            <Col xs={24} sm={12}>
              <VenueListForm
                form={form}
                mode="single"
                label="Venue"
                onSelect={handleVenueSelect}
              />
            </Col>
          </Row>

          <ScreenListForm
            form={form}
            label="Choose Screen"
            onSelect={handleScreenSelect}
            rules={[{ required: true, message: "Please select a screen" }]}
          />
        </Card>
      </Col>
    </Row>
  );
}

export default MovieSeatDetailForm;
    