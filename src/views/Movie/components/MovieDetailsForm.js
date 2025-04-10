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
    Divider,
    Rate,
    Typography,
    Tag,
    Image
} from "antd";
import {
    DollarOutlined,
    CalendarOutlined,
    TeamOutlined,
    TrophyOutlined,
    GlobalOutlined
} from "@ant-design/icons";
import TextEditor from "components/util-components/FormItems/TextEditor";
import ResizedImgePicker from "components/util-components/Image/ResizedImgePicker";
import { ThumbnailImageResolutions } from "constants/SupportFileConstants";
import { useDispatch, useSelector } from "react-redux";
import { fetchPersonalitiesData } from "store/slices/castSlice";
import MovieFilter from "./MovieFilter";
import LoadingOverlay from "components/util-components/Loader";
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

const MovieDetailsForm = ({ form }) => {
    const dispatch = useDispatch();
    const { response } = useSelector((state => state.cast));
    const { omdbMovie, loading } = useSelector((state) => state.movie);

    const genres = ["Action", "Comedy", "Drama", "Horror", "Sci-Fi", "Thriller", "Animation", "Crime"];
    const languages = ["English", "Hindi", "French", "Spanish", "Chinese", "Tamil", "Malayalam"];
    const currencies = ["USD", "EUR", "GBP", "INR", "JPY", "AUD"];

    const normFile = (e) => {
        if (Array.isArray(e)) {
            return e;
        }
        return e?.fileList || [];
    };

    const currencyFormatter = (value) => {
        if (!value) return '';
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

    const currencyParser = (value) => {
        if (!value) return '';
        return value.replace(/\$\s?|(,*)/g, '');
    };

    const getImdbRating = (movie) => {
        if (!movie?.imdbRating || movie.imdbRating === "N/A") return null;
        return parseFloat(movie.imdbRating);
    };

    const getRuntimeMinutes = (runtimeStr) => {
        if (!runtimeStr || runtimeStr === "N/A") return null;
        const match = runtimeStr.match(/(\d+)/);
        return match ? parseInt(match[1], 10) : null;
    };

    const getActorsArray = (actorsStr) => {
        if (!actorsStr || actorsStr === "N/A") return [];
        return actorsStr.split(',').map(actor => actor.trim());
    };

    useEffect(() => {
        dispatch(fetchPersonalitiesData(10));
    }, [dispatch]);

    useEffect(() => {
        if (omdbMovie) {
            console.log("Response movie:", omdbMovie);

            const genreArray = omdbMovie.Genre ?
                omdbMovie.Genre.split(',').map(g => g.trim()) : [];

            const languageArray = omdbMovie.Language ?
                omdbMovie.Language.split(',').map(l => l.trim()) : [];

            const releaseDate = omdbMovie.Released && omdbMovie.Released !== "N/A" ?
                dayjs(omdbMovie.Released) : null;

            form.setFieldsValue({
                Title: omdbMovie.Title || '',
                Runtime: getRuntimeMinutes(omdbMovie.Runtime),
                Released: releaseDate,
                production_company: omdbMovie.Production !== "N/A" ? omdbMovie.Production : '',
                Genre: genreArray,
                Language: languageArray[0] || '',
                rating: getImdbRating(omdbMovie),
                Plot: omdbMovie.Plot || '',
                director: omdbMovie.Director || '',
                actors: getActorsArray(omdbMovie.Actors),
                awards: omdbMovie.Awards !== "N/A" ? omdbMovie.Awards : '',
                country: omdbMovie.Country !== "N/A" ? omdbMovie.Country : '',
                Poster: omdbMovie.Poster && response.Poster !== "images"
                    ? [
                        {
                            uid: "-1",
                            name: omdbMovie.Poster.split("/").pop(),
                            status: "done",
                            url: omdbMovie.Poster,
                        },
                    ]
                    : [],
            });
        }
    }, [form, omdbMovie]);

    const handleMovieSelect = (imdbId) => {
        console.log("Selected movie ID:", imdbId);
    };

    return (
        <>
            <Card title={<Title level={4}>Movie Details</Title>} bordered>
                <MovieFilter form={form} onMovieSelect={handleMovieSelect} />

                <Divider />

                {/* {omdbMovie && omdbMovie.Poster && omdbMovie.Poster !== "N/A" && (
                    <Row gutter={16} style={{ marginBottom: 24 }}>
                        <Col xs={24} sm={6} md={4}>
                            <Image
                                src={omdbMovie.Poster}
                                alt={omdbMovie.Title}
                                style={{ maxWidth: '100%', borderRadius: 8 }}
                                preview={true}
                            />
                        </Col>
                        <Col xs={24} sm={18} md={20}>
                            <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                <Title level={3}>{omdbMovie.Title} ({omdbMovie.Year})</Title>

                                <Space wrap>
                                    {omdbMovie.Genre && omdbMovie.Genre.split(',').map(genre => (
                                        <Tag color="blue" key={genre.trim()}>{genre.trim()}</Tag>
                                    ))}
                                </Space>

                                <Space>
                                    {omdbMovie.Runtime !== "N/A" && (
                                        <Text><CalendarOutlined /> {omdbMovie.Runtime}</Text>
                                    )}
                                    {omdbMovie.imdbRating !== "N/A" && (
                                        <Text><Rate disabled defaultValue={parseFloat(omdbMovie.imdbRating) / 2} count={5} /> ({omdbMovie.imdbRating}/10)</Text>
                                    )}
                                </Space>

                                {omdbMovie.Director !== "N/A" && (
                                    <Text><strong>Director:</strong> {omdbMovie.Director}</Text>
                                )}

                                {omdbMovie.Plot !== "N/A" && (
                                    <Text>{omdbMovie.Plot}</Text>
                                )}
                            </Space>
                        </Col>
                    </Row>
                )} */}

                <Row gutter={16}>
                    {/* Basic Information */}
                    <Col xs={24} sm={12}>
                        <Form.Item
                            name="Title"
                            label="Movie Name"
                            rules={[{ required: true, message: "Please enter movie name" }]}
                        >
                            <Input placeholder="Enter movie name" />
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={12}>
                        <Form.Item
                            name="Runtime"
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
                            label={<span><DollarOutlined /> Budget</span>}
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
                            label={<span><DollarOutlined /> Box Office Revenue</span>}
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
                            name="Released"
                            label={<span><CalendarOutlined /> Release Date</span>}
                        >
                            <DatePicker style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>

                    {/* Production Details */}
                    <Col xs={24} sm={12}>
                        <Form.Item
                            name="production_company"
                            label="Production Company"
                        >
                            <Input placeholder="Enter production company" />
                        </Form.Item>
                    </Col>

                    {/* Cast & Crew */}
                    <Col xs={24} sm={12}>
                        <Form.Item
                            name="director"
                            label="Director"
                        >
                            <Input placeholder="Enter director name" />
                        </Form.Item>
                    </Col>

                    {/* <Col xs={24} sm={12}>
                        <Form.Item
                            name="actors"
                            label={<span><TeamOutlined /> Actors</span>}
                        >
                            <Select mode="tags" placeholder="Enter actors" style={{ width: '100%' }}>
                                {response?.data?.map(person => (
                                    <Option key={person.id} value={person.name}>{person.name}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col> */}

                    <Col xs={24} sm={12}>
                        <Form.Item
                            name="awards"
                            label={<span><TrophyOutlined /> Awards</span>}
                        >
                            <Input placeholder="Enter awards" />
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={12}>
                        <Form.Item
                            name="country"
                            label={<span><GlobalOutlined /> Country</span>}
                        >
                            <Input placeholder="Enter country" />
                        </Form.Item>
                    </Col>

                    {/* Genres and Language */}
                    <Col xs={24} sm={12}>
                        <Form.Item
                            name="Genre"
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
                            name="Language"
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
                            label="Age Restriction"
                            name="ageRestriction"
                            rules={[{ required: true, message: 'Please select an age restriction' }]}
                        >
                            <Select placeholder="Select age restriction">
                                <Option value="G">G - General Audience</Option>
                                <Option value="PG">PG - Parental Guidance</Option>
                                <Option value="PG-13">PG-13 - Parents Strongly Cautioned</Option>
                                <Option value="R">R - Restricted</Option>
                                <Option value="NC-17">NC-17 - Adults Only</Option>
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col xs={24}>
                        <Form.Item
                            name="Plot"
                            label="Synopsis"
                        >
                            <TextEditor />
                        </Form.Item>
                    </Col>

                    <Col xs={24}>
                        <Form.Item
                            name="Poster"
                            label="Poster Image"
                            valuePropName="value"
                            getValueFromEvent={normFile}
                            style={{ marginBottom: "0px", padding: "0px" }}
                            extra={omdbMovie?.Poster && omdbMovie.Poster !== "N/A" ? "You can upload a custom poster or use the one provided by OMDB." : null}
                        >
                            <ResizedImgePicker
                                maxCount={1}
                                targetResolution={ThumbnailImageResolutions.EVENT}
                            />
                        </Form.Item>
                    </Col>
                </Row>
            </Card>
            <LoadingOverlay loading={loading} />
        </>
    );
}

export default MovieDetailsForm;