import React, { useRef, useState, useEffect } from 'react';
import { DayPilotNavigator } from "@daypilot/daypilot-lite-react";

const CalendarNav = ({ setStartDate }) => {
  const wrapperRef = useRef(null);
  const [cellWidth, setCellWidth] = useState(30);

  useEffect(() => {
    const observer = new ResizeObserver(entries => {
      for (let entry of entries) {
        const colWidth = entry.contentRect.width;
        // 7 day columns + small padding on each side
        const newCellWidth = Math.floor((colWidth - 16) / 7);
        setCellWidth(Math.max(10, newCellWidth)); // never smaller than 10
      }
    });

    if (wrapperRef.current) observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, []);

  const handleTimeRangeSelected = args => {
    setStartDate(args.day);
  };

  return (
    <div ref={wrapperRef} style={{ width: '100%' }}>
      <DayPilotNavigator
        selectMode={"Week"}
        showMonths={1}
        skipMonths={1}
        onTimeRangeSelected={handleTimeRangeSelected}
        cellWidth={cellWidth}
        cellHeight={Math.floor(cellWidth * 0.75)}
      />
    </div>
  );
}

export default CalendarNav;