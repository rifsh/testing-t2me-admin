import React, { useState } from "react";
import { Input, Row, Col, Card, Form, DatePicker, Select, Radio } from "antd";
import PlaceWithCountryForm from "components/util-components/FormItems/PlaceWithCountryForm";
import VenueListForm from "components/util-components/FormItems/VenueList";
import ScreenListForm from "components/util-components/FormItems/ScreenDropdownList";
import {
  getSingleVenues,
  getVenues,
  setSelectedPlace,
  setSelectedVenue,
  setSelectedVenueList,
} from "store/slices/locationSlice";
import { resetTicketSelection } from "store/slices/ticketSlice";
import { useDispatch } from "react-redux";
import { setSelectedScreenData } from "store/slices/screenSlice";
import TheaterListForm from "components/util-components/FormItems/TheaterListForm";

const { Option } = Select;

function ScheduleDetailForm({ form, mode }) {
  const dispatch = useDispatch();
  const [selectedFields, setSelectedFields] = useState({
    selectedVenue: null,
    selectedScreen: null,
  });

  const handlePlaceSelect = (id) => {
    dispatch(getVenues({ place_id: id, is_indoor: true }));
    form.setFieldValue("venue_id", undefined);
    form.setFieldValue("screen_id", undefined);
    dispatch(resetTicketSelection());
    setSelectedFields({ selectedScreen: null, selectedVenue: null });
    dispatch(setSelectedPlace(id));
    dispatch(setSelectedVenueList("clear"));
    form.resetFields("venue_id");
  };

  const handleVenueSelect = (venue) => {
    form.setFieldValue("screen_id", undefined);
    setSelectedFields({ selectedScreen: null, selectedVenue: venue });
    dispatch(setSelectedVenue(venue));
    dispatch(getSingleVenues(venue));
  };

  const handleScreenSelect = (screen) => {
    setSelectedFields({ ...selectedFields, selectedScreen: screen });
    dispatch(setSelectedScreenData(screen));
  };
  const rules = {
    place: [{ required: true, message: "Please select a place" }],
    venue: [{ required: true, message: "Please select a venue" }],
  };
  return (
    <Row gutter={16}>
      <Col xs={24} sm={24} md={17}>
        <Card title="Schedule Details">
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <PlaceWithCountryForm
                form={form}
                label="Choose a Place"
                onSelect={handlePlaceSelect}
                rules={rules.place}
              />
            </Col>
            <Col xs={24} sm={12}>
              <VenueListForm
                form={form}
                mode={"single"}
                label="Venue"
                rules={rules.venue}
                onSelect={(value) => handleVenueSelect(value)}
              />
            </Col>
            <Col span={24}>
              <TheaterListForm form={form} />
            </Col>
          </Row>
        </Card>
      </Col>
    </Row>
  );
}

export default ScheduleDetailForm;
