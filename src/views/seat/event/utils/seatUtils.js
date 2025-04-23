export const updateSeatNumbers = (seats) => {
    const updatedSeats = JSON.parse(JSON.stringify(seats));
    
    for (let r = 0; r < updatedSeats.length; r++) {
      let visibleSeatCount = 1;
      
      for (let c = 0; c < updatedSeats[r].length; c++) {
        if (updatedSeats[r][c].type === 'hidden') {
          updatedSeats[r][c].visualNumber = '';
        } else {
          updatedSeats[r][c].visualNumber = visibleSeatCount++;
        }
      }
    }
    
    return updatedSeats;
  };
  
  export const generateInitialSeats = (rows, columns) => {
    const newSeats = [];
    
    for (let r = 0; r < rows; r++) {
      const rowLabel = String.fromCharCode(65 + r);
      const row = [];
      
      for (let c = 0; c < columns; c++) {
        row.push({
          id: `${rowLabel}${c+1}`,
          type: 'standard',
          category: r < Math.floor(rows / 3) ? 'front' : 
                  r < Math.floor(rows * 2/3) ? 'middle' : 'back',
          visualNumber: c+1
        });
      }
      
      newSeats.push(row);
    }
    
    return updateSeatNumbers(newSeats);
  };