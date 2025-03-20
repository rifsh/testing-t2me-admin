import { Button, Col, Row } from 'antd'
import React from 'react'
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { APP_PREFIX_PATH } from 'configs/AppConfig';

const BackPageButoon = ({ path }) => {
    const navigate = useNavigate();
    const handleBackToList = () => {
        navigate(`${path}`);
    };

    return (
        <>
            <Row style={{ marginBottom: 16 }}>
                <Col>
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={handleBackToList}
                    >
                        Back to Screen List
                    </Button>
                </Col>
            </Row>
        </>
    )
}

export default BackPageButoon