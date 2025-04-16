import React, { useEffect, useCallback, useMemo, useState } from 'react';
import { Form, Card, Row, Col, Select, Space, Avatar, DatePicker, message, Alert, Button, Tag, Badge } from 'antd';
import { UserOutlined, InfoCircleOutlined, CalendarOutlined, LoadingOutlined, ExclamationCircleOutlined, FrownOutlined, SearchOutlined, DatabaseOutlined, VideoCameraOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { clearOMDBData, fetchMovie, fetchMovieData, setFilterData, setimdbId } from 'store/slices/movieSlice';
import debounce from 'lodash/debounce';

const MovieFilter = ({ form, onMovieSelect }) => {
    const dispatch = useDispatch();
    const { response, filterData, loading } = useSelector((state) => state.movie);
    const movies = response?.Search || [];
    const [showHelper, setShowHelper] = useState(true);

    const debouncedSearch = useCallback(
        debounce((value) => {
            dispatch(setFilterData({
                searchValue: value,
                year: filterData.y || ''
            }));
        }, 300),
        [dispatch, filterData.y]
    );

    useEffect(() => {
        if (filterData.s && filterData.y) {
            dispatch(fetchMovieData({
                search: filterData.s,
                year: filterData.y
            }));
            setShowHelper(false);
        }
    }, [dispatch, filterData.s, filterData.y]);

    const handleSearchChange = (value) => {
        if (!filterData.y && value) {
            setShowHelper(true);
        }
        debouncedSearch(value);
    };

    const handleSelectChange = (imdbID, option) => {
        if (imdbID) {
            dispatch(setimdbId(imdbID));
            dispatch(fetchMovie({ imdb_id: imdbID }));
        }
        if (onMovieSelect) {
            onMovieSelect(imdbID);
        }
    };

    const handleYearChange = (date, dateString) => {
        dispatch(setFilterData({
            searchValue: filterData.s || '',
            year: dateString
        }));
        setShowHelper(false);
        dispatch(clearOMDBData());
    };

    const movieOptions = useMemo(() =>
        movies.map((movie) => (
            <Select.Option
                key={movie.imdbID}
                value={movie.imdbID}
                label={movie.Title}
            >
                <Space>
                    <Avatar
                        src={movie.Poster !== "N/A" ? movie.Poster : undefined}
                        icon={<UserOutlined />}
                        size={40}
                    />
                    <span>{movie.Title} ({movie.Year}) ({movie.Type})</span>
                </Space>
            </Select.Option>
        )),
        [movies]
    );

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && filterData.s && !movies.some(opt => opt.Title === filterData.s)) {
            const newOption = {
                imdbID: `new-${Date.now()}`,
                Title: filterData.s,
                Poster: "N/A",
                Year: "Unknown"
            };

            message.success(`Added "${newOption.Title}" to options`);
        }
    };

    return (
        <Card
            className="movie-filter-card"
            title={
                <div className="flex items-center">
                    <SearchOutlined className="mr-2 text-blue-500" />
                    <span>Movie Search</span>
                </div>
            }
        >
            {showHelper && filterData.s && !filterData.y && (
                <Alert
                    message="Year Selection Recommended"
                    description="Searching with both title and year provides more accurate results from the OMDB database."
                    type="info"
                    showIcon
                    icon={<InfoCircleOutlined />}
                    closable
                    onClose={() => setShowHelper(false)}
                    style={{ marginBottom: 16 }}
                    action={
                        <Button size="small" type="primary" onClick={() => form.getFieldInstance('year').focus()}>
                            Select Year
                        </Button>
                    }
                />
            )}

            <Form form={form} layout="vertical">
                <Row gutter={16}>
                    <Col xs={24} md={12} lg={8}>
                        <Form.Item
                            name="year"
                            label={
                                <span className="flex items-center">
                                    <CalendarOutlined className="mr-1" />
                                    Release Year
                                    <Badge dot={!filterData.y} color="blue" className="ml-1" />
                                </span>
                            }
                            tooltip="Selecting a year first will help narrow down your search"
                        >
                            <DatePicker
                                onChange={handleYearChange}
                                picker="year"
                                allowClear
                                placeholder="Select year first"
                                style={{ width: '100%' }}
                                className={!filterData.y ? "pulse-animation" : ""}
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12} lg={8}>
                        <Form.Item
                            name="search"
                            label={
                                <span className="flex items-center">
                                    <VideoCameraOutlined className="mr-1" />
                                    Movie Title
                                </span>
                            }
                            tooltip={!filterData.y ? "For best results, select a release year first" : "Search the OMDB database for movies"}
                        >
                            <Select
                                value={filterData.s}
                                onSearch={handleSearchChange}
                                onChange={handleSelectChange}
                                onInputKeyDown={handleKeyDown}
                                placeholder={filterData.y ? `Search movies from ${filterData.y}` : "Search for a movie"}
                                optionLabelProp="label"
                                style={{ width: '100%' }}
                                showSearch
                                loading={loading}
                                filterOption={false}
                                notFoundContent={
                                    loading ? (
                                        <div className="flex items-center justify-center py-2">
                                            <LoadingOutlined className="mr-2" /> Searching OMDB...
                                        </div>
                                    ) : (
                                        !filterData.y && filterData.s ? (
                                            <div className="flex items-center justify-center text-orange-500 py-2">
                                                <ExclamationCircleOutlined className="mr-2" /> Please select a release year first
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center text-gray-500 py-2">
                                                <FrownOutlined className="mr-2" /> No movies found
                                            </div>
                                        )
                                    )
                                }
                                allowClear
                                suffixIcon={filterData.s ? <SearchOutlined /> : <DatabaseOutlined />}
                            >
                                {movieOptions}
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={24} lg={8}>
                        <Form.Item label=" " colon={false}>
                            <div className="flex items-center text-xs text-gray-500">
                                <InfoCircleOutlined className="mr-1" />
                                Data provided by <a href="http://www.omdbapi.com/" target="_blank" rel="noopener noreferrer" className="ml-1 font-medium">Open Movie Database (OMDB)</a>
                            </div>
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Card>
    );
};

export default MovieFilter;