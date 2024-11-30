import React, { useEffect } from "react";
import { Card, Table, Input, Tabs, Button, Select } from "antd";
import { FormOutlined, SearchOutlined } from "@ant-design/icons";
import Flex from "components/shared-components/Flex";
import Loading from "components/shared-components/Loading";
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
          onClick={() => navigate(`${APP_PREFIX_PATH}/category/add`)}
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
                  onClick: () => handleRowClick(record),
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
