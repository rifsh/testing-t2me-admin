import React, { useState } from "react";
import {
    Input,
    Select,
    Tabs,
    message,
} from "antd";
import MovieDetailsForm from "./MovieDetailsForm";
import MovieMediaUploader from "./MediaPreviewManager";

const { TextArea } = Input;
const { Option } = Select;

const MovieForm = ({ form }) => {
    const [castMembers, setCastMembers] = useState([]);

    return (
        <div>
            <Tabs defaultActiveKey="1">
                <Tabs.TabPane tab="Movie Details" key="1">
                    <MovieDetailsForm form={form} />
                </Tabs.TabPane>
                {/* <Tabs.TabPane tab="Production Details" key="2">
                    <MovieProductionForm/>
                </Tabs.TabPane> */}
                <Tabs.TabPane tab="Preview Details" key="4">
                    <MovieMediaUploader form={form} />
                </Tabs.TabPane>
            </Tabs>
        </div>
    );
};

export default MovieForm;