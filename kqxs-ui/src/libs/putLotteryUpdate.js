// export default async function putLotteryUpdate(data) {
//   const response = await fetch(`http://localhost:3001/api/lottery/update`, {
//     method: "PUT",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(data),
//   });

//   if (!response.ok) {
//     throw new Error("failed to fetch user");
//   }

//   return response.json();
// }

export const putLotteryUpdate = async (data) => {
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  return fetch(`${BASE_URL}/api/lottery/update`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
};
