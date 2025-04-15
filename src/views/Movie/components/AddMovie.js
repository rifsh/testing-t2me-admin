import React, { useEffect, useState } from "react";
import {
    Form,
    Button,
    Card,
    Row,
    Col,
    Space,
    message,
    Steps
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import Title from "antd/es/typography/Title";
import DiscardButton from "components/shared-components/Buttons/DiscardButton";
import { MOVIE_CONSTANTS } from "constants/MovieConstants";
import MovieDetailsForm from "./MovieDetailsForm";
import CastDetailsForm from "./CastDetailsForm";
import MovieMediaUploader from "./MediaPreviewManager";
import { MODE } from "constants/TextConstant";
import { createMovie, editMovie, fetchMoviesById, setEditMovieData } from "store/slices/movieSlice";
import { ActionType } from "utils/api/warning-submit-util";
import { setSelectedSubmitItem } from "store/slices/modalSlice";
import { SubmitAndConfirmModal } from "components/util-components/ModalItems/SubmitConfirmModal";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import { fetchEventType } from "store/slices/eventSlice";
import dayjs from "dayjs";
import { setLocationDialogVisible, setLocationModalLoading } from "store/slices/locationSlice";
import WarningModal from "components/util-components/ModalItems/WarningModal";

const AddMovie = ({ mode, id }) => {
    const [form] = Form.useForm();
    const dispatch = useDispatch();
    const [current, setCurrent] = useState(0);
    const [formData, setFormData] = useState({
        movieDetails: {},
        cast: [],
        crew: [],
        media: {},
        thumbnail_image: []
    });
    const { loading, movieResponse, submitMessage, movieSingleResponse, movieEditData, message: movieMessage } = useSelector((state) => state.movie);
    const { eventType } = useSelector((state) => state.event);
    const { dialogVisible } = useSelector((state) => state.locations);

    useEffect(() => {
        if (id) {
            dispatch(fetchMoviesById({ movie_id: id }))
        }
        if (!eventType.length) {
            dispatch(fetchEventType({ active: true }));
        }
    }, [dispatch, eventType.length, id]);

    useEffect(() => {
        if (movieSingleResponse) {
            if (mode === MODE.EDIT && Array.isArray(movieSingleResponse.movie_details)) {
                form.setFieldsValue({
                    Title: movieSingleResponse?.event_name,
                    age_restriction: movieSingleResponse.movie_details[0].age_restriction,
                    Runtime: movieSingleResponse?.movie_details[0]?.runtime,
                    country: movieSingleResponse?.movie_details[0]?.country,
                    director: movieSingleResponse?.movie_details[0]?.director,
                    Genre: movieSingleResponse?.movie_details[0]?.genre,
                    Language: movieSingleResponse?.movie_details[0]?.language,
                    rating: movieSingleResponse?.movie_details[0]?.rating,
                    Released: dayjs(movieSingleResponse?.movie_details[0]?.released, "YYYY-MM-DD"),
                    budget_currency: movieSingleResponse?.movie_details[0]?.budget_currency,
                    box_office_currency: movieSingleResponse?.movie_details[0]?.box_office_currency,
                    awards: movieSingleResponse?.movie_details[0]?.awards,
                    production_company: movieSingleResponse?.movie_details[0]?.production_company,
                    Plot: movieSingleResponse?.description,
                    mediaItems: movieSingleResponse?.movie_details[0]?.media_items,
                    thumbnail_image:
                        movieSingleResponse.thumbnail_image && movieSingleResponse.thumbnail_image !== "images"
                            ? [
                                {
                                    uid: "-1",
                                    name: movieSingleResponse.thumbnail_image.split("/").pop(),
                                    status: "done",
                                    url: movieSingleResponse.thumbnail_image,
                                },
                            ]
                            : [],
                });
            }
        }
    }, [movieSingleResponse])

    const next = () => {
        form.validateFields()
            .then((values) => {
                const currentStepData = form.getFieldsValue(true);

                setFormData(prevData => ({
                    ...prevData,
                    ...currentStepData,
                    thumbnail_image: currentStepData.thumbnail_image || prevData.thumbnail_image
                }));

                console.log("Current step data:", currentStepData);
                setCurrent(current + 1);
            })
            .catch(() => {
                message.error("Please complete this step before continuing.");
            });
    };

    const prev = () => {
        const currentStepData = form.getFieldsValue(true);
        setFormData(prevData => ({
            ...prevData,
            ...currentStepData
        }));

        setCurrent(current - 1);
    };

    useEffect(() => {
        form.setFieldsValue(formData);
    }, [current, form, formData]);

    const renderStepContent = () => {
        switch (MOVIE_CONSTANTS.MOVIE_STEPS[current].content) {
            case "movieDetails":
                return <MovieDetailsForm form={form} mode={mode} />;
            case "castCrew":
                return (
                    <CastDetailsForm
                        mode={mode}
                        form={form}
                        initialValues={
                            mode === MODE.ADD ? {
                                cast: formData.cast || [],
                                crew: formData.crew || []
                            } : {
                                cast: movieSingleResponse?.movie_details[0].casts || [],
                                crew: formData.crew || []
                            }
                        }
                    />
                );
            case "mediaPreview":
                return <MovieMediaUploader form={form} mode={mode} />;
            default:
                return null;
        }
    };

    useEffect(() => {
        form.setFieldsValue({
            cast: [],
            crew: []
        });

        setFormData(prevData => ({
            ...prevData,
            cast: [],
            crew: []
        }));
    }, [form]);

    const handleSubmit = async () => {
        try {
            await form.validateFields();
            const currentStepData = form.getFieldsValue(true);
            const finalFormData = {
                ...formData,
                ...currentStepData
            };

            const releasedFormatted = finalFormData.Released?.format
                ? finalFormData.Released.format("YYYY-MM-DDTHH:mm:ss")
                : finalFormData.released;

            const transformCastData = (castArray) => {
                return castArray?.map(member => ({
                    id: member.id || null,
                    personality_id: member.personality_id,
                    actor_name: member.actorName,
                    actor_image: member.actorImage,
                    character_name: member.character_name,
                    role: member.role,
                    type: member.type
                })) || [];
            };

            const responseFormattedData = {
                event_type_id: eventType?.find((item) => item.type === "Movie")?.id || 1,
                event_name: finalFormData.Title,
                age_restriction: finalFormData.age_restriction,
                runtime: finalFormData.Runtime,
                language: finalFormData.Language,
                genre: finalFormData.Genre,
                released: releasedFormatted,
                description: finalFormData.Plot,
                country: finalFormData.country,
                director: finalFormData.director,
                rating: finalFormData.rating,
                budget_currency: finalFormData.budget_currency,
                box_office_currency: finalFormData.box_office_currency,
                awards: finalFormData.awards,
                production_company: finalFormData.production_company,
                thumbnail_image: finalFormData.thumbnail_image || null,
                mediaItems: finalFormData.mediaItems || [],
                cast: transformCastData(finalFormData.cast),
            };
            if (mode === MODE.ADD) {
                console.log("Final form data: ", responseFormattedData)
                await dispatch(createMovie({
                    data: responseFormattedData,
                    action: ActionType.SUBMIT
                }));

                dispatch(setSelectedSubmitItem(responseFormattedData));
            } else {
                const formattedData = {
                    ...responseFormattedData,
                    id: id
                }
                console.log("Final form data: ", responseFormattedData);
                dispatch(setEditMovieData(formattedData));
                const resultAction = await dispatch(
                    editMovie({ data: movieEditData, action: ActionType.WARNING })
                );
                dispatch(setLocationDialogVisible(true));
            }

        } catch (errorInfo) {
            if (errorInfo.errorFields) {
                message.error("Please fill all the required fields.");
                errorInfo.errorFields.forEach((field) => {
                    console.log(`Field Error: ${field.name.join(".")} - ${field.errors.join(", ")}`);
                });
            } else {
                message.error("An unexpected error occurred. Please try again.");
            }
        }
    };

    const handleModalSubmit = async () => {
        dispatch(setLocationModalLoading(true));
        const resultAction = await dispatch(
            editMovie({ data: movieEditData, action: ActionType.SUBMIT })
        );
        dispatch(setLocationModalLoading(false));
        dispatch(setLocationDialogVisible(false));
        if (editMovie.fulfilled?.match(resultAction)) {
            dispatch(setSelectedSubmitItem(movieEditData));
        }
    };

    const handleModalCancel = () => {
        dispatch(setLocationDialogVisible(false));
    };

    return (
        <>
            <Form form={form} layout="vertical">
                <div style={{ marginTop: 16 }}>
                    <Col xs={24} sm={24} md={24}>
                        <Card
                            title={<Title level={4}>Movie Information</Title>}
                            bordered
                            className="movie-information-card"
                        >
                            <Steps current={current} style={{ marginBottom: 24 }}>
                                {MOVIE_CONSTANTS.MOVIE_STEPS.map((item) => (
                                    <Steps.Step key={item.title} title={item.title} />
                                ))}
                            </Steps>

                            <div className="steps-content">{renderStepContent()}</div>
                        </Card>
                    </Col>
                    <Row justify="space-between" style={{ marginTop: 24 }}>
                        <Space>
                            {current > 0 && (
                                <Button onClick={prev}>
                                    Previous
                                </Button>
                            )}
                        </Space>

                        <Space>
                            {current < MOVIE_CONSTANTS.MOVIE_STEPS.length - 1 ? (
                                <Button type="primary" onClick={next}>
                                    Next
                                </Button>
                            ) : (
                                <>
                                    <DiscardButton form={form} />
                                    <Button
                                        type="primary"
                                        onClick={handleSubmit}
                                        loading={loading}
                                    >
                                        Submit
                                    </Button>
                                </>
                            )}
                        </Space>
                    </Row>
                </div>
            </Form>

            <WarningModal
                visible={dialogVisible}
                title="Confirm Action"
                details={movieMessage}
                responseData={movieResponse}
                warningMessage="Do you want to continue?"
                onSubmit={handleModalSubmit}
                onCancel={handleModalCancel}
                confirmText="Proceed"
                cancelText="Back"
                loading={loading}
                tableConfig={{
                    title: "Active Schedules",
                    dataKey: "items",
                }}
            />

            <SubmitAndConfirmModal
                responseData={movieResponse}
                addFunction={mode === MODE.ADD ? createMovie : editMovie}
                navigationPath={`${APP_PREFIX_PATH}/movie/list`}
                responseMessage={submitMessage}
            />
        </>
    );
};

export default AddMovie;