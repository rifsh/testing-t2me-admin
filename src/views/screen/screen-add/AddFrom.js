import React from 'react'
import Flex from "components/shared-components/Flex";
import { Tabs, Form } from "antd";
import PageHeaderAlt from "components/layout-components/PageHeaderAlt";
import AddScreenFormFields from '../components/AddScreenFormFields';

const AddFrom = ({ mode, screenId }) => {

  return (
    <>
      <Form
        layout="vertical"
        name="category-form"
        className="ant-advanced-search-form"
      >
        <PageHeaderAlt className="border-bottom" overlap>
          <div className="container">
            <Flex
              className="py-2"
              mobileFlex={false}
              justifyContent="space-between"
              alignItems="center"
            >
              {mode === 'ADD' ? (
                <h2 className="mb-3">
                  Add Screen
                </h2>
              ) : (
                <h2 className="mb-3">
                  Edit Screen
                </h2>
              )}
            </Flex>
          </div>
        </PageHeaderAlt>

        <div className="container">
          <Tabs
            onChange={onchange}
            style={{ marginTop: 30 }}
            items={[
              {
                label: "Screen",
                key: "add-screen",
                children: <AddScreenFormFields type={'screen'} mode={mode} screenId={screenId} />,
              }
            ]}
          />
        </div>
      </Form>
    </>
  )
}

export default AddFrom