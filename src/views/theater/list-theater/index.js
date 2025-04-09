import React, { useEffect } from 'react'
import { Button, Card, Col, Flex, Menu, Row, Table } from 'antd';
import EllipsisDropdown from 'components/shared-components/EllipsisDropdown';
import {
    EyeOutlined,
    EditOutlined,
    FormOutlined,
} from "@ant-design/icons";
import utils from 'utils';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedItem } from 'store/slices/modalSlice';
import { setDialogVisible } from 'store/slices/eventSlice';
import { theaterMockData } from 'mock/data/thaeterMockData';
import SearchBarWithStatus from 'components/util-components/Search/SearchBarWithStatus';
import { useNavigate } from 'react-router-dom';
import { APP_PREFIX_PATH } from 'configs/AppConfig';
import { fetchTheaters } from 'store/slices/theaterSlice';
import { DEFAULT_PAGE_SIZE } from 'constants/PageConstants';

const Index = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { response, loading } = useSelector((state) => state.theater);

    useEffect(() => {
        dispatch(fetchTheaters(DEFAULT_PAGE_SIZE))
    }, [dispatch])


    const handleUpdateStatus = (item) => {
        const newStatus = !item.status;
        const data = { status: newStatus, id: item.id };

        dispatch(setSelectedItem(data));
        dispatch(setDialogVisible(true));
    };

    const handleViewDetails = async (id) => {
        navigate(`${APP_PREFIX_PATH}/movie-theater/detail/${id}`);
    };

    const handleViewEdit = async (id) => {
        navigate(`${APP_PREFIX_PATH}/movie-theater/edit/${id}`);
    };

    const dropdownMenu = (row) => (
        <Menu>
            <Menu.Item>
                <Flex alignItems="center" onClick={() => handleViewDetails(row.id)}>
                    <EyeOutlined role='button' />
                    <span className="ml-2">View Details</span>
                </Flex>
            </Menu.Item>
            <Menu.Item>
                <Flex alignItems="center" onClick={() => handleViewEdit(row.id)}>
                    <EditOutlined role='button' />
                    <span className="ml-2">Edit Venue</span>
                </Flex>
            </Menu.Item>
        </Menu>
    );

    const tableColumns = [
        {
            title: "Thater name",
            dataIndex: "name",
            render: (name) => <span>{name || "N/A"}</span>,
            sorter: (a, b) => utils.antdTableSorter(a, b, "name"),
        },
        {
            title: "Screen capacity",
            dataIndex: 'number_of_screens',
            render: (name) => <span>{name || "N/A"}</span>,
            sorter: (a, b) => utils.antdTableObjectSorter(a, b, ["place", "name"]),
        },
        {
            title: "Capacity",
            dataIndex: "capacity",
            render: (address) => <span>{address || "N/A"}</span>,
            sorter: (a, b) => utils.antdTableSorter(a, b, "address"),
        },
        {
            title: "Phone",
            dataIndex: "phone_number",
            render: (phone) => <span>{phone}</span>,
            sorter: (a, b) => utils.antdTableSorter(a, b, "indoor"),
        },
        {
            title: "Capacity",
            dataIndex: "capacity",
            render: (capacity) => <span>{capacity || "0"}</span>,
            sorter: (a, b) => utils.antdTableSorter(a, b, "capacity"),
        },
        utils.statusColumnUtil(handleUpdateStatus),
        {
            title: "",
            dataIndex: "actions",
            render: (_, elm) => (
                <div className="text-right">
                    <EllipsisDropdown menu={dropdownMenu(elm)} />
                </div>
            ),
        },
    ];
    return (
        <Card>
            <Row gutter={16} justify={"space-between"} style={{ marginBottom: 16 }}>
                <SearchBarWithStatus
                    additionalFilters={[
                        {
                            placeholder: "Please choose a Place",
                            formName: "place_id",
                            isAutoComplete: true,
                        },
                    ]}
                />

                <Col xs={24} sm={8} style={{ textAlign: "right" }}>
                    <Button
                        type="primary"
                        icon={<FormOutlined />}
                        onClick={() => navigate(`${APP_PREFIX_PATH}/movie-theater/add`)}
                    >
                        Add Venue
                    </Button>
                </Col>
            </Row>
            <div className="table-responsive">
                <Table
                    columns={tableColumns}
                    dataSource={response?.items}
                    rowKey="id"
                    loading={loading}
                // pagination={{
                //     current: pagination.page,
                //     pageSize: pagination.size,
                //     total: pagination.total,
                //     onChange: (page, pageSize) => handlePagination(page, pageSize),
                // }}
                />
            </div>
        </Card>
    )
}

export default Index