import React from 'react';
import { useLocation } from 'react-router-dom';
import CategoryForm from '../form-category';

const AddCategory = () => {
  const location = useLocation();
  const { mode = "ADD", id = null } = location.state || {}; // Default to ADD mode

  return <CategoryForm mode={mode} id={id} />;
};

export default AddCategory;
