const TicketMockData = {};
TicketMockData.getAllTickets = {
  data: [
    {
      id: 2,
      venue_id: 1,
      number_of_tickets: 100,
      base_price: 50,
      ticket_types: {
        set1: [
          {
            name: "Premium",
            price: 100,
            number_of_tickets: 20,
            ticket_set: "Set1",
          },
          {
            name: "Gold",
            price: 80,
            number_of_tickets: 30,
            ticket_set: "Set1",
          },
          {
            name: "Normal",
            price: 60,
            number_of_tickets: 50,
            ticket_set: "Set1",
          },
        ],
        set2: [
          {
            name: "Premium",
            price: 120,
            number_of_tickets: 15,
            ticket_set: "Set2",
          },
          {
            name: "Gold",
            price: 90,
            number_of_tickets: 25,
            ticket_set: "Set2",
          },
          {
            name: "Normal",
            price: 70,
            number_of_tickets: 60,
            ticket_set: "Set2",
          },
        ],
        set3: [
          {
            name: "Premium",
            price: 130,
            number_of_tickets: 10,
            ticket_set: "Set3",
          },
          {
            name: "Gold",
            price: 100,
            number_of_tickets: 50,
            ticket_set: "Set3",
          },
          {
            name: "Normal",
            price: 80,
            number_of_tickets: 40,
            ticket_set: "Set3",
          },
        ],
      },
    },
    {
      id: 3,
      venue_id: 1,
      number_of_tickets: 100,
      base_price: 50,
      ticket_types: {
        set1: [
          {
            name: "Premium",
            price: 100,
            number_of_tickets: 20,
            ticket_set: "Set1",
          },
          {
            name: "Gold",
            price: 80,
            number_of_tickets: 30,
            ticket_set: "Set1",
          },
          {
            name: "Normal",
            price: 60,
            number_of_tickets: 50,
            ticket_set: "Set1",
          },
        ],
      },
    },
  ],
  status: {
    message: "success",
    status_code: 200,
  },
};

export default TicketMockData;
