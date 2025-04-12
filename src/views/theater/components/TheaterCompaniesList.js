import React, { useEffect } from 'react'
import { Avatar, Button, Card, Col, Flex, Menu, Row, Table, Tag } from 'antd'
import SearchBarWithStatus from 'components/util-components/Search/SearchBarWithStatus'
import { EditOutlined, EyeOutlined, FormOutlined } from "@ant-design/icons";
import { useNavigate } from 'react-router-dom';
import { APP_PREFIX_PATH } from 'configs/AppConfig';
import { theaterCompanyDataSource } from 'mock/data/thaeterMockData';
import EllipsisDropdown from 'components/shared-components/EllipsisDropdown';
import { useDispatch } from 'react-redux';
import { DEFAULT_PAGE_SIZE } from 'constants/PageConstants';
import { useSelector } from 'react-redux';
import { editTheaterCompanyStatus, fetchTheaterCompanies, fetchTheaterCompanyByid, setDetailModal, setTheaterCompanyEditId } from 'store/slices/theaterCompanySlice';
import Utils from 'utils';
import { setDialogVisible, setSelectedItem } from 'store/slices/modalSlice';
import StatusSubmitAndConfirmModal from 'components/util-components/ModalItems/StatusSubmitModal';
import UpdateStatusModal from 'components/util-components/ModalItems/UpdateStatusModal';
import { TextConstants } from 'constants/TextConstant';
import { setLocationDialogVisible, setLocationModalLoading } from 'store/slices/locationSlice';
import WarningModal from 'components/util-components/ModalItems/WarningModal';
import TheaterCompanyDetailModal from './TheaterCompanyDetailModal ';
import LoadingOverlay from 'components/util-components/Loader';

const TheaterCompaniesList = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { response, editLoading, singleLoading, loading, editable_status, statusEditresponse, pagination, message: theaterCompanyMessage, editId, isDetailModal, singleResponse } = useSelector((state) => state.theaterCompany);
    const { dialogVisible, modalLoading, } = useSelector((state) => state.locations);

    useEffect(() => {
        dispatch(fetchTheaterCompanies(DEFAULT_PAGE_SIZE));
    }, [dispatch]);


    const handleViewDetails = async (id) => {
        dispatch(setDetailModal(true));
        dispatch(fetchTheaterCompanyByid({ company_id: id }));
    };

    const handleViewEdit = async (id) => {
        dispatch(setTheaterCompanyEditId(id));
        dispatch(setLocationDialogVisible(true));
    };

    const handleModalSubmit = async () => {
        dispatch(setLocationModalLoading(true));
        navigate(`${APP_PREFIX_PATH}/movie-theater-company/edit/${editId}`);
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
        dispatch(fetchTheaterCompanies({ page: page, size: pageSize }));
    };

    const handleUpdateStatus = (item) => {
        const newStatus = !item.status;
        const data = { status: newStatus, id: item.id };
        dispatch(setSelectedItem(data));
        dispatch(setDialogVisible(true));
    };

    const handleDetailModalClose = () => {
        dispatch(setDetailModal(false));
    };
    const columns = [
        {
            title: "Logo",
            dataIndex: "thumbnail_image",
            key: "thumbnail_image",
            width: 80,
            render: (image, record) => (
                <Avatar
                    src={image || "https://via.placeholder.com/150"}
                    size={60}
                    alt={record.name}
                />
            ),
        },
        {
            title: "Company Name",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Phone",
            dataIndex: "phone_number",
            key: "phone_number",
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
        },
        {
            title: "Website",
            dataIndex: "website_url",
            key: "website_url",
            render: (text) => (
                <a href={text} target="_blank" rel="noopener noreferrer">
                    {text}
                </a>
            ),
        },
        Utils.statusColumnUtil(handleUpdateStatus),
        {
            title: "Actions",
            fixed: "right",
            width: 100,
            dataIndex: "actions",
            render: (_, elm) => (
                <div className="text-right">
                    <EllipsisDropdown menu={dropdownMenu(elm)} />
                </div>
            ),
        },
    ];

    return (
        <>
            <Card>
                <Row gutter={16} justify={"space-between"} style={{ marginBottom: 16 }}>
                    <SearchBarWithStatus
                        placeholder="Enter theater company"
                        fetchFunction={fetchTheaterCompanies}
                    />

                    <Col xs={24} sm={8} style={{ textAlign: "right" }}>
                        <Button
                            type="primary"
                            icon={<FormOutlined />}
                            onClick={() => {
                                navigate(`${APP_PREFIX_PATH}/movie-theater-company/add`);
                            }
                            }
                        >
                            Add Company
                        </Button>
                    </Col>
                </Row>
                <Table
                    columns={columns}
                    dataSource={response?.items}
                    rowKey="id"
                    loading={loading}
                    scroll={{ x: 'max-content' }}
                    pagination={{
                        current: pagination.page,
                        pageSize: pagination.size,
                        total: pagination.total,
                        onChange: (page, pageSize) => handlePagination(page, pageSize),
                    }}
                />
            </Card>

            <TheaterCompanyDetailModal
                visible={isDetailModal}
                onClose={handleDetailModalClose}
                theaterCompany={singleResponse}
                loading={singleLoading}
            />

            <WarningModal
                mode={"itemmodal"}
                visible={dialogVisible}
                title="Edit Personality Profile"
                details={TextConstants.DefaultEditContent4}
                warningMessage="Do you want to proceed to the edit page?"
                onSubmit={handleModalSubmit}
                onCancel={handleModalCancel}
                confirmText="Proceed to Edit"
                cancelText="Cancel"
                loading={modalLoading}
            />

            <UpdateStatusModal
                responseMessage={theaterCompanyMessage}
                editFunction={editTheaterCompanyStatus}
                getAllFunction={(pageData) => fetchTheaterCompanies(pageData)}
                pageData={{ page: 1, size: 10 }}
                // tableConfig={{
                //     title: "Active Schedules",
                //     dataKey: "items",
                // }}
                editable_status={editable_status}
                responseData={statusEditresponse}
                // pagination={warningPagination}
                loading={editLoading}
            />

            <StatusSubmitAndConfirmModal
                editFunction={editTheaterCompanyStatus}
                getAllFunction={fetchTheaterCompanies}
                responseData={statusEditresponse}
                responseMessage={theaterCompanyMessage}
                pageData={DEFAULT_PAGE_SIZE}
                onSubmitMessage={TextConstants.StatusUpdatedSuccess}
                onCloseMessage={TextConstants.StatusUpdateCanceled}
            />
        </>
    )
}

export default TheaterCompaniesList