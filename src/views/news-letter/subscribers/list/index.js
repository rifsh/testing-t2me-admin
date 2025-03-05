import React from 'react'
import { Card, Table, Select, Input, Button, Menu, message, Collapse, Dropdown, } from "antd";
import Flex from 'components/shared-components/Flex';
import { newsLetterMockData } from './MockData';
import { EditOutlined, EyeOutlined, FormOutlined, MoreOutlined } from "@ant-design/icons";
import Utils from 'utils';
import { APP_PREFIX_PATH } from 'configs/AppConfig';
import { useNavigate } from 'react-router-dom';

const List = () => {
    const navigate = useNavigate();
    const { Search } = Input;
    const { Option } = Select;

    const handleUpdateStatus = (item) => {
        const newStatus = !item.status;
        const data = { status: newStatus, id: item.id };
    };

    const getDropdownMenu = (row) => [
        {
            key: "remark",
            label: (
                <Flex alignItems="center">
                    <EditOutlined className='text-danger'/>
                    <span className="ml-2">Delete</span>
                </Flex>
            ),
            // onClick: () => handleEditTax(row.id),
        },
        {
            key: "view",
            label: (
                <Flex alignItems="center">
                    <EyeOutlined />
                    <span className="ml-2">View Details</span>
                </Flex>
            ),
            // onClick: () => showModal(row),
        }
    ];

    const tableColumns = [
        {
            title: "Email",
            dataIndex: "email",
            sorter: (a, b) => Utils.antdTableSorter(a, b, "email"),
        },
        {
            title: "Subscription Date	",
            dataIndex: 'subscription_date',
            sorter: (a, b) => new Date(a.subscription_date) - new Date(b.subscription_date),
        },
        {
            title: "Status",
            dataIndex: 'status',
            sorter: (a, b) => Utils.antdTableSorter(a, b, "status"),
        },
        // Utils.statusColumnUtil(handleUpdateStatus),
        {
            title: "Last Activity",
            dataIndex: "venues",
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
                >
                    <Flex className="mb-1" mobileFlex={false}>
                        <div className="mr-md-3 mb-3">
                            <Search
                                placeholder="Search Event"
                                // onChange={(e) => handleSearchIsEmpty(e.target.value)}
                                // onSearch={(value) => handleSearch(value)}
                                style={{ width: 200 }}
                            />
                        </div>
                        <div className="mb-3">
                            <Select
                                defaultValue="All"
                                className="mr-2"
                            >
                                <Option value={null}>All</Option>
                                <Option value={true}>Verified</Option>
                                <Option value={false}>Unverified</Option>
                            </Select>
                        </div>
                    </Flex>
                </Flex>
                <div className="table-responsive">
                    <Table
                        columns={tableColumns}
                        dataSource={newsLetterMockData}
                        rowKey="id"
                        loading={false}
                    // pagination={{
                    //     current: pagination.page,
                    //     pageSize: pagination.size,
                    //     total: pagination.total,
                    //     onChange: (page, pageSize) => handlePagination(page, pageSize),
                    // }}
                    />
                </div>
                {/* <WarningModal
                    mode={"itemmodal"}
                    visible={dialogVisible}
                    title="Edit Event"
                    details={TextConstants.DefaultEditContent1}
                    warningMessage="Do you want to proceed to the edit page?"
                    onSubmit={handleModalSubmit}
                    onCancel={handleModalCancel}
                    confirmText="Proceed to Edit"
                    cancelText="Cancel"
                    loading={modalLoading}
                />

                <UpdateStatusModal
                    responseMessage={messages}
                    editFunction={editEventStatus}
                    editable_status={editable_status}
                    getAllFunction={(pageData) => fetchAllEvent(pageData)}
                    responseData={responseImpactData}
                    tableConfig={{
                        title: "Active Schedules",
                        dataKey: "items",
                    }}
                    pageData={{ page: 1, size: 10 }}
                    pagination={warningPagination}
                    loading={loading}
                />
                <StatusSubmitAndConfirmModal
                    editFunction={editEventStatus}
                    getAllFunction={fetchAllEvent}
                    responseData={responseData}
                    responseMessage={messages}
                    pageData={DEFAULT_PAGE_SIZE}
                    onSubmitMessage={TextConstants.StatusUpdatedSuccess}
                    onCloseMessage={TextConstants.StatusUpdateCanceled}
                /> */}
            </Card>

        </>
    )
}

export default List