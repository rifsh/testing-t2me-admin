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
    Image,
    Button,
    Upload
} from "antd";
import {
    DollarOutlined,
    CalendarOutlined,
    TeamOutlined,
    TrophyOutlined,
    GlobalOutlined,
    UploadOutlined,
    PlusOutlined
} from "@ant-design/icons";
import TextEditor from "components/util-components/FormItems/TextEditor";
import { parseSizeToBytes, SupportImageFormat } from "constants/SupportFileConstants";
import { useDispatch, useSelector } from "react-redux";
import { fetchPersonalitiesData } from "store/slices/castSlice";
import MovieFilter from "./MovieFilter";
import LoadingOverlay from "components/util-components/Loader";
import dayjs from 'dayjs';
import { MODE } from "constants/TextConstant";
import Utils from "utils";
import { DEFAULT_PAGE_SIZE } from "constants/PageConstants";
import { fetchMoviegenres, fetchMovieLanguages } from "store/slices/movieSlice";
import GenericDropdown from "views/theater/components/GenericDropdown";

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

const MovieDetailsForm = ({ form, mode }) => {
    const dispatch = useDispatch();
    const { response } = useSelector((state => state.cast));
    const { omdbMovie, loading, movieLanguages, movieGenres } = useSelector((state) => state.movie);
    const resolution = {
        max_size: 1080,
        min_size: 1080,
    }
    const genres = ["Action", "Comedy", "Drama", "Horror", "Sci-Fi", "Thriller", "Animation", "Crime"];
    const languages = ["English", "Hindi", "French", "Spanish", "Chinese", "Tamil", "Malayalam"];
    const currencies = ["USD", "EUR", "GBP", "INR", "JPY", "AUD"];

    const normFile = (e) => {
        if (Array.isArray(e)) {
            return e;
        }
        return e?.fileList;
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
        dispatch(fetchPersonalitiesData({ DEFAULT_PAGE_SIZE }));
        dispatch(fetchPersonalitiesData({ DEFAULT_PAGE_SIZE }));
    }, [dispatch]);

    useEffect(() => {
        if (omdbMovie) {
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
                // genre: genreArray,
                // language: languageArray[0] || '',
                rating: getImdbRating(omdbMovie),
                Plot: omdbMovie.Plot || '',
                director: omdbMovie.Director || '',
                actors: getActorsArray(omdbMovie.Actors),
                awards: omdbMovie.Awards !== "N/A" ? omdbMovie.Awards : '',
                country: omdbMovie.Country !== "N/A" ? omdbMovie.Country : '',
            });
        }
    }, [form, omdbMovie]);

    const handleMovieSelect = (imdbId) => {
        console.log("Selected movie ID:", imdbId);
    };

    useEffect(() => {
        return () => {
            form.setFieldsValue({
                name: '',
                director: '',
            });
            console.log("Component unmounted!");
        };
    }, [])

    useEffect(() => {
        if (movieGenres) {
            console.log("movieGenres", movieGenres);
        }
    }, [movieGenres])

    return (
        <>
            <Card title={<Title level={4}>Movie Details</Title>} bordered>
                {mode === MODE.ADD && <MovieFilter form={form} onMovieSelect={handleMovieSelect} />}
                <Divider />

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
                            rules={[{ required: true, message: "Enter director name" }]}
                        >
                            <Input placeholder="Enter director name" />
                        </Form.Item>
                    </Col>

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
                        <GenericDropdown
                            name="genre"
                            label="Genres"
                            mode="multiple"
                            rules={[{ required: true, message: 'Please select genres!' }]}
                            fetchOptions={fetchMoviegenres}
                            optionsData={movieGenres}
                            loading={loading}
                            optionLabelKey="name"
                            optionExtraLabel=""
                            optionValueKey="id"
                            searchParamKey="search"
                            form={form}
                        />
                    </Col>

                    <Col xs={24} sm={12}>
                        <GenericDropdown
                            name="language"
                            label="Language"
                            mode="multiple"
                            rules={[{ required: true, message: 'Please select languages!' }]}
                            fetchOptions={fetchMovieLanguages}
                            optionsData={movieLanguages}
                            loading={loading}
                            optionLabelKey="language"
                            optionExtraLabel="native_name"
                            optionValueKey="id"
                            searchParamKey="search"
                            form={form}
                        />
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
                            name="age_restriction"
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
                            label="Poster Image"
                            name="thumbnail_image"
                            valuePropName="fileList"
                            getValueFromEvent={normFile}
                            style={{ marginBottom: "0px", padding: "0px" }}
                            rules={[{ required: true, message: 'Please add a poster image' }]}
                        >
                            <Upload
                                name="thumbnail_image"
                                listType="picture"
                                maxCount={1}
                                beforeUpload={(file) =>
                                    Utils.handleBannerBeforeUpload(
                                        file,
                                        resolution?.resolution,
                                        parseSizeToBytes(resolution?.min_size),
                                        parseSizeToBytes(resolution?.max_size)
                                    )
                                }
                                accept={`.${SupportImageFormat.join(",.")}`}
                            >
                                <Button icon={<UploadOutlined />}>Click to upload</Button>
                            </Upload>
                        </Form.Item>

                        <Form.Item
                            className="mt-3"
                            name="banner_image"
                            label="Banner Media"
                            valuePropName="fileList"
                            getValueFromEvent={normFile}
                            rules={[{ required: true, message: 'Please add a Banner image' }]}
                            style={{ marginBottom: "0px", padding: "0px" }}
                        >
                            <Upload
                                name="thumbnail_image"
                                listType="picture"
                                maxCount={1}
                                beforeUpload={(file) =>
                                    Utils.handleBannerBeforeUpload(
                                        file,
                                        resolution?.resolution,
                                        parseSizeToBytes(resolution?.min_size),
                                        parseSizeToBytes(resolution?.max_size)
                                    )
                                }
                                accept={`.${SupportImageFormat.join(",.")}`}
                            >
                                <Button icon={<UploadOutlined />}>Click to upload</Button>
                            </Upload>
                        </Form.Item>
                    </Col>
                </Row>
            </Card >
            <LoadingOverlay loading={loading} />
        </>
    );
}

export default MovieDetailsForm;