import LotteryResultsAdmin from "./Components/LotteryResultsAdmin";
import styles from "./admin.module.css";

export default async function AdminPage() {
  // const dataLotteryDataForAdmin = await getLotteryDataForAdmin();
  const dataLotteryDataForAdmin = [];

  return (
    <main className={styles.main}>
      <LotteryResultsAdmin data={dataLotteryDataForAdmin} />
      {/* <LotteryResults data={dataLotteryDataForAdmin} /> */}
    </main>
  );
}
