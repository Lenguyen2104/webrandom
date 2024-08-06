export default async function getLotteryDataForAdmin() {
  const response = await fetch(
    `http://localhost:3001/api/lottery/get-data-admin`
  );

  if (!response.ok) {
    throw new Error("failed to fetch user");
  }

  return response.json();
}
