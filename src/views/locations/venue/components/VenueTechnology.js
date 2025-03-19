import React from 'react'
import { Tabs, Button, Input, Row, Col, Form } from 'antd';
import { DesktopOutlined, SoundOutlined, SafetyOutlined, PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';

const VenueTechnology = ({ form }) => {
    return (
        <>
            <Tabs defaultActiveKey="screen" style={{ marginBottom: '24px' }}>
                <Tabs.TabPane tab={<span><DesktopOutlined /> Screen Technology</span>} key="screen">
                    <Form.List name="screen_tech">
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map(({ key, name, ...restField }) => (
                                    <Row gutter={[16, 8]} key={key} style={{ marginBottom: '8px' }}>
                                        <Col span={10}>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'name']}
                                                rules={[{ required: true, message: 'Enter screen technology' }]}
                                            >
                                                <Input placeholder="Enter screen technology (e.g., 4K Projection)" />
                                            </Form.Item>
                                        </Col>
                                        <Col span={10}>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'description']}
                                                rules={[{ required: true, message: 'Enter description' }]}
                                            >
                                                <Input placeholder="Enter description" />
                                            </Form.Item>
                                        </Col>
                                        <Col span={4}>
                                            <Button
                                                type="text"
                                                danger
                                                icon={<MinusCircleOutlined />}
                                                onClick={() => remove(name)}
                                            />
                                        </Col>
                                    </Row>
                                ))}
                                <Form.Item>
                                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                        Add Screen Technology
                                    </Button>
                                </Form.Item>
                            </>
                        )}
                    </Form.List>
                </Tabs.TabPane>

                <Tabs.TabPane tab={<span><SoundOutlined /> Audio Technology</span>} key="audio">
                    <Form.List name="audios">
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map(({ key, name, ...restField }) => (
                                    <Row gutter={[16, 8]} key={key} style={{ marginBottom: '8px' }}>
                                        <Col span={10}>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'name']}
                                                rules={[{ required: true, message: 'Enter audio technology' }]}
                                            >
                                                <Input placeholder="Enter audio technology (e.g., Dolby Atmos)" />
                                            </Form.Item>
                                        </Col>
                                        <Col span={10}>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'description']}
                                                rules={[{ required: true, message: 'Enter description' }]}
                                            >
                                                <Input placeholder="Enter description" />
                                            </Form.Item>
                                        </Col>
                                        <Col span={4}>
                                            <Button
                                                type="text"
                                                danger
                                                icon={<MinusCircleOutlined />}
                                                onClick={() => remove(name)}
                                            />
                                        </Col>
                                    </Row>
                                ))}
                                <Form.Item>
                                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                        Add Audio Technology
                                    </Button>
                                </Form.Item>
                            </>
                        )}
                    </Form.List>
                </Tabs.TabPane>

                <Tabs.TabPane tab={<span><SafetyOutlined /> Accessibility Features</span>} key="accessibility">
                    <Form.List name="accessbility_feature">
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map(({ key, name, ...restField }) => (
                                    <Row gutter={[16, 8]} key={key} style={{ marginBottom: '8px' }}>
                                        <Col span={10}>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'name']}
                                                rules={[{ required: true, message: 'Enter accessibility feature' }]}
                                            >
                                                <Input placeholder="Enter accessibility feature (e.g., Wheelchair Access)" />
                                            </Form.Item>
                                        </Col>
                                        <Col span={10}>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'description']}
                                                rules={[{ required: true, message: 'Enter description' }]}
                                            >
                                                <Input placeholder="Enter description" />
                                            </Form.Item>
                                        </Col>
                                        <Col span={4}>
                                            <Button
                                                type="text"
                                                danger
                                                icon={<MinusCircleOutlined />}
                                                onClick={() => remove(name)}
                                            />
                                        </Col>
                                    </Row>
                                ))}
                                <Form.Item>
                                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                        Add Accessibility Feature
                                    </Button>
                                </Form.Item>
                            </>
                        )}
                    </Form.List>
                </Tabs.TabPane>
            </Tabs>
        </>
    );
};

export default VenueTechnology;
