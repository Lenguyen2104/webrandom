export const getMaxLengthForPrize = (number) => {
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
