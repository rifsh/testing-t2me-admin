import React, { useEffect } from "react";
import {
    Form,
    Input,
    Select,
    Card,
    Row,
    Col,
    DatePicker,
    InputNumber,
    Space,
    Avatar,
} from "antd";
import {
    UserOutlined,
} from "@ant-design/icons";
import TextEditor from "components/util-components/FormItems/TextEditor";
import ResizedImgePicker from "components/util-components/Image/ResizedImgePicker";
import { ThumbnailImageResolutions } from "constants/SupportFileConstants";
import { useDispatch, useSelector } from "react-redux";
import { actorsData } from "../movie-list/MockData";
import { fetchPersonalitiesData } from "store/slices/castSlice";

const { TextArea } = Input;
const { Option } = Select;

const MovieDetailsForm = () => {
    const dispatch = useDispatch();
    const { response } = useSelector((state => state.cast))
    const genres = ["Action", "Comedy", "Drama", "Horror", "Sci-Fi", "Thriller", "Animation"];
    const languages = ["English", "Hindi", "French", "Spanish", "Chinese", "Tamil", "Malayalam"];
    const currencies = ["USD", "EUR", "GBP", "INR", "JPY", "AUD"];

    const normFile = (e) => {
        if (Array.isArray(e)) {
            return e;
        }
        return e?.fileList || [];
    };

    // Format currency input
    const currencyFormatter = (value) => {
        if (!value) return '';
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

    const currencyParser = (value) => {
        if (!value) return '';
        return value.replace(/\$\s?|(,*)/g, '');
    };

    useEffect(() => {
        dispatch(fetchPersonalitiesData(10))
    }, [dispatch])

    useEffect(() => {
        if (response) {
            console.log("responsemovie", response)
        }
    }, [response])

    return (
        <Card title="Movie Details" bordered>
            <Row gutter={16}>
                {/* Basic Information */}
                <Col xs={24} sm={12}>
                    <Form.Item
                        name="movie_name"
                        label="Movie Name"
                        rules={[{ required: true, message: "Please enter movie name" }]}
                    >
                        <Input placeholder="Enter movie name" />
                    </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                    <Form.Item
                        name="duration"
                        label="Duration (Minutes)"
                        rules={[{ required: true, message: "Enter duration" }]}
                    >
                        <InputNumber min={60} max={300} style={{ width: "100%" }} />
                    </Form.Item>
                </Col>

                {/* Financial Information */}
                <Col xs={24} sm={12}>
                    <Form.Item
                        name="budget"
                        label="Budget"
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            min={0}
                            formatter={currencyFormatter}
                            parser={currencyParser}
                            addonBefore={
                                <Form.Item name="budget_currency" noStyle initialValue="USD">
                                    <Select style={{ width: 80 }}>
                                        {currencies.map(currency => (
                                            <Option key={currency} value={currency}>{currency}</Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            }
                        />
                    </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                    <Form.Item
                        name="box_office"
                        label="Box Office Revenue"
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            min={0}
                            formatter={currencyFormatter}
                            parser={currencyParser}
                            addonBefore={
                                <Form.Item name="box_office_currency" noStyle initialValue="USD">
                                    <Select style={{ width: 80 }}>
                                        {currencies.map(currency => (
                                            <Option key={currency} value={currency}>{currency}</Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            }
                        />
                    </Form.Item>
                </Col>

                {/* Dates */}
                <Col xs={24} sm={12}>
                    <Form.Item
                        name="release_date"
                        label="Release Date"
                    >
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                </Col>

                {/* <Col xs={24} sm={12}>
                    <Form.Item
                        name="production_status"
                        label="Production Status"
                    >
                        <Select placeholder="Select status">
                            {productionStatuses.map(status => (
                                <Option key={status} value={status}>{status}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Col> */}

                {/* Production Details */}
                <Col xs={24} sm={12}>
                    <Form.Item
                        name="production_company"
                        label="Production Company"
                    >
                        <Input placeholder="Enter production company" />
                    </Form.Item>
                </Col>

                {/* <Col xs={24} sm={12}>
                    <Form.Item
                        name="distributor"
                        label="Distributor"
                    >
                        <Input placeholder="Enter distributor" />
                    </Form.Item>
                </Col> */}

                {/* Existing Fields */}
                <Col xs={24} sm={12}>
                    <Form.Item
                        name="genres"
                        label="Genres"
                        rules={[{ required: true, message: "Select genres" }]}
                    >
                        <Select mode="multiple" placeholder="Select genres">
                            {genres.map((genre) => (
                                <Option key={genre} value={genre}>{genre}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                    <Form.Item
                        name="language"
                        label="Language"
                        rules={[{ required: true, message: "Select language" }]}
                    >
                        <Select placeholder="Select language">
                            {languages.map((lang) => (
                                <Option key={lang} value={lang}>{lang}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                    <Form.Item
                        name="rating"
                        label="Rating (out of 10)"
                        rules={[
                            { required: true, message: "Please enter movie rating" },
                            { type: 'number', min: 0, max: 10, message: "Rating must be between 0 and 10" }
                        ]}
                    >
                        <InputNumber
                            min={0}
                            max={10}
                            step={0.1}
                            precision={1}
                            style={{ width: "100%" }}
                            placeholder="Enter movie rating"
                        />
                    </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                    <Form.Item
                        name="selectedActors"
                        label="Cast"
                        rules={[
                            {
                                required: true,
                                message: 'Please select at least one actor'
                            },
                            {
                                validator: (_, value) =>
                                    value && value.length <= 5
                                        ? Promise.resolve()
                                        : Promise.reject(new Error('Maximum 5 actors allowed'))
                            }
                        ]}
                    >
                        <Select
                            mode="multiple"
                            placeholder="Select actors"
                            optionLabelProp="label"
                            style={{ width: '100%' }}
                            options={actorsData.map(actor => ({
                                value: actor.id,
                                label: actor.name,
                                image: actor.imageUrl,
                            }))}
                            optionRender={(option) => (
                                <Space>
                                    <Avatar
                                        src={option.data.image}
                                        icon={<UserOutlined />}
                                        size={40}
                                    />
                                    <span>{option.data.label}</span>
                                </Space>
                            )}
                        />
                    </Form.Item>
                </Col>

                <Col xs={24}>
                    <Form.Item
                        name="description"
                        label="Description"
                    >
                        <TextEditor />
                    </Form.Item>
                </Col>

                <Col xs={24}>
                    <Form.Item name="poster">
                        <Form.Item
                            name="poster_image"
                            label="Poster Image"
                            valuePropName="value"
                            getValueFromEvent={normFile}
                            style={{ marginBottom: "0px", padding: "0px" }}
                        >
                            <ResizedImgePicker
                                maxCount={1}
                                targetResolution={ThumbnailImageResolutions.EVENT}
                            />
                        </Form.Item>
                    </Form.Item>
                </Col>
            </Row>
        </Card>
    );
}

export default MovieDetailsForm;