"use client";

import PropTypes from "prop-types";
import { useEffect, useState } from "react";

function CountdownTimer({ startFrom }) {
  const [time, setTime] = useState(startFrom);

  useEffect(() => {
    if (time <= 0) return;
    const timer = setInterval(() => {
      setTime((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [time]);

  return <span>{time > 0 ? time : "0"}</span>;
}

CountdownTimer.propTypes = {
  startFrom: PropTypes.number.isRequired,
};

export default CountdownTimer;
