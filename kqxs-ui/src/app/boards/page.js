import HomePage from "../(home)/page";
// import HomePage from "../app/(home)/page";
import styles from "./boards.module.css";

export default function boards() {
  return (
    <div className={styles.main}>
      <HomePage />
    </div>
  );
}
