export default async function postLotteryData() {
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  // const response = await fetch(`${BASE_URL}/api/lottery/generate`, {
    const response = await fetch('https://quaythuxsmb.net/api/lottery/generate', {
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
