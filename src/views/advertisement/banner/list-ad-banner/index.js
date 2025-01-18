import React, { useEffect, useState } from "react";
import { Card, Table, Input, Tabs, Button, Select, Menu } from "antd";
import { FormOutlined, SearchOutlined, EditOutlined, EyeOutlined, } from "@ant-design/icons";
import Flex from "components/shared-components/Flex";
import EllipsisDropdown from "components/shared-components/EllipsisDropdown";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import Utils from "utils";
import { setSelectedItem } from "store/slices/modalSlice";
import UpdateStatusModal from "components/util-components/ModalItems/UpdateStatusModal";
import {
  fetchAdBanners,
} from "store/slices/advertisementSlice";
import SearchBarWithStatus from "components/util-components/Search/SearchBarWithStatus";

const { TabPane } = Tabs;
const { Option } = Select;

const AdBannerlist = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [modalType, setModalType] = useState("banner");

  const {
    filteredAdBanner,
    pagination,
    subPagination,
    loading,
    editable_status,
    message: responseMessage,
  } = useSelector((state) => state.advertisement);

  useEffect(() => {
    dispatch(fetchAdBanners({ page: 1, size: 10 }));
    console.log(filteredAdBanner.length, "-------------------------ssss");

  }, [dispatch]);



  const handlePagination = (page, size, type) => {

    dispatch(fetchAdBanners({ page: page, size: size }));

  };

   const handleEditAdBanner = async (id) => {
      return navigate(`${APP_PREFIX_PATH}/advertisement/banner/edit/${id}`);
    };




  const dropdownMenu = (row) => (
    <Menu>
      <Menu.Item>
        <Flex alignItems="center" onClick={() => handleEditAdBanner(row.id)}>
          <EditOutlined />
          <span className="ml-2">
            Edit Banner
          </span>
        </Flex>
      </Menu.Item>
    </Menu>
  );


  const categoryColumns = [
    {
      title: "Banner Image",
      dataIndex: "media_path",
      render: (mediaPath) => {
        const isVideo = /\.(mp4|webm|ogg)$/i.test(mediaPath);
        return isVideo ? (
          <video
            src={mediaPath}
            style={{ width: 80, height: 50 }}
            muted
            playsInline
            onLoadedData={(e) => {
              const videoElement = e.target;
              videoElement.currentTime = 4;
            }}
          />
        ) : (
          <img
            src={mediaPath}
            alt="Image Thumbnail"
            style={{ width: 80, height: 50 }}
          />
        );
      },
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Category Name",
      dataIndex: "name",
      render: (_, record) => <span>{record.name}</span>,
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Place",
      dataIndex: "place.name",
      render: (_, record) => <span>{record.place.name}</span>,
      sorter: (a, b) => a.place.name.localeCompare(b.place.name),
    },
    {
      title: "Event",
      dataIndex: "event.event_name",
      render: (_, record) => (
        <span>{record.event?.event_name || "Not Available"}</span>
      ),
      sorter: (a, b) => (a.event?.event_name || "").localeCompare(b.event?.event_name || ""),
    },
    {
      title: "Url",
      dataIndex: "ads_url",
      render: (_, record) => (
        <a href={record.ads_url} target="_blank" rel="noopener noreferrer">
          {record.ads_url}
        </a>
      ),
      sorter: (a, b) => a.ads_url.localeCompare(b.ads_url),
    },
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


  return (
    <Card>
      <Flex alignItems="center" justifyContent="space-between">
        <SearchBarWithStatus fetchFunction={fetchAdBanners} />
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
    </Card>
  );

};

export default AdBannerlist;
