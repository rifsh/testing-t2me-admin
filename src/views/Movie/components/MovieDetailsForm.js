import React, { useEffect, useState } from "react";
import {
    Form,
    Input,
    Select,
    Button,
    Card,
    Row,
    Col,
    Upload,
    TimePicker,
    InputNumber,
    message,
} from "antd";
import {
    UploadOutlined,
    PlusOutlined,
} from "@ant-design/icons";
import TextEditor from "components/util-components/FormItems/TextEditor";
import ResizedImgePicker from "components/util-components/Image/ResizedImgePicker";
import { ThumbnailImageResolutions } from "constants/SupportFileConstants";
import { useSelector } from "react-redux";

const { TextArea } = Input;
const { Option } = Select;

const MovieDetailsForm = () => {
    const [poster, setPoster] = useState(null);
    const { singleScreen } = useSelector((state) => state.screen);

    const genres = ["Action", "Comedy", "Drama", "Horror", "Sci-Fi", "Thriller", "Animation"];
    const languages = ["English", "Hindi", "French", "Spanish", "Chinese", "Tamil", "Malayalam"];

    const normFile = (e) => {
        if (Array.isArray(e)) {
            return e;
        }
        return e?.fileList || [];
    };

    useEffect(() => {
        console.log(singleScreen.time_slots)
    }, [singleScreen])

    return (
        <Card title="Movie Details" bordered>
            <Row gutter={16}>
                <Col xs={24} sm={12}>
                    <Form.Item
                        name={`movie_name`}
                        label="Movie Name"
                        rules={[{ required: true, message: "Please enter movie name" }]}
                    >
                        <Input placeholder="Enter movie name" />
                    </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                    <Form.Item
                        name={`duration`}
                        label="Duration (Minutes)"
                        rules={[{ required: true, message: "Enter duration" }]}
                    >
                        <InputNumber min={60} max={300} style={{ width: "100%" }} />
                    </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                    <Form.Item
                        name={`genres`}
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
                        name={`language`}
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
                        name={`rating`}
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

                <Col xs={24}>
                    <Form.Item
                        name={`description`}
                        label="Description"
                    >
                        <TextEditor />
                    </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                    <Form.Item
                        name={`showtime`}
                        label="Showtime"
                        rules={[{ required: true, message: "Select showtime" }]}
                    >
                        <Select mode="multiple" placeholder="Select available time slots">
                            {singleScreen.time_slots?.map((value) => (
                                <Option key={value} value={value}>{value}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                    <Form.Item
                        name={`ticket_price`}
                        label="Ticket Price (₹)"
                        rules={[{ required: true, message: "Enter ticket price" }]}
                    >
                        <InputNumber min={50} max={500} style={{ width: "100%" }} />
                    </Form.Item>
                </Col>

                <Col xs={24}>
                    <Form.Item name={`poster`}>
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