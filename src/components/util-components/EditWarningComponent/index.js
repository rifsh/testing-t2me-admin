import React from 'react';
import { Col, Alert } from "antd";
import { TextConstants } from "constants/TextConstant";

export const EditWarningAlert = () => {
    return (
        <Col xs={24} sm={24} md={17}>
            <Alert
                message="Warning"
                description={TextConstants.DefaultEditContent2}
                type="warning"
                showIcon
            />
        </Col>
    )
}

