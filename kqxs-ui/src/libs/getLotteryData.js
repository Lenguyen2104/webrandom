export default async function getLotteryData() {
  const response = await fetch(`http://localhost:3001/api/lottery/get`);

  if (!response.ok) {
    throw new Error("failed to fetch user");
  }

  return response.json();
}
