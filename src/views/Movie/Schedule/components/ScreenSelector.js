import React from 'react';
import { Select } from 'antd';

const { Option } = Select;

const ScreenSelector = ({ screens, selectedScreen, onScreenChange }) => {
  if (!screens || screens.length === 0) {
    return (
      <Select 
        style={{ width: '100%' }} 
        placeholder="No screens available" 
        disabled 
      />
    );
  }

  return (
    <Select
      style={{ width: '100%', marginTop: 8 }}
      placeholder="Select a screen"
      value={selectedScreen !== null ? selectedScreen : undefined}
      onChange={onScreenChange}
    >
      {screens.map((screen, index) => (
        <Option key={index} value={index}>
          {screen}
        </Option>
      ))}
    </Select>
  );
};

export default ScreenSelector;