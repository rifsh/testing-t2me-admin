import React from 'react'
import Flex from "components/shared-components/Flex";
import { Tabs, Form } from "antd";
import PageHeaderAlt from "components/layout-components/PageHeaderAlt";
import AddNewsLetterFormFields from 'views/news-letter/components/AddNewsLetterFormFields';

const AddFrom = () => {

  const onChange = (key) => {
    console.log(key);
  };

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
              <h2 className="mb-3">
                Add News Letter
              </h2>
            </Flex>
          </div>
        </PageHeaderAlt>

        <div className="container">
          <Tabs
            onChange={onchange}
            style={{ marginTop: 30 }}
            items={[
              {
                label: "news letter",
                key: "add-letter",
                children: <AddNewsLetterFormFields type={'normal'}/>,
              },
              {
                label: "Text formatter",
                key: "text-formatter",
                children: <AddNewsLetterFormFields type={'formatter'}/>,
              },

            ]}
          />
        </div>
      </Form>
    </>
  )
}

export default AddFrom