import React, { useState, useEffect } from 'react'
import { Card, Table, Select, Input, Button, Dropdown, Tag, Badge, Space, Tooltip } from "antd";
import Flex from 'components/shared-components/Flex';
import {
    EditOutlined,
    EyeOutlined,
    FormOutlined,
    MoreOutlined,
    DeleteOutlined,
    PlusOutlined,
    FilterOutlined,
    ExportOutlined
} from "@ant-design/icons";
import Utils from 'utils';
import { APP_PREFIX_PATH } from 'configs/AppConfig';
import { useNavigate } from 'react-router-dom';
import { screensMockData } from './MockData';

const ScreenList = () => {
    const navigate = useNavigate();
    const { Search } = Input;
    const { Option } = Select;
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(screensMockData);
    const [filteredData, setFilteredData] = useState(screensMockData);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: screensMockData.length
    });

    const handleSearch = (value) => {
        setLoading(true);

        const filtered = screensMockData.filter(item =>
            item.screen_name.toLowerCase().includes(value.toLowerCase()) ||
            item.venue_name.toLowerCase().includes(value.toLowerCase()) ||
            item.place_name.toLowerCase().includes(value.toLowerCase())
        );

        setFilteredData(filtered);
        setPagination({
            ...pagination,
            total: filtered.length
        });

        setTimeout(() => {
            setLoading(false);
        }, 500);
    };

    const handleClearSearch = () => {
        setFilteredData(screensMockData);
        setPagination({
            ...pagination,
            total: screensMockData.length
        });
    };

    const handleScreenTypeFilter = (value) => {
        setLoading(true);

        let filtered = screensMockData;
        if (value !== 'all') {
            filtered = screensMockData.filter(item => item.screen_type === value);
        }

        setFilteredData(filtered);
        setPagination({
            ...pagination,
            total: filtered.length
        });

        setTimeout(() => {
            setLoading(false);
        }, 500);
    };

    const handleUpdateStatus = (item) => {
        console.log(`Updating status for screen: ${item.id}`);
    };

    const handleViewDetails = (row) => {
        console.log("Viewing details for:", row);
        navigate(`${APP_PREFIX_PATH}/screen/details/${row.id}`);
    };

    const handleEditScreen = (row) => {
        console.log("Editing screen:", row);
        navigate(`${APP_PREFIX_PATH}/screen/edit/${row.id}`);
    };

    const handleDeleteScreen = (row) => {
        console.log("Deleting screen:", row);
    };

    const handlePagination = (page, pageSize) => {
        setPagination({
            ...pagination,
            current: page,
            pageSize: pageSize
        });
    };

    const getDropdownMenu = (row) => [
        {
            key: "edit",
            label: (
                <Flex alignItems="center">
                    <EditOutlined />
                    <span className="ml-2">Edit</span>
                </Flex>
            ),
            onClick: () => handleEditScreen(row),
        },
        {
            key: "view",
            label: (
                <Flex alignItems="center">
                    <EyeOutlined />
                    <span className="ml-2">View Details</span>
                </Flex>
            ),
            onClick: () => handleViewDetails(row),
        },
        {
            key: "delete",
            label: (
                <Flex alignItems="center">
                    <DeleteOutlined className='text-danger' />
                    <span className="ml-2 text-danger">Delete</span>
                </Flex>
            ),
            onClick: () => handleDeleteScreen(row),
        }
    ];

    const getScreenTypeTag = (type) => {
        const typeColors = {
            'standard': 'blue',
            'imax': 'purple',
            'vip': 'gold',
            '4dx': 'green',
            '3d': 'cyan'
        };

        return (
            <Tag color={typeColors[type] || 'default'}>
                {type.toUpperCase()}
            </Tag>
        );
    };

    const getStatusBadge = (isActive) => {
        return isActive ?
            <Badge status="success" text="Active" /> :
            <Badge status="error" text="Inactive" />;
    };

    const tableColumns = [
        {
            title: "Screen Name",
            dataIndex: "screen_name",
            sorter: (a, b) => Utils.antdTableSorter(a, b, "screen_name"),
            render: (text, record) => (
                <span className="font-weight-semibold">
                    {text}
                </span>
            )
        },
        {
            title: "Venue",
            dataIndex: 'venue_name',
            sorter: (a, b) => Utils.antdTableSorter(a, b, "venue_name"),
        },
        {
            title: "Location",
            dataIndex: 'place_name',
            sorter: (a, b) => Utils.antdTableSorter(a, b, "place_name"),
        },
        {
            title: "Type",
            dataIndex: 'screen_type',
            sorter: (a, b) => Utils.antdTableSorter(a, b, "screen_type"),
            render: (type) => getScreenTypeTag(type)
        },
        {
            title: "Capacity",
            dataIndex: 'capacity',
            sorter: (a, b) => a.capacity - b.capacity,
        },
        {
            title: "Status",
            dataIndex: "is_active",
            sorter: (a, b) => a.is_active - b.is_active,
            render: (isActive) => getStatusBadge(isActive)
        },
        {
            title: "",
            dataIndex: "actions",
            render: (_, row) => (
                <Dropdown menu={{ items: getDropdownMenu(row) }} trigger={["click"]}>
                    <Button type="text" icon={<MoreOutlined />} />
                </Dropdown>
            ),
        },
    ];

    return (
        <>
            <Card title="Screen Management">
                <Flex
                    alignItems="center"
                    justifyContent="space-between"
                    mobileFlex={false}
                    className="mb-1"
                >
                    <Flex className="mb-3" mobileFlex={false}>
                        <div className="mr-md-3 mb-3">
                            <Search
                                placeholder="Search Screens"
                                allowClear
                                onSearch={handleSearch}
                                onChange={(e) => e.target.value === "" && handleClearSearch()}
                                style={{ width: 250 }}
                            />
                        </div>
                        <div className="mr-md-3 mb-3">
                            <Select
                                defaultValue="all"
                                style={{ width: 150 }}
                                onChange={handleScreenTypeFilter}
                                placeholder="Filter by Type"
                            >
                                <Option value="all">All Types</Option>
                                <Option value="standard">Standard</Option>
                                <Option value="imax">IMAX</Option>
                                <Option value="vip">VIP</Option>
                                <Option value="4dx">4DX</Option>
                                <Option value="3d">3D</Option>
                            </Select>
                        </div>
                        <div className="mb-3">
                            <Select
                                defaultValue="all"
                                style={{ width: 150 }}
                                placeholder="Filter by Status"
                            >
                                <Option value="all">All Status</Option>
                                <Option value="active">Active</Option>
                                <Option value="inactive">Inactive</Option>
                            </Select>
                        </div>
                    </Flex>
                    <div className="mb-3">
                        <Space>
                            <Tooltip title="Export">
                                <Button icon={<ExportOutlined />}>
                                    Export
                                </Button>
                            </Tooltip>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={() => navigate(`${APP_PREFIX_PATH}/screen/add`)}
                            >
                                Add Screen
                            </Button>
                        </Space>
                    </div>
                </Flex>
                <div className="table-responsive">
                    <Table
                        columns={tableColumns}
                        dataSource={filteredData}
                        rowKey="id"
                        loading={loading}
                        pagination={{
                            current: pagination.current,
                            pageSize: pagination.pageSize,
                            total: pagination.total,
                            onChange: (page, pageSize) => handlePagination(page, pageSize),
                            showSizeChanger: true,
                            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} screens`
                        }}
                    />
                </div>
            </Card>
        </>
    )
}

export default ScreenList;