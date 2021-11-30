import moment from "moment";
import React, { useEffect, useState } from "react";

export const TimeClock = ({ lastTime, isCountUp }) => {
  const [duration, setDuration] = useState("");
  const [intervalId, setIntervalId] = useState(null);

  useEffect(() => {
    if (lastTime) {
      const temp = getDiff();
      if (temp > 0) {
        setDuration(moment.duration(temp));
        const intervalIdTemp = setInterval(() => {
          const diff = getDiff();
          setDuration(moment.duration(diff));
        }, 1000);
        setIntervalId(intervalIdTemp);
      }
    }
    return () => {
      clearInterval(intervalId);
    };
  }, [lastTime]);

  const getDiff = () => {
    if (isCountUp) {
      return moment().diff(lastTime);
    } else {
      return lastTime.diff(moment());
    }
  };

  const convertClock = (str) => {
    return str.toString().padStart(2, "0");
  };

  return (
    <>
      {duration && (
        <p>
          {convertClock(duration.days())}:{convertClock(duration.hours())}:
          {convertClock(duration.minutes())}:{convertClock(duration.seconds())}
        </p>
      )}
      {!duration && <p>00:00:00:00</p>}
    </>
  );
};
