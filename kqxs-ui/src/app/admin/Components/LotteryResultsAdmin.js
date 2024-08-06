"use client";

import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import getLotteryDataForAdmin from "../../../libs/getLotteryDataForAdmin";
import ws from "../../../webSocketAdmin";
import styles from "./LotteryResultsAdmin.module.css";

LotteryResultsAdmin.propTypes = {
  data: PropTypes.array.isRequired,
};

export default function LotteryResultsAdmin({ data }) {
  const [dataLottery, setDataLottery] = useState(data);

  useEffect(() => {
    // Function to fetch initial data
    async function fetchData() {
      const fetchedData = await getLotteryDataForAdmin();
      setDataLottery(fetchedData);
    }

    // Function to update the state with new WebSocket data
    const updateData = (updatedData) => {
      console.log("🚀 ~ updateData ~ updatedData:", updatedData);
      setDataLottery(updatedData);
    };

    // Setup WebSocket event listener
    ws.onmessage = (event) => {
      try {
        const updatedData = JSON.parse(event.data);
        console.log("🚀 ~ useEffect ~ updatedData:", updatedData);
        updateData(updatedData);
      } catch (error) {
        console.error("Error parsing WebSocket data:", error);
      }
    };

    // Fetch initial data
    fetchData();

    // Cleanup function to close WebSocket connection and remove event listener
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);

  return (
    <div className={styles.container}>
      {dataLottery.length <= 0 ? (
        <div className={styles.waitingMessage}>đang đợi vòng quay thử...</div>
      ) : (
        dataLottery.map((stage, index) => (
          <div key={index} className={styles.resultsBox}>
            <h2 className={styles.resultsTitle}>
              <span className={styles.secondLine}>
                <a className={styles.resultsTitle} href="/lottery-results">
                  Kết quả Xổ số Miền Bắc (KQXS MB) - Stage {stage.stage}
                </a>
              </span>
              <span className={`${styles.secondLine} ${styles.redText}`}>
                XSMB (Nam Định) Đang quay thưởng
              </span>
              <span className={styles.secondLine}>
                <a href="/xsmb" className={styles.link}>
                  XSMB
                </a>{" "}
                /
                <a href="/xsmb-results" className={styles.link}>
                  XSMB
                </a>{" "}
                /
                <a href="/xsmb-results/2024-08-03" className={styles.link}>
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
                {stage?.data?.map((prize) => (
                  <tr key={prize.name}>
                    <td className={styles.prizeColumn}>{prize.name}</td>
                    <td>{prize.numbers.join(", ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  );
}
