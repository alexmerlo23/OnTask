import React from 'react';
import { DayPilotNavigator } from "@daypilot/daypilot-lite-react";

// styling
const styles = {
  wrap: {
    display: "flex"
  },
  left: {
    marginRight: "10px"
  },
  main: {
    flexGrow: "1"
  }
};

const CalendarNav = ({ setStartDate }) => {
  const handleTimeRangeSelected = args => {
    setStartDate(args.day); // Call the function to update the start date
  };

  // navbar
  return (
    <div style={styles.wrap}>
      <div style={styles.left}>
        <DayPilotNavigator
          selectMode={"Week"}
          showMonths={1}
          skipMonths={1}
          onTimeRangeSelected={handleTimeRangeSelected}
        />
      </div>
    </div>
  );
}

export default CalendarNav;