import React from "react";
import { Input, Row, Form, Card, Col, Button } from "antd";
import Flex from "components/shared-components/Flex";
import DiscardButton from "components/shared-components/Buttons/DiscardButton";

const FaqFormFields = ({ mode }) => {
    return (
        <Row gutter={16}>
            <Col xs={24} sm={24} md={17}>
                <Form
                    layout="vertical"
                    name="venue_form"
                    className="ant-advanced-search-form">
                    <Card title="Add Faq's">
                    <Form.Item
                            name=""
                            label="Category"
                        >
                            <Input placeholder="Select the Category" />
                        </Form.Item>

                        <Form.Item
                            name=""
                            label="Faq's"
                        >
                            <Input placeholder="Enter Faq Questions" />
                        </Form.Item>

                        <Form.Item
                            name=""
                            label="Replies"

                        >
                            <Input.TextArea
                                rows={4}
                                placeholder="Enter your replies"
                            />
                        </Form.Item>
                        
                    </Card>
                    <Flex
              className="py-2"
              mobileFlex={false}
              justifyContent="space-between"
            >
              <DiscardButton />
              <Button type="primary">
                {mode === "ADD" ? "Add" : "Save"}
              </Button>
            </Flex>
                </Form>
            </Col>
        </Row>
    )
}
export default FaqFormFields;