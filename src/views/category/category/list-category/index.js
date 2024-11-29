import React, { useEffect, useState } from "react";
import { Card, Table, Input, Tabs, Button, Spin, message } from "antd";
import { SearchOutlined, FormOutlined } from "@ant-design/icons";
import Flex from "components/shared-components/Flex";
import dayjs from "dayjs";
import { DATE_FORMAT_DD_MM_YYYY } from "constants/DateConstant";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategory } from "store/slices/categorySlice";
import { useNavigate } from "react-router-dom";
import { debounce } from "lodash";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import Loading from "components/shared-components/Loading";

const CategoryList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { categories, loading, error } = useSelector((state) => state.category);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCategories, setFilteredCategories] = useState([]);

  useEffect(() => {
    dispatch(fetchCategory());
  }, []);

  useEffect(() => {
    setFilteredCategories(categories);
  }, [categories]);

  useEffect(() => {
    if (error) message.error(error);
  }, [error]);


  const handleSearch = (e) => {
    dispatch(setSearchTerm(e.target.value));
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
    },
    {
      title: "Category Name",
      dataIndex: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
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
      <div className="table-responsive">
        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "300px",
            }}
          >
            <Loading />
          </div>
        ) : (
          <Tabs
            defaultActiveKey="1"
            style={{ marginTop: 30 }}
            items={[
              {
                label: "Category",
                key: "1",
                children: (
                  <Table
                    columns={columns}
                    dataSource={filteredCategories}
                    rowKey="id"
                  />
                ),
              },
              {
                label: "Sub Category",
                key: "2",
                children: (
                  <Table
                    columns={columns}
                    dataSource={filteredCategories}
                    rowKey="id"
                  />
                ),
              },
            ]}
          />
        )}
      </div>
    </Card>
  );
};

export default CategoryList;
