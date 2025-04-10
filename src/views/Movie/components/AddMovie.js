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
import { setSelectedScreenData } from "store/slices/screenSlice";

const AddMovie = ({ mode = "ADD" }) => {
    const [form] = Form.useForm();
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

    useEffect(() => {
        form.setFieldsValue({
            cast: [],
            crew: []
        });
    }, [form]);

    const handleSubmit = () => {
        form.validateFields()
            .then(values => {
                console.log("Form values:", values);
                // Add API call or dispatch action
            })
            .catch(errorInfo => {
                console.error("Validation failed:", errorInfo);
                message.error("Please fill in all required fields");
            });
    };

    return (
        <Form form={form} layout="vertical">
            {/* <Row gutter={16}>
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
                            onSelect={handleScreenSelect}
                            rules={[{ required: true, message: "Please select a screen" }]}
                        />
                    </Card>
                </Col>
            </Row> */}

            {/* {(!selectedFields.selectedVenue || !selectedFields.selectedScreen) && (
                <Alert
                    message="Venue and screen Required"
                    description="Please select a venue and screen to configure the movie."
                    type="info"
                    showIcon
                />
            )} */}


            <div style={{ marginTop: 16 }}>
                <Col xs={24} sm={24} md={24}>
                    <Card
                        title={<Title level={4}>Movie Information</Title>}
                        bordered
                        className="movie-information-card"
                    >
                        <MovieForm form={form} theater_id={form.getFieldValue('theater_id')} />
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
            </div>
        </Form>
    );
};

export default AddMovie;
