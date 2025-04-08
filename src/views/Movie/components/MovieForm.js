import React, { useState } from "react";
import {
    Input,
    Select,
    Tabs,
    message,
} from "antd";
import MovieDetailsForm from "./MovieDetailsForm";
import MovieMediaUploader from "./MediaPreviewManager";
import FilmTeamManagement from "./CastDetailsForm";
import CastDetailsForm from "./CastDetailsForm";

const { TextArea } = Input;
const { Option } = Select;

const MovieForm = ({ form }) => {

    return (
        <div>
            <Tabs defaultActiveKey="1">
                <Tabs.TabPane tab="Movie Details" key="1">
                    <MovieDetailsForm form={form} />
                </Tabs.TabPane>
                <Tabs.TabPane tab="Cast & Crew" key="2">
                    <CastDetailsForm
                        form={form}
                        initialValues={{
                            cast: form.getFieldValue('cast') || [],
                            crew: form.getFieldValue('crew') || []
                        }}
                    />
                </Tabs.TabPane>
                <Tabs.TabPane tab="Preview Details" key="4">
                    <MovieMediaUploader form={form} />
                </Tabs.TabPane>
            </Tabs>
        </div>
    );
};

export default MovieForm;