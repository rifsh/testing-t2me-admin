import { Button, Form, message } from 'antd'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentStep } from 'store/slices/eventSlice';
import { StepIndicator } from 'views/schedule/components/StepIndicator'
import dayjs from "dayjs";
import LoadingOverlay from 'components/util-components/Loader';

const ScheduleForm = ({ mode }) => {
    const steps = [
        "Schedule Details",
        "Time Slots",
        "Coupon & Offer",
        "Confirmation",
    ];

    const { form } = Form.useForm();
    const dispatch = useDispatch();
    const { currentStep, eventDetails, submitLoading } = useSelector(
        (state) => state.event
    );

    const nextStep = async () => {
        try {
            await form.validateFields();
            const values = form.getFieldValue();

            if (currentStep === 2) {
                const startDate = values.start_date
                    ? dayjs(values.start_date).format("YYYY-MM-DD")
                    : null;
                const endDate = values.end_date
                    ? dayjs(values.end_date).format("YYYY-MM-DD")
                    : null;

                if (!startDate || !endDate) {
                    message.error("Please select both start and end dates");
                    return;
                }

                const timeSlots = values.timeSlots || {};

                // Validate each date's time slots
                for (const date in timeSlots) {
                    // Skip validation for dates outside the selected range
                    if (dayjs(date).isBefore(startDate) || dayjs(date).isAfter(endDate)) {
                        continue;
                    }

                    const slots = timeSlots[date];
                    if (!Array.isArray(slots) || slots.length === 0) continue;

                    // Validate each slot
                    for (const slot of slots) {
                        if (!slot.start_time) {
                            message.error(`Start time is required for all slots on ${date}`);
                            return;
                        }

                        if (!slot.is_midnight_passed && !slot.end_time) {
                            message.error(
                                `End time is required for non-midnight slots on ${date}`
                            );
                            return;
                        }

                        if (slot.is_midnight_passed && !slot.show_end_date) {
                            message.error(
                                `Show end date is required for midnight-passed slots on ${date}`
                            );
                            return;
                        }

                        if (!slot.ticketType) {
                            message.error(`Ticket type is required for all slots on ${date}`);
                            return;
                        }
                    }
                }
            }

            if (currentStep < steps.length) {
                dispatch(setCurrentStep(currentStep + 1));
            }
        } catch (error) {
            console.error("Validation error:", error);
            message.error("Please ensure all required fields are filled correctly.");
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            dispatch(setCurrentStep(currentStep - 1));
        }
    };

    const onFinish = async () => {
        try {
            const values = form.getFieldValue();

            const startDate = dayjs(values.start_date).format("YYYY-MM-DD");
            const endDate = dayjs(values.end_date).format("YYYY-MM-DD");
            if (currentStep < steps.length) {
                dispatch(setCurrentStep(currentStep + 1));
            }
        } catch (error) {
            console.error("Submission error:", error);
            message.error(
                "Failed to submit the form. Please check all required fields."
            );
        }
    };

    const confirm = () => {

    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return <>sample</>;
            case 2:
                return <>sample1</>;
            case 3:
                return <>sample2</>;
            case 4:
                return <>sample3</>;
            default:
                return null;
        }
    };
    return (
        <div>
            <h2>{mode === "EDIT" ? "Edit Schedule" : "Create Schedule"}</h2>
            <StepIndicator steps={steps} currentStep={currentStep} />
            <div style={{ padding: "20px" }}>
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{}} // Add empty initial values
                >
                    {renderStepContent()}
                </Form>
            </div>
            <div style={{ textAlign: "right", marginTop: "20px" }}>
                {currentStep > 1 && <Button onClick={prevStep}>Previous</Button>}

                {currentStep < 3 ? (
                    <Button type="primary" onClick={nextStep}>
                        Next
                    </Button>
                ) : currentStep === 3 ? (
                    <Button type="primary" onClick={onFinish}>
                        Submit
                    </Button>
                ) : (
                    <Button type="primary" onClick={confirm}>
                        Confirm
                    </Button>
                )}
            </div>
            <LoadingOverlay loading={false} />
            {/* <SubmitAndConfirmModal
                responseData={responseData}
                addFunction={addSchedule}
                navigationPath={`${APP_PREFIX_PATH}/schedule/list`}
                responseMessage={responseMessage}
            /> */}
        </div>
    )
}

export default ScheduleForm