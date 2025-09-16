import React from "react";
import { Button, Col, Row } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const BackButton = ({ path, label = "Back", icon = <ArrowLeftOutlined /> }) => {
    const navigate = useNavigate();

    const handleBack = () => {
        if (path) {
            navigate(path);
        } else {
            navigate(-1); // fallback to previous page
        }
    };

    return (
        <Row style={{ marginBottom: 16 }}>
            <Col>
                <Button className="mr-2" icon={icon} onClick={handleBack}>
                    {label}
                </Button>
            </Col>
        </Row>
    );
};

export default BackButton;
