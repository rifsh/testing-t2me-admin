import React, { useEffect } from "react";
import { Card, Table, Button, Menu, Modal } from "antd";
import { FormOutlined, EditOutlined } from "@ant-design/icons";
import Flex from "components/shared-components/Flex";
import EllipsisDropdown from "components/shared-components/EllipsisDropdown";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { APP_PREFIX_PATH, CDN_PATH } from "configs/AppConfig";
import WarningModal from "components/util-components/ModalItems/WarningModal";
import { TextConstants } from "constants/TextConstant";
import {
  fetchAdBanners,
  setSelectedMedia,
  setModalVisible,
  setEditItemId,
  setAdBannerDialogVisible,
  setAdBannerModalLoading,
  updateAdBannerStatus,
} from "store/slices/advertisementSlice";
import SearchBarWithStatus from "components/util-components/Search/SearchBarWithStatus";
import { setDialogVisible, setSelectedItem } from "store/slices/modalSlice";
import Utils from "utils";
import { DEFAULT_PAGE_SIZE } from "constants/PageConstants";
import StatusSubmitAndConfirmModal from "components/util-components/ModalItems/StatusSubmitModal";
import UpdateStatusModal from "components/util-components/ModalItems/UpdateStatusModal";
import usePaginationHook from "utils/hooks/usePaginationHandler";
import CDNImage from "components/layout-components/Image/CDNImage";

const AdBannerlist = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    filteredAdBanner,
    pagination,
    loading,
    modalVisible,
    selectedMedia,
    editItemId,
    dialogVisible,
    modalLoading,
    message,
    warningPagination,
    responseImpactData,
    editable_status,
  } = useSelector((state) => state.advertisement);
  const { responseData } = useSelector((state) => state.modalSlice);
  const handlePagination = usePaginationHook(fetchAdBanners);

  useEffect(() => {
    dispatch(fetchAdBanners({ page: 1, size: 10 }));
    console.log(filteredAdBanner.length, "-------------------------ssss");
  }, [dispatch]);

  // const handlePagination = (page, size, type) => {
  //   dispatch(fetchAdBanners({ page: page, size: size }));
  // };

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

  // const handleEditAdBanner = async (id) => {
  //   return navigate(`${APP_PREFIX_PATH}/advertisement/banner/edit/${id}`);
  // };
  const handleEditAdBanner = (id) => {
    dispatch(setEditItemId(id));
    dispatch(setAdBannerDialogVisible(true));
  };
  const handleModalSubmit = async () => {
    dispatch(setAdBannerModalLoading(true));
    navigate(`${APP_PREFIX_PATH}/advertisement/banner/edit/${editItemId}`);
    console.log(editItemId, "9234239423490823498234098234908");
    dispatch(setAdBannerDialogVisible(false));
    dispatch(setAdBannerModalLoading(false));
  };

  const handleModalCancel = () => {
    dispatch(setAdBannerDialogVisible(false));
  };

  const dropdownMenu = (row) => (
    <Menu>
      <Menu.Item>
        <Flex alignItems="center" onClick={() => handleEditAdBanner(row.id)}>
          <EditOutlined />
          <span className="ml-2">Edit Banner</span>
        </Flex>
      </Menu.Item>
    </Menu>
  );

  const handleUpdateStatus = (item) => {
    const newStatus = !item.status;
    const data = { status: newStatus, id: item.id };
    dispatch(setSelectedItem(data));
    dispatch(setDialogVisible(true));
  };

  const categoryColumns = [
    {
      title: "Banner Image",
      dataIndex: "media_path",
      render: (mediaPath) => {
        const isVideo = /\.(mp4|webm|ogg)$/i.test(mediaPath);
        return isVideo ? (
          <video
            src={`${CDN_PATH}/${mediaPath}`}
            style={{ width: 80, height: 50 }}
            muted
            playsInline
            onClick={() => handleMediaClick(mediaPath)}
            onLoadedData={(e) => {
              const videoElement = e.target;
              videoElement.currentTime = 4;
            }}
          />
        ) : (
          // <img
          //   src={`${CDN_PATH}/${mediaPath}`}
          //   alt="Image Thumbnail"
          //   onClick={() => handleMediaClick(mediaPath)}
          //   style={{ width: 80, height: 50 }}
          // />
          <CDNImage
            src={mediaPath}
            alt={`Image Thumbnail`}
            height={50}
            width={80}
          />
        );
      },
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Banner Name",
      dataIndex: "name",
      render: (_, record) => <span>{record.name}</span>,
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Category Name",
      dataIndex: ["banner_category", "name"],
      render: (_, record) => <span>{record.banner_category.name}</span>,
      sorter: (a, b) =>
        a.record.banner_category.name.localeCompare(
          b.record.banner_category.name
        ),
    },
    {
      title: "Event Type",
      dataIndex: "event_type.name",
      render: (_, record) => <span>{record.event_type?.name || "Not Available"}</span>,
      sorter: (a, b) => a.event_type.name.localeCompare(b.event_type.name),
    },
    {
      title: "Place",
      dataIndex: "place.name",
      render: (_, record) => <span>{record.place?.name || "Not Available"}</span>,
      sorter: (a, b) => a.place.name.localeCompare(b.place.name),
    },
    {
      title: "Event",
      dataIndex: "event.event_name",
      render: (_, record) => (
        <span>{record.event?.event_name || "Not Available"}</span>
      ),
      sorter: (a, b) =>
        (a.event?.event_name || "").localeCompare(b.event?.event_name || ""),
    },
    {
      title: "Url",
      dataIndex: "ads_url",
      width: 120,
      render: (_, record) => {
        const url = record.ads_url || "";
        const maxLength = 30;
        const displayText =
          url.length > maxLength ? url.substring(0, maxLength) + "..." : url;

        return (
          <a href={url} target="_blank" rel="noopener noreferrer">
            {displayText}
          </a>
        );
      },
      sorter: (a, b) => a.ads_url.localeCompare(b.ads_url),
    },
    Utils.statusColumnUtil(handleUpdateStatus),
    {
      title: "",
      dataIndex: "actions",
      render: (_, record) => (
        <div className="text-right">
          <EllipsisDropdown menu={dropdownMenu(record)} />
        </div>
      ),
    },
  ];
  const getModalProps = () => {
    return {
      responseMessage: message,
      editable_status: editable_status,
      editFunction: updateAdBannerStatus,
      getAllFunction: (pageData) => fetchAdBanners(pageData),
      pageData: { page: 1, size: 10 },
      tableConfig: {
        title: "Active Schedules",
        dataKey: "items",
      },
      responseData: responseImpactData,
      pagination: warningPagination,
      loading: loading,
    };
  };

  return (
    <Card>
      <Flex alignItems="center" justifyContent="space-between">
        <SearchBarWithStatus fetchFunction={fetchAdBanners} isStatus={false} />
        <div>
          <Button
            type="primary"
            icon={<FormOutlined />}
            onClick={() => {
              return navigate(`${APP_PREFIX_PATH}/advertisement/banner/add`);
            }}
          >
            Add Banner
          </Button>
        </div>
      </Flex>
      <Table
        columns={categoryColumns}
        dataSource={filteredAdBanner}
        rowKey="id"
        loading={loading}
        pagination={{
          current: pagination.page,
          pageSize: pagination.size,
          total: pagination.total,
          onChange: (page, pageSize) =>
            handlePagination(page, pageSize, "category"),
        }}
      />
      <WarningModal
        mode={"itemmodal"}
        visible={dialogVisible}
        title="Edit Place"
        details={TextConstants.DefaultEditContent1}
        warningMessage="Do you want to proceed to the edit page?"
        onSubmit={handleModalSubmit}
        onCancel={handleModalCancel}
        confirmText="Proceed to Edit"
        cancelText="Cancel"
        loading={modalLoading}
      />
      <UpdateStatusModal {...getModalProps()} />
      <StatusSubmitAndConfirmModal
        editFunction={updateAdBannerStatus}
        getAllFunction={fetchAdBanners}
        responseData={responseData}
        responseMessage={message}
        pageData={DEFAULT_PAGE_SIZE}
        onSubmitMessage={TextConstants.StatusUpdatedSuccess}
        onCloseMessage={TextConstants.StatusUpdateCanceled}
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
            // <img
            //   src={`${CDN_PATH}/${selectedMedia}`}
            //   alt="Media Preview"
            //   style={{
            //     width: "50%",
            //     height: "auto",
            //     borderRadius: "8px",
            //     objectFit: "cover",
            //   }}
            // />
            <CDNImage
              src={selectedMedia}
              alt={`Media Preview`}
              width={300}
            />
          ))}
      </Modal>
    </Card>
  );
};

export default AdBannerlist;
