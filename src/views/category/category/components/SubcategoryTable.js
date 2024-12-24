import React from "react";
import { Table, Select, Menu, Button } from "antd";
import EllipsisDropdown from "components/shared-components/EllipsisDropdown";
import UpdateStatusModal from "components/util-components/ModalItems/UpdateStatusModal";
import Utils from "utils";

const { Option } = Select;

const SubcategoryTable = ({
  subcategories,
  categories,
  loading,
  onCategorySelect,
  onUpdateStatus,
  responseMessage,
  editSubCategory,
  fetchSubcategories,
}) => {
  const dropdownMenu = (row) => (
    <Menu>
      <Menu.Item>View Details</Menu.Item>
      <Menu.Item>Add to remark</Menu.Item>
    </Menu>
  );

  const columns = [
    {
      title: "Subcategory Name",
      dataIndex: "name",
    },
    {
      title: "Category Name",
      dataIndex: ["category", "name"],
    },
    Utils.statusColumnUtil(onUpdateStatus),
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
      <Select
        placeholder="Select Category"
        className="w-100 mb-3"
        onChange={onCategorySelect}
      >
        {categories.map((category) => (
          <Option key={category.id} value={category.id}>
            {category.name}
          </Option>
        ))}
      </Select>
      <Table
        columns={columns}
        dataSource={subcategories}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
      <UpdateStatusModal
        responseMessage={responseMessage}
        editFunction={editSubCategory}
        getAllFunction={fetchSubcategories}
      />
    </div>
  );
};

export default SubcategoryTable;
