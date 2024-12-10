import React, { useEffect } from "react";
import { Modal, DatePicker, Form, Button } from "antd";
import moment from "moment";
import { useDispatch } from "react-redux";
import { updateSelectedOffer } from "store/slices/scheduleSlice";

const OfferDateModal = ({
  isModalVisible,
  handleModalClose,
  selectedItemForModal,
}) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  useEffect(() => {
    if (selectedItemForModal) {
      form.setFieldsValue({
        valid_from: moment(selectedItemForModal.start_date),
        valid_to: moment(selectedItemForModal.end_date),
      });
    }
  }, [selectedItemForModal, form]);

  const handleFormSubmit = (values) => {
    const { valid_from, valid_to } = values;

    dispatch(
      updateSelectedOffer({
        id: selectedItemForModal.id,
        start_date: valid_from ? moment(valid_from).format("YYYY-MM-DD") : null,
        end_date: valid_to ? moment(valid_to).format("YYYY-MM-DD") : null,
      })
    );

    handleModalClose();
  };

  return (
    <Modal
      title={selectedItemForModal ? selectedItemForModal.name : "Item Details"}
      visible={isModalVisible}
      onCancel={handleModalClose}
      footer={null}
    >
      {selectedItemForModal && (
        <Form form={form} onFinish={handleFormSubmit}>
          <div>
            <h3>{selectedItemForModal.name}</h3>
            <Form.Item
              label="Start Time"
              name="valid_from"
              rules={[
                { required: true, message: "Please select a start time" },
              ]}
            >
              <DatePicker
                format="YYYY-MM-DD"
                value={form.getFieldValue("valid_from")}
                onChange={(date) => form.setFieldsValue({ valid_from: date })}
              />
            </Form.Item>
            <Form.Item
              label="End Time"
              name="valid_to"
              rules={[{ required: true, message: "Please select an end time" }]}
            >
              <DatePicker
                format="YYYY-MM-DD"
                value={form.getFieldValue("valid_to")}
                onChange={(date) => form.setFieldsValue({ valid_to: date })}
              />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Save Changes
              </Button>
            </Form.Item>
          </div>
        </Form>
      )}
    </Modal>
  );
};

export default OfferDateModal;
