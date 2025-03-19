import React, { useEffect } from "react";
import { Form, Select } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { getVenues, setSelectedVenue } from "store/slices/locationSlice";
import { fetchScreenTech } from "store/slices/screenSlice";

const ScreenTechListForm = ({ form, label, rules, onSelect, mode, venue_id }) => {

    const dispatch = useDispatch();
    const { screenTechnologies, techLoading } = useSelector(
        (state) => state.screen
    );

    useEffect(() => {

        if (venue_id) {
            dispatch(fetchScreenTech({ venue_id: form.getFieldValue("venue_id") }));
            console.log("placeid", screenTechnologies.map((x) => x.name));
        }

    }, [dispatch, form, venue_id]);

    const handleSetSelectedVenue = (value) => {

    };

    return (
        <Form.Item name="venue_id" label={label} rules={rules}>
            <Select
                mode={mode}
                notFoundContent={
                    techLoading ? (
                        <span>Loading ...</span>
                    ) : (
                        <span>
                            No available.
                        </span>
                    )
                }
                loading={techLoading}
                showSearch
                filterOption={(input, option) =>
                    option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                options={screenTechnologies.map((tech) => ({
                    value: tech.id,
                    label: tech.name,
                }))}
                onSelect={handleSetSelectedVenue}
            />
        </Form.Item>
    )
}

export default ScreenTechListForm    