import { Card, Col, Form, Row } from 'antd';
import React from 'react'
import { InfoCircleOutlined } from "@ant-design/icons";
import PlaceWithCountryForm from 'components/util-components/FormItems/PlaceWithCountryForm';
import VenueListForm from 'components/util-components/FormItems/VenueList';
import { useDispatch } from 'react-redux';
import { getSingleVenues, getVenues, setSelectedPlace, setSelectedVenue, setSelectedVenueList } from 'store/slices/locationSlice';
import AddFields from '../components/AddFields';

const Index = () => {
    const dispatch = useDispatch();
    const [form] = Form.useForm();
    const mode = "ADD";

    const rules = {
        place: [{ required: true, message: "Please select a place" }],
        venue: [{ required: true, message: "Please select a venue" }],
    };

    const handlePlaceSelect = (id) => {
        dispatch(getVenues({ place_id: id, is_indoor: true }));
        dispatch(setSelectedPlace(id));
        dispatch(setSelectedVenueList("clear"));
    }

    const handleVenueSelect = (venue) => {
        dispatch(setSelectedVenue(venue))
        dispatch(getSingleVenues(venue))
    }

    return (
        <Form form={form} layout="vertical">
            <Row gutter={16} align="top">
                <Col xs={24} sm={24} md={24}>
                    <Card
                        title={
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                {mode === "ADD" ? (
                                    <span>Venue Selection</span>
                                ) : (
                                    <span>Selecte loaction</span>
                                )}
                                <InfoCircleOutlined style={{ marginLeft: '8px', color: '#8c8c8c' }} />
                            </div>
                        }
                        bordered
                        className="venue-selection-card"
                    >
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
                        </Row>
                    </Card>
                </Col>
            </Row>
            <div>
                <AddFields />
            </div>
        </Form>

    )
}

export default Index