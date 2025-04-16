import { Avatar, Select, Space, message } from 'antd';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { UserOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from 'react-redux';
import { fetchPersonalitiesData } from 'store/slices/castSlice';
import debounce from 'lodash/debounce';

const CelebritiesListDropDown = ({ value, onChange, disabled = false, style = {} }) => {
    const dispatch = useDispatch();
    const { response, loading, error } = useSelector((state) => state.cast);
    const [searchValue, setSearchValue] = useState('');
    const [options, setOptions] = useState([]);
    const [localOptions, setLocalOptions] = useState([]);
    const [initialFetchDone, setInitialFetchDone] = useState(false);

    // Initial data fetch
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                await dispatch(fetchPersonalitiesData()).unwrap();
                setInitialFetchDone(true);
            } catch (err) {
                console.log('error occured', err)
            }
        };

        fetchInitialData();
    }, [dispatch]);

    // Update options when API response changes
    useEffect(() => {
        if (response?.items) {
            // Filter out duplicates by ID
            const uniqueOptions = [...new Map(
                [...response.items, ...localOptions].map(item => [item.id, item])
            ).values()];
            setOptions(uniqueOptions);
        }
    }, [response, localOptions]);

    // Show error message if API fails
    useEffect(() => {
        if (error) {
            message.error('Failed to load or search actors list. Please try again later.');
        }
    }, [error]);

    // Debounced search function
    const debouncedSearch = useCallback(
        debounce((value) => {
            if (value?.trim()) {
                dispatch(fetchPersonalitiesData({ search: value.trim() }));
            }
        }, 300),
        [dispatch]
    );

    const handleChange = (selectedValue, option) => {
        if (onChange && selectedValue) {
            onChange(selectedValue, option);
        }
    };

    const handleSearch = (value) => {
        setSearchValue(value || '');
        if (value?.trim()) {
            debouncedSearch(value);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && searchValue?.trim() &&
            !options.some(opt => opt.name?.toLowerCase() === searchValue.trim().toLowerCase())) {
            const newOption = {
                id: `new-${Date.now()}`,
                name: searchValue.trim(),
                thumbnail_image: null,
                isCustom: true
            };

            setLocalOptions(prev => [...prev, newOption]);
            handleChange(newOption.id, {
                key: newOption.id,
                value: newOption.id,
                label: newOption.name,
                image: newOption.thumbnail_image,
                isCustom: true
            });

            message.success(`Added "${newOption.name}" to options`);
            setSearchValue('');
        }
    };

    const handleDropdownOpen = () => {
        if (initialFetchDone) {
            dispatch(fetchPersonalitiesData());
        }
    };

    // Memoize the rendered options to prevent unnecessary re-renders
    const renderedOptions = useMemo(() => {
        return options.map((actor) => (
            <Select.Option
                key={actor.id}
                value={actor.id}
                label={actor.name}
                image={actor.thumbnail_image}
                isCustom={actor.isCustom}
            >
                <Space>
                    <Avatar
                        src={actor.thumbnail_image}
                        icon={<UserOutlined />}
                        size={40}
                        alt={actor.name || 'Actor'}
                    />
                    <span>{actor.name}{actor.isCustom ? ' (custom)' : ''}</span>
                </Space>
            </Select.Option>
        ));
    }, [options]);

    return (
        <Select
            value={value}
            onClick={handleDropdownOpen}
            onSearch={handleSearch}
            onChange={handleChange}
            onInputKeyDown={handleKeyDown}
            placeholder="Select or add actor"
            optionLabelProp="label"
            style={{ width: '100%', ...style }}
            showSearch
            loading={loading}
            disabled={disabled}
            filterOption={(input, option) => {
                return option?.label?.toLowerCase().includes(input.toLowerCase());
            }}
            notFoundContent={loading ? 'Loading...' : searchValue ? 'Press Enter to add as new' : 'No data'}
            allowClear
            maxTagCount={3}
            showArrow
        >
            {renderedOptions}
        </Select>
    );
};

export default React.memo(CelebritiesListDropDown);