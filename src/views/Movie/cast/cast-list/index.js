import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Dropdown, Tag, Badge, Space, Avatar, Typography } from "antd";
import { EditOutlined, EyeOutlined, MoreOutlined, UserAddOutlined } from "@ant-design/icons";
import { useNavigate } from 'react-router-dom';
import SearchBarWithStatus from 'components/util-components/Search/SearchBarWithStatus';
import { APP_PREFIX_PATH } from 'configs/AppConfig';
import { useDispatch, useSelector } from 'react-redux';
import { editPersonalityStatus, fetchPersonalitiesData, setPersonalityEditId } from 'store/slices/castSlice';
import { DEFAULT_PAGE_SIZE } from 'constants/PageConstants';
import { setEditItemId } from 'store/slices/categorySlice';
import { setLocationDialogVisible, setLocationModalLoading } from 'store/slices/locationSlice';
import WarningModal from 'components/util-components/ModalItems/WarningModal';
import { TextConstants } from 'constants/TextConstant';
import Utils from 'utils';
import { setDialogVisible, setSelectedItem } from 'store/slices/modalSlice';
import UpdateStatusModal from 'components/util-components/ModalItems/UpdateStatusModal';
import StatusSubmitAndConfirmModal from 'components/util-components/ModalItems/StatusSubmitModal';
import usePaginationHook from 'utils/hooks/usePaginationHandler';
import usePermissions from 'utils/hooks/usePermissions';
import { PERMISSIONS } from 'constants/RolesPermissionConstants';

const { Text } = Typography;

const Index = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [filteredData, setFilteredData] = useState([]);
    const { response, loading, pagination, editId, editable_status, message, editResponse } = useSelector((state => state.cast));
    const {
        dialogVisible,
        modalLoading,
    } = useSelector((state) => state.locations);
    useEffect(() => {
        dispatch(fetchPersonalitiesData(DEFAULT_PAGE_SIZE));
    }, [dispatch]);

    useEffect(() => {
        if (response && response.items) {
            setFilteredData(response.items);
        }
    }, [response]);
    const handlePagination = usePaginationHook(fetchPersonalitiesData);
    const { hasPermission, hasAnyPermission } = usePermissions();

    const calculateAge = (birthDate) => {
        if (!birthDate) return '-';

        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    const handleViewDetails = (actor) => {
        navigate(`${APP_PREFIX_PATH}/personality/details/${actor.id}`);
    };

    const handleEditActor = (actor) => {
        dispatch(setPersonalityEditId(actor.id));
        dispatch(setLocationDialogVisible(true));
    };
    const handleModalSubmit = async () => {
        dispatch(setLocationModalLoading(true));
        navigate(`${APP_PREFIX_PATH}/personality/edit/${editId}`);
        dispatch(setLocationDialogVisible(false));
        dispatch(setLocationModalLoading(false));
    };

    const handleModalCancel = () => {
        dispatch(setLocationDialogVisible(false));
    };

    const getDropdownMenu = (actor) => [
        {
            key: "view",
            label: (
                hasPermission(PERMISSIONS.APPLICATIONS.SERVICES.MOVIE.PERSONALITY_PROFILE.GET_PERSONALITY_DETAILS) ? (
                    <Space>
                        <EyeOutlined />
                        <span>View Details</span>
                    </Space>
                ) : null
            ),
            onClick: () => handleViewDetails(actor),
        },
        {
            key: "edit",
            label: (
                hasPermission(PERMISSIONS.APPLICATIONS.SERVICES.MOVIE.PERSONALITY_PROFILE.EDIT_PERSONALITY) ? (
                    <Space>
                        <EditOutlined />
                        <span>Edit</span>
                    </Space>
                ) : null
            ),
            onClick: () => handleEditActor(actor),
        }
    ];

    const handleSearch = (value) => {
        if (response && response.items) {
            dispatch(fetchPersonalitiesData())
        }
    };

    // const handlePagination = (page, pageSize) => {
    //     dispatch(fetchPersonalitiesData({ page: page, size: pageSize }));
    // };

    const handleUpdateStatus = (item) => {
        const newStatus = !item.status;
        const data = { status: newStatus, id: item.id };
        dispatch(setSelectedItem(data));
        dispatch(setDialogVisible(true));
    };

    const tableColumns = [
        {
            title: "Profile",
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
            title: "Name",
            dataIndex: "name",
            key: "name",
            render: (text, record) => (
                <Space direction="vertical" size={0}>
                    <Text strong>{text}</Text>
                    {record.also_known_as && (
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            AKA: {record.also_known_as}
                        </Text>
                    )}
                </Space>
            ),
        },
        {
            title: "Gender",
            dataIndex: "gender",
            key: "gender",
            render: (gender) => gender ? (
                <Tag color={gender === 'male' ? 'blue' : gender === 'female' ? 'magenta' : 'purple'}>
                    {gender.charAt(0).toUpperCase() + gender.slice(1)}
                </Tag>
            ) : '-',
        },
        {
            title: "Age",
            dataIndex: "birthDate",
            key: "age",
            render: (_, record) => calculateAge(record.birthDate),
        },
        {
            title: "Occupation",
            dataIndex: "occupation",
            key: "occupation",
            render: (occupations) => occupations && occupations.length > 0 ? (
                <Space size={[0, 4]} wrap>
                    {occupations.slice(0, 2).map(occ => (
                        <Tag key={occ}>{occ}</Tag>
                    ))}
                    {occupations.length > 2 && <Tag>+{occupations.length - 2}</Tag>}
                </Space>
            ) : '-',
        },
        {
            title: "Nationality",
            dataIndex: "nationality",
            key: "nationality",
            render: (nationality) => nationality || '-',
        },
        Utils.statusColumnUtil(handleUpdateStatus, !hasPermission(PERMISSIONS.APPLICATIONS.SERVICES.MOVIE.PERSONALITY_PROFILE.EDIT_PERSONALITY_STATUS)),

        {
            title: "Actions",
            dataIndex: "actions",
            render: (_, actor) => (
                hasAnyPermission([PERMISSIONS.APPLICATIONS.SERVICES.MOVIE.PERSONALITY_PROFILE.GET_PERSONALITY_DETAILS, PERMISSIONS.APPLICATIONS.SERVICES.MOVIE.PERSONALITY_PROFILE.EDIT_PERSONALITY]) ? (
                    <Dropdown menu={{ items: getDropdownMenu(actor) }} trigger={["click"]}>
                        <Button type="text" icon={<MoreOutlined />} />
                    </Dropdown>
                ) : null
            ),
        },
    ];

    return (
        <>

            <Card>
                <Space style={{ width: "100%", justifyContent: "space-between", marginBottom: "10px" }}>
                    <SearchBarWithStatus
                        placeholder="Search by name or nationality"
                        fetchFunction={fetchPersonalitiesData}
                    />
                    {hasPermission(PERMISSIONS.APPLICATIONS.SERVICES.MOVIE.PERSONALITY_PROFILE.ADD_PERSONALITY) && <Button
                        type="primary"
                        icon={<UserAddOutlined />}
                        onClick={() => navigate(`${APP_PREFIX_PATH}/personality/add`)}
                    >
                        Add
                    </Button>}
                </Space>

                <Table
                    columns={tableColumns}
                    dataSource={filteredData}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        current: pagination.page,
                        pageSize: pagination.size,
                        total: pagination.total,
                        onChange: (page, pageSize) => handlePagination(page, pageSize),
                        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} Profiles`
                    }}
                />
            </Card>
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
                responseMessage={message}
                editFunction={editPersonalityStatus}
                getAllFunction={(pageData) => fetchPersonalitiesData(pageData)}
                // tableConfig={{
                //     title: "Active Schedules",
                //     dataKey: "items",
                // }}
                editable_status={editable_status}
                responseData={editResponse}
                loading={loading}
            />

            <StatusSubmitAndConfirmModal
                editFunction={editPersonalityStatus}
                getAllFunction={fetchPersonalitiesData}
                responseData={editResponse}
                responseMessage={message}
                pageData={DEFAULT_PAGE_SIZE}
                onSubmitMessage={TextConstants.StatusUpdatedSuccess}
                onCloseMessage={TextConstants.StatusUpdateCanceled}
            />
        </>
    );
}

export default Index;