import { Card, Form, Select } from "antd";
import React, { useState } from "react";

import categoryListData from "assets/data/category-list.json";
import { fetchCategories, fetchSubcategories } from "store/slices/categorySlice";
import { useDispatch, useSelector } from "react-redux";

const { Option } = Select;

const CategoryField = () => {
  const [categoryList] = useState(categoryListData);
  const [selectedCategory, setSelectedCategory] = useState();
  const dispatch = useDispatch();
  const {
    filteredCategories,
    subcategories,
    selectedCategoryId,
    loading,
    activeTab,
  } = useSelector((state) => state.category);

  const handleCategoryChange = (value) => {
    const selected = categoryList.find(
      (category) => category.category === value
    );
    setSelectedCategory(selected);
  };

  const fetchCategoryItems = () => {
    dispatch(fetchCategories());
  };
  const fetchSubCategoryItems = (categoryId) => {
    dispatch(fetchSubcategories(categoryId));
  };
  
  return (
    <Card>
      <Form.Item name="category" label="Category">
        <Select
          className="w-100"
          placeholder="Choose a Category"
          onClick={fetchCategoryItems}
          onSelect={(value) => fetchSubCategoryItems(value)} 
          loading={loading}
        >
          {filteredCategories.map((elm) => (
            <Option key={elm.name} value={elm.id} >
              {elm.name}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item name="subCategory" label="Sub Category">
        <Select
          className="w-100"
          placeholder="Choose a Sub Category"
          disabled={!subcategories}
        >
          {subcategories &&
            subcategories.map((sub) => (
              <Option key={sub.name} value={sub.name}>
                {sub.name}
              </Option>
            ))}
        </Select>
      </Form.Item>
    </Card>
  );
};

export default CategoryField;
