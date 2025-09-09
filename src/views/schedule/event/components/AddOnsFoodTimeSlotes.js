import React, { useState, useEffect } from "react";
import {
  Card,
  Form,
  Select,
  Input,
  Row,
  Col,
  Button,
  TimePicker,
  InputNumber,
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { setFoodTimeSlots } from "store/slices/scheduleSlice";
import dayjs from "dayjs";
import { AddOnsFoodTimeSlotValidator } from "utils/validation/addOnsFoodTimeValidation";

const { Option } = Select;

export function AddOnsFoodTimeSlotes({ form }) {
  const dispatch = useDispatch();
  const { foodTimeSlots: reduxTimeSlots } = useSelector(
    (state) => state.schedules
  );

  const [foodTimeSlots, setLocalTimeSlots] = useState([
    {
      id: 1,
      name: "",
      start_time: null,
      end_time: null,
      num_of_tickets: null,
    },
  ]);

  // Initialize from Redux store if available
  useEffect(() => {
    if (reduxTimeSlots && Object.keys(reduxTimeSlots).length > 0) {
      const slotsArray = Object.values(reduxTimeSlots).flat();
      if (slotsArray.length > 0) {
        setLocalTimeSlots(slotsArray);
      }
    }
  }, [reduxTimeSlots]);

  const addTimeSlot = () => {
    const newId = Math.max(...foodTimeSlots.map((slot) => slot.id)) + 1;
    const newTimeSlot = {
      id: newId,
      name: "",
      start_time: null,
      end_time: null,
      num_of_tickets: null,
    };

    const updatedTimeSlots = [...foodTimeSlots, newTimeSlot];
    setLocalTimeSlots(updatedTimeSlots);
    dispatch(setFoodTimeSlots(updatedTimeSlots));
    form.setFieldsValue({ time_slots: updatedTimeSlots });
  };

  const removeTimeSlot = (id) => {
    if (foodTimeSlots.length === 1) return;

    const updatedTimeSlots = foodTimeSlots.filter((slot) => slot.id !== id);
    setLocalTimeSlots(updatedTimeSlots);
    dispatch(setFoodTimeSlots(updatedTimeSlots));
    form.setFieldsValue({ time_slots: updatedTimeSlots });
  };

  const updateTimeSlot = (id, field, value) => {
    const updatedTimeSlots = foodTimeSlots.map((slot) => {
      if (slot.id === id) {
        return { ...slot, [field]: value };
      }
      return slot;
    });

    setLocalTimeSlots(updatedTimeSlots);
    dispatch(setFoodTimeSlots(updatedTimeSlots));
    form.setFieldsValue({ time_slots: updatedTimeSlots });
  };

  const getSlotValidation = (slot) => {
    const validation = AddOnsFoodTimeSlotValidator.validateSingleSlot(slot);
    return validation;
  };

  return (
    <Card title="Food Time Slots">
      <Row gutter={24}>
        <Col xs={24}>
          <Form.Item
            name="time_slots"
            rules={[
              {
                required: true,
                message: "Please configure at least one time slot",
              },
              {
                validator: (_, value) => {
                  if (!value || value.length === 0) {
                    return Promise.reject(
                      new Error("At least one time slot is required")
                    );
                  }

                  // Use comprehensive validation
                  const validation =
                    AddOnsFoodTimeSlotValidator.validateAllSlots(
                      foodTimeSlots,
                      {
                        checkBusinessHours: false,
                        checkOverlaps: true,
                        requireUniqueNames: true,
                      }
                    );

                  if (!validation.passed) {
                    return Promise.reject(new Error(validation.message));
                  }

                  return Promise.resolve();
                },
              },
            ]}
          >
            <div>
              {foodTimeSlots.map((slot, index) => {
                const slotValidation = getSlotValidation(slot);

                return (
                  <Card
                    key={slot.id}
                    size="small"
                    title={`Time Slot ${index + 1}`}
                    extra={
                      foodTimeSlots.length > 1 && (
                        <Button
                          type="text"
                          danger
                          size="small"
                          icon={<DeleteOutlined />}
                          onClick={() => removeTimeSlot(slot.id)}
                        >
                          Remove
                        </Button>
                      )
                    }
                    style={{
                      marginBottom: 16,
                      borderColor: !slotValidation.passed
                        ? "#ff4d4f"
                        : undefined,
                    }}
                  >
                    <Row gutter={16}>
                      <Col xs={24} sm={6}>
                        <Form.Item
                          label="Slot Name"
                          style={{ marginBottom: 8 }}
                          validateStatus={
                            slot.name &&
                            AddOnsFoodTimeSlotValidator.validateUniqueNames(
                              foodTimeSlots
                            ).passed === false
                              ? "error"
                              : ""
                          }
                          help={
                            slot.name &&
                            AddOnsFoodTimeSlotValidator.validateUniqueNames(
                              foodTimeSlots
                            ).passed === false
                              ? "Name must be unique"
                              : ""
                          }
                        >
                          <Input
                            placeholder="e.g., Breakfast, Lunch"
                            value={slot.name}
                            onChange={(e) =>
                              updateTimeSlot(slot.id, "name", e.target.value)
                            }
                            maxLength={50}
                          />
                        </Form.Item>
                      </Col>

                      <Col xs={24} sm={6}>
                        <Form.Item
                          label="Start Time"
                          style={{ marginBottom: 8 }}
                        >
                          <TimePicker
                            placeholder="09:00"
                            value={slot.start_time}
                            onChange={(time) =>
                              updateTimeSlot(slot.id, "start_time", time)
                            }
                            format="HH:mm"
                            style={{ width: "100%" }}
                          />
                        </Form.Item>
                      </Col>

                      <Col xs={24} sm={6}>
                        <Form.Item
                          label="End Time"
                          style={{ marginBottom: 8 }}
                          validateStatus={
                            slot.start_time &&
                            slot.end_time &&
                            !dayjs(slot.end_time).isAfter(
                              dayjs(slot.start_time)
                            )
                              ? "error"
                              : ""
                          }
                          help={
                            slot.start_time &&
                            slot.end_time &&
                            !dayjs(slot.end_time).isAfter(
                              dayjs(slot.start_time)
                            )
                              ? "End time must be after start time"
                              : ""
                          }
                        >
                          <TimePicker
                            placeholder="12:00"
                            value={slot.end_time}
                            onChange={(time) =>
                              updateTimeSlot(slot.id, "end_time", time)
                            }
                            format="HH:mm"
                            style={{ width: "100%" }}
                          />
                        </Form.Item>
                      </Col>

                      <Col xs={24} sm={6}>
                        <Form.Item
                          label="Number of Tickets"
                          style={{ marginBottom: 8 }}
                        >
                          <InputNumber
                            placeholder="100"
                            value={slot.num_of_tickets}
                            onChange={(value) =>
                              updateTimeSlot(slot.id, "num_of_tickets", value)
                            }
                            min={1}
                            max={10000}
                            style={{ width: "100%" }}
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    {/* Show validation message for this slot */}
                    {!slotValidation.passed && (
                      <div
                        style={{
                          color: "#ff4d4f",
                          fontSize: "12px",
                          marginTop: "4px",
                        }}
                      >
                        {slotValidation.message}
                      </div>
                    )}
                  </Card>
                );
              })}

              <Button
                type="dashed"
                onClick={addTimeSlot}
                icon={<PlusOutlined />}
                style={{ width: "100%" }}
              >
                Add Time Slot
              </Button>
            </div>
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );
}
