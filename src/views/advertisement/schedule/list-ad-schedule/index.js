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
import {
  fetchAdSchedules,
  setSelectedMedia,
  setModalVisible,
} from "store/slices/advertisementSlice";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import { setDialogVisible, setSelectedItem } from "store/slices/modalSlice";
import Utils from "utils";
import UpdateStatusModal from "components/util-components/ModalItems/UpdateStatusModal";
import SearchBarWithStatus from "components/util-components/Search/SearchBarWithStatus";
import { DEFAULT_PAGE_SIZE } from "constants/PageConstants";

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
  } = useSelector((state) => state.advertisement);



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

  const getDropdownMenu = (row) => [
    // {
    //   key: "view",
    //   label: (
    //     <Flex alignItems="center">
    //       <EyeOutlined />
    //       <span className="ml-2">View Details</span>
    //     </Flex>
    //   ),
    // },
    {
      key: "remark",
      label: (
        <Flex alignItems="center">
          <EditOutlined />
          <span className="ml-2">Edit Schedule</span>
        </Flex>
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
      sorter: (a, b) => Utils.antdTableSorter(a, b, "name")
    },
    {
      title: "Start Date",
      dataIndex: "start_date",
      sorter: (a, b) => new Date(a.start_date) - new Date(b.start_date),
      render: (date) => (date ? new Date(date).toLocaleDateString() : "N/A")
    },
    {
      title: "End Date",
      dataIndex: "end_date",
      sorter: (a, b) => new Date(a.end_date) - new Date(b.end_date),
      render: (date) => (date ? new Date(date).toLocaleDateString() : "N/A")
    },
    {
      title: "Start Time",
      dataIndex: "start_time",
      render: (time) => time || "N/A"
    },
    {
      title: "End Time",
      dataIndex: "end_time",
      render: (time) => time || "N/A"
    },
    {
      title: "Duration",
      dataIndex: "duration",
      sorter: (a, b) => a.duration - b.duration,
      render: (duration) => `${duration} seconds`
    },
    {
      title: "Category",
      dataIndex: ["advertisement_banner", "banner_category", "name"],
      sorter: (a, b) => a.advertisement_banner.banner_category.name - b.advertisement_banner.banner_category.name
    },
    {
      title: "Place",
      dataIndex: ["advertisement_banner", "place", "name"],
      render: (name) => name || "N/A",
      sorter: (a, b) =>
        a.advertisement_banner.place.name.localeCompare(b.advertisement_banner.place.name)
    },
    {
      title: "Event",
      dataIndex: ["advertisement_banner", "event", "event_name"],
      render: (name) => name || "N/A",
      sorter: (a, b) =>
        a.advertisement_banner.event?.event_name.localeCompare(b.advertisement_banner.event?.event_name)
    },

    // -------------STATUS COLUMN COMPLETE AFTER ADDING STATUS FIELD IN API-----------------
    // Utils.statusColumnUtil(handleUpdateStatus),
    // -------------STATUS COLUMN COMPLETE AFTER ADDING STATUS FIELD IN API-----------------

    {
      title: "",
      dataIndex: "actions",
      render: (_, row) => (
        <Dropdown menu={{ items: getDropdownMenu(row) }} trigger={["click"]}>
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      )
    }
  ];

  return (
    <Card>
      <Flex alignItems="center" className="mb-3" justifyContent="space-between">
        <SearchBarWithStatus fetchFunction={fetchAdSchedules} />
        <Button
          type="primary"
          icon={<FormOutlined />}
          onClick={() => navigate(`${APP_PREFIX_PATH}/advertisement/schedule/add`)}
        >
          Add Schedule
        </Button>
      </Flex>

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
            <video src={selectedMedia} controls autoPlay style={{ width: "100%", height: "auto", borderRadius: "8px" }} />
          ) : (
            <img src={selectedMedia} alt="Media Preview" style={{
              width: "50%",
              height: "auto",
              borderRadius: "8px",
              objectFit: "cover",
            }} />
          ))}
      </Modal>
    </Card>
  );
};

export default CouponList;
