import React, { useState } from "react";
import { Input, Select } from "antd";
import { useDispatch } from "react-redux";
import Flex from "components/shared-components/Flex";

const { Option } = Select;
const { Search } = Input;

const SearchBarWithStatus = ({ fetchFunction, additionalParams }) => {
  const dispatch = useDispatch();
  const [searchValue, setSearchValue] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);

  const handleSearch = (value) => {
    if (value) {
      setSearchValue(value || null);
      dispatch(
        fetchFunction({
          ...additionalParams,
          search: value || null,
          page: 1,
          size: 10,
          active: statusFilter,
        })
      );
    }
  };
  const handleSearchIsEmpty = (value) => {
    console.log("enterd is empty search");
    if (!value) {
      console.log("is empty search");
      setSearchValue(null);
      dispatch(
        fetchFunction({
          ...additionalParams,
          search: null,
          page: 1,
          size: 10,
          active: statusFilter,
        })
      );
    }
  };

  const handleStatusChange = (status) => {
    setStatusFilter(status);

    dispatch(
      fetchFunction({
        ...additionalParams,
        search: searchValue,
        page: 1,
        size: 10,
        active:status,
      })
    );
  };

  return (
    <Flex className="mb-1" mobileFlex={false}>
      {/* Search Input */}
      <div className="mr-md-3 mb-3">
        <Search
          placeholder="Search"
          onChange={(e) => handleSearchIsEmpty(e.target.value)}
          onSearch={handleSearch}
          style={{ width: 200 }}
        />
      </div>

      {/* Status Dropdown */}
      <div className="mb-3">
        <Select
          defaultValue="All"
          onChange={handleStatusChange}
          className="mr-2"
          style={{ minWidth: 180 }}
        >
          <Option value={null}>All</Option>
          <Option value={true}>Active</Option>
          <Option value={false}>Inactive</Option>
        </Select>
      </div>
    </Flex>
  );
};

export default SearchBarWithStatus;
