import React, { useState } from "react";
import {
    Form,
    Input,
    Select,
    Button,
    Card,
    Row,
    Col,
    Tabs,
    Space,
    Upload,
    TimePicker,
    InputNumber,
    message,
    Avatar
} from "antd";
import {
    InfoCircleOutlined,
    UploadOutlined,
    PlusOutlined,
    UserOutlined,
    DeleteOutlined
} from "@ant-design/icons";
import MovieDetailsForm from "./MovieDetailsForm";
import CastDetailsForm from "./CastDetailsForm";
import MovieMediaUploader from "./MediaPreviewManager";
import MovieProductionForm from "./MovieProductionForm";

const { TextArea } = Input;
const { Option } = Select;

const MovieForm = ({ form }) => {
    const [poster, setPoster] = useState(null);
    const [castMembers, setCastMembers] = useState([]);

    const genres = ["Action", "Comedy", "Drama", "Horror", "Sci-Fi", "Thriller", "Animation"];
    const languages = ["English", "Hindi", "French", "Spanish", "Chinese", "Tamil", "Malayalam"];
    const roles = ["Lead Actor", "Lead Actress", "Supporting Actor", "Supporting Actress", "Director", "Music Director"];

    const handlePosterUpload = ({ file }) => {
        setPoster(file);
        message.success("Poster uploaded successfully!");
    };

    const addCastMember = () => {
        setCastMembers([...castMembers, { name: '', role: '', image: null }]);
    };

    const removeCastMember = (index) => {
        const updatedCastMembers = castMembers.filter((_, i) => i !== index);
        setCastMembers(updatedCastMembers);
    };

    const handleCastMemberChange = (index, field, value) => {
        const updatedCastMembers = [...castMembers];
        updatedCastMembers[index][field] = value;
        setCastMembers(updatedCastMembers);
    };

    const handleCastMemberImageUpload = (index, { file }) => {
        const updatedCastMembers = [...castMembers];
        updatedCastMembers[index].image = file;
        setCastMembers(updatedCastMembers);
        message.success(`${file.name} uploaded successfully!`);
    };

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