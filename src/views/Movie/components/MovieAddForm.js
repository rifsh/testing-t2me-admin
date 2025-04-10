import React from 'react'
import {
    Form,
    Tabs,
    Typography
} from 'antd';
import AddMovie from './AddMovie';
import { MODE } from 'constants/TextConstant';
const { Title } = Typography;

const MovieAddForm = ({ mode }) => {
    return (
        <div>
            <Form
                layout="vertical"
                name="category-form"
                className="ant-advanced-search-form"
            >
                <Title level={3}>
                    {mode === MODE.ADD ? "Add New Movie" : "Edit Movie Details"}
                </Title>

                <div className="container">
                    <Tabs
                        onChange={onchange}
                        style={{ marginTop: 30 }}
                        items={[
                            {
                                label: "Movie",
                                key: "add-movie",
                                children: <AddMovie mode={mode} />,
                            }
                        ]}
                    />
                </div>
            </Form>
        </div>
    )
}

export default MovieAddForm