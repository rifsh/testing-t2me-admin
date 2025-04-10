export const theaterMockData = [
    {
        id: 1,
        name: "Metro Grand Cinema",
        location: "123 Central Avenue, Downtown",
        phone: "metro@cineplex.com",
        screens: 10,
        capacity: 1500,
        facilities: ["IMAX", "Dolby Atmos", "3D", "Wheelchair Access", "Café"],
        status: "active",
        openingHours: {
            weekdays: "10:00 AM - 11:00 PM",
            weekends: "9:00 AM - 12:30 AM"
        },
        ticketPricing: {
            standard: 12.99,
            premium: 16.99,
            child: 8.50
        }
    },
    {
        id: 2,
        name: "Starlight Drive-In",
        location: "456 Highway Road, Suburbs",
        phone: "info@starlightdrivein.com",
        screens: 1,
        capacity: 200,
        facilities: ["Outdoor Screening", "Food Trucks", "Pet-Friendly"],
        status: "seasonal",
        openingHours: {
            weekdays: "Closed",
            weekends: "7:00 PM - 2:00 AM (Summer Only)"
        },
        ticketPricing: {
            standard: 15.00,
            premium: 20.00,
            child: 10.00
        }
    },
    {
        id: 3,
        name: "Royal Multiplex",
        location: "789 Kings Plaza, Uptown",
        phone: "bookings@royalmultiplex.com",
        screens: 15,
        capacity: 2500,
        facilities: ["VIP Lounges", "4DX", "Gourmet Dining", "Valet Parking"],
        status: "active",
        openingHours: {
            weekdays: "9:00 AM - 1:00 AM",
            weekends: "8:00 AM - 2:00 AM"
        },
        ticketPricing: {
            standard: 14.50,
            premium: 22.00,
            vip: 35.00
        }
    },
    {
        id: 4,
        name: "CineArts Pavilion",
        location: "321 Arts District, Riverside",
        phone: "support@cinearts.com",
        screens: 5,
        capacity: 600,
        facilities: ["Indie Films", "Film Festivals", "Bar"],
        status: "maintenance",
        openingHours: {
            weekdays: "11:00 AM - 10:00 PM",
            weekends: "10:00 AM - 11:00 PM"
        },
        ticketPricing: {
            standard: 11.00,
            member: 8.00,
            senior: 7.50
        }
    }
];