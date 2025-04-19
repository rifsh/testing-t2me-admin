import React from "react";
import {
  Card,
  Row,
  Col,
  Table,
  Badge,
  ProgressBar,
} from "react-bootstrap";
import { Bar, Pie, Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

const OrganizerReports = () => {
  const scheduledEvents = [
    {
      id: 1,
      title: "Tech Conference 2025",
      image:
        "https://media.licdn.com/dms/image/v2/C561BAQE-51J-8KkMZg/company-background_10000/company-background_10000/0/1584559866970/eventscom_cover?e=2147483647&v=beta&t=3bktbE7ts5aNwH8XEUM5rW0G2aMbuQ1b2dHBVQgZqmA",
      startDate: "2025-05-20",
      endDate: "2025-05-22",
      status: "Upcoming",
      updatedAt: "2025-04-10",
      attendees: 250,
      capacity: 300,
      revenue: 12500,
    },
    {
      id: 2,
      title: "Startup Meetup",
      image:
        "https://mediaim.expedia.com/destination/9/cd8a3f3db7149b0ce36d052aea1182df.jpg",
      startDate: "2025-03-10",
      endDate: "2025-03-11",
      status: "Completed",
      updatedAt: "2025-03-05",
      attendees: 180,
      capacity: 200,
      revenue: 9000,
    },
    {
      id: 3,
      title: "AI Workshop",
      image:
        "https://s7ap1.scene7.com/is/image/incredibleindia/india-gate-delhi-1-attr-hero?qlt=82&ts=1727351922349",
      startDate: "2025-04-18",
      endDate: "2025-04-19",
      status: "Upcoming",
      updatedAt: "2025-04-12",
      attendees: 95,
      capacity: 120,
      revenue: 4750,
    },
    {
      id: 4,
      title: "Health Summit",
      image:
        "https://aurifer.tax/wp-content/uploads/2023/03/1295CA28-51B0-4890-B288-7E2B6ABCA328.jpeg",
      startDate: "2025-02-01",
      endDate: "2025-02-03",
      status: "Cancelled",
      updatedAt: "2025-01-25",
      attendees: 0,
      capacity: 150,
      revenue: 0,
    },
    {
      id: 5,
      title: "Marketing Seminar",
      image:
        "https://media.licdn.com/dms/image/v2/C561BAQE-51J-8KkMZg/company-background_10000/company-background_10000/0/1584559866970/eventscom_cover?e=2147483647&v=beta&t=3bktbE7ts5aNwH8XEUM5rW0G2aMbuQ1b2dHBVQgZqmA",
      startDate: "2025-06-15",
      endDate: "2025-06-16",
      status: "Upcoming",
      updatedAt: "2025-04-14",
      attendees: 210,
      capacity: 250,
      revenue: 10500,
    },
  ];

  // Calculate statistics
  const totalStats = {
    scheduled: scheduledEvents.length,
    upcoming: scheduledEvents.filter((e) => e.status === "Upcoming").length,
    completed: scheduledEvents.filter((e) => e.status === "Completed").length,
    cancelled: scheduledEvents.filter((e) => e.status === "Cancelled").length,
    totalRevenue: scheduledEvents.reduce(
      (sum, event) => sum + event.revenue,
      0
    ),
    totalAttendees: scheduledEvents.reduce(
      (sum, event) => sum + event.attendees,
      0
    ),
    avgAttendance: Math.round(
      scheduledEvents.reduce(
        (sum, event) => sum + (event.attendees / event.capacity) * 100,
        0
      ) / scheduledEvents.length
    ),
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Upcoming":
        return (
          <Badge className="p-3 bg-primary text-white rounded-md">
            Upcoming
          </Badge>
        );
      case "Completed":
        return <Badge className="p-3 bg-success rounded-md">Completed</Badge>;
      case "Cancelled":
        return <Badge className="p-3 bg-danger rounded-md">Cancelled</Badge>;
      default:
        return <Badge className="p-3 bg-warning rounded-md">Unknown</Badge>;
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Chart data
  const statusChartData = {
    labels: ["Upcoming", "Completed", "Cancelled"],
    datasets: [
      {
        data: [totalStats.upcoming, totalStats.completed, totalStats.cancelled],
        backgroundColor: ["#0dcaf0", "#198754", "#dc3545"],
        borderWidth: 1,
      },
    ],
  };

  const revenueChartData = {
    labels: scheduledEvents.map((event) => event.title),
    datasets: [
      {
        label: "Revenue ($)",
        data: scheduledEvents.map((event) => event.revenue),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 2,
      },
    ],
  };

  const attendanceChartData = {
    labels: scheduledEvents.map((event) => event.title),
    datasets: [
      {
        label: "Attendance Rate (%)",
        data: scheduledEvents.map((event) =>
          Math.round((event.attendees / event.capacity) * 100)
        ),
        backgroundColor: "rgba(153, 102, 255, 0.6)",
        borderColor: "rgba(153, 102, 255, 1)",
        borderWidth: 2,
        tension: 0.3,
      },
    ],
  };

  return (
    <div className="container-fluid py-4">
      <h2 className="mb-4 fw-bold text-primary">Organizer Dashboard</h2>

      {/* All Events in Separate Rows */}
      <div className="shadow-sm border-0 mb-4 w-full">
        <div className="table-responsive">
          <Table hover className="mb-0 w-100">
            <thead>
              <tr className="text-nowrap">
                <th className="ps-4">Image</th>
                <th>Event</th>

                <th>Dates</th>
                <th>Attendance</th>
                <th>Revenue</th>
                <th>Status</th>
                {/* <th className="pe-4">Actions</th> */}
              </tr>
            </thead>
            <tbody>
              {scheduledEvents.map((event) => (
                <tr
                  key={event.id}
                  className="border py-4 align-middle text-center"
                >
                  <td>
                    <div className="d-flex justify-content-center align-items-center">
                      <img
                        src={event.image}
                        alt={event.title}
                        className="rounded-circle me-3"
                        style={{
                          width: "60px",
                          height: "60px",
                          objectFit: "cover",
                          border: "2px solid #f8f9fa",
                        }}
                      />
                    </div>
                  </td>

                  <td>
                    <div>
                      <div className="fw-bold">{event.title}</div>
                      <small className="text-muted">
                        Updated:{" "}
                        {new Date(event.updatedAt).toLocaleDateString()}
                      </small>
                    </div>
                  </td>

                  <td>
                    <div>
                      {formatDate(event.startDate)} -{" "}
                      {formatDate(event.endDate)}
                    </div>
                  </td>

                  <td>
                    <div className="d-flex align-items-center justify-content-center ">
                      <div className="me-2">
                        {event.attendees}/{event.capacity}
                      </div>
                      <ProgressBar
                        now={(event.attendees / event.capacity) * 100}
                        style={{ width: "80px", height: "6px" }}
                        variant={
                          event.status === "Cancelled" ? "danger" : "primary"
                        }
                      />
                    </div>
                  </td>

                  <td className="fw-bold">${event.revenue.toLocaleString()}</td>

                  <td>{getStatusBadge(event.status)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </div>

      {/* Summary Cards */}
      <Row className="mb-4 g-4">
        <Col xl={3} lg={6} md={6}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body className="text-center">
              <div className="bg-primary bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                <i className="bi bi-calendar-event fs-3 text-primary"></i>
              </div>
              <Card.Title className="text-muted mb-1">Total Events</Card.Title>
              <Card.Text className="fs-2 fw-bold">
                {totalStats.scheduled}
              </Card.Text>
              <small className="text-muted">Last updated today</small>
            </Card.Body>
          </Card>
        </Col>
        <Col xl={3} lg={6} md={6}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body className="text-center">
              <div className="bg-info bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                <i className="bi bi-people fs-3 text-info"></i>
              </div>
              <Card.Title className="text-muted mb-1">
                Total Attendees
              </Card.Title>
              <Card.Text className="fs-2 fw-bold">
                {totalStats.totalAttendees}
              </Card.Text>
              <small className="text-muted">Across all events</small>
            </Card.Body>
          </Card>
        </Col>
        <Col xl={3} lg={6} md={6}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body className="text-center">
              <div className="bg-success bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                <i className="bi bi-currency-dollar fs-3 text-success"></i>
              </div>
              <Card.Title className="text-muted mb-1">Total Revenue</Card.Title>
              <Card.Text className="fs-2 fw-bold">
                ${totalStats.totalRevenue.toLocaleString()}
              </Card.Text>
              <small className="text-muted">From ticket sales</small>
            </Card.Body>
          </Card>
        </Col>
        <Col xl={3} lg={6} md={6}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body className="text-center">
              <div className="bg-warning bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                <i className="bi bi-graph-up fs-3 text-warning"></i>
              </div>
              <Card.Title className="text-muted mb-1">
                Avg Attendance
              </Card.Title>
              <Card.Text className="fs-2 fw-bold">
                {totalStats.avgAttendance}%
              </Card.Text>
              <ProgressBar
                now={totalStats.avgAttendance}
                className="mt-2"
                variant="warning"
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts Row */}
      <Row className="mb-4 g-4">
        <Col lg={4} md={6}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body>
              <Card.Title className="text-muted mb-3">
                Event Status Distribution
              </Card.Title>
              <div style={{ height: "250px" }}>
                <Pie
                  data={statusChartData}
                  options={{
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "bottom",
                      },
                    },
                  }}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4} md={6}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body>
              <Card.Title className="text-muted mb-3">Event Revenue</Card.Title>
              <div style={{ height: "250px" }}>
                <Bar
                  data={revenueChartData}
                  options={{
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                      },
                    },
                  }}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4} md={12}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body>
              <Card.Title className="text-muted mb-3">
                Attendance Rates
              </Card.Title>
              <div style={{ height: "250px" }}>
                <Line
                  data={attendanceChartData}
                  options={{
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 100,
                      },
                    },
                  }}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default OrganizerReports;
