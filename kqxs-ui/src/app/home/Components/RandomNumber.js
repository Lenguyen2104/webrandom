"use client";

import { useEffect, useState } from "react";
import styles from "./RandomNumber.module.css";

export default function RandomNumber({ number, duration }) {
  const [displayNumber, setDisplayNumber] = useState(
    generateRandomNumber(number.length)
  );
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayNumber(generateRandomNumber(number.length));
    }, 100);

    const timeout = setTimeout(() => {
      clearInterval(interval);
      setDisplayNumber(number);
      setIsFinished(true);
    }, duration);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [number, duration]);

  return (
    <div className={styles.numberContainer}>
      {displayNumber.split("").map((digit, index) => (
        <div key={index} className={styles.digitWrapper}>
          <div
            className={`${styles.circle} ${
              index % 2 === 0 ? styles.red : styles.black
            } ${isFinished ? styles.hidden : ""}`}
          />
          <div
            className={`${styles.digit} ${!isFinished ? styles.whiteText : ""}`}
          >
            {digit}
          </div>
        </div>
      ))}
    </div>
  );
}

function generateRandomNumber(length) {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += Math.floor(Math.random() * 10);
  }
  return result;
}
