import React from "react";
import { Modal, Form, Input, message } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { createSection, setModalVisible } from "store/slices/faqSlice";

const CreateSectionModal = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const { isModalVisible, addingSectionLoading, faqSections } = useSelector(
    (state) => state.faqs
  );

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      console.log(faqSections, "THIS IS SECTIONS");

      const isDuplicate = faqSections.some(
        (section) => section.toLowerCase() === values.sectionName.toLowerCase()
      );

      if (isDuplicate) {
        message.error(
          "Section name already exists. Please try a different name."
        );
        return;
      }

      await dispatch(createSection(values.sectionName)).unwrap();
      form.resetFields();
      message.success("Section created successfully");
    } catch (error) {
      if (error.errorFields) {
        message.error("Please enter a section name");
      } else {
        message.error(error || "Failed to create section");
      }
    }
  };

  const handleCancel = () => {
    dispatch(setModalVisible(false));
    form.resetFields();
  };

  return (
    <Modal
      title="Create New Section"
      open={isModalVisible}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={addingSectionLoading}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="sectionName"
          label="Section Name"
          rules={[{ required: true, message: "Please input section name!" }]}
        >
          <Input placeholder="Enter section name" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateSectionModal;
