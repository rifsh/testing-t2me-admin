import FaqFormFields from "../components/faqFormFields";
import { Form } from "antd";

const {
  default: PageHeaderAlt,
} = require("components/layout-components/PageHeaderAlt");

const ADD = "ADD";
const EDIT = "EDIT";

const FaqForm = ({ mode }) => {
  return (
    <>
      <Form
        layout="vertical"
        name="advanced search"
        className="ant-advanced-search-form"
        initialValues={{
          heightUnit: "cm",
          widthUnit: "cm",
          weightUnit: "kg",
        }}
      >
        <PageHeaderAlt className="border-bottom" overlap>
          <div className="container"></div>
        </PageHeaderAlt>
        <div className="container" style={{ marginTop: 100 }}>
          <FaqFormFields mode={mode} />
        </div>
      </Form>
    </>
  );
};
export default FaqForm;
