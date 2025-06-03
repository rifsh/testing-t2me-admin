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
import { getAllMovieSchedule } from "store/slices/movieScheduleSlice";
import dayjs from "dayjs";
import usePaginationHook from "utils/hooks/usePaginationHandler";
import { isOrganizer } from "configs/UserAccessConfig";
import usePermissions from "utils/hooks/usePermissions";
import { PERMISSIONS } from "constants/RolesPermissionConstants";

const ScheduleList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { allSchedule, message, pagination, editable_status, loading } =
    useSelector((state) => state.movieScheduleSlice);
  const handlePagination = usePaginationHook(getAllMovieSchedule);
  const { hasPermission, hasAnyPermission } = usePermissions()
  useEffect(() => {
    dispatch(getAllMovieSchedule({ size: 10, page: 1, organizer: isOrganizer() ? false : null }));
  }, [dispatch]);

  // const handlePagination = (page, size) => {
  //   dispatch(getAllMovieSchedule({ page: page, size: size }));
  // };

  const handleUpdateStatus = (item) => {
    const newStatus = !item.status;
    const data = { status: newStatus, id: item.id };
    dispatch(setSelectedItem(data));
  };

  const handleViewDetails = async (id) => {
    navigate(`${APP_PREFIX_PATH}/movie-schedule/details/${id}`);
  };

  const handleEditSchedule = async (id) => {
    await dispatch(fetchSingleSchedules({ id: id }));
    navigate(`${APP_PREFIX_PATH}/schedule/edit/${id}`);
  };

  const dropdownMenu = (row) => (
    <Menu>
      <Menu.Item>
        <Flex alignItems="center" onClick={() => handleViewDetails(row.id)}>
          <EyeOutlined />
          <span className="ml-2">View Details</span>
        </Flex>
      </Menu.Item>
      <Menu.Item>
        <Flex alignItems="center" onClick={() => handleEditSchedule(row.id)}>
          <EditOutlined />
          <span className="ml-2">Edit Event</span>
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
      title: "Theater & Venue",
      render: (_, record) => (
        <div>
          <div>
            <strong>{record.theatre.name}</strong>
          </div>
          <div>
            {record.theatre.venue.name}, {record.theatre.place.name}
          </div>
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
      dataIndex: "schedule_status",
      render: (status) => {
        const statusMap = {
          Upcoming: { text: "Upcoming", badge: "processing" },
          Running: { text: "Running", badge: "success" },
          Expired: { text: "Expired", badge: "error" },
          Disabled: { text: "Disabled", badge: "error" },
          "Booking Enabled": { text: "Booking Enabled", badge: "success" },
        };

        const statusInfo = statusMap[status] || {
          text: status,
          badge: "default",
        };

        return (
          <div>
            <Badge status={statusInfo.badge} />
            <span className="mx-2">{statusInfo.text}</span>
          </div>
        );
      },
      sorter: (a, b) => Utils.antdTableSorter(a, b, "schedule_status"),
    },
    {
      title: "",
      dataIndex: "actions",
      render: (_, elm) => (
        hasAnyPermission([PERMISSIONS.APPLICATIONS.SERVICES.MOVIE.SCHEDULE]) ? (
          <div className="text-right">
            <EllipsisDropdown menu={dropdownMenu(elm)} />
          </div>
        ) : null
      ),
    },
  ];

  return (
    <Card>
      <Flex alignItems="center" justifyContent="space-between">
        <SearchBarWithStatus fetchFunction={getAllMovieSchedule} />
        {hasPermission(PERMISSIONS.APPLICATIONS.SERVICES.MOVIE.SCHEDULE.ADD_MOVIE_SCHEDULES) && <Button
          type="primary"
          icon={<FormOutlined />}
          onClick={() => navigate(`${APP_PREFIX_PATH}/movie-schedule/add`)}
        >
          Add Schedule
        </Button>}
      </Flex>
      <div>
        <Table
          columns={tableColumns}
          dataSource={allSchedule}
          rowKey="id"
          loading={loading}
          expandable={{
            expandedRowRender: (record) => (
              <List
                itemLayout="horizontal"
                dataSource={record.movie_show}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          src={item.movie?.thumbnail_image}
                          shape="square"
                          size={64}
                        />
                      }
                      title={<span>{item.movie?.title}</span>}
                      description={
                        <div>
                          <div>
                            Screen: {item.screen?.screen_name} (Capacity:{" "}
                            {item.screen?.capacity})
                          </div>
                          <div>Status: {item.movie_status}</div>
                          {item.movie?.description && (
                            <div
                              dangerouslySetInnerHTML={{
                                __html: item.movie.description,
                              }}
                            ></div>
                          )}
                        </div>
                      }
                    />
                    <Tag color="orange">{item.movie_status}</Tag>
                  </List.Item>
                )}
              />
            ),
          }}
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
        getAllFunction={(pageData) => getAllMovieSchedule(pageData)}
        pageData={{ page: 1, size: 10 }}
      />
    </Card>
  );
};

export default ScheduleList;
