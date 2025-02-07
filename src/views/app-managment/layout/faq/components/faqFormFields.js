import React, { useState } from "react";
import { Input, Row, Form, Card, Col, Button } from "antd";
import Flex from "components/shared-components/Flex";
import DiscardButton from "components/shared-components/Buttons/DiscardButton";

const FaqFormFields = ({ mode }) => {
    const [form] = Form.useForm();
    const [questions, setQuestions] = useState([{ question: "", reply: "" }]);

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

    const onFinish = (values) => {
        console.log("Form values:", values);
    };

    return (
        <Row gutter={16}>
            <Col xs={24} sm={24} md={17}>
                <Form
                    form={form}
                    layout="vertical"
                    name="venue_form"
                    className="ant-advanced-search-form"
                    onFinish={onFinish}
                >
                    <Card title="Add Faq's">
                        <Form.Item
                            name="category"
                            label="Category"
                        >
                            <Input placeholder="Select the Category" />
                        </Form.Item>

                        {questions.map((question, index) => (
                            <div key={index}>
                                <Form.Item
                                    label={`Question ${index + 1}`}
                                >
                                    <Input
                                        placeholder="Enter Faq Questions"
                                        value={question.question}
                                        onChange={(e) => handleQuestionChange(index, "question", e.target.value)}
                                    />
                                </Form.Item>

                                <Form.Item
                                    label={`Reply ${index + 1}`}
                                >
                                    <Input.TextArea
                                        rows={4}
                                        placeholder="Enter your replies"
                                        value={question.reply}
                                        onChange={(e) => handleQuestionChange(index, "reply", e.target.value)}
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
                        <Button type="primary" htmlType="submit">
                            {mode === "ADD" ? "Add" : "Save"}
                        </Button>
                    </Flex>
                </Form>
            </Col>
        </Row>
    );
};

export default FaqFormFields;