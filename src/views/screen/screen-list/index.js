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
import { screenOptions } from 'constants/ScreenConstants';
import { useDispatch, useSelector } from 'react-redux';
import { fetchScreenData, setScreenEditItemId } from 'store/slices/screenSlice';
import { setEditItemId } from 'store/slices/categorySlice';
import { setLocationDialogVisible, setLocationModalLoading } from 'store/slices/locationSlice';
import WarningModal from 'components/util-components/ModalItems/WarningModal';
import UpdateStatusModal from 'components/util-components/ModalItems/UpdateStatusModal';
import { DEFAULT_PAGE_SIZE } from 'constants/PageConstants';
import SearchBarWithStatus from 'components/util-components/Search/SearchBarWithStatus';
import { TextConstants } from 'constants/TextConstant';

const ScreenList = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(screensMockData);
    const [filteredData, setFilteredData] = useState([]);
    const { response, loading: screenLoader, pagination, editItemId } = useSelector((state) => state.screen);
    const { dialogVisible, modalLoading } = useSelector((state) => state.locations);

    useEffect(() => {
        dispatch(fetchScreenData(DEFAULT_PAGE_SIZE));
    }, [dispatch]);

    useEffect(() => {
        if (response && response.items) {
            const formattedData = Object.values(response.items).map(item => ({
                id: item.id,
                screen_name: item.screen_name,
                screen_number: item.screen_number,
                venue_name: item.venue?.name || 'N/A',
                place_name: item.venue?.place?.name || 'N/A',
                screen_type: item.screen_technology?.name || 'standard',
                capacity: item.capacity,
                is_active: true,
                audio_system: item.audio?.name || 'N/A',
                reserved_seating: item.reserved_seating,
                description: item.description,
                // Add any other fields you need for your table
            }));

            setData(formattedData);
            setFilteredData(formattedData);
        }
    }, [response]);

    const handleViewDetails = (row) => {
        console.log("Viewing details for:", row);
        navigate(`${APP_PREFIX_PATH}/screen/detail/${row.id}`);
    };

    const handleEditScreen = (row) => {
        console.log("Editing screen:", row);
        dispatch(setScreenEditItemId(row.id));
        dispatch(setLocationDialogVisible(true));
    };

    const handleModalSubmit = async () => {
        dispatch(setLocationModalLoading(true));
        navigate(`${APP_PREFIX_PATH}/screen/edit/${editItemId}`);
        dispatch(setLocationDialogVisible(false));
        dispatch(setLocationModalLoading(false));
    };

    const handleModalCancel = () => {
        dispatch(setLocationDialogVisible(false));
    };

    const handlePagination = (page, pageSize) => {
        dispatch(fetchScreenData({ page: page, size: pageSize }));
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
    ];

    const getScreenTypeTag = (type) => {
        const typeColors = {
            'standard': 'blue',
            'imax': 'purple',
            'vip': 'gold',
            '4dx': 'green',
            '3d': 'cyan',
            '4k': 'magenta',
            'dolby': 'orange'
        };

        return (
            <Tag color={typeColors[type.toLowerCase()] || 'default'}>
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
                    {text} <small>({record.screen_number})</small>
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
            title: "Technology",
            dataIndex: 'screen_type',
            sorter: (a, b) => Utils.antdTableSorter(a, b, "screen_type"),
            render: (type) => getScreenTypeTag(type)
        },
        {
            title: "Audio",
            dataIndex: 'audio_system',
            sorter: (a, b) => Utils.antdTableSorter(a, b, "audio_system"),
            render: (type) => type && getScreenTypeTag(type)
        },
        {
            title: "Capacity",
            dataIndex: 'capacity',
            sorter: (a, b) => a.capacity - b.capacity,
        },
        {
            title: "Seating",
            dataIndex: 'reserved_seating',
            render: (reserved) => reserved ?
                <Tag color="green">Reserved</Tag> :
                <Tag color="orange">Open</Tag>
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
            <Card>
                <Flex
                    alignItems="center"
                    justifyContent="space-between"
                    mobileFlex={false}
                    className="mb-1"
                >
                    <SearchBarWithStatus
                        fetchFunction={fetchScreenData}
                    />
                    <Space>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => navigate(`${APP_PREFIX_PATH}/screen/add`)}
                        >
                            Add Screen
                        </Button>
                    </Space>
                </Flex>
                <div className="table-responsive">
                    <Table
                        columns={tableColumns}
                        dataSource={filteredData}
                        rowKey="id"
                        loading={screenLoader || loading}
                        pagination={{
                            current: pagination.current,
                            pageSize: pagination.pageSize,
                            total: pagination.total,
                            onChange: (page, pageSize) => handlePagination(page, pageSize),
                            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} screens`
                        }}
                    />
                </div>

                <WarningModal
                    mode={"itemmodal"}
                    visible={dialogVisible}
                    title="Edit Screen"
                    details={TextConstants.DefaultEditContent3}
                    warningMessage="Do you want to proceed to the edit page?"
                    onSubmit={handleModalSubmit}
                    onCancel={handleModalCancel}
                    confirmText="Proceed to Edit"
                    cancelText="Cancel"
                    loading={modalLoading}
                />
                {/* <UpdateStatusModal
                    responseMessage={message}
                    editFunction={editVenueStatus}
                    getAllFunction={(pageData) => getVenues(pageData)}
                    pageData={{ page: 1, size: 10 }}
                    tableConfig={{
                        title: "Active Schedules",
                        dataKey: "items",
                    }}
                    editable_status={editable_status}
                    responseData={responseImpactData}
                    pagination={warningPagination}
                    loading={loading}
                /> */}
            </Card >
        </>
    )
}

export default ScreenList;