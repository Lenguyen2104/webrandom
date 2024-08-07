export default async function getLotteryDataForAdmin() {
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const response = await fetch(`${BASE_URL}/api/lottery/results`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    // throw new Error("failed to fetch user");
    console.log("failed to fetch user");
  }

  return response.json();
}
