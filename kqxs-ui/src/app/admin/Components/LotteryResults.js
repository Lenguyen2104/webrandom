"use client";

import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import getLotteryDataForAdmin from "../../../libs/getLotteryDataForAdmin";
import ws from "../../../socket";
import styles from "./LotteryResults.module.css";

LotteryResults.propTypes = {
  data: PropTypes.array.isRequired,
};

export default function LotteryResults({ data }) {
  const [currentNumberIndex, setCurrentNumberIndex] = useState(0);
  const [countdown, setCountdown] = useState(5);
  const [isCountdownActive, setIsCountdownActive] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const [editingNumber, setEditingNumber] = useState(null);
  const [newNumber, setNewNumber] = useState("");
  const [completedNumbers, setCompletedNumbers] = useState([]);
  const [newData, setNewData] = useState(data);
  const [prizes, setPrizes] = useState(newData);

  useEffect(() => {
    async function fetchData() {
      const data = await getLotteryDataForAdmin();
      setNewData(data);
    }
    fetchData();
  }, []);

  useEffect(() => {
    setPrizes(newData);
  }, [newData]);

  useEffect(() => {
    ws.onopen = () => {
      console.log("WebSocket connection opened.");
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed.");
      setTimeout(ws.connectWebSocket, 1000);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onmessage = (event) => {
      const updatedData = JSON.parse(event.data);
      setPrizes(updatedData);
      setNewData(updatedData);
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);

  const specialNumber = prizes.find((prize) => prize.name === "Đặc biệt")
    ?.numbers[0];

  const calculateNumbersOrder = () => {
    const numbers = [...prizes.flatMap((prize) => prize.numbers)];
    const firstCycleNumbers = numbers.filter((num) => num !== specialNumber);
    const secondCycleNumbers = [specialNumber];
    return [...firstCycleNumbers, ...secondCycleNumbers];
  };

  const allNumbers = calculateNumbersOrder();

  useEffect(() => {
    if (isComplete) return;

    const countdownTimer = setInterval(() => {
      setCountdown((prev) => {
        if (prev > 1) {
          return prev - 1;
        } else {
          clearInterval(countdownTimer);
          setIsCountdownActive(false);
          return 0;
        }
      });
    }, 500);

    const numberChangeTimer = setTimeout(() => {
      setCurrentNumberIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;
        if (nextIndex >= allNumbers.length) {
          setIsComplete(true);
          return prevIndex;
        }
        setCountdown(5);
        setIsCountdownActive(true);
        return nextIndex;
      });

      setCompletedNumbers((prevCompletedNumbers) => [
        ...prevCompletedNumbers,
        allNumbers[currentNumberIndex],
      ]);
    }, 3000);

    return () => {
      clearInterval(countdownTimer);
      clearTimeout(numberChangeTimer);
    };
  }, [
    newData,
    currentNumberIndex,
    allNumbers,
    countdown,
    isCountdownActive,
    isComplete,
  ]);

  const handleNumberClick = (number) => {
    setEditingNumber(number);
    setNewNumber(number);
  };

  const handleInputChange = (event) => {
    const value = event.target.value;
    const maxLength = getMaxLengthForPrize(editingNumber);

    if (value.length <= maxLength) {
      setNewNumber(value);
    }
  };

  const postUpdateData = async (data) => {
    try {
      const response = await fetch(
        "http://localhost:3001/api/lottery/update-data",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: data,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Data posted successfully:", result);
    } catch (error) {
      console.error("Error posting data:", error);
    }
  };

  const handleSaveNumber = () => {
    const updatedPrizes = prizes.map((prize) => ({
      ...prize,
      numbers: prize.numbers.map((num) =>
        num === editingNumber ? newNumber : num
      ),
    }));

    setPrizes(updatedPrizes);
    setEditingNumber(null);

    const prizeName = prizes.find((prize) =>
      prize.numbers.includes(editingNumber)
    ).name;

    const message = JSON.stringify({
      type: "updateNumber",
      prize: prizeName,
      oldNumber: editingNumber,
      newNumber,
    });
    postUpdateData(message);
  };

  const getMaxLengthForPrize = (number) => {
    for (const prize of newData) {
      if (prize.numbers.includes(number)) {
        switch (prize.name) {
          case "Đặc biệt":
          case "Giải nhất":
            return 5;
          case "Giải nhì":
          case "Giải ba":
            return 5;
          case "Giải tư":
          case "Giải năm":
            return 4;
          case "Giải sáu":
            return 3;
          case "Giải bảy":
            return 2;
          default:
            return 5;
        }
      }
    }
    return 5;
  };

  const renderNumbers = (numbers, prizeName) => {
    const numberClass =
      prizeName === "Đặc biệt" || prizeName === "Giải bảy"
        ? styles.redNumber
        : styles.resultsNumber;

    let rowClass = styles.resultsNumberRow;

    const backgroundClass =
      prizeName === "Giải nhất" && isCountdownActive
        ? styles.yellowBackground
        : "";

    if (
      prizeName === "Giải nhì" ||
      prizeName === "Giải tư" ||
      prizeName === "Giải sáu"
    ) {
      rowClass += ` ${styles.spaceAround}`;
    }

    if (prizeName === "Giải ba" || prizeName === "Giải năm") {
      const firstRow = numbers.slice(0, 3);
      const secondRow = numbers.slice(3);
      return (
        <>
          <div className={`${rowClass} ${backgroundClass}`}>
            {firstRow.map((number, i) => (
              <span
                key={i}
                className={numberClass}
                onClick={() =>
                  !completedNumbers.includes(number) &&
                  handleNumberClick(number)
                }
              >
                {editingNumber === number ? (
                  <input
                    type="text"
                    value={newNumber}
                    onChange={handleInputChange}
                    onBlur={handleSaveNumber}
                    maxLength={getMaxLengthForPrize(editingNumber)}
                  />
                ) : (
                  number
                )}
                {!completedNumbers.includes(number) && (
                  <span className={styles.timeIndicator}>
                    {(() => {
                      if (number === allNumbers[currentNumberIndex]) {
                        return isCountdownActive ? `${countdown}s` : "0s";
                      }
                      return "5s";
                    })()}
                  </span>
                )}
              </span>
            ))}
          </div>
          <div className={`${rowClass} ${backgroundClass}`}>
            {secondRow.map((number, i) => (
              <span
                key={i}
                className={numberClass}
                onClick={() =>
                  !completedNumbers.includes(number) &&
                  handleNumberClick(number)
                }
              >
                {editingNumber === number ? (
                  <input
                    type="text"
                    value={newNumber}
                    onChange={handleInputChange}
                    onBlur={handleSaveNumber}
                    maxLength={getMaxLengthForPrize(editingNumber)}
                  />
                ) : (
                  number
                )}
                {!completedNumbers.includes(number) && (
                  <span className={styles.timeIndicator}>
                    {(() => {
                      if (number === allNumbers[currentNumberIndex]) {
                        return isCountdownActive ? `${countdown}s` : "0s";
                      }
                      return "5s";
                    })()}
                  </span>
                )}
              </span>
            ))}
          </div>
        </>
      );
    }

    return (
      <div className={styles.resultsNumberRow}>
        {numbers.map((number, i) => (
          <span
            key={i}
            className={`${numberClass} ${
              number === allNumbers[currentNumberIndex] && isCountdownActive
                ? styles.yellowBackground
                : ""
            }`}
            onClick={() =>
              !completedNumbers.includes(number) && handleNumberClick(number)
            }
          >
            {editingNumber === number ? (
              <input
                type="text"
                value={newNumber}
                onChange={handleInputChange}
                onBlur={handleSaveNumber}
                maxLength={getMaxLengthForPrize(editingNumber)}
              />
            ) : (
              number
            )}
            {!completedNumbers.includes(number) && (
              <span className={styles.timeIndicator}>
                {(() => {
                  if (number === allNumbers[currentNumberIndex]) {
                    return isCountdownActive ? `${countdown}s` : "0s";
                  }
                  return "5s";
                })()}
              </span>
            )}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.resultsBox}>
        <h2 className={styles.resultsTitle}>
          <span className={styles.secondLine}>
            <a className={styles.resultsTitle}>
              Kết quả Xổ số Miền Bắc (KQXS MB)
            </a>
          </span>
          <span className={`${styles.secondLine} ${styles.redText}`}>
            XSMB (Nam Định) Đang quay thưởng
          </span>
          <span className={styles.secondLine}>
            <a href="#" className={styles.link}>
              XSMB
            </a>{" "}
            /
            <a href="#" className={styles.link}>
              XSMB
            </a>{" "}
            /
            <a href="#" className={styles.link}>
              Thứ 7 XSMB 03/08/2024 (Nam Định)
            </a>
          </span>
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

// {isWaiting ? (
//   <div className={styles.waitingMessage}>đang đợi vòng quay thử...</div>
// ) : (
//   <table className={styles.resultsTable}>
//     <thead>
//       <tr>
//         <th className={styles.prizeColumn}>Giải</th>
//         <th>Kết quả</th>
//       </tr>
//     </thead>
//     <tbody>
//       {prizes.map((prize) => (
//         <tr key={prize.name}>
//           <td className={styles.prizeColumn}>{prize.name}</td>
//           <td>{renderNumbers(prize.numbers, prize.name)}</td>
//         </tr>
//       ))}
//     </tbody>
//   </table>
// )}
