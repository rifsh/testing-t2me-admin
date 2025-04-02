import React from 'react'
import AddMovie from '../components/AddMovie';
import {
    Form,
    Input,
    Select,
    Tabs,
    Flex
} from 'antd';
import PageHeaderAlt from 'components/layout-components/PageHeaderAlt';

const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

const Index = () => {
    const mode = "ADD"
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
                                    Add Movie
                                </h2>
                            ) : (
                                <h2 className="mb-3">
                                    Edit Movie
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
                                label: "Movie",
                                key: "add-movie",
                                children: <AddMovie mode={mode}/>,
                            }
                        ]}
                    />
                </div>
            </Form>
        </>
    )
}

export default Index