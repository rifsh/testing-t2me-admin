import React, { useState } from "react";
import { AutoComplete, Input, Select } from "antd";
import { useDispatch } from "react-redux";
import Flex from "components/shared-components/Flex";

const { Option } = Select;
const { Search } = Input;

const SearchBarWithStatus = ({ fetchFunction, additionalFilters = [] }) => {
  const dispatch = useDispatch();
  const [searchValue, setSearchValue] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [filterValues, setFilterValues] = useState({});

  const handleSearch = (value) => {
    if (value) {
      setSearchValue(value || null);
      dispatch(
        fetchFunction({
          search: value || null,
          page: 1,
          size: 10,
          active: statusFilter,
          ...filterValues,
        })
      );
    }
  };

  const handleSearchIsEmpty = (value) => {
    if (!value) {
      setSearchValue(null);
      dispatch(
        fetchFunction({
          search: null,
          page: 1,
          size: 10,
          active: statusFilter,
          ...filterValues,
        })
      );
    }
  };
  const handleFilterItemIsEmpty = (value) => {
    if (!value) {
      dispatch(
        fetchFunction({
          search: searchValue,
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
        search: searchValue,
        page: 1,
        size: 10,
        active: status,
        ...filterValues,
      })
    );
  };

  const handleFilterChange = (value, formName) => {
    const newFilterValues = {
      ...filterValues,
      [formName]: value,
    };
    setFilterValues(newFilterValues);

    dispatch(
      fetchFunction({
        search: searchValue,
        page: 1,
        size: 10,
        active: statusFilter,
        ...newFilterValues,
      })
    );
  };

  const getAutoCompleteOptions = (options = []) => {
    if (!Array.isArray(options)) return [];

    return options
      .map((option) => {
        // Ensure option and required properties exist
        if (!option || !option.name) return null;

        return {
          label: option.name,
          id:option.id ? option.id.toString() : "",
          value:option.name,
        };
      })
      .filter(Boolean); // Remove any null values
  };
  const handleAutoCompleteSelect = (value, option, formName) => {
    const selectedLabel = option.label; // Displayed value
    const selectedId = option.id; // Actual ID used for filtering
  
    setFilterValues((prev) => ({
      ...prev,
      [formName]: selectedId,
    }));
  
    dispatch(
      fetchFunction({
        search: searchValue,
        page: 1,
        size: 10,
        active: statusFilter,
        ...filterValues,
        [formName]: selectedId,
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
      <div className="mb-3 mr-md-3">
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

      {/* Dynamic Additional Filters */}
      {additionalFilters.map((filter, index) => {
        // Ensure filter has required properties
        if (!filter || !Array.isArray(filter.options)) return null;

        return (
          <div key={index} className="mb-3 mr-md-3">
            {filter.isAutoComplete ? (
              <AutoComplete
              options={getAutoCompleteOptions(filter.options)}
              style={{ width: 180 }}
              onChange={(e) => handleFilterItemIsEmpty(e)}
              placeholder={filter.placeholder || "Select"}
              onSelect={(value, option) => handleAutoCompleteSelect(value, option, filter.formName)}
              filterOption={(inputValue, option) =>
                option?.label?.toLowerCase().includes(inputValue.toLowerCase())
              }
            />
            
            ) : (
              <Select
                placeholder={filter.placeholder || "Select"}
                // onChange={(e) => handleFilterItemIsEmpty(e)}
                onSelect={(value) => handleFilterChange(value, filter.formName)}
                style={{ minWidth: 180 }}
                className="mr-2"
              >
                <Option value={null}>All</Option>
                {filter.options.map((option) =>
                  option && option.id && option.name ? (
                    <Option key={option.id} value={option.id}>
                      {option.name}
                    </Option>
                  ) : null
                )}
              </Select>
            )}
          </div>
        );
      })}
    </Flex>
  );
};

export default SearchBarWithStatus;
