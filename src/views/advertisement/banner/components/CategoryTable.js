import React from "react";
import { Table, Input, Button, Select, Menu } from "antd";
import { SearchOutlined, FormOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import EllipsisDropdown from "components/shared-components/EllipsisDropdown";
import UpdateStatusModal from "components/util-components/ModalItems/UpdateStatusModal";

const { Option } = Select;

const CategoryTable = ({
  categories,
  loading,
  onSearch,
  onFilterStatus,
  onUpdateStatus,
  responseMessage,
  updateCategory,
  fetchCategories,
}) => {
  const navigate = useNavigate();

  const dropdownMenu = (row) => (
    <Menu>
      <Menu.Item onClick={() => navigate(`/category/edit/${row.id}`)}>
        View Details
      </Menu.Item>
      <Menu.Item>Add to remark</Menu.Item>
    </Menu>
  );

  const columns = [
    {
      title: "Category Name",
      dataIndex: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Description",
      dataIndex: "description",
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (_, record) => (
        <Button
          type={record.status ? "primary" : "default"}
          onClick={() => onUpdateStatus(record)}
        >
          {record.status ? "Active" : "Inactive"}
        </Button>
      ),
    },
    {
      title: "",
      dataIndex: "actions",
      render: (_, record) => (
        <EllipsisDropdown menu={dropdownMenu(record)} />
      ),
    },
  ];

  return (
    <div>
      <Input
        placeholder="Search Categories"
        prefix={<SearchOutlined />}
        onChange={(e) => onSearch(e.target.value)}
        className="mb-2"
      />
      <Select
        defaultValue="All"
        onChange={onFilterStatus}
        className="w-100 mb-2"
      >
        <Option value="All">All Categories</Option>
        <Option value="Active">Active</Option>
        <Option value="Inactive">Inactive</Option>
      </Select>
      <Button
        type="primary"
        icon={<FormOutlined />}
        block
        onClick={() => navigate("/category/add")}
        className="mb-3"
      >
        Add Category
      </Button>
      <Table
        columns={columns}
        dataSource={categories}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
      <UpdateStatusModal
        responseMessage={responseMessage}
        editFunction={updateCategory}
        getAllFunction={fetchCategories}
      />
    </div>
  );
};

export default CategoryTable;

