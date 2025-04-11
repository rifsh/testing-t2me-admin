import { Avatar, Select, Space, message } from 'antd';
import React, { useEffect, useState } from 'react';
import { UserOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from 'react-redux';
import { fetchTheaterCompanies } from 'store/slices/theaterCompanySlice';

const TheaterCompanyList = ({ value, onChange }) => {
    const dispatch = useDispatch();
    const { response, loading } = useSelector((state) => state.theaterCompany);
    const [searchValue, setSearchValue] = useState('');
    const [options, setOptions] = useState([]);

    useEffect(() => {
        dispatch(fetchTheaterCompanies());
    }, [dispatch]);

    useEffect(() => {
        if (response?.items) {
            setOptions(response.items);
        }
    }, [response]);

    const handleChange = (value, option) => {
        if (onChange) {
            onChange(value, option);
        }
    };

    const handleSearch = (value) => {
        setSearchValue(value);
        dispatch(fetchTheaterCompanies({ search: value }));
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && searchValue && !options.some(opt => opt.name === searchValue)) {
            const newOption = {
                id: `new-${Date.now()}`,
                name: searchValue,
                thumbnail_image: null
            };
            setOptions([...options, newOption]);
            handleChange(newOption.id, {
                key: newOption.id,
                value: newOption.id,
                label: newOption.name,
                image: newOption.thumbnail_image
            });
            message.success(`Added "${newOption.name}" to options`);
        }
    };

    return (
        <Select
            value={value}
            onSearch={handleSearch}
            onChange={handleChange}
            onInputKeyDown={handleKeyDown}
            placeholder="Select or add actor"
            optionLabelProp="label"
            style={{ width: '100%' }}
            showSearch
            loading={loading}
            filterOption={false}
            notFoundContent={null}
        >
            {options.map((actor) => (
                <Select.Option
                    key={actor.id}
                    value={actor.id}
                    label={actor.name}
                    image={actor.thumbnail_image}
                >
                    <Space>
                        <Avatar
                            src={actor.thumbnail_image}
                            icon={<UserOutlined />}
                            size={40}
                        />
                        <span>{actor.name}</span>
                    </Space>
                </Select.Option>
            ))}
        </Select>
    );
};

export default TheaterCompanyList;