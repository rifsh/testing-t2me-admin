import { SEAT_CATEGORIES } from 'constants/SeatTypes';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedCategory } from "store/slices/movieSeatSlice";
import { Typography, Select } from 'antd';

const { Text } = Typography;
const { Option } = Select;

const CategorySelector = () => {
  const dispatch = useDispatch();
  const { selectedCategory } = useSelector(state => state.movieSeatSlice);

  const handleChange = (value) => {
    dispatch(setSelectedCategory(value));
  };

  return (
    <div>
      <Text strong style={{ display: 'block', marginBottom: '8px' }}>Category</Text>
      <Select
        value={selectedCategory}
        onChange={handleChange}
        style={{ width: '100%' }}
      >
        {SEAT_CATEGORIES.map(cat => (
          <Option key={cat.id} value={cat.id}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span
                style={{
                  display: 'inline-block',
                  width: '12px',
                  height: '12px',
                  marginRight: '8px',
                  border: `2px solid ${cat.borderColor.replace('border-', '').replace('-500', '')}`,
                  borderRadius: '2px'
                }}
              />
              {cat.label} (${cat.price})
            </div>
          </Option>
        ))}
      </Select>
    </div>
  );
};

export default CategorySelector;