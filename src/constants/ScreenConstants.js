export const screenOptions = {
    screenTypes: [
        { label: "Standard", value: "standard" },
        { label: "IMAX", value: "imax" },
        { label: "VIP", value: "vip" },
        { label: "4DX", value: "4dx" },
        { label: "3D", value: "3d" }
    ],
    seatStructures: [
        { value: "1", label: "Default Structure" },
        { value: "2", label: "Custom Structure 1" },
        { value: "3", label: "Custom Structure 2" },
    ],
    ticketStructures: [
        { value: "1", label: "Default Pricing" },
        { value: "2", label: "Weekend Pricing" },
        { value: "3", label: "Holiday Pricing" },
    ],
    availableTimes: [
        { value: "morning", label: "Morning" },
        { value: "afternoon", label: "Afternoon" },
        { value: "evening", label: "Evening" },
        { value: "night", label: "Night" },
    ],
    accessibilityFeatures: [
        { value: "wheelchair", label: "Wheelchair Access" },
        { value: "hearing_loop", label: "Hearing Loop" },
        { value: "audio_description", label: "Audio Description" },
    ],
    screenTechnologies: [
        { value: "digital", label: "Digital" },
        { value: "laser", label: "Laser Projection" },
        { value: "dolby", label: "Dolby Vision" },
    ],
    audioSystems: [
        { value: "standard", label: "Standard" },
        { value: "dolby_atmos", label: "Dolby Atmos" },
        { value: "dts", label: "DTS-X" },
    ],
};
