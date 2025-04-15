import React, { useState } from "react";
import { Button, Steps, message } from "antd";
import MovieDetailsForm from "./MovieDetailsForm";
import MovieMediaUploader from "./MediaPreviewManager";
import CastDetailsForm from "./CastDetailsForm";

const steps = [
    {
        title: "Movie Details",
        content: "movieDetails",
    },
    {
        title: "Cast & Crew",
        content: "castCrew",
    },
    {
        title: "Media Preview",
        content: "mediaPreview",
    },
];

const MovieForm = ({ form }) => {
    const [current, setCurrent] = useState(0);

    const next = () => {
        form.validateFields()
            .then(() => {
                setCurrent(current + 1);
            })
            .catch(() => {
                message.error("Please complete this step before continuing.");
            });
    };

    const prev = () => {
        setCurrent(current - 1);
    };

    const renderStepContent = () => {
        switch (steps[current].content) {
            case "movieDetails":
                return <MovieDetailsForm form={form} />;
            case "castCrew":
                return (
                    <CastDetailsForm
                        form={form}
                        initialValues={{
                            cast: form.getFieldValue("cast") || [],
                            crew: form.getFieldValue("crew") || [],
                        }}
                    />
                );
            case "mediaPreview":
                return <MovieMediaUploader form={form} />;
            default:
                return null;
        }
    };

    return (
        <>
            <Steps current={current} style={{ marginBottom: 24 }}>
                {steps.map((item) => (
                    <Steps.Step key={item.title} title={item.title} />
                ))}
            </Steps>

            <div className="steps-content">{renderStepContent()}</div>

            <div className="steps-action" style={{ marginTop: 24 }}>
                {current > 0 && (
                    <Button style={{ margin: "0 8px" }} onClick={() => prev()}>
                        Previous
                    </Button>
                )}
                {current < steps.length - 1 && (
                    <Button type="primary" onClick={() => next()}>
                        Next
                    </Button>
                )}
            </div>
        </>
    );
};

export default MovieForm;
