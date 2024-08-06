import styles from "./LotteryResults.module.css";

export const numberDisplay = (numbers, prizeName) => {
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
        <div className={`${rowClass} ${backgroundClass}`}>
          {secondRow.map((number, i) => (
            <span
              key={i}
              className={numberClass}
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
