"use client";

import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import styles from "./LotteryResultsAdmin.module.css";

LotteryResultsAdmin.propTypes = {
  data: PropTypes.array.isRequired,
};

export default function LotteryResultsAdmin({ data }) {
  const [currentNumberIndex, setCurrentNumberIndex] = useState(0);
  const [countdown, setCountdown] = useState(5);
  const [isCountdownActive, setIsCountdownActive] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const [editingNumber, setEditingNumber] = useState(null);
  const [newNumber, setNewNumber] = useState("");
  const [completedNumbers, setCompletedNumbers] = useState([]);
  const [dataLottery, setDataLottery] = useState(data);
  const [prizes, setPrizes] = useState(dataLottery);

  let ws;

  const connectWebSocket = () => {
    ws = new WebSocket(`wss://quaythuxsmb.net/socket/admin`);

    ws.onopen = () => {
      ws.send("admin"); // Identifies as an admin client
    };

    ws.onmessage = (event) => {
      try {
        const updatedData = JSON.parse(event.data);
        setDataLottery(updatedData);
        setPrizes(updatedData);
      } catch (error) {
        console.error(
          "Error parsing WebSocket data:",
          error,
          "Received data:",
          event.data
        );
      }
    };

    ws.onclose = () => {
      setTimeout(connectWebSocket, 1000);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
  };

  connectWebSocket();

  useEffect(() => {
    // Function to fetch initial data
    // async function fetchData() {
    //   const fetchedData = await getLotteryDataForAdmin();
    //   setDataLottery(fetchedData);
    // }

    // Function to update the state with new WebSocket data
    const updateData = (updatedData) => {
      setDataLottery(updatedData);
    };

    // Setup WebSocket event listener
    ws.onmessage = (event) => {
      try {
        const updatedData = JSON.parse(event.data);
        updateData(updatedData);
      } catch (error) {
        console.error("Error parsing WebSocket data:", error);
      }
    };

    // Fetch initial data
    // fetchData();

    // Cleanup function to close WebSocket connection and remove event listener
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [dataLottery]);

  const specialNumber = prizes?.find((prize) => prize.name === "Đặc biệt")
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
    }, 2000);

    return () => {
      clearInterval(countdownTimer);
      clearTimeout(numberChangeTimer);
    };
  }, [
    prizes,
    dataLottery,
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

  const getMaxLengthForPrize = (number) => {
    for (const prize of dataLottery) {
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

  const handleSaveNumber = async () => {
    const updatedPrizes = prizes.map((prize) => ({
      ...prize,
      numbers: prize.numbers.map((num) =>
        num === editingNumber ? newNumber : num
      ),
    }));

    setPrizes(updatedPrizes);
    setEditingNumber(null);

    try {
      const BASE_URL = process.env.REACT_APP_BASE_URL;
      const response = await fetch(`${BASE_URL}/api/lottery/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedPrizes),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log("🚀 ~ handleSaveNumber ~ errorText:", errorText);
      }

      const result = await response.json();
      const formattedResult = result.data ? result.data : result;
      console.log("Data posted successfully:", formattedResult);
    } catch (error) {
      console.error("Error posting data:", error);
    }
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
        {numbers?.map((number, i) => (
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
        {dataLottery?.length == 0 ? (
          <div className={styles.waitingMessage}>đang đợi vòng quay thử...</div>
        ) : (
          <table className={styles.resultsTable}>
            <thead>
              <tr>
                <th className={styles.prizeColumn}>Giải</th>
                <th>Kết quả</th>
              </tr>
            </thead>
            <tbody>
              {prizes?.map((prize) => (
                <tr key={prize.name}>
                  <td className={styles.prizeColumn}>{prize.name}</td>
                  <td>{renderNumbers(prize.numbers, prize.name)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
