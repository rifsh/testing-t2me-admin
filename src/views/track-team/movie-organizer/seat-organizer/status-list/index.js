/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { Card, Table, Select, Menu, Row, Form, Tag } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import EllipsisDropdown from "components/shared-components/EllipsisDropdown";
import Flex from "components/shared-components/Flex";
import { useLocation, useNavigate } from "react-router-dom";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import { useDispatch, useSelector } from "react-redux";
import SearchBarWithStatus from "components/util-components/Search/SearchBarWithStatus";
import { DEFAULT_PAGE_SIZE } from "constants/PageConstants";
import Utils from "utils";
import { getAllTrackrequestSeatStructures } from "store/slices/movieSeatSlice";
import usePaginationHook from "utils/hooks/usePaginationHandler";
import { PERMISSIONS } from "constants/RolesPermissionConstants";
import usePermissions from "utils/hooks/usePermissions";

const { Option } = Select;

const OrganizerMovieStatusList = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const [formattedData, setFormattedData] = useState([]);
    const { hasPermission, hasAnyPermission } = usePermissions()
    const type = params.get("type");
    const { allTrackrequestSeats, pagination, loading } = useSelector(
        (state) => state.movieSeatSlice
    );
    const [activeStatus, setactiveStatus] = useState();
    const handlePagination = usePaginationHook(getAllTrackrequestSeatStructures);

    useEffect(() => {
        dispatch(
            getAllTrackrequestSeatStructures({
                ...DEFAULT_PAGE_SIZE,
            })
        );
    }, [dispatch]);

    const handleViewDetails = async (id) => {
        console.log(id);
        navigate(`${APP_PREFIX_PATH}/track/moive-seats/status/details/${id}`);
    };

    const handleShowStatus = (status) => {
        setactiveStatus(status);
        dispatch(
            getAllTrackrequestSeatStructures({
                page: 1,
                size: 10,
                filters: status,
            })
        );
    };

    useEffect(() => {
        if (allTrackrequestSeats) {
            const newData = {
                ...allTrackrequestSeats,
            }
            setFormattedData(newData)
        }
        console.log("allTrackrequestSeats", allTrackrequestSeats)
    }, [allTrackrequestSeats]);

    const dropdownMenu = (row) => (
        <Menu>
            {hasPermission(PERMISSIONS.APPLICATIONS.SERVICES.MOVIE.SEAT.GET_ORGANIZER_SINGLE_MOVIE_SEAT_STRUCTURE) && <Menu.Item>
                < Flex alignItems="center"
                    onClick={() => handleViewDetails(row.id)}>
                    <EyeOutlined />
                    <span className="ml-2">View Details</span>
                </Flex >
            </Menu.Item>}
        </Menu>
    );

    const tableColumns = [
        {
            title: "Seat Name",
            dataIndex: "name",
            sorter: (a, b) => a.name.localeCompare(b.name),
        },
        {
            title: "Theatre Name",
            dataIndex: "theatre",
            render: (theatre) => theatre?.name || "N/A",
        },
        {
            title: "Screen Name",
            dataIndex: "screen",
            render: (screen) => screen?.screen_name || "N/A",
        },
        {
            title: "Venue Name",
            dataIndex: "venue",
            render: (venue) => venue?.name || "N/A",
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
                hasAnyPermission([
                    PERMISSIONS.APPLICATIONS.SERVICES.MOVIE.SEAT.GET_ORGANIZER_SINGLE_MOVIE_SEAT_STRUCTURE
                ]) ? (
                    < div className="text-right" >
                        <EllipsisDropdown menu={dropdownMenu(elm)} />
                    </div >
                ) : null
            ),
        },
    ];


    const [form] = Form.useForm();

    return (
        <Card>
            <Row gutter={16} justify="start" align="" wrap={false}>
                <SearchBarWithStatus
                    fetchFunction={getAllTrackrequestSeatStructures}
                    isStatus={false}
                    additionalParams={{
                        event_code: Utils.getEventTypeCodeWithType(type),
                    }}
                />

                <div className="mb-3">
                    <Select
                        defaultValue="All"
                        onChange={handleShowStatus}
                        className="mr-2 wide-select"
                    >
                        <Option value={null}>All</Option>
                        <Option value="REJECTED">Rejected</Option>
                        <Option value="PENDING">Pending</Option>
                        <Option value="APPROVED">Approved</Option>
                        <Option value="UPDATES">Update Requested</Option>
                    </Select>
                </div>
            </Row>

            <div className="table-responsive">
                <Table
                    columns={tableColumns}
                    dataSource={allTrackrequestSeats}
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
        </Card>
    );
};

export default OrganizerMovieStatusList;
