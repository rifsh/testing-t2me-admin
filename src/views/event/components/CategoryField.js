import { Card, Col, Form, Select } from "antd";
import {
  fetchCategories,
  fetchSubcategories,
} from "store/slices/categorySlice";
import { useDispatch, useSelector } from "react-redux";
import { RulesMessageConstants } from "constants/RulesConstant";

const { Option } = Select;

const CategoryField = () => {
  const rules = {
    category: [{ required: true, message: RulesMessageConstants.PLACE }],
    subCategory: [{ required: true, message: RulesMessageConstants.VENUE }],
  };
  const dispatch = useDispatch();
  const { filteredCategories, subcategories, loading } = useSelector(
    (state) => state.category
  );

  const fetchCategoryItems = () => {  
    dispatch(fetchCategories());
  };
  const fetchSubCategoryItems = (categoryId) => {
    dispatch(fetchSubcategories(categoryId));
  };

  return (
    <Col xs={24} sm={24} md={17}>
      <Card xs={24} sm={24} md={17}>
        <Form.Item name="category_id" label="Category" rules={rules.category}>
          <Select
            className="w-100"
            placeholder="Choose a Category"
            onClick={fetchCategoryItems}
            onSelect={(value) => fetchSubCategoryItems(value)}
            loading={loading}
          >
            {filteredCategories.map((elm) => (
              <Option key={elm.name} value={elm.id}>
                {elm.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="sub_category_id"
          label="Sub Category"
          rules={rules.subCategory}
        >
          <Select
            className="w-100"
            placeholder="Choose a Sub Category"
            disabled={!subcategories}
          >
            {subcategories &&
              subcategories.map((sub) => (
                <Option key={sub.name} value={sub.id}>
                  {sub.name}
                </Option>
              ))}
          </Select>
        </Form.Item>
      </Card>
    </Col>
  );
};

export default CategoryField;
