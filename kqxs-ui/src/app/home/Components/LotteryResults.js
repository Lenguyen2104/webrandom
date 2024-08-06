"use client";

import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import postLotteryData from "../../../libs/postLotteryData";
import ws from "../../../webSocketClient";
import styles from "./LotteryResults.module.css";
import RandomNumber from "./RandomNumber";

LotteryResults.propTypes = {
  data: PropTypes.array.isRequired,
};

export default function LotteryResults({ data }) {
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [shownNumbers, setShownNumbers] = useState(new Set());
  const [isSpinning, setIsSpinning] = useState(false);
  const [prizes, setPrizes] = useState(data);

  const calculateOrder = () => {
    const numbers = [...prizes.flatMap((prize) => prize.numbers)];
    const firstCycleNumbers = numbers.filter((num) => num !== specialNumber);
    const secondCycleNumbers = [specialNumber];
    return [...firstCycleNumbers, ...secondCycleNumbers];
  };

  const specialNumber = prizes.find((prize) => prize.name === "Đặc biệt")
    ?.numbers[0];
  const allNumbers = calculateOrder();

  const timeDown = 6000;

  useEffect(() => {
    const updateData = (updatedData) => {
      setPrizes(updatedData);
    };

    if (typeof window !== "undefined") {
      window.handleWebSocketData = updateData;
    }

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
      if (typeof window !== "undefined") {
        delete window.handleWebSocketData;
      }
    };
  }, []);

  useEffect(() => {
    let interval;
    if (isSpinning) {
      interval = setInterval(() => {
        setCurrentIndex((prevIndex) => {
          const nextIndex = prevIndex + 1;
          if (nextIndex >= allNumbers.length) {
            clearInterval(interval);
            setIsSpinning(false);
            return prevIndex;
          }
          setShownNumbers((prevSet) => {
            const updatedSet = new Set(prevSet);
            updatedSet.add(allNumbers[nextIndex]);
            return updatedSet;
          });
          return nextIndex;
        });
      }, timeDown);
    }
    return () => clearInterval(interval);
  }, [isSpinning, allNumbers]);

  const handleButtonClick = async () => {
    if (!isSpinning) {
      setShownNumbers(new Set());
      setCurrentIndex(-1);
      setIsSpinning(true);
      try {
        const newData = await postLotteryData();
        setPrizes(newData);
      } catch (error) {
        console.error("Failed to fetch new data", error);
      }
    }
  };

  const renderNumbers = (numbers, prizeName) => {
    const numberClass =
      prizeName === "Đặc biệt" || prizeName === "Giải bảy"
        ? styles.redNumber
        : styles.resultsNumber;

    let rowClass = styles.resultsNumberRow;

    if (
      prizeName === "Giải nhì" ||
      prizeName === "Giải tư" ||
      prizeName === "Giải sáu"
    ) {
      rowClass += " " + styles.spaceAround;
    }

    const renderBall = (number, index) => {
      return (
        <div className={styles.ballWrapper} key={index}>
          {shownNumbers.has(number) ? (
            <RandomNumber number={number} duration={timeDown} />
          ) : (
            <div className={styles.spinningBall} />
          )}
        </div>
      );
    };

    if (prizeName === "Giải ba" || prizeName === "Giải năm") {
      const firstRow = numbers.slice(0, 3);
      const secondRow = numbers.slice(3);
      return (
        <>
          <div className={rowClass}>
            {firstRow.map((number, i) => renderBall(number, i))}
          </div>
          <div className={rowClass}>
            {secondRow.map((number, i) => renderBall(number, i))}
          </div>
        </>
      );
    }

    return (
      <div className={rowClass}>
        {numbers?.map((number, i) => renderBall(number, i))}
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.resultsBox}>
        <h2 className={styles.resultsTitle}>
          <span className={styles.secondLine}>Xổ số Miền Bắc (KQXS MB)</span>
          <span className={`${styles.secondLine} ${styles.redText}`}>
            XSMB (Nam Định) Đang quay thưởng
          </span>
          <span className={styles.secondLine}>
            <a href="/xsmb" className={styles.link}>
              XSMB
            </a>{" "}
            /
            <a href="/xsmb" className={styles.link}>
              XSMB
            </a>{" "}
            /
            <a href="/xsmb/thu-7-03-08-2024" className={styles.link}>
              Thứ 7 XSMB 03/08/2024 (Nam Định)
            </a>
          </span>
          <button
            className={styles.spinButton}
            onClick={handleButtonClick}
            disabled={isSpinning}
          >
            {isSpinning ? "Đang quay thử" : "Quay thử"}
          </button>
        </h2>
        <table className={styles.resultsTable}>
          <thead>
            <tr>
              <th className={styles.prizeColumn}>Giải</th>
              <th>Kết quả</th>
            </tr>
          </thead>
          <tbody>
            {prizes.map((prize) => (
              <tr key={prize.name}>
                <td className={styles.prizeColumn}>{prize.name}</td>
                <td>{renderNumbers(prize.numbers, prize.name)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
