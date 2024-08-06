import getLotteryData from "../../libs/getLotteryData";
import LotteryResults from "./Components/LotteryResults";
import styles from "./home.module.css";

export default async function HomePage() {
  const dataLottery = await getLotteryData();

  return (
    <main className={styles.main}>
      <LotteryResults data={dataLottery} />
    </main>
  );
}
