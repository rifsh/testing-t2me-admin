import React, { useEffect, useState } from "react";
import { Card, Table, Input, Tabs, Button, Select, Menu } from "antd";
import {
  FormOutlined,
  SearchOutlined,
  EyeOutlined,
  PlusCircleOutlined,
  EditOutlined,
} from "@ant-design/icons";
import Flex from "components/shared-components/Flex";
import EllipsisDropdown from "components/shared-components/EllipsisDropdown";
import { useDispatch, useSelector } from "react-redux";
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
  filterCategory,
  setFormTabKey,
} from "store/slices/categorySlice";

const { TabPane } = Tabs;
const { Option } = Select;

// Inline truncateText function as fallback
const truncateText = (text, maxLength = 50) => {
  if (!text) return "";
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

const CategoryList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(null);

  const {
    filteredCategories,
    filteredSubCategories,
    pagination,
    subPagination,
    loading,
    message: responseMessage,
    activeTab,
  } = useSelector((state) => state.category);

  useEffect(() => {
    dispatch(fetchCategories({ page: 1, size: 10 }));
    dispatch(
      fetchSubcategories({ categoryId: null, data: { page: 1, size: 10 } })
    );
  }, [dispatch]);

  const handleSearch = (value) => {
    dispatch(filterCategory({ searchTerm: value, type: "category" }));
  };

  const handleSubCategorySearch = (value) => {
    dispatch(
      filterCategory({ searchTerm: value, status: null, type: "subCategory" })
    );
  };
  const handlePagination = (page, size, type) => {
    if (type === "category") {
      dispatch(fetchCategories({ page: page, size: size }));
    }
    if (type === "subCategory") {
      dispatch(
        fetchSubcategories({
          categoryId: null,
          data: { page: page, size: size },
        })
      );
    }
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
    if (value === 0) {
      setSelectedCategory(value);
      dispatch(
        fetchSubcategories({ categoryId: null, data: { page: 1, size: 10 } })
      );
    } else {
      setSelectedCategory(value);
      dispatch(
        fetchSubcategories({ categoryId: value, data: { page: 1, size: 10 } })
      );
    }
  };

  const dropdownMenu = (row) => (
    <Menu>
      {/* <Menu.Item
        // onClick={() => navigate(`${APP_PREFIX_PATH}/category/edit/${row.id}`)}
      >
        <Flex alignItems="center">
          <EyeOutlined />
          <span className="ml-2">View Details</span>
        </Flex>
      </Menu.Item> */}
      <Menu.Item>
        <Flex alignItems="center">
          <EditOutlined />
          <span className="ml-2">Edit Category</span>
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
      title: "Category Name",
      dataIndex: ["category", "name"],
      sorter: (a, b) => Utils.antdTableSorter(a, b, ["category", "name"]),
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
      <Tabs activeKey={activeTab} onChange={handleTabChange}>
        <TabPane tab="Categories" key="categories">
          <Flex alignItems="center" justifyContent="space-between">
            <div className="mr-md-3 mb-3">
              <Input
                placeholder="Search Categories"
                prefix={<SearchOutlined />}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <div>
              <Button
                type="primary"
                icon={<FormOutlined />}
                onClick={() => {
                  dispatch(setFormTabKey(1));
                  return navigate(`${APP_PREFIX_PATH}/category/add`);
                }}
              >
                Add Category
              </Button>
            </div>
          </Flex>
          <Table
            columns={categoryColumns}
            dataSource={filteredCategories}
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

          <UpdateStatusModal
            responseMessage={responseMessage}
            editFunction={updateCategory}
            getAllFunction={fetchCategories}
          />
        </TabPane>
        <TabPane tab="Subcategories" key="subcategories">
          <Flex alignItems="center" justifyContent="space-between">
            <Flex alignItems="center" justifyContent="start">
              <div className="mb-3" style={{ paddingRight: "10px" }}>
                <Input
                  placeholder="Search Categories"
                  prefix={<SearchOutlined />}
                  onChange={(e) => handleSubCategorySearch(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <Select
                  placeholder="Select Category"
                  style={{ minWidth: 180 }}
                  onSelect={handleCategorySelect}
                  value={selectedCategory}
                >
                  <Option key={0} value={0}>
                    All Category
                  </Option>
                  {filteredCategories.map((category) => (
                    <Option key={category.id} value={category.id}>
                      {category.name}
                    </Option>
                  ))}
                </Select>
              </div>
            </Flex>
            <div>
              <Button
                type="primary"
                icon={<FormOutlined />}
                onClick={() => {
                  dispatch(setFormTabKey(2));
                  return navigate(`${APP_PREFIX_PATH}/category/add`);
                }}
              >
                Add Sub Category
              </Button>
            </div>
          </Flex>
          <Table
            columns={subCategoryColumns}
            dataSource={filteredSubCategories}
            rowKey="subId"
            loading={loading}
            pagination={{
              current: subPagination.page,
              pageSize: subPagination.size,
              total: subPagination.total,
              onChange: (page, pageSize) =>
                handlePagination(page, pageSize, "subCategory"),
            }}
          />
          <UpdateStatusModal
            responseMessage={responseMessage}
            editFunction={editSubCategory}
            getAllFunction={fetchSubcategories}
          />
        </TabPane>
      </Tabs>
    </Card>
  );
};

export default CategoryList;
