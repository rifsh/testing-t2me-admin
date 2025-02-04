import { FormOutlined } from '@ant-design/icons';
import {Card, Col, Button} from "antd";

const { Row } = require("antd")

const FaqList = () => {
    return (
        <Card>
            <Row gutter={16} justify = {"space-between"} style={{marginBottom: 16}}>
                <Col xs={24} sm={8} style={{textAlign: "right"}}>
                <Button
                type="primary"
                icon={<FormOutlined/>}
                >
                    Add
                </Button>
                </Col>
                <Col xs={24} sm={8} style={{textAlign: "right"}}>
                <Button
                type="primary"
                icon={<FormOutlined/>}
                >
                    Add Faq
                </Button>
                </Col>
            </Row>
        </Card>
    )
};

export default FaqList;