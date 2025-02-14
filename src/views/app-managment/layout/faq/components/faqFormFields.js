// FaqFormFields.js
import React, { useState, useEffect } from "react";
import { Input, Row, Form, Card, Col, Button, message, Select } from "antd";
import Flex from "components/shared-components/Flex";
import { useNavigate } from "react-router-dom";
import DiscardButton from "components/shared-components/Buttons/DiscardButton";
import { fetchAllFaqs, addFaq } from "store/slices/faqSlice";
import { useDispatch, useSelector } from "react-redux";
import { filterOption } from "components/util-components/FormItems/dropDownSearch";
import { APP_PREFIX_PATH } from "configs/AppConfig";

const FaqFormFields = ({ mode }) => {
  const navigate = useNavigate();
  const { Option } = Select;
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [questions, setQuestions] = useState([{ question: "", reply: "" }]);

  const { submitting, error, loading, faqSections } = useSelector(
    (state) => state.faqs
  );

  useEffect(() => {
    dispatch(fetchAllFaqs());
  }, [dispatch]);

  // Show error message if there's an error
  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  const handleAddQuestion = () => {
    setQuestions([...questions, { question: "", reply: "" }]);
  };

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
  };

  const handleRemoveQuestion = (index) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
  };

  const handleAdd = async () => {
    try {
      // Validate all form fields
      const values = await form.validateFields();

      // Validate questions
      if (questions.some((q) => !q.question || !q.reply)) {
        message.error("Please fill in all questions and replies");
        return;
      }

      // Dispatch addFaq action
      const result = await dispatch(
        addFaq({
          category: values.category,
          questions,
        })
      ).unwrap();

      // Reset form on success
      form.resetFields();
      setQuestions([{ question: "", reply: "" }]);
      navigate(`${APP_PREFIX_PATH}/app/management/layout/faq/list`);
      dispatch(fetchAllFaqs());

      message.success("FAQ added successfully");
    } catch (error) {
      if (error.errorFields) {
        message.error("Please fill in all required fields");
      }
    }
  };

  return (
    <Row gutter={16}>
      <Col xs={24} sm={24} md={17}>
        <Form
          form={form}
          layout="vertical"
          name="faq_form"
          className="ant-advanced-search-form"
        >
          <Card title="Add FAQ's">
            {/* <Form.Item
              name="category"
              label="Category"
              rules={[{ required: true, message: "Please input category!" }]}
            >
              <Input placeholder="Enter FAQ Category" />
            </Form.Item> */}

            <Form.Item name="category" label="Section">
              <Select
                className="w-100"
                placeholder="Choose a Section"
                showSearch
                filterOption={filterOption}
                loading={loading}
                // onChange={(id) => handleCountrySelect(id)}
              >
                {faqSections && faqSections.length > 0 ? (
                  faqSections.map((secion) => (
                    <Option key={secion} value={secion}>
                      {secion}
                    </Option>
                  ))
                ) : (
                  <Option disabled>No sections available</Option>
                )}
              </Select>
            </Form.Item>

            {questions.map((question, index) => (
              <div key={index} className="mb-4">
                <Form.Item
                  label={`Question ${index + 1}`}
                  rules={[
                    { required: true, message: "Please input question!" },
                  ]}
                >
                  <Input
                    placeholder="Enter FAQ Question"
                    value={question.question}
                    onChange={(e) =>
                      handleQuestionChange(index, "question", e.target.value)
                    }
                  />
                </Form.Item>

                <Form.Item
                  label={`Reply ${index + 1}`}
                  rules={[{ required: true, message: "Please input reply!" }]}
                >
                  <Input.TextArea
                    rows={4}
                    placeholder="Enter your reply"
                    value={question.reply}
                    onChange={(e) =>
                      handleQuestionChange(index, "reply", e.target.value)
                    }
                  />
                </Form.Item>

                {questions.length > 1 && (
                  <Button
                    type="danger"
                    onClick={() => handleRemoveQuestion(index)}
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}

            <Button
              type="dashed"
              onClick={handleAddQuestion}
              style={{ width: "100%", marginBottom: 16 }}
            >
              Add Question
            </Button>
          </Card>

          <Flex
            className="py-2"
            mobileFlex={false}
            justifyContent="space-between"
          >
            <DiscardButton />
            <Button
              type="primary"
              onClick={handleAdd}
              loading={submitting}
              disabled={submitting}
            >
              {submitting ? "Adding..." : mode === "ADD" ? "Add" : "Save"}
            </Button>
          </Flex>
        </Form>
      </Col>
    </Row>
  );
};

export default FaqFormFields;
