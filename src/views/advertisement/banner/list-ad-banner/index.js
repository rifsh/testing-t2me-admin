import React, { useEffect } from "react";
import { Card, Table, Button,  Menu } from "antd";
import { FormOutlined, EditOutlined } from "@ant-design/icons";
import Flex from "components/shared-components/Flex";
import EllipsisDropdown from "components/shared-components/EllipsisDropdown";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { APP_PREFIX_PATH } from "configs/AppConfig";

import {
  fetchAdBanners,
} from "store/slices/advertisementSlice";
import SearchBarWithStatus from "components/util-components/Search/SearchBarWithStatus";


const CategoryList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();


  const {
    filteredAdBanner,
    pagination,
    loading,

  } = useSelector((state) => state.advertisement);

  useEffect(() => {
    dispatch(fetchAdBanners({ page: 1, size: 10 }));
    console.log(filteredAdBanner.length, "-------------------------ssss");

  }, [dispatch]);



  const handlePagination = (page, size, type) => {

    dispatch(fetchAdBanners({ page: page, size: size }));

  };




  const dropdownMenu = (row) => (
    <Menu>
      <Menu.Item>
        <Flex alignItems="center">
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
      render: (logo) => <img src={logo} alt="Logo" style={{ width: 80,height:50 }} />,
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
      render: (_, record) => <span>{record.event.event_name}</span>,
      sorter: (a, b) => a.event.event_name.localeCompare(b.event.event_name),
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

export default CategoryList;
