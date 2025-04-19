import { Avatar, Select, Space, message } from 'antd';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { UserOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from 'react-redux';
import { fetchPersonalitiesData } from 'store/slices/castSlice';
import debounce from 'lodash/debounce';

const CelebritiesListDropDown = ({ value, onChange, disabled = false, style = {} }) => {
    const dispatch = useDispatch();
    const { response, loading, error } = useSelector(state => state.cast);
    const [localOptions, setLocalOptions] = useState([]);

    // Initial fetch
    useEffect(() => {
        dispatch(fetchPersonalitiesData());
    }, [dispatch]);

    // Error handler
    useEffect(() => {
        if (error) {
            message.error('Failed to load or search actors list. Please try again later.');
        }
    }, [error]);

    // Debounced search
    const debouncedSearch = useCallback(
        debounce(value => {
            dispatch(fetchPersonalitiesData({ search: value }));
        }, 300),
        [dispatch]
    );

    const handleSearch = (val) => {
        if (val.trim()) {
            debouncedSearch(val);
        } else {
            dispatch(fetchPersonalitiesData());
        }
    };

    const handleChange = (selectedValue, option) => {
        dispatch(fetchPersonalitiesData({}));
        if (onChange && selectedValue) {
            onChange(selectedValue, option);
        }
    };

    const handleKeyDown = (e) => {
        const search = e.target.value.trim();
        if (e.key === 'Enter' && search &&
            !allOptions.some(opt => opt.name?.toLowerCase() === search.toLowerCase())
        ) {
            const newOption = {
                id: `new-${Date.now()}`,
                name: search,
                thumbnail_image: null,
                isCustom: true
            };
            setLocalOptions(prev => [...prev, newOption]);
            message.success(`Added "${search}" to options`);
            handleChange(newOption.id, {
                key: newOption.id,
                value: newOption.id,
                label: newOption.name,
                image: newOption.thumbnail_image,
                isCustom: true
            });
        }
    };

    const allOptions = useMemo(() => {
        const combined = [...(response?.items || []), ...localOptions];
        return [...new Map(combined.map(item => [item.id, item])).values()];
    }, [response, localOptions]);

    const renderedOptions = useMemo(() => (
        allOptions.map(actor => (
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
                        alt={actor.name}
                    />
                    <span>{actor.name}{actor.isCustom ? ' (custom)' : ''}</span>
                </Space>
            </Select.Option>
        ))
    ), [allOptions]);

    return (
        <Select
            value={value}
            onSearch={handleSearch}
            onChange={handleChange}
            onInputKeyDown={handleKeyDown}
            placeholder="Select or add actor"
            optionLabelProp="label"
            style={{ width: '100%', ...style }}
            showSearch
            loading={loading}
            disabled={disabled}
            filterOption={(input, option) =>
                option?.label?.toLowerCase().includes(input.toLowerCase())
            }
            notFoundContent={loading ? 'Loading...' : 'Press Enter to add as new'}
            allowClear
            showArrow
        >
            {renderedOptions}
        </Select>
    );
};

export default React.memo(CelebritiesListDropDown);
