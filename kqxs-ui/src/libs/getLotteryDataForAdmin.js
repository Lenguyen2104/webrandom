export default async function getLotteryDataForAdmin() {
  const response = await fetch(`http://localhost:3001/api/lottery/results`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("failed to fetch user");
  }

  return response.json();
}
