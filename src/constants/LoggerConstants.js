export const eventType = [
    { value: "all", label: "All Event Types" },
    { value: "event_ticket", label: "Event Ticket" },
    { value: "event_seat", label: "Event Seat" },
    { value: "movie_seat", label: "Movie" },
]

export const statusFilters = [
    { value: "all", label: "All" },
    { value: "scheduled", label: "Scheduled" },
    { value: "completed", label: "Completed" },
    { value: "failed", label: "Failed" },
    { value: "cancelled", label: "Cancelled" },
]
export const paymentModeFilters = [
    { value: "all", label: "All" },
    { value: "ONLINE", label: "Online" },
    { value: "COUNTER", label: "Counter Sale" },
]

export const paymentPlatformFilters = [
    { value: "all", label: "All" },
    { value: "WEB", label: "WEB" },
    { value: "ANDROID", label: "Android" },
    { value: "IOS", label: "IOS" },
]

export const paymentFilterTypes = {
    paymentMode: 'payment_mode',
    paymentPlatform: 'payment_platform',
}

export const triggeredText = '-- [Triggered from'