import React, { useEffect } from "react";
import PageHeaderAlt from "components/layout-components/PageHeaderAlt";
import { Form } from "antd";
import FooterFormFields from "../components/VenueFormFields";

const FooterForm = ({ mode }) => {
  return (
    <>
      <Form
        layout="vertical"
        name="advanced_search"
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
          <FooterFormFields mode={mode} />
        </div>
      </Form>
    </>
  );
};

export default FooterForm;
