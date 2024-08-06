import styles from "./admin.module.css";
import LotteryResults from "./Components/LotteryResults";

export default async function AdminPage() {
  // const dataLotteryDataForAdmin = await getLotteryDataForAdmin();
  const dataLotteryDataForAdmin = [];

  return (
    <main className={styles.main}>
      <LotteryResults data={dataLotteryDataForAdmin} />
    </main>
  );
}
