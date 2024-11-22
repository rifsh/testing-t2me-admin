import { Card, Form, Select } from "antd";
import React, { useState } from "react";

import categoryListData from "assets/data/category-list.json";

const { Option } = Select;

const CategoryField = () => {
  const [categoryList] = useState(categoryListData);
  const [selectedCategory, setSelectedCategory] = useState();

  const handleCategoryChange = (value) => {
    const selected = categoryList.find((category) => category.category === value);
    setSelectedCategory(selected);
  };

  return (
    <Card>
      <Form.Item name="category" label="Category">
        <Select
          className="w-100"
          placeholder="Choose a Category"
          onChange={handleCategoryChange}
        >
          {categoryList.map((elm) => (
            <Option key={elm.category} value={elm.category}>
              {elm.category}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item name="subCategory" label="Sub Category">
        <Select className="w-100" placeholder="Choose a Sub Category" disabled={!selectedCategory}>
          {selectedCategory &&
            selectedCategory.subCategory.map((sub) => (
              <Option key={sub.subcategoryName} value={sub.subcategoryName}>
                {sub.subcategoryName}
              </Option>
            ))}
        </Select>
      </Form.Item>
    </Card>
  );
};

export default CategoryField;
