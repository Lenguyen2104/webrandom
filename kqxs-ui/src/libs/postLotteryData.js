export default async function postLotteryData() {
  const response = await fetch(`http://localhost:3001/api/lottery/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    // throw new Error("failed to fetch user");
  }

  return response.json();
}
