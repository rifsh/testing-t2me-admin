/* eslint-disable no-unused-vars */
import React, { useState, useCallback } from "react";
import { Card, Table, Select, Input, Button, Tabs } from "antd";
import CategoryListData from "assets/data/category-list.json";
import {
  SearchOutlined,
  FormOutlined,
  EyeOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import Flex from "components/shared-components/Flex";
import dayjs from "dayjs";
import { DATE_FORMAT_DD_MM_YYYY } from "constants/DateConstant";
import utils from "utils";
import { useNavigate } from "react-router-dom";
import { debounce } from "lodash";
import { APP_PREFIX_PATH } from "configs/AppConfig";

const { Option } = Select;

const CountryList = () => {
  const [list, setList] = useState(CategoryListData);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter by status
  const handleShowStatus = (value) => {
    const filteredData =
      value !== "All"
        ? utils.filterArray(CategoryListData, "status", value)
        : CategoryListData;
    setList(filteredData);
  };

  // Debounced search handler
  const handleSearch = useCallback(
    debounce((value) => {
      const searchArray = value ? list : CategoryListData;
      const filteredData = utils.wildCardSearch(searchArray, value);
      setList(filteredData);
      setSelectedRowKeys([]);
    }, 500),
    []
  );

  // Table columns for category
  const categoryColumns = [
    {
      title: "Category Name",
      dataIndex: "category",
      render: (_, record) => <span>{record.category}</span>,
      sorter: (a, b) => utils.antdTableSorter(a, b, "category"),
    },
    {
      title: "Description",
      dataIndex: "description",
      render: (_, record) => <span>{record.description}</span>,
      sorter: (a, b) => utils.antdTableSorter(a, b, "description"),
    },
    {
      title: "Date",
      dataIndex: "createdDate",
      render: (_, record) => (
        <span>{dayjs(record.createdDate).format(DATE_FORMAT_DD_MM_YYYY)}</span>
      ),
      sorter: (a, b) => utils.antdTableSorter(a, b, "createdDate"),
    },
  ];

  // Table columns for subcategory
  const subCategoryColumns = [
    {
      title: "Category Name",
      dataIndex: "category",
      render: (_, record) => <span>{record.category}</span>,
    },
    {
      title: "Sub Category Name",
      dataIndex: "subCategory",
      render: (_, record) =>
        record.subCategory.map((sub) => (
          <div key={sub.subcategoryName}>{sub.subcategoryName}</div>
        )),
    },
    {
      title: "Description",
      dataIndex: "subCategory",
      render: (_, record) =>
        record.subCategory.map((sub) => <div key={sub.description}>{sub.description}</div>),
    },
    {
      title: "Date",
      dataIndex: "subCategory",
      render: (_, record) =>
        record.subCategory.map((sub) => (
          <div key={sub.createdDate}>
            {dayjs(sub.createdDate).format(DATE_FORMAT_DD_MM_YYYY)}
          </div>
        )),
    },
  ];

  const rowSelection = {
    onChange: (key, rows) => {
      setSelectedRows(rows);
      setSelectedRowKeys(key);
    },
  };

  const navigate = useNavigate();

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
              onChange={(e) => {
                setSearchTerm(e.target.value);
                handleSearch(e.target.value);
              }}
              value={searchTerm}
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
              <Option value="All">All Status</Option>
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
            Add Country
          </Button>
        </div>
      </Flex>
      <div className="table-responsive">
        <Tabs
          defaultActiveKey="1"
          style={{ marginTop: 30 }}
          items={[
            {
              label: "Category",
              key: "1",
              children: (
                <Table
                  columns={categoryColumns}
                  dataSource={list}
                  rowKey="category"
                  rowSelection={{
                    selectedRowKeys: selectedRowKeys,
                    type: "checkbox",
                    preserveSelectedRowKeys: false,
                    ...rowSelection,
                  }}
                />
              ),
            },
            {
              label: "Sub Category",
              key: "2",
              children: (
                <Table
                  columns={subCategoryColumns}
                  dataSource={list}
                  rowKey="category"
                />
              ),
            },
          ]}
        />
      </div>
    </Card>
  );
};

export default CountryList;
