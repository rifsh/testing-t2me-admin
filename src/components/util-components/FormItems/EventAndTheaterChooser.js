import React, { useEffect } from "react";
import { Form, Select, Divider } from "antd";
import { CalendarOutlined, SearchOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import TheaterListForm from "components/util-components/FormItems/TheaterListForm";
import { EventType } from "constants/AppConstants";
import { isOrganizer } from "configs/UserAccessConfig";
import { fetchAllEvent } from "store/slices/eventSlice";
import { EVENT_TYPES } from "constants/PageConstants";

const { Option } = Select;

const EventAndTheaterChooser = ({ type, form }) => {
  const dispatch = useDispatch();

  const { filteredEvents = [], loading = false } = useSelector(
    (state) => state.event || {}
  );

  useEffect(() => {
    if (isOrganizer() && type === EventType.EVENT) {
      dispatch(fetchAllEvent({ event_type: EVENT_TYPES.event }));
    }
  }, [dispatch, type]);

  return (
    <>
      {isOrganizer() && type === EventType.MOVIE ? (
        <>
          <TheaterListForm
            rules={[{ required: true }]}
            form={form}
            mode="multiple"
            name="theatre_ids"
            apiParams={{
              organizer: true,
            }}
          />
          <Divider style={{ margin: "16px 0" }} />
        </>
      ) : isOrganizer() && type === EventType.EVENT ? (
        <>
          <Form.Item
            name="event_ids"
            label="Events"
            rules={[
              {
                required: true,
                message: "Please select at least one event!",
              },
            ]}
          >
            <Select
              showSearch
              placeholder="Search and select events"
              mode="multiple"
              loading={loading}
              allowClear
              suffixIcon={<SearchOutlined />}
              filterOption={(input, option) =>
                option.children.props.children[1]
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              size="large"
            >
              {filteredEvents?.map((event) => (
                <Option key={event.id} value={event.id}>
                  <div className="font-medium text-gray-900 flex items-center">
                    <CalendarOutlined className="mr-2 text-blue-500" />
                    {event.event_name}
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>
        </>
      ) : (
        <></>
      )}
    </>
  );
};

export default EventAndTheaterChooser;