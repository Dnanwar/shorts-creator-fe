type HeatMapPoint = {
  time_in_sec: number;
  intensity: number;
};

type TimeRange = {
  startTime: number;
  endTime: number;
};

export function convertToRanges(
  heatMapInfo: HeatMapPoint[],
  totalDuration: number,
  spread: number = 7.5
): TimeRange[] {
  return heatMapInfo.map(({ time_in_sec }) => {
    let startTime = time_in_sec - spread;
    let endTime = time_in_sec + spread;

    if (startTime < 0) {
      endTime += Math.abs(startTime);
      startTime = 0;
    }

    if (endTime > totalDuration) {
      const overshoot = endTime - totalDuration;
      startTime = Math.max(0, startTime - overshoot);
      endTime = totalDuration;
    }

    // Clamp within 0-totalDuration just to be safe
    startTime = Math.max(0, Math.min(startTime, totalDuration));
    endTime = Math.max(0, Math.min(endTime, totalDuration));

    // return {
    //   startTime: Number(startTime.toFixed(2)),
    //   endTime: Number(endTime.toFixed(2)),
    // };
    return {
      startTime: Math.floor(startTime),
      endTime: Math.floor(endTime),
    };
  });
}
