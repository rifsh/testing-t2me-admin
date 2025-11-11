import { Card, Checkbox, Form, Tag, Skeleton } from "antd";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAvailableOfferDays } from "store/slices/offerSlice";

const ApplicableDays = ({
    form,
    availableOfferDays,
    loading,
}) => {
    const [selectedDays, setSelectedDays] = useState([]);

    const getDayDisplayInfo = (dayName) => {
        const dayColors = {
            MONDAY: "#1890ff",
            TUESDAY: "#52c41a",
            WEDNESDAY: "#faad14",
            THURSDAY: "#722ed1",
            FRIDAY: "#eb2f96",
            SATURDAY: "#13c2c2",
            SUNDAY: "#f5222d",
        };

        const dayIcons = {
            MONDAY: "M",
            TUESDAY: "T",
            WEDNESDAY: "W",
            THURSDAY: "T",
            FRIDAY: "F",
            SATURDAY: "S",
            SUNDAY: "S",
        };

        return {
            color: dayColors[dayName] || "#1890ff",
            icon: dayIcons[dayName] || dayName.charAt(0),
            displayName: dayName.charAt(0) + dayName.slice(1).toLowerCase(),
        };
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const allDayNames = availableOfferDays.map((day) =>
                day.full_name.toUpperCase()
            );
            form.setFieldsValue({ applicable_days: allDayNames });
            setSelectedDays(allDayNames);
        } else {
            form.setFieldsValue({ applicable_days: [] });
            setSelectedDays([]);
        }
    };

    const handleDayClick = (dayName) => {
        const normalizedDayName = dayName.toUpperCase();
        const currentDays = form.getFieldValue("applicable_days") || [];
        const normalizedCurrentDays = currentDays.map((d) => d.toUpperCase());

        let newDays;
        if (normalizedCurrentDays.includes(normalizedDayName)) {
            newDays = currentDays.filter(
                (d) => d.toUpperCase() !== normalizedDayName
            );
        } else {
            newDays = [...currentDays, normalizedDayName];
        }

        form.setFieldsValue({ applicable_days: newDays });
        setSelectedDays(newDays);
    };

    const allSelected =
        availableOfferDays?.length > 0 &&
        selectedDays.length === availableOfferDays.length;

    return (
        <Card
            title={
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span>Applicable Days</span>
                </div>
            }
            bordered={false}
            style={{ marginBottom: "16px" }}
        >
            <div
                style={{
                    marginBottom: "16px",
                    padding: "12px",
                    background: "#f5f5f5",
                    borderRadius: "8px",
                }}
            >
                <Checkbox
                    checked={allSelected}
                    indeterminate={selectedDays.length > 0 && !allSelected}
                    onChange={handleSelectAll}
                    style={{ fontSize: "14px", fontWeight: 500 }}
                    disabled={loading}
                >
                    Select All Days
                </Checkbox>
            </div>

            {/* 👇 Skeleton loader when data is loading */}
            {loading ? (
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2, 1fr)",
                        gap: "10px",
                    }}
                >
                    {[...Array(7)].map((_, i) => (
                        <Card
                            key={i}
                            bordered
                            style={{
                                minHeight: "70px",
                                // maxWidth:'50px',
                                borderRadius: "8px",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "8px",
                                    height: "100%",
                                }}
                            >
                                <Skeleton.Avatar active size={32} shape="circle" />
                                <Skeleton.Button active size={12}  />
                            </div>

                        </Card>
                    ))}
                </div>
            ) : (
                <Form.Item name="applicable_days" noStyle>
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(2, 1fr)",
                            gap: "10px",
                        }}
                    >
                        {availableOfferDays?.map((day) => {
                            const dayName = day.full_name.toUpperCase();
                            const normalizedSelectedDays = selectedDays.map((d) =>
                                d.toUpperCase()
                            );
                            const isSelected = normalizedSelectedDays.includes(dayName);
                            const dayInfo = getDayDisplayInfo(dayName);

                            return (
                                <div
                                    key={day.id}
                                    onClick={() => handleDayClick(dayName)}
                                    style={{
                                        padding: "12px",
                                        borderRadius: "8px",
                                        backgroundColor: isSelected
                                            ? `${dayInfo.color}15`
                                            : "#fafafa",
                                        border: isSelected
                                            ? `2px solid ${dayInfo.color}`
                                            : "1px solid #e0e0e0",
                                        cursor: "pointer",
                                        transition: "all 0.3s ease",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: "6px",
                                        minHeight: "70px",
                                        position: "relative",
                                        boxShadow: isSelected
                                            ? `0 2px 8px ${dayInfo.color}40`
                                            : "0 1px 2px rgba(0,0,0,0.05)",
                                        transform: isSelected ? "scale(1.02)" : "scale(1)",
                                    }}
                                >
                                    <div
                                        style={{
                                            width: "32px",
                                            height: "32px",
                                            borderRadius: "50%",
                                            backgroundColor: isSelected ? dayInfo.color : "#e0e0e0",
                                            color: "white",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontWeight: "bold",
                                            fontSize: "14px",
                                            transition: "all 0.3s ease",
                                        }}
                                    >
                                        {dayInfo.icon}
                                    </div>
                                    <span
                                        style={{
                                            fontSize: "13px",
                                            fontWeight: isSelected ? 600 : 400,
                                            color: isSelected ? dayInfo.color : "#595959",
                                            textAlign: "center",
                                        }}
                                    >
                                        {dayInfo.displayName}
                                    </span>
                                    {isSelected && (
                                        <div
                                            style={{
                                                position: "absolute",
                                                top: "6px",
                                                right: "6px",
                                                width: "18px",
                                                height: "18px",
                                                borderRadius: "50%",
                                                backgroundColor: dayInfo.color,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontSize: "10px",
                                                color: "white",
                                            }}
                                        >
                                            ✓
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </Form.Item>
            )}
        </Card>
    );
};

export default ApplicableDays;
