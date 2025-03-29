import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  Button, 
  Modal, 
  Menu, 
  Dropdown, 
  Form, 
  Input, 
  ColorPicker,
  Space,
  Table,
  Tooltip,
  Popconfirm
} from "antd";
import { 
  TagsOutlined, 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined 
} from "@ant-design/icons";
import { 
  setActiveCategory, 
  addCategory, 
  updateCategory, 
  deleteCategory,
  updateSeatCategory 
} from "store/slices/seatSlice";

const CategorySelector = () => {
  const dispatch = useDispatch();
  const categories = useSelector(state => state.seat.categories);
  const activeCategory = useSelector(state => state.seat.activeCategory);
  const selectedSeats = useSelector(state => state.seat.selectedSeats);
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  
  const activecat = categories.find(cat => cat.id === activeCategory);
  
  const handleCategorySelect = ({ key }) => {
    dispatch(setActiveCategory(key));
  };
  
  const handleOpenModal = () => {
    setIsModalVisible(true);
  };
  
  const handleCloseModal = () => {
    setIsModalVisible(false);
  };
  
  const handleAddCategory = () => {
    form.resetFields();
    form.setFieldsValue({
      id: '',
      name: '',
      color: '#ffffff'
    });
    form.submit();
  };
  
  const handleEditCategory = (category) => {
    form.resetFields();
    form.setFieldsValue({
      id: category.id,
      name: category.name,
      color: category.color
    });
  };
  
  const handleDeleteCategory = (categoryId) => {
    dispatch(deleteCategory(categoryId));
  };
  
  const handleFormSubmit = (values) => {
    const { id, name, color } = values;
    
    if (id) {
      dispatch(updateCategory({ id, name, color }));
    } else {
      dispatch(addCategory({ name, color }));
    }
    
    form.resetFields();
  };
  
  const handleAssignCategory = (categoryId) => {
    if (selectedSeats.length > 0) {
      dispatch(updateSeatCategory({ seatIndices: selectedSeats, categoryId }));
    }
  };
  
  const menu = (
    <Menu onClick={handleCategorySelect} selectedKeys={[activeCategory]}>
      {categories.map(category => (
        <Menu.Item key={category.id}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div 
              style={{ 
                width: '12px', 
                height: '12px', 
                backgroundColor: category.color,
                border: '1px solid #ccc',
                borderRadius: '2px'
              }} 
            />
            {category.name}
          </div>
        </Menu.Item>
      ))}
      <Menu.Divider />
      <Menu.Item key="manage" onClick={handleOpenModal}>
        <PlusOutlined /> Manage Categories
      </Menu.Item>
    </Menu>
  );
  
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div 
            style={{ 
              width: '12px', 
              height: '12px', 
              backgroundColor: record.color,
              border: '1px solid #ccc',
              borderRadius: '2px'
            }} 
          />
          {text}
        </div>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit Category">
            <Button 
              icon={<EditOutlined />} 
              size="small" 
              onClick={() => handleEditCategory(record)} 
            />
          </Tooltip>
          
          <Tooltip title="Assign to Selected Seats">
            <Button 
              icon={<TagsOutlined />} 
              size="small" 
              disabled={selectedSeats.length === 0}
              onClick={() => handleAssignCategory(record.id)}
            />
          </Tooltip>
          
          <Tooltip title="Delete Category">
            <Popconfirm
              title="Are you sure you want to delete this category?"
              onConfirm={() => handleDeleteCategory(record.id)}
              okText="Yes"
              cancelText="No"
              disabled={categories.length <= 1}
            >
              <Button 
                icon={<DeleteOutlined />} 
                size="small" 
                danger 
                disabled={categories.length <= 1}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      )
    }
  ];
  
  return (
    <>
      <Tooltip title="Select Category">
        <Dropdown overlay={menu} trigger={['click']}>
          <Button
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '5px',
              backgroundColor: activecat?.color || '#fff',
              borderColor: '#d9d9d9'
            }}
          >
            <TagsOutlined />
            {activecat?.name || 'Select Category'}
          </Button>
        </Dropdown>
      </Tooltip>
      
      <Modal
        title="Manage Seat Categories"
        open={isModalVisible}
        onCancel={handleCloseModal}
        footer={[
          <Button key="cancel" onClick={handleCloseModal}>
            Close
          </Button>
        ]}
      >
        <Form
          form={form}
          layout="inline"
          onFinish={handleFormSubmit}
          style={{ marginBottom: '16px' }}
        >
          <Form.Item name="id" hidden>
            <Input />
          </Form.Item>
          
          <Form.Item
            name="name"
            rules={[{ required: true, message: 'Please enter category name' }]}
          >
            <Input placeholder="Category Name" />
          </Form.Item>
          
          <Form.Item
            name="color"
            rules={[{ required: true, message: 'Please select a color' }]}
          >
            <ColorPicker />
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Save
            </Button>
          </Form.Item>
        </Form>
        
        <Table
          dataSource={categories}
          columns={columns}
          rowKey="id"
          pagination={false}
          size="small"
        />
      </Modal>
    </>
  );
};

export default CategorySelector;