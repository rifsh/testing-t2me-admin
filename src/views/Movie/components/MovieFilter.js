import React, { useEffect, useCallback, useMemo } from 'react';
import { Form, Card, Row, Col, Select, Space, Avatar, DatePicker, message } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMovie, fetchMovieData, setFilterData, setimdbId } from 'store/slices/movieSlice';
import debounce from 'lodash/debounce';

const MovieFilter = ({ form, onMovieSelect }) => {
    const dispatch = useDispatch();
    const { response, filterData, loading } = useSelector((state) => state.movie);
    const movies = response?.Search || [];

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
        }
    }, [dispatch, filterData.s, filterData.y]);

    const handleSearchChange = (value) => {
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
                    <span>{movie.Title} ({movie.Year})</span>
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
        <Card className="movie-filter-card">
            <Form form={form} layout="vertical">
                <Row gutter={16}>
                    <Col xs={24} md={12} lg={8}>
                        <Form.Item name="search" label="Movie Title">
                            <Select
                                value={filterData.s}
                                onSearch={handleSearchChange}
                                onChange={handleSelectChange}
                                onInputKeyDown={handleKeyDown}
                                placeholder="Search for a movie"
                                optionLabelProp="label"
                                style={{ width: '100%' }}
                                showSearch
                                loading={loading}
                                filterOption={false}
                                notFoundContent={loading ? 'Searching...' : 'No movies found'}
                                allowClear
                            >
                                {movieOptions}
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12} lg={8}>
                        <Form.Item name="year" label="Release Year">
                            <DatePicker
                                onChange={handleYearChange}
                                picker="year"
                                allowClear
                            />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Card>
    );
};

export default MovieFilter;