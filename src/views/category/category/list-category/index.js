import React, { useEffect, useState } from "react";
import { Card, Table, Input, Tabs, Button, Select, Menu, message } from "antd";
import {
  FormOutlined,
  SearchOutlined,
  EyeOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import Flex from "components/shared-components/Flex";
import EllipsisDropdown from "components/shared-components/EllipsisDropdown";
import { useDispatch, useSelector } from "react-redux";
// import {
//   fetchCategories,
//   fetchSubcategories,
//   setSearchTerm,
//   setActiveTab,
//   updateCategory,
//   filterCategories,
// } from "store/slices/categorySlice";
import { useNavigate } from "react-router-dom";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import Utils from "utils";
import { setSelectedItem } from "store/slices/modalSlice";
import UpdateStatusModal from "components/util-components/ModalItems/UpdateStatusModal";
import {
  fetchSubcategories,
  setSearchTerm,
  setActiveTab,
  updateCategory,
  filterCategories,
  fetchCategories,
  editSubCategory,
} from "store/slices/categorySlice";

const { TabPane } = Tabs;
const { Option } = Select;

const CategoryList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(null);

  const {
    filteredCategories,
    subcategories,
    loading,
    message: responseMessage,
    activeTab,
  } = useSelector((state) => state.category);

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchSubcategories());
  }, [dispatch]);

  const handleSearch = (value) => {
    dispatch(filteredCategories({ searchTerm: value, status: null }));
  };

  const handleShowStatus = (status) => {
    dispatch(filteredCategories({ searchTerm: null, status }));
  };

  const handleUpdateStatus = (item) => {
    const newStatus = !item.status;
    const data = { status: newStatus, id: item.id };
    dispatch(setSelectedItem(data));
  };

  const handleTabChange = (key) => {
    dispatch(setActiveTab(key));
  };

  const handleCategorySelect = (value) => {
    setSelectedCategory(value);
    dispatch(fetchSubcategories(value));
  };

  const dropdownMenu = (row) => (
    <Menu>
      <Menu.Item
        onClick={() => navigate(`${APP_PREFIX_PATH}/category/edit/${row.id}`)}
      >
        <Flex alignItems="center">
          <EyeOutlined />
          <span className="ml-2">View Details</span>
        </Flex>
      </Menu.Item>
      <Menu.Item>
        <Flex alignItems="center">
          <PlusCircleOutlined />
          <span className="ml-2">Add to remark</span>
        </Flex>
      </Menu.Item>
    </Menu>
  );
  const truncateText = (text, maxLength = 50) => {
    if (!text) return "";
    return text.length > maxLength
      ? `${text.substring(0, maxLength)}...`
      : text;
  };

  // Adjusted columns
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
      render: (_, record) => <span>{truncateText(record.description)}</span>,
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

  const subCategoryColumns = [
    {
      title: "Subcategory Name",
      dataIndex: "name",
      render: (_, record) => <span>{record.name}</span>,
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Parent Category",
      dataIndex: "parent_category",
      render: (_, record) => <span>{record.parent_category}</span>,
      sorter: (a, b) => a.parent_category.localeCompare(b.parent_category),
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

  return (
    <Card>
      <Flex
        alignItems="center"
        justifyContent="space-between"
        mobileFlex={false}
      >
        <Flex className="mb-1" mobileFlex={false}>
          <div className="mr-md-3 mb-3">
            <Input
              placeholder="Search"
              prefix={<SearchOutlined />}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <Select
              defaultValue="All"
              className="w-100"
              style={{ minWidth: 180 }}
              onChange={handleShowStatus}
              placeholder="Status"
            >
              <Option value="All">All Categories</Option>
              <Option value="Active">Active</Option>
              <Option value="Inactive">Inactive</Option>
            </Select>
          </div>
        </Flex>
        <div>
          <Button
            type="primary"
            icon={<FormOutlined />}
            block
            onClick={() => navigate(`${APP_PREFIX_PATH}/category/add`)}
          >
            Add Category
          </Button>
        </div>
      </Flex>

      <Tabs activeKey={activeTab} onChange={handleTabChange}>
        <TabPane tab="Categories" key="categories">
          <div className="table-responsive">
            <Table
              columns={categoryColumns}
              dataSource={filteredCategories}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 10,
                // showSizeChanger: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} items`,
              }}
            />
            <UpdateStatusModal
              responseMessage={responseMessage}
              editFunction={updateCategory}
              getAllFunction={fetchCategories}
            />
          </div>
        </TabPane>
        <TabPane tab="Subcategories" key="subcategories">
          <div className="mb-3">
            <Select
              placeholder="Select Category"
              className="mb-3"
              style={{ minWidth: 180 }}
              onChange={handleCategorySelect}
              value={selectedCategory}
            >
              {filteredCategories.map((category) => (
                <Option key={category.id} value={category.id}>
                  {category.name}
                </Option>
              ))}
            </Select>
          </div>
          <div className="table-responsive">
            <Table
              columns={subCategoryColumns}
              dataSource={subcategories}
              rowKey="subId"
              loading={loading}
              pagination={{
                pageSize: 10,
                // showSizeChanger: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} items`,
              }}
            />
            <UpdateStatusModal
              responseMessage={responseMessage}
              editFunction={editSubCategory}
              getAllFunction={fetchSubcategories}
            />
          </div>
        </TabPane>
      </Tabs>
    </Card>
  );
};

export default CategoryList;
