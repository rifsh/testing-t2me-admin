import { Form, Select } from 'antd'
import { Option } from 'antd/es/mentions'
import { screenOptions } from 'constants/ScreenConstants'
import React from 'react'

const ScreenTechnology = ({form, index}) => {
    return (
        <>
            <Form.Item name={['screens', index, 'screen_technology_id']} label="Screen Technology">
                <Select placeholder="Select technology">
                    {screenOptions.screenTechnologies.map(({ value, label }) => (
                        <Option key={value} value={value}>{label}</Option>
                    ))}
                </Select>
            </Form.Item>
        </>
    )
}

export default ScreenTechnology