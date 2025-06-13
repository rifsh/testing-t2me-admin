import React from 'react'
import { Button, Form, Input, Modal } from 'antd'
import { useDispatch, useSelector } from 'react-redux'
import { setEntrollUserModalState } from 'store/slices/theaterSlice';

const EntrollUserModal = ({ form, handleEnrollSubmit }) => {
    const dispatch = useDispatch();
    const { isEntrollUserModal } = useSelector((state) => state.theater)

    return (
        <div>
            <Modal
                title="Enroll User to Event"
                open={isEntrollUserModal}
                onCancel={() => dispatch(setEntrollUserModalState(false))}
                footer={[
                    <Button key="back" onClick={() => dispatch(setEntrollUserModalState(false))}>
                        Cancel
                    </Button>,
                    <Button key="submit" type="primary" onClick={handleEnrollSubmit}>
                        Enroll
                    </Button>,
                ]}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="email"
                        label="User Email"
                        rules={[
                            { required: true, message: "Please enter the user's email" },
                            { type: "email", message: "Please enter a valid email" },
                        ]}
                    >
                        <Input placeholder="Enter user email" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    )
}

export default EntrollUserModal