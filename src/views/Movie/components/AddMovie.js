import React, { useEffect, useState } from "react";
import {
    Form,
    Button,
    Card,
    Row,
    Col,
    Space,
    Alert,
    message
} from "antd";
import {
    InfoCircleOutlined,
} from "@ant-design/icons";
import PlaceWithCountryForm from "components/util-components/FormItems/PlaceWithCountryForm";
import VenueListForm from "components/util-components/FormItems/VenueList";
import { useDispatch } from "react-redux";
import {
    getSingleVenues,
    getVenues,
    setSelectedPlace,
    setSelectedVenue,
    setSelectedVenueList,
} from "store/slices/locationSlice";
import { resetTicketSelection } from "store/slices/ticketSlice";
import ScreenListForm from "components/util-components/FormItems/ScreenDropdownList";
import Title from "antd/es/typography/Title";
import MovieForm from "./MovieForm";
import { Collapse } from "@mui/material";
import DiscardButton from "components/shared-components/Buttons/DiscardButton";

const AddMovie = ({ mode = "ADD" }) => {
    const [form] = Form.useForm();
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(false);

    const handlePlaceSelect = (id) => {
        setIsLoading(true);
        dispatch(getVenues({ place_id: id, is_indoor: true }));
        form.setFieldValue("venue_id", "");
        dispatch(resetTicketSelection());
        dispatch(setSelectedPlace(id));
        dispatch(setSelectedVenueList("clear"));
        form.resetFields('venue_id')
        setIsLoading(false);
    };

    const handleVenueSelect = (venue) => {
        form.setFieldValue("screen_id", "");
        setIsLoading(true);
        dispatch(setSelectedVenue(venue));
        dispatch(getSingleVenues(venue));
        setIsLoading(false);
    };

    const handleSubmit = () => {
        form.validateFields()
            .then(values => {
                console.log("Form values:", values);
                setIsLoading(true);
                // Add API call or dispatch action
                setIsLoading(false);
            })
            .catch(errorInfo => {
                console.error("Validation failed:", errorInfo);
                message.error("Please fill in all required fields");
            });
    };

    return (
        <Form form={form} layout="vertical">
            <Row gutter={16}>
                <Col xs={24} sm={24} md={24}>
                    <Card
                        title={
                            <div style={{ display: "flex", alignItems: "center" }}>
                                <span>{mode === "ADD" ? "Venue Selection" : "Selected Location"}</span>
                                <InfoCircleOutlined style={{ marginLeft: "8px", color: "#8c8c8c" }} />
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
                            rules={[{ required: true, message: "Please select a screen" }]}
                        />
                    </Card>
                </Col>
            </Row>

            {!form.getFieldValue('venue_id') && <Alert
                message="Theater Required"
                description="Please select a theater to configure the movie."
                type="info"
                showIcon
            />}

            <div style={{ marginTop: 16 }}>
                <Collapse in={!!form.getFieldValue('venue_id')}>
                    <Col xs={24} sm={24} md={24}>
                        <Card
                            title={<Title level={4}>Movie Information</Title>}
                            bordered
                            className="movie-information-card"
                        >
                            {form.getFieldValue('venue_id') ? (
                                <MovieForm form={form} theater_id={form.getFieldValue('theater_id')} />
                            ) : (
                                <Alert
                                    message="Theater Required"
                                    description="Please select a theater to configure the movie."
                                    type="info"
                                    showIcon
                                />
                            )}
                        </Card>
                    </Col>
                    <Row justify="end" style={{ marginTop: '20px' }}>
                        <Space>
                            <DiscardButton form={form} />
                            <Button
                                type="primary"
                                onClick={handleSubmit}
                            // disabled={!form.getFieldValue('venue_id') || isLoading}
                            // loading={isLoading}
                            >
                                Submit
                            </Button>
                        </Space>
                    </Row>
                </Collapse>
            </div>
        </Form>
    );
};

export default AddMovie;
