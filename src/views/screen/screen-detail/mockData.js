// Mock data for ScreenDetailView component
const mockScreenDetail = {
    screen_id: "SCR10025",
    screen_name: "Premier IMAX Experience",
    screen_number: "4",
    description: "Our flagship IMAX screen features state-of-the-art projection technology and Dolby Atmos sound system for the ultimate cinematic experience. The stadium-style seating arrangement ensures perfect viewing angles from every seat.",
    capacity: 248,
    reserved_seating: true,
    seat_structure_id: "SEAT-IMAX-01",
    
    venue: {
      id: "VEN1002",
      name: "CinePlex Metropolis",
      place: {
        id: "PLC1001",
        name: "Downtown Center",
        country: {
          id: "CTR101",
          name: "United States"
        }
      }
    },
    
    screen_technology: {
      id: "TECH1003",
      name: "IMAX",
      description: "IMAX digital projection system with 4K resolution and a 1.9:1 aspect ratio. Features laser-aligned digital sound and a curved screen that extends beyond your peripheral vision for a truly immersive experience."
    },
    
    audio: {
      id: "AUD1002",
      name: "Dolby Atmos",
      description: "64-channel surround sound technology with overhead speakers for a truly immersive audio experience. Supports object-based audio for precise sound positioning and movement throughout the theater space."
    },
    
    accessibilty: [
      {
        id: "ACC1001",
        name: "Wheelchair Accessible"
      },
      {
        id: "ACC1002",
        name: "Hearing Loop"
      },
      {
        id: "ACC1003",
        name: "Audio Description"
      }
    ],
    
    time_slots: [
      "10:00 AM - 12:30 PM",
      "1:00 PM - 3:30 PM",
      "4:00 PM - 6:30 PM",
      "7:00 PM - 9:30 PM",
      "10:00 PM - 12:30 AM"
    ],
    
    screen_ticket_structure: [
      "General Admission - $18.50",
      "Senior/Student - $15.00",
      "Children (3-12) - $12.50",
      "VIP Experience - $25.00",
      "Tuesday Discount - $12.00"
    ]
  };