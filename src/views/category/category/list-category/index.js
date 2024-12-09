import React, { useEffect } from "react";
import { Card, Table, Input, Tabs, Button, Select, Menu, Dropdown, message } from "antd";
import { FormOutlined, SearchOutlined, EyeOutlined, PlusCircleOutlined, EllipsisOutlined } from "@ant-design/icons";
import Flex from "components/shared-components/Flex";
import Loading from "components/shared-components/Loading";
import {  updateCategory } from "store/slices/categorySlice";

import { useDispatch, useSelector } from "react-redux";
import {
  fetchCategories,
  fetchSubcategories,
  setSearchTerm,
  setActiveTab,
} from "store/slices/categorySlice";
import { useNavigate } from "react-router-dom";
import { APP_PREFIX_PATH } from "configs/AppConfig";

const { TabPane } = Tabs;

const EllipsisDropdown = ({ menu }) => (
  <Dropdown overlay={menu} trigger={["click"]}>
    <Button icon={<EllipsisOutlined />} type="text" />
  </Dropdown>
);

const CategoryList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const {
    filteredCategories,
    subcategories,
    selectedCategoryId,
    loading,
    activeTab,
  } = useSelector((state) => state.category);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleSearch = (e) => {
    dispatch(setSearchTerm(e.target.value));
  };

  const handleRowClick = (record) => {
    dispatch(fetchSubcategories(record.id));
    dispatch(setActiveTab("subcategories"));
  };

  const handleTabChange = (key) => {
    dispatch(setActiveTab(key));
  };

  const dropdownMenu = (row) => {
    
  
    return (
      <Menu>
        <Menu.Item
          key="1"
          onClick={() => navigate(`${APP_PREFIX_PATH}/category/edit`, { state: { mode: "EDIT", id: row.id } })}
        >
          <Flex alignItems="center">
            <EyeOutlined />
            <span className="ml-2">Edit Details</span>
          </Flex>
        </Menu.Item>
        <Menu.Item
          key="2"
          onClick={async () => {
            try {
              // Dispatch updateCategory with toggled status
              const resultAction = await dispatch(updateCategory({ id: row.id, status: false}));
  
              if (updateCategory.fulfilled.match(resultAction)) {
                message.success(`Category ${row.name} status updated `);
                navigate(`${APP_PREFIX_PATH}/category/list`);
              }
            } catch (error) {
              message.error("Failed to update category status");
              console.error(error);
            }
          }}
        >
          <Flex alignItems="center">
            <PlusCircleOutlined />
            <span className="ml-2">Block</span> {/* Change button text */}
          </Flex>
        </Menu.Item>
      </Menu>
    );
  };
  const categoryColumns = [
    {
      title: "ID",
      dataIndex: "id",
      sorter: (a, b) => Number(a.id) - Number(b.id),
    },
    {
      title: "Category Name",
      dataIndex: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Status",
      dataIndex: "status",
      sorter: (a, b) => a.status.localeCompare(b.status),
    },
    {
      title: "",
      dataIndex: "actions",
      render: (_, elm) => {
        console.log(elm, "Actions data");
        return (
          <div className="text-right">
            <EllipsisDropdown menu={dropdownMenu(elm)} />
          </div>
        );
      },
    },
  ];

  const subCategoryColumns = [
    {
      title: "ID",
      dataIndex: "id",
    },
    {
      title: "Subcategory Name",
      dataIndex: "name",
    },
    {
      title: "Status",
      dataIndex: "status",
    },
  ];

  return (
    <Card>
      <Flex alignItems="center" justifyContent="space-between" mobileFlex={false}>
        <Flex className="mb-1" mobileFlex={false}>
          <Input
            placeholder="Search Categories"
            prefix={<SearchOutlined />}
            onChange={handleSearch}
            className="mr-md-3 mb-3"
          />
          <Select
            defaultValue="All"
            className="w-100"
            style={{ minWidth: 180 }}
            placeholder="Status"
          >
            <Select.Option value="All">All</Select.Option>
            <Select.Option value="Active">Active</Select.Option>
            <Select.Option value="Inactive">Inactive</Select.Option>
          </Select>
        </Flex>
        <Button
          type="primary"
          icon={<FormOutlined />}
          onClick={() => navigate(`${APP_PREFIX_PATH}/category/add`, { state: { mode: "ADD" } })}
        >
          Add Category
        </Button>
      </Flex>

      <div style={{ marginTop: 20 }}>
        {loading ? (
          <Loading />
        ) : (
          <Tabs activeKey={activeTab} onChange={handleTabChange}>
            <TabPane tab="Categories" key="categories">
              <Table
                columns={categoryColumns}
                dataSource={filteredCategories}
                rowKey="id"
                pagination={false}
                onRow={(record) => ({
                  onClick: (event) => {
                    if (!event.target.closest(".ant-dropdown-trigger")) {
                      handleRowClick(record);
                    }
                  },
                })}
              />
            </TabPane>
            <TabPane
              tab="Subcategories"
              key="subcategories"
              disabled={!selectedCategoryId}
            >
              {subcategories.length > 0 ? (
                <Table
                  columns={subCategoryColumns}
                  dataSource={subcategories}
                  rowKey="id"
                  pagination={false}
                />
              ) : (
                <p>No Subcategories</p>
              )}
            </TabPane>
          </Tabs>
        )}
      </div>
    </Card>
  );
};

export default CategoryList;
