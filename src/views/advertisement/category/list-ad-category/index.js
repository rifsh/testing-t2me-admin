import React, { useEffect, useState } from "react";
import { Card, Table, Input, Tabs, Button, Select, Menu } from "antd";
import { FormOutlined, SearchOutlined, EditOutlined,EyeOutlined, } from "@ant-design/icons";
import Flex from "components/shared-components/Flex";
import EllipsisDropdown from "components/shared-components/EllipsisDropdown";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import Utils from "utils";
import { setSelectedItem } from "store/slices/modalSlice";
import UpdateStatusModal from "components/util-components/ModalItems/UpdateStatusModal";
import {
  fetchAdCategories,
  updateAdCategory
} from "store/slices/adCategorySlice";
import SearchBarWithStatus from "components/util-components/Search/SearchBarWithStatus";

const { TabPane } = Tabs;
const { Option } = Select;

const CategoryList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [modalType, setModalType] = useState("category");

  const {
    filteredAdCategories,
    pagination,
    subPagination,
    loading,
    editable_status,
    message: responseMessage,
  } = useSelector((state) => state.adCategory);

  useEffect(() => {
    dispatch(fetchAdCategories({ page: 1, size: 10 }));
  }, [dispatch]);



  const handlePagination = (page, size, type) => {
    if (type === "category") {
      dispatch(fetchAdCategories({ page: page, size: size }));
    }
  };

  const handleUpdateStatus = (item) => {
    const newStatus = !item.status;
    const data = { status: newStatus, id: item.id };
    dispatch(setSelectedItem(data));
  };

  

  const dropdownMenu = (row) => (
    <Menu>
        <Menu.Item>
          <Flex alignItems="center" >
            <EyeOutlined />
            <span className="ml-2">View Details</span>
          </Flex>
        </Menu.Item>
      <Menu.Item>
        <Flex alignItems="center">
          <EditOutlined />
          <span className="ml-2">
           Edit Category
          </span>
        </Flex>
      </Menu.Item>
    </Menu>
  );
  

  const categoryColumns = [
    {
      title: "Category Name",
      dataIndex: "name",
      render: (_, record) => <span>{record.name}</span>,
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Description",
      dataIndex: "description",
      render: (_, record) => (
        <span>{Utils.truncateText(record.description)}</span>
      ),
      sorter: (a, b) =>
        (a.description || "").localeCompare(b.description || ""),
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
    if (modalType === "category") {
      return {
        responseMessage: responseMessage,
        editable_status: editable_status,
        editFunction: updateAdCategory,
        getAllFunction: (pageData) => fetchAdCategories(pageData),
        pageData: { page: 1, size: 10 },
      };
    }
  };

  return (
    <Card>  
          <Flex alignItems="center" justifyContent="space-between">
            <SearchBarWithStatus fetchFunction={fetchAdCategories} />
            <div>
              <Button
                type="primary"
                icon={<FormOutlined />}
                onClick={() => {
                  return navigate(`${APP_PREFIX_PATH}/advertisement/category/add`);
                }}
              >
                Add Category
              </Button>
            </div>
          </Flex>
          <Table
            columns={categoryColumns}
            dataSource={filteredAdCategories}
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
      <UpdateStatusModal {...getModalProps()} />
    </Card>
  );
};

export default CategoryList;
