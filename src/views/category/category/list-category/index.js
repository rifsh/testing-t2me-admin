import React, { useEffect, useState } from "react";
import { Card, Table, Select, Input, Button, Tabs, Spin } from "antd";
import { SearchOutlined, FormOutlined } from "@ant-design/icons";
import Flex from "components/shared-components/Flex";
import dayjs from "dayjs";
import { DATE_FORMAT_DD_MM_YYYY } from "constants/DateConstant";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategory } from "store/slices/categorySlice";
import { useNavigate } from "react-router-dom";
import { debounce } from "lodash";
import { APP_PREFIX_PATH } from "configs/AppConfig";

const { Option } = Select;

const CategoryList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { categories, loading } = useSelector((state) => state.category);

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCategories, setFilteredCategories] = useState([]);

  useEffect(() => {
    dispatch(fetchCategory());
  }, [dispatch]);

  useEffect(() => {
    setFilteredCategories(categories);
  }, [categories]);

  const handleSearch = debounce((value) => {
    setSearchTerm(value);
    if (value) {
      const filtered = categories.filter((cat) =>
        cat.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredCategories(filtered);
    } else {
      setFilteredCategories(categories);
    }
  }, 300);

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
      title: "Date",
      dataIndex: "createdDate",
      render: (date) => dayjs(date).format(DATE_FORMAT_DD_MM_YYYY),
    },
  ];

  return (
    <Card>
      <Flex alignItems="center" justifyContent="space-between">
        <Input
          placeholder="Search"
          prefix={<SearchOutlined />}
          onChange={(e) => handleSearch(e.target.value)}
          value={searchTerm}
        />
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
          <Spin size="large" />
        ) : (
          <Table
            columns={columns}
            dataSource={filteredCategories}
            rowKey="id"
          />
        )}
      </div>
    </Card>
  );
};

export default CategoryList;
