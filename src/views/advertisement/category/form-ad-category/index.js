import Flex from "components/shared-components/Flex";
import React, { useEffect } from "react";
import { Tabs, Form } from "antd";
import PageHeaderAlt from "components/layout-components/PageHeaderAlt";
import CategoryFormFields from "../components/CategoryFormFields";
import SubCategoryFormFields from "../components/SubCategoryFormFields";
import { useSelector } from "react-redux";

const ADD = "ADD";
const EDIT = "EDIT";

const CategoryForm = ({ mode = ADD, id }) => {
  const { activeTab } = useSelector((state) => state.category);
  const category = useSelector((state) =>
    state.category.categories.find((cat) => cat.id === id)
  );

  return (
    <Form
      layout="vertical"
      name="category-form"
      className="ant-advanced-search-form"
    >
      <PageHeaderAlt className="border-bottom" overlap>
        <div className="container">
          <Flex
            className="py-2"
            mobileFlex={false}
            justifyContent="space-between"
            alignItems="center"
          >
            <h2 className="mb-3">
              {mode === ADD ? "Add New Category" : "Edit Category"}
            </h2>
          </Flex>
        </div>
      </PageHeaderAlt>
      <div className="container">
        <Tabs
          defaultActiveKey={activeTab}
          style={{ marginTop: 30 }}
          items={[
            {
              label: "Category",
              key: "categories",
              children: <CategoryFormFields mode={mode} category={category} />,
            },
            
          ]}
        />
      </div>
    </Form>
  );
};

export default CategoryForm;
