import React, { useEffect, useState } from "react";
import { Form, Button, Card, Row, Col, Space, message, Tabs } from "antd";
import { useDispatch, useSelector } from "react-redux";
import Title from "antd/es/typography/Title";
import DiscardButton from "components/shared-components/Buttons/DiscardButton";
import { MOVIE_CONSTANTS } from "constants/MovieConstants";
import MovieDetailsForm from "./MovieDetailsForm";
import CastDetailsForm from "./CastDetailsForm";
import MovieMediaUploader from "./MediaPreviewManager";
import { MODE } from "constants/TextConstant";
import {
  clearOMDBData,
  createMovie,
  editMovie,
  fetchMoviesById,
  setEditMovieData,
} from "store/slices/movieSlice";
import { ActionType } from "utils/api/warning-submit-util";
import { setSelectedSubmitItem } from "store/slices/modalSlice";
import { SubmitAndConfirmModal } from "components/util-components/ModalItems/SubmitConfirmModal";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import { fetchEventType } from "store/slices/eventSlice";
import dayjs from "dayjs";
import {
  setLocationDialogVisible,
  setLocationModalLoading,
} from "store/slices/locationSlice";
import WarningModal from "components/util-components/ModalItems/WarningModal";

const AddMovie = ({ mode, id }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("0");
  const [formValidationStatus, setFormValidationStatus] = useState({
    0: false,
    1: false,
    2: false,
  });
  const [formData, setFormData] = useState({
    movieDetails: {},
    cast: [],
    crew: [],
    media: {},
    mediaItems: [],
  });
  const {
    loading,
    movieResponse,
    submitMessage,
    movieSingleResponse,
    movieEditData,
    message: movieMessage,
  } = useSelector((state) => state.movie);
  const { eventType } = useSelector((state) => state.event);
  const { dialogVisible } = useSelector((state) => state.locations);

  useEffect(() => {
    if (id) {
      dispatch(fetchMoviesById({ movie_id: id }));
    }
    if (!eventType.length) {
      dispatch(fetchEventType({ active: true }));
    }
  }, [dispatch, eventType.length, id]);

  useEffect(() => {
    console.warn("Movie Edit Data");
    if (movieSingleResponse) {
      if (mode === MODE.EDIT) {
        const mediaItems =
          movieSingleResponse?.media_items || [];
        console.log("Movie Single Response", mediaItems);
        const thumbnailImage =
          movieSingleResponse.thumbnail_image &&
            movieSingleResponse.thumbnail_image !== "images"
            ? [
              {
                uid: "-1",
                name: movieSingleResponse.thumbnail_image.split("/").pop(),
                status: "done",
                url: movieSingleResponse.thumbnail_image,
              },
            ]
            : [];
        const banner_image =
          movieSingleResponse?.banner_image &&
            movieSingleResponse?.banner_image !== "images"
            ? [
              {
                uid: "-1",
                name: movieSingleResponse?.banner_image
                  .split("/")
                  .pop(),
                status: "done",
                url: movieSingleResponse?.banner_image,
              },
            ]
            : [];

        form.setFieldsValue({
          Title: movieSingleResponse?.title,
          age_restriction: movieSingleResponse.age_restriction,
          Runtime: movieSingleResponse?.runtime,
          country: movieSingleResponse?.country,
          director: movieSingleResponse?.director,
          Genre: movieSingleResponse?.genre,
          Language: movieSingleResponse?.language,
          rating: movieSingleResponse?.rating,
          Released: dayjs(movieSingleResponse?.released, "YYYY-MM-DD"),
          budget_currency: movieSingleResponse?.budget_currency,
          box_office_currency: movieSingleResponse?.box_office_currency,
          awards: movieSingleResponse?.awards,
          production_company: movieSingleResponse?.production_company,
          Plot: movieSingleResponse?.description,
          mediaItems: mediaItems,
          thumbnail_image: thumbnailImage,
          banner_image: banner_image,
        });

        // Also update formData state to ensure consistency
        setFormData((prevData) => ({
          ...prevData,
          mediaItems: mediaItems,
          thumbnail_image: thumbnailImage,
          banner_image: banner_image,
        }));
      }
    }
  }, [movieSingleResponse, form, mode]);

  const handleTabChange = async (key) => {
    try {
      // Validate current tab fields before allowing change
      const currentTabIndex = parseInt(activeTab);
      const targetTabIndex = parseInt(key);

      // If going forward, validate the current tab first
      if (targetTabIndex > currentTabIndex) {
        await validateTabFields(currentTabIndex);
      }

      // Save current form data regardless of direction
      const currentStepData = form.getFieldsValue(true);

      setFormData(prevData => ({
        ...prevData,
        ...currentStepData,
        // Ensure media data is preserved
        thumbnail_image: currentStepData.thumbnail_image || prevData.thumbnail_image,
        mediaItems: currentStepData.mediaItems || prevData.mediaItems,
        director: currentStepData.director || prevData.director
      }));

      // Change the tab
      setActiveTab(key);
    } catch (error) {
      message.error("Please complete this tab before continuing.");
    }
  };

  const validateTabFields = async (tabIndex) => {
    let fieldsToValidate = [];

    // Determine which fields to validate based on the tab
    switch (tabIndex) {
      case 0:
        fieldsToValidate = [
          "Title",
          "age_restriction",
          "Runtime",
          "country",
          "Genre",
          "Language",
          "Released",
          "Plot",
        ];
        break;
      case 1:
        // Cast/crew validation if needed
        // fieldsToValidate = ['cast', 'crew'];
        break;
      case 2:
        // Media validation if needed
        break;
      default:
        break;
    }

    // Validate the selected fields
    if (fieldsToValidate.length > 0) {
      await form.validateFields(fieldsToValidate);
    }

    // Mark this tab as validated
    setFormValidationStatus((prev) => ({
      ...prev,
      [tabIndex]: true,
    }));
  };

  useEffect(() => {
    // Ensure form is updated with current formData when tab changes
    form.setFieldsValue(formData);
  }, [activeTab, form, formData]);

  const renderTabContent = (tabKey) => {
    switch (tabKey) {
      case "0":
        return <MovieDetailsForm form={form} mode={mode} />;
      case "1":
        return (
          <CastDetailsForm
            mode={mode}
            form={form}
            initialValues={{
              cast:
                mode === MODE.ADD
                  ? formData.cast || []
                  : movieSingleResponse?.casts || [],
              crew: formData.crew || [],
            }}
          />
        );
      case "2":
        return <MovieMediaUploader form={form} mode={mode} />;
      default:
        return null;
    }
  };

  useEffect(() => {
    form.setFieldsValue({
      cast: [],
      crew: [],
    });

    setFormData((prevData) => ({
      ...prevData,
      cast: [],
      crew: [],
    }));
  }, [form]);

  const handleSubmit = async () => {
    try {
      // Final validation of all required fields
      await form.validateFields();

      const currentStepData = form.getFieldsValue(true);

      const finalFormData = {
        ...formData,
        ...currentStepData,
      };

      const releasedFormatted = finalFormData.Released?.format
        ? finalFormData.Released.format("YYYY-MM-DDTHH:mm:ss")
        : finalFormData.released;

      const transformCastData = (castArray) => {
        return (
          castArray?.map((member) => ({
            id: mode === MODE.ADD ? null : member.id,
            personality_id: member.personality_id,
            actor_name: member.actorName,
            actor_image: member.actorImage,
            character_name: member.character_name,
            role: member.role,
            type: member.type,
          })) || []
        );
      };
      console.log("Final form data: ", finalFormData);

      const responseFormattedData = {
        event_type_id:
          eventType?.find((item) => item.type === "Movie")?.id || 1,
        title: finalFormData.Title,
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
        budget: finalFormData.budget,
        box_office_currency: finalFormData.box_office_currency,
        box_office: finalFormData.box_office,
        awards: finalFormData.awards,
        production_company: finalFormData.production_company,
        thumbnail_image: finalFormData.thumbnail_image || null,
        banner_image: finalFormData.banner_image || null,
        mediaItems: finalFormData.mediaItems || [],
        cast: transformCastData(finalFormData.cast),
      };

      if (mode === MODE.ADD) {
        console.log("Submitting new movie: ", responseFormattedData);
        await dispatch(
          createMovie({
            data: responseFormattedData,
            action: ActionType.SUBMIT,
          })
        );

        dispatch(setSelectedSubmitItem(responseFormattedData));
      } else {
        const formattedData = {
          ...responseFormattedData,
          id: id,
        };
        console.log("Updating movie: ", formattedData);
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
          console.log(
            `Field Error: ${field.name.join(".")} - ${field.errors.join(", ")}`
          );
        });

        // Navigate to the tab with errors
        const firstErrorField = errorInfo.errorFields[0].name[0];
        let tabWithError = "0"; // Default to first tab

        // Determine which tab has the error
        const movieDetailsFields = [
          "Title",
          "age_restriction",
          "Runtime",
          "country",
          "Genre",
          "Language",
          "Released",
          "Plot",
          "rating",
          "budget_currency",
          "box_office_currency",
          "awards",
          "production_company",
          "director",
        ];
        const castFields = ["cast", "crew"];
        const mediaFields = ["mediaItems", "thumbnail_image"];

        if (movieDetailsFields.includes(firstErrorField)) {
          tabWithError = "0";
        } else if (castFields.includes(firstErrorField)) {
          tabWithError = "1";
        } else if (mediaFields.includes(firstErrorField)) {
          tabWithError = "2";
        }

        setActiveTab(tabWithError);
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

  useEffect(() => {
    return () => {
      dispatch(clearOMDBData("omdb"));
    };
  }, [dispatch]);

  const tabItems = MOVIE_CONSTANTS.MOVIE_STEPS.map((item, index) => ({
    key: String(index),
    label: item.title,
    children: renderTabContent(String(index)),
  }));

  const handleNext = async () => {
    try {
      const currentTabIndex = parseInt(activeTab);
      await validateTabFields(currentTabIndex);

      // If validation passes, go to next tab
      const nextTabIndex = currentTabIndex + 1;
      if (nextTabIndex < MOVIE_CONSTANTS.MOVIE_STEPS.length) {
        // Save current form data before advancing
        const currentStepData = form.getFieldsValue(true);
        setFormData(prevData => ({
          ...prevData,
          ...currentStepData,
          mediaItems: currentStepData.mediaItems || prevData.mediaItems
        }));

        setActiveTab(String(nextTabIndex));
      }
    } catch (error) {
      message.error("Please complete this tab before continuing.");
    }
  };

  const handlePrev = () => {
    const currentTabIndex = parseInt(activeTab);
    const prevTabIndex = currentTabIndex - 1;
    if (prevTabIndex >= 0) {
      // Save current tab data
      const currentStepData = form.getFieldsValue(true);
      setFormData(prevData => ({
        ...prevData,
        ...currentStepData,
        // Explicitly preserve media data
        // thumbnail_image: currentStepData.thumbnail_image || prevData.thumbnail_image,
        mediaItems: currentStepData.mediaItems || prevData.mediaItems
      }));

      setActiveTab(String(prevTabIndex));
    }
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
              <Tabs
                activeKey={activeTab}
                onChange={handleTabChange}
                items={tabItems}
                tabBarExtraContent={{
                  right: (
                    <Space>
                      {parseInt(activeTab) > 0 && (
                        <Button onClick={handlePrev}>Previous</Button>
                      )}
                      {parseInt(activeTab) <
                        MOVIE_CONSTANTS.MOVIE_STEPS.length - 1 ? (
                        <Button type="primary" onClick={handleNext}>
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
                  ),
                }}
              />
            </Card>
          </Col>
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
