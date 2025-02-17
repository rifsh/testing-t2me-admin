import React, { useEffect, useState } from "react";
import {
  Card,
  Table,
  Select,
  Input,
  Button,
  Modal,
  Descriptions,
  Dropdown,
  Badge,
  Menu,
} from "antd";
import {
  EyeOutlined,
  PlusCircleOutlined,
  SearchOutlined,
  FormOutlined,
  MoreOutlined,
  EditOutlined,
} from "@ant-design/icons";
import Flex from "components/shared-components/Flex";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { TextConstants } from "constants/TextConstant";
import {
  fetchAdSchedules,
  setSelectedMedia,
  setModalVisible,
  editScheduleStatus,
} from "store/slices/advertisementSlice";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import { setDialogVisible, setSelectedItem } from "store/slices/modalSlice";
import Utils from "utils";
import UpdateStatusModal from "components/util-components/ModalItems/UpdateStatusModal";
import SearchBarWithStatus from "components/util-components/Search/SearchBarWithStatus";
import { DEFAULT_PAGE_SIZE } from "constants/PageConstants";
import StatusSubmitAndConfirmModal from "components/util-components/ModalItems/StatusSubmitModal";


const { Option } = Select;

const CouponList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    filteredAdSchedules,
    pagination,
    subPagination,
    loading,
    editable_status,
    message: responseMessage,
    modalVisible,
    selectedMedia,
    warningPagination,
    responseImpactData,
  } = useSelector((state) => state.advertisement);
  const { responseData } = useSelector((state) => state.modalSlice);

  useEffect(() => {
    dispatch(fetchAdSchedules({ page: 1, size: 10 }));
    console.log(filteredAdSchedules.length, "-------------------------ssss");
  }, [dispatch]);

  const handlePagination = (page, size, type) => {
    dispatch(fetchAdSchedules({ page: page, size: size }));
  };
  const handleMediaClick = (mediaPath) => {
    dispatch(setSelectedMedia(mediaPath));
    dispatch(setModalVisible(true));
  };

  const handleModalClose = () => {
    const videoElement = document.querySelector("video");
    if (videoElement) videoElement.pause();
    dispatch(setModalVisible(false));
    dispatch(setSelectedMedia(null));
  };

  const handleUpdateStatus = (item) => {
    const newStatus = !item.status;
    const data = { status: newStatus, id: item.id };
    dispatch(setSelectedItem(data));
    dispatch(setDialogVisible(true));
  };
  const handleEditSchedule = (id) => {
    navigate(`${APP_PREFIX_PATH}/advertisement/schedule/edit/${id}`);
  };

  const getDropdownMenu = (row) => [
    {
      key: "remark",
      label: (
        <Menu>
          <Menu.Item onClick={() => handleEditSchedule(row.id)}>
            <Flex alignItems="center">
              <EyeOutlined />
              <span className="ml-2">Edit AdSchedule</span>
            </Flex>
          </Menu.Item>
        </Menu>
      ),
    },
  ];

  const tableColumns = [
    {
      title: "File",
      dataIndex: ["advertisement_banner", "media_path"],
      render: (mediaPath) => {
        const isVideo = /\.(mp4|webm|ogg)$/i.test(mediaPath);
        return isVideo ? (
          <video
            src={mediaPath}
            style={{ width: 80, height: 50, cursor: "pointer" }}
            muted
            playsInline
            onClick={() => handleMediaClick(mediaPath)}
          />
        ) : (
          <img
            src={mediaPath}
            alt="Image Thumbnail"
            style={{ width: 80, height: 50, cursor: "pointer" }}
            onClick={() => handleMediaClick(mediaPath)}
          />
        );
      },
    },
    {
      title: "Name",
      dataIndex: "name",
      sorter: (a, b) => Utils.antdTableSorter(a, b, "name"),
    },
    {
      title: "Start Date",
      dataIndex: "start_date",
      sorter: (a, b) => new Date(a.start_date) - new Date(b.start_date),
      render: (date) => (date ? new Date(date).toLocaleDateString() : "N/A"),
    },
    {
      title: "End Date",
      dataIndex: "end_date",
      sorter: (a, b) => new Date(a.end_date) - new Date(b.end_date),
      render: (date) => (date ? new Date(date).toLocaleDateString() : "N/A"),
    },
    {
      title: "Start Time",
      dataIndex: "start_time",
      render: (time) => time || "N/A",
    },
    {
      title: "End Time",
      dataIndex: "end_time",
      render: (time) => time || "N/A",
    },
    {
      title: "Duration",
      dataIndex: "duration",
      sorter: (a, b) => a.duration - b.duration,
      render: (duration) => `${duration} seconds`,
    },
    {
      title: "Category",
      dataIndex: ["advertisement_banner", "banner_category", "name"],
      sorter: (a, b) =>
        a.advertisement_banner.banner_category.name -
        b.advertisement_banner.banner_category.name,
    },
    {
      title: "Place",
      dataIndex: ["advertisement_banner", "place", "name"],
      render: (name) => name || "N/A",
      sorter: (a, b) =>
        a.advertisement_banner.place.name.localeCompare(
          b.advertisement_banner.place.name
        ),
    },
    {
      title: "Event",
      dataIndex: ["advertisement_banner", "event", "event_name"],
      render: (name) => name || "N/A",
      sorter: (a, b) =>
        a.advertisement_banner.event?.event_name.localeCompare(
          b.advertisement_banner.event?.event_name
        ),
    },
    {
      title: "Schedule Status",
      dataIndex: "schedule_status",
      render: (_, record) => {
        const statusMap = {
          Expired: { text: "Expired", badge: "error" },
          Upcoming: { text: "Upcoming", badge: "processing" },
          Running: { text: "Running", badge: "success" },
          Disabled: { text: "Disabled", badge: "error" },
        };

        const status = statusMap[record.schedule_status] || {
          text: record.schedule_status,
          badge: "default",
        };

        return (
          <div>
            <Badge status={status.badge} />
            <span className="mx-2">{status.text}</span>
          </div>
        );
      },
      sorter: (a, b) => Utils.antdTableSorter(a, b, "schedule_status"),
    },
    Utils.statusColumnUtil(handleUpdateStatus),

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
    <Card>
      <Flex alignItems="center" className="mb-3" justifyContent="space-between">
        <SearchBarWithStatus
          fetchFunction={fetchAdSchedules}
          isStatus={false}
        />
        <Button
          type="primary"
          icon={<FormOutlined />}
          onClick={() =>
            navigate(`${APP_PREFIX_PATH}/advertisement/schedule/add`)
          }
        >
          Add Schedule
        </Button>
      </Flex>

      <UpdateStatusModal
        responseMessage={responseMessage}
        editFunction={editScheduleStatus}
        getAllFunction={(pageData) => fetchAdSchedules(pageData)}
        pageData={{ page: 1, size: 10 }}
        tableConfig={{
          title: "Active Schedules",
          dataKey: "items",
        }}
        editable_status={editable_status}
        responseData={responseImpactData}
        pagination={warningPagination}
        loading={loading}
      />
      <StatusSubmitAndConfirmModal
        editFunction={editScheduleStatus}
        getAllFunction={fetchAdSchedules}
        responseData={responseData}
        responseMessage={responseMessage}
        pageData={DEFAULT_PAGE_SIZE}
        onSubmitMessage={TextConstants.StatusUpdatedSuccess}
        onCloseMessage={TextConstants.StatusUpdateCanceled}
      />

      <Table
        columns={tableColumns}
        dataSource={filteredAdSchedules}
        rowKey="id"
        loading={loading}
        pagination={{
          current: pagination.page,
          pageSize: pagination.size,
          total: pagination.total,
          onChange: (page, pageSize) => handlePagination(page, pageSize),
        }}
      />
      <Modal
        visible={modalVisible}
        onCancel={handleModalClose}
        footer={null}
        centered
        width="50%"
        bodyStyle={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "rgba(255, 255, 255, 0.5)",
        }}
        maskStyle={{
          backdropFilter: "blur(10px)",
          backgroundColor: "rgba(0, 0, 0, 0.4)",
        }}
        destroyOnClose={true}
      >
        {selectedMedia &&
          (/\.(mp4|webm|ogg)$/i.test(selectedMedia) ? (
            <video
              src={selectedMedia}
              controls
              autoPlay
              style={{ width: "100%", height: "auto", borderRadius: "8px" }}
            />
          ) : (
            <img
              src={selectedMedia}
              alt="Media Preview"
              style={{
                width: "50%",
                height: "auto",
                borderRadius: "8px",
                objectFit: "cover",
              }}
            />
          ))}
      </Modal>
    </Card>
  );
};

export default CouponList;
