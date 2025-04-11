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
import { setDialogVisible, setSelectedItem } from 'store/slices/modalSlice';
import SearchBarWithStatus from 'components/util-components/Search/SearchBarWithStatus';
import { useNavigate } from 'react-router-dom';
import { APP_PREFIX_PATH } from 'configs/AppConfig';
import { editTheaterStatus, fetchTheaters, setTheaterEditId } from 'store/slices/theaterSlice';
import { DEFAULT_PAGE_SIZE } from 'constants/PageConstants';
import { setLocationDialogVisible, setLocationModalLoading } from 'store/slices/locationSlice';
import WarningModal from 'components/util-components/ModalItems/WarningModal';
import { TextConstants } from 'constants/TextConstant';
import UpdateStatusModal from 'components/util-components/ModalItems/UpdateStatusModal';
import StatusSubmitAndConfirmModal from 'components/util-components/ModalItems/StatusSubmitModal';

const TheaterList = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { response, loading, pagination, editId, message: theaterMessage, editable_status } = useSelector((state) => state.theater);
    const { dialogVisible, modalLoading } = useSelector((state) => state.locations);

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
        dispatch(setTheaterEditId(id))
        dispatch(setLocationDialogVisible(true));
    };

    const handleModalSubmit = async () => {
        dispatch(setLocationModalLoading(true));
        navigate(`${APP_PREFIX_PATH}/movie-theater/edit/${editId}`);
        dispatch(setLocationDialogVisible(false));
        dispatch(setLocationModalLoading(false));
    };

    const handleModalCancel = () => {
        dispatch(setLocationDialogVisible(false));
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
                    <span className="ml-2">Edit</span>
                </Flex>
            </Menu.Item>
        </Menu>
    );

    const handlePagination = (page, pageSize) => {
        dispatch(fetchTheaters({ page: page, size: pageSize }));
    };

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
            title: "Website",
            dataIndex: "website",
            key: "website",
            render: (text) => (
                <a href={text} target="_blank" rel="noopener noreferrer">
                    {text}
                </a>
            ),
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
                    placeholder="Enter theater name"
                    fetchFunction={fetchTheaters}
                />

                <Col xs={24} sm={8} style={{ textAlign: "right" }}>
                    <Button
                        type="primary"
                        icon={<FormOutlined />}
                        onClick={() => navigate(`${APP_PREFIX_PATH}/movie-theater/add`)}
                    >
                        Add Theater
                    </Button>
                </Col>
            </Row>
            <div className="table-responsive">
                <Table
                    columns={tableColumns}
                    dataSource={response?.items}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        current: pagination.page,
                        pageSize: pagination.size,
                        total: pagination.total,
                        onChange: (page, pageSize) => handlePagination(page, pageSize),
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

            <UpdateStatusModal
                responseMessage={theaterMessage}
                editFunction={editTheaterStatus}
                getAllFunction={(pageData) => fetchTheaters(pageData)}
                pageData={{ page: 1, size: 10 }}
                tableConfig={{
                    title: "Active Schedules",
                    dataKey: "items",
                }}
                editable_status={editable_status}
                responseData={response}
                // pagination={warningPagination}
                loading={loading}
            />

            <StatusSubmitAndConfirmModal
                editFunction={editTheaterStatus}
                getAllFunction={fetchTheaters}
                responseData={response}
                responseMessage={theaterMessage}
                pageData={DEFAULT_PAGE_SIZE}
                onSubmitMessage={TextConstants.StatusUpdatedSuccess}
                onCloseMessage={TextConstants.StatusUpdateCanceled}
            />
        </Card>
    )
}

export default TheaterList