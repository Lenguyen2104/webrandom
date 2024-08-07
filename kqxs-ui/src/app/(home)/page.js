import postLotteryData from "../../libs/postLotteryData";
import LotteryResults from "./Components/LotteryResults";
import styles from "./home.module.css";

export default async function HomePage() {
  const dataLottery = await postLotteryData();

  return (
    <main className={styles.main}>
      <LotteryResults data={dataLottery} />
    </main>
  );
}
