import { Form } from "antd";
import React from "react";

import AddTableField from "../components/AddTableField";

const Index = () => {
  const [form] = Form.useForm();

  return (
    <Form form={form} layout="vertical">
      <div>
        <AddTableField />
      </div>
    </Form>
  );
};

export default Index;
