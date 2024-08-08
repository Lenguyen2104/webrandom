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

const getLastTwoDigits = (number) => {
  return number.slice(-2);
};
export default function LotteryResults({ data }) {
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [shownNumbers, setShownNumbers] = useState(new Set());
  const [isSpinning, setIsSpinning] = useState(false);
  const [prizes, setPrizes] = useState(data);
  const [lotteryData, setLotteryData] = useState([]);

  // Flatten the data to get a sequential array of last two digits
  const flattenedData = lotteryData?.flatMap((category) =>
    category.numbers.map((number) => getLastTwoDigits(number))
  );

  // Initialize data structure for matched pairs
  let headColumns = Array.from({ length: 10 }, () => []);
  let tailColumns = Array.from({ length: 10 }, () => []);

  // Populate the headColumns and tailColumns
  flattenedData.forEach((digits) => {
    const first = digits[0];
    const last = digits[1];
    headColumns[first].push(last);
    tailColumns[last].push(first);
  });

  // Convert arrays to comma-separated strings
  headColumns = headColumns.map((arr) => arr.join(", "));
  tailColumns = tailColumns.map((arr) => arr.join(", "));

  const calculateOrder = () => {
    const numbers = [...prizes?.flatMap((prize) => prize?.numbers)];
    const firstCycleNumbers = numbers.filter((num) => num !== specialNumber);
    const secondCycleNumbers = [specialNumber];
    return [...firstCycleNumbers, ...secondCycleNumbers];
  };

  const specialNumber = prizes?.find((prize) => prize.name === "Đặc biệt")?.numbers[0];

  const allNumbers = calculateOrder();

  const timeDown = 2000;

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
        setLotteryData(newData);
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
      <div className={styles.formGroup}>
        {/* <div className="btn-item"> */}
        <div className="btn-item2 fixw">
          <button className={styles.buttonDanger} disabled={isSpinning}>
            Miền Bắc
          </button>
        </div>
        <div className="btn-item2 fixw">
          <button
            onClick={handleButtonClick}
            className="btn btn-danger"
            disabled={isSpinning}
          >
            {isSpinning ? "Đang quay thử" : "Quay thử"}
          </button>
        </div>
      </div>
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
      <div className={styles.lotteryTableContainer}>
        <div className={styles.options}></div>
      </div>
      <div className="number-spin">
        <label className="label-radio labelspin">
          Đầy đủ{" "}
          <input
            className="radio-1"
            defaultChecked=""
            name="spinOptions"
            defaultValue={1}
            type="radio"
          />
          <span className="radio-2" />
        </label>
        <label className="label-radio labelspin">
          2 số{" "}
          <input
            className="radio-1"
            name="spinOptions"
            defaultValue={2}
            type="radio"
          />
          <span className="radio-2" />
        </label>
        <label className="label-radio labelspin">
          3 số{" "}
          <input
            className="radio-1"
            name="spinOptions"
            defaultValue={3}
            type="radio"
          />
          <span className="radio-2" />
        </label>
      </div>
      <table className="table text-center">
        <tbody>
          <tr id="hover-number" data="xsmb">
            <td>0</td>
            <td>1</td>
            <td>2</td>
            <td>3</td>
            <td>4</td>
            <td>5</td>
            <td>6</td>
            <td>7</td>
            <td>8</td>
            <td>9</td>
          </tr>
        </tbody>
      </table>
      <div className="site-link2">
        <h4>
          <a
            title="Bảng Loto Miền Bắc"
            href="/lo-to-mien-bac/ket-qua-lo-to-mien-bac-p1.html"
          >
            Bảng Loto Miền Bắc
          </a>
        </h4>
      </div>
      <div className={styles.lotteryTableContainer}>
        <table className={styles.table}>
          <thead>
            <tr className={styles.headerRow}>
              <th className={styles.headerCell}>Đầu</th>
              <th className={styles.headerCell}>Đuôi</th>
              <th className={styles.headerCell}>Đầu</th>
              <th className={styles.headerCell}>Đuôi</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 10 }, (_, i) => (
              <tr key={i} className={styles.bodyRow}>
                <td className={styles.bodyCell}>
                  <span className={styles.redText}>{i}</span>
                </td>
                <td className={styles.bodyCell}>{headColumns[i]}</td>
                <td className={styles.bodyCell}>{tailColumns[i]}</td>
                <td className={styles.bodyCell}>
                  <span className={styles.redText}>{i}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
