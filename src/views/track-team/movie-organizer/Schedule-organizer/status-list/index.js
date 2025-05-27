import React, { useEffect } from "react";
import { Avatar, Badge, Button, Card, List, Menu, Table, Tag } from "antd";
import Flex from "components/shared-components/Flex";
import { EditOutlined, EyeOutlined, FormOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import { useDispatch, useSelector } from "react-redux";
import { editSchedule, fetchSingleSchedules } from "store/slices/scheduleSlice";
import UpdateStatusModal from "components/util-components/ModalItems/UpdateStatusModal";
import { setSelectedItem } from "store/slices/modalSlice";
import Utils from "utils";
import SearchBarWithStatus from "components/util-components/Search/SearchBarWithStatus";
import { DEFAULT_PAGE_SIZE } from "constants/PageConstants";
import EllipsisDropdown from "components/shared-components/EllipsisDropdown";
import { getAllOrganizerMovieSchedule } from "store/slices/movieScheduleSlice";
import dayjs from "dayjs";
import usePaginationHook from "utils/hooks/usePaginationHandler";
import { isOrganizer } from "configs/UserAccessConfig";

const ScheduleList = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { allOrganizerSchedule, message, pagination, editable_status, loading } =
        useSelector((state) => state.movieScheduleSlice);

    const handlePagination = usePaginationHook(getAllOrganizerMovieSchedule);

    useEffect(() => {
        dispatch(getAllOrganizerMovieSchedule({ size: 10, page: 1 }));
    }, [dispatch]);

    const handleUpdateStatus = (item) => {
        const newStatus = !item.status;
        const data = { status: newStatus, id: item.id };
        dispatch(setSelectedItem(data));
    };

    const handleViewDetails = async (id) => {
        navigate(`${APP_PREFIX_PATH}/track/moive-schedule/status/detail/${id}`);
    };

    const dropdownMenu = (row) => (
        <Menu>
            <Menu.Item>
                <Flex alignItems="center" onClick={() => handleViewDetails(row.id)}>
                    <EyeOutlined />
                    <span className="ml-2">View Details</span>
                </Flex>
            </Menu.Item>
        </Menu>
    );

    const tableColumns = [
        {
            title: "Show Name",
            dataIndex: "name",
            sorter: (a, b) => Utils.antdTableSorter(a, b, "name"),
        },
        {
            title: "Theater",
            render: (_, record) => (
                <div>
                    {record.theatre.name}
                </div>
            ),
        },
        {
            title: "Date",
            dataIndex: "start_date",
            render: (text) => dayjs(text).format("YYYY-MM-DD"),
            sorter: (a, b) => Utils.antdTableSorter(a, b, "start_date"),
        },
        {
            title: "Time",
            render: (_, record) => (
                <span>{`${record.start_time.slice(0, 5)} - ${record.end_time.slice(
                    0,
                    5
                )}`}</span>
            ),
            sorter: (a, b) => Utils.antdTableSorter(a, b, "start_time"),
        },
        {
            title: "Status",
            dataIndex: "approval_status",
            render: (text) => {
                const mappedText = {
                    pending: "Pending Approval",
                    rejected: "Rejected",
                    approved: "Approved",
                    update: "Change Requested",
                };

                const color =
                    text?.toLowerCase() === "approved"
                        ? "green"
                        : text?.toLowerCase() === "rejected"
                            ? "red"
                            : text?.toLowerCase() === "update"
                                ? "blue"
                                : "orange";

                return (
                    <Tag color={color}>{mappedText[text?.toLowerCase()] || text}</Tag>
                );
            },
            sorter: (a, b) => a.approval_status.localeCompare(b.approval_status),
            sortDirections: ["ascend", "descend"],
        },
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
            <Flex alignItems="center" justifyContent="space-between">
                <SearchBarWithStatus fetchFunction={getAllOrganizerMovieSchedule} />
                <Button
                    type="primary"
                    icon={<FormOutlined />}
                    onClick={() => navigate(`${APP_PREFIX_PATH}/movie-schedule/add`)}
                >
                    Add Schedule
                </Button>
            </Flex>
            <div>
                <Table
                    columns={tableColumns}
                    dataSource={allOrganizerSchedule}
                    rowKey="id"
                    loading={loading}
                    // expandable={{
                    //     expandedRowRender: (record) => (
                    //         <List
                    //             itemLayout="horizontal"
                    //             dataSource={record.movie_show}
                    //             renderItem={(item) => (
                    //                 <List.Item>
                    //                     <List.Item.Meta
                    //                         avatar={
                    //                             <Avatar
                    //                                 src={item.movie?.thumbnail_image}
                    //                                 shape="square"
                    //                                 size={64}
                    //                             />
                    //                         }
                    //                         title={<span>{item.movie?.title}</span>}
                    //                         description={
                    //                             <div>
                    //                                 <div>
                    //                                     Screen: {item.screen?.screen_name} (Capacity:{" "}
                    //                                     {item.screen?.capacity})
                    //                                 </div>
                    //                                 <div>Status: {item.movie_status}</div>
                    //                                 {item.movie?.description && (
                    //                                     <div
                    //                                         dangerouslySetInnerHTML={{
                    //                                             __html: item.movie.description,
                    //                                         }}
                    //                                     ></div>
                    //                                 )}
                    //                             </div>
                    //                         }
                    //                     />
                    //                     <Tag color="orange">{item.movie_status}</Tag>
                    //                 </List.Item>
                    //             )}
                    //         />
                    //     ),
                    // }}
                    pagination={{
                        current: pagination.page,
                        pageSize: pagination.size,
                        total: pagination.total,
                        onChange: (page, pageSize) => handlePagination(page, pageSize),
                    }}
                />
            </div>

            <UpdateStatusModal
                responseMessage={message}
                editable_status={editable_status}
                editFunction={editSchedule}
                getAllFunction={(pageData) => getAllOrganizerMovieSchedule(pageData)}
                pageData={{ page: 1, size: 10 }}
            />
        </Card>
    );
};

export default ScheduleList;
