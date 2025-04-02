import React, { useState } from 'react';
import {
    Table,
    Tag,
    Space,
    Button,
    Input,
    Select,
    DatePicker,
    Dropdown,
    Menu,
    Modal,
    message,
    Typography
} from 'antd';
import {
    SearchOutlined,
    EditOutlined,
    DeleteOutlined,
    PlusOutlined,
    MoreOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    DownOutlined,
    CalendarOutlined,
    TeamOutlined
} from '@ant-design/icons';
import { data } from '../../../mock/data/DinesList'
import { useNavigate } from 'react-router-dom';
import { APP_PREFIX_PATH } from 'configs/AppConfig';

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const Index = () => {
    const navigate = useNavigate();
    const [searchText, setSearchText] = useState('');
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filterOptions, setFilterOptions] = useState({
        status: 'all',
        dateRange: null,
    });

    const handleStatusChange = (value) => {
        setFilterOptions({
            ...filterOptions,
            status: value
        });
    };

    const handleDateChange = (dates) => {
        setFilterOptions({
            ...filterOptions,
            dateRange: dates
        });
    };

    const handleSearch = (e) => {
        setSearchText(e.target.value);
    };

    const onSelectChange = (selectedRowKeys) => {
        setSelectedRowKeys(selectedRowKeys);
    };

    const handleBulkAction = (action) => {
        if (selectedRowKeys.length === 0) {
            message.warning('Please select at least one venue');
            return;
        }

        setLoading(false);

        setTimeout(() => {
            message.success(`${action} performed on ${selectedRowKeys.length} selected venues`);
            setLoading(false);
            setSelectedRowKeys([]);
        }, 1000);
    };

    const showDetailsModal = (record) => {
        Modal.info({
            title: `${record.name} Details`,
            content: (
                <div>
                    <p><strong>ID:</strong> {record.id}</p>
                    <p><strong>Location:</strong> {record.location}</p>
                    <p><strong>Cuisine:</strong> {record.cuisine}</p>
                    <p><strong>Capacity:</strong> {record.capacity} seats</p>
                    <p><strong>Price Range:</strong> {record.priceRange}</p>
                    <p><strong>Opening Hours:</strong> {record.openingHours}</p>
                    <p><strong>Tables:</strong> {record.availableTables} available of {record.totalTables} total</p>
                    <p><strong>Reservations Today:</strong> {record.reservationsToday}</p>
                </div>
            ),
            width: 500,
        });
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 100,
            sorter: (a, b) => a.id.localeCompare(b.id),
        },
        {
            title: 'Venue Name',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name),
            render: (text, record) => (
                <a onClick={() => showDetailsModal(record)}>{text}</a>
            ),
        },
        {
            title: 'Location',
            dataIndex: 'location',
            key: 'location',
            ellipsis: true,
        },
        {
            title: 'Cuisine',
            dataIndex: 'cuisine',
            key: 'cuisine',
            filters: [
                { text: 'Seafood', value: 'Seafood' },
                { text: 'International', value: 'International' },
                { text: 'Vegetarian', value: 'Vegetarian' },
                { text: 'Japanese', value: 'Japanese' },
                { text: 'Italian', value: 'Italian' },
                { text: 'Steakhouse', value: 'Steakhouse' },
                { text: 'Indian', value: 'Indian' },
                { text: 'American', value: 'American' },
            ],
            onFilter: (value, record) => record.cuisine.includes(value),
        },
        {
            title: 'Price',
            dataIndex: 'priceRange',
            key: 'priceRange',
            width: 80,
            filters: [
                { text: '$', value: '$' },
                { text: '$$', value: '$$' },
                { text: '$$$', value: '$$$' },
                { text: '$$$$', value: '$$$$' },
            ],
            onFilter: (value, record) => record.priceRange.includes(value),
            sorter: (a, b) => a.priceRange.length - b.priceRange.length,
        },
        {
            title: 'Tables',
            key: 'tables',
            width: 120,
            render: (_, record) => (
                <span>
                    {record.availableTables}/{record.totalTables}
                </span>
            ),
            sorter: (a, b) => a.availableTables - b.availableTables,
        },
        {
            title: 'Reservations',
            dataIndex: 'reservationsToday',
            key: 'reservationsToday',
            width: 130,
            sorter: (a, b) => a.reservationsToday - b.reservationsToday,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (status) => {
                let color = 'green';
                if (status === 'full') {
                    color = 'orange';
                } else if (status === 'maintenance') {
                    color = 'red';
                }
                return (
                    <Tag color={color}>
                        {status.toUpperCase()}
                    </Tag>
                );
            },
            filters: [
                { text: 'Active', value: 'active' },
                { text: 'Full', value: 'full' },
                { text: 'Maintenance', value: 'maintenance' },
            ],
            onFilter: (value, record) => record.status === value,
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 120,
            render: (_, record) => (
                <Space size="small">
                    <Dropdown
                        overlay={
                            <Menu>
                                <Menu.Item key="1" onClick={() => message.info(`View tables for ${record.name}`)}>
                                    View Details
                                </Menu.Item>
                                <Menu.Item key="2" onClick={() => message.info(`View reservations for ${record.name}`)}>
                                    Edit
                                </Menu.Item>
                            </Menu>
                        }
                    >
                        <Button type="text" icon={<MoreOutlined />} />
                    </Dropdown>
                </Space>
            ),
        },
    ];

    const filteredData = data.filter(item => {
        const matchSearch =
            item.name.toLowerCase().includes(searchText.toLowerCase()) ||
            item.location.toLowerCase().includes(searchText.toLowerCase()) ||
            item.id.toLowerCase().includes(searchText.toLowerCase());

        const matchStatus =
            filterOptions.status === 'all' ||
            item.status === filterOptions.status;

        return matchSearch && matchStatus;
    });

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: "space-between", gap: '16px', flexWrap: 'wrap' }}>
                <div>
                    <Input
                        placeholder="Search venues..."
                        prefix={<SearchOutlined />}
                        style={{ width: 250 }}
                        value={searchText}
                        onChange={handleSearch}
                        allowClear
                    />
                    <Select
                        defaultValue="all"
                        style={{ width: 140 }}
                        onChange={handleStatusChange}
                    >
                        <Option value="all">All</Option>
                        <Option value="active">Active</Option>
                        <Option value="full">Full</Option>
                        <Option value="maintenance">Maintenance</Option>
                    </Select>
                    <RangePicker
                        onChange={handleDateChange}
                        placeholder={['Start Date', 'End Date']}
                    />
                    {selectedRowKeys.length > 0 && (
                        <Space>
                            <span>{selectedRowKeys.length} selected</span>
                            <Button
                                onClick={() => handleBulkAction('Activate')}
                                icon={<CheckCircleOutlined />}
                                type="default"
                                size="middle"
                            >
                                Activate
                            </Button>
                            <Button
                                onClick={() => handleBulkAction('Deactivate')}
                                icon={<CloseCircleOutlined />}
                                type="default"
                                size="middle"
                            >
                                Deactivate
                            </Button>
                        </Space>
                    )}
                </div>
                <div>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() =>navigate(`${APP_PREFIX_PATH}/dine/add`)}
                    >
                        Add Dine
                    </Button>
                </div>
            </div>

            <Table
                columns={columns}
                dataSource={filteredData}
                loading={loading}
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total) => `Total ${total} items`,
                }}
                size="middle"
            />
        </div>
    );
};

export default Index;