import React, { useState, useRef } from "react";
import { SeatsioSeatingChart } from "@seatsio/seatsio-react";

const SeatingChart = () => {
  const [selectedSeats, setSelectedSeats] = useState([]);
  const chartReference = useRef(null);

  const handleSubmit = () => {
    // Create JSON object with selected seats and any other data you need
    const selectionData = {
      seats: selectedSeats,
      timestamp: new Date().toISOString(),
      // Add any other necessary data here
    };
    
    console.log("Selected seats data:", selectionData);
    
    // Here you would typically send this data to your backend
    // fetch('/api/bookings', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(selectionData)
    // })
    
    alert("Selection submitted! Check console for data.");
  };

  return (
    <div>
      <div style={{ height: "500px" }}>
        <SeatsioSeatingChart
          workspaceKey="38e0b595-56e3-4836-bbfc-9c60fc423856"
          event="4b359ffa-8137-4dcf-be13-70ce325eee43"
          region="oc"
          onChartRendered={(chart) => {
            // Store reference to the chart
            chartReference.current = chart;
            console.log("Chart fully rendered", chart);
          }}
          // Track seat selection events
          onObjectSelected={(object) => {
            setSelectedSeats(prevSeats => [...prevSeats, object]);
            console.log("Selected:", object);
          }}
          onObjectDeselected={(object) => {
            setSelectedSeats(prevSeats => 
              prevSeats.filter(seat => seat.id !== object.id)
            );
            console.log("Deselected:", object);
          }}
          pricing={[
            { category: "1", price: 30 },
            { category: "2", price: 40 },
            { category: "3", price: 50 },
          ]}
          priceFormatter={(price) => `$${price}`}
        />
      </div>
      
      <div style={{ marginTop: "20px" }}>
        <h3>Selected Seats: {selectedSeats.length}</h3>
        <button 
          onClick={handleSubmit}
          style={{
            padding: "10px 20px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "16px"
          }}
        >
          Submit Selection
        </button>
      </div>
    </div>
  );
};

export default SeatingChart;