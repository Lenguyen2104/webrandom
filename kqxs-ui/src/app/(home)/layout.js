import { Inter } from "next/font/google";
import PropTypes from "prop-types";
const inter = Inter({ subsets: ["latin"] });

export default function HomeLayout({ children }) {
  return (
    <html lang="vi">
      <body className={inter.className}>{children}</body>
    </html>
  );
}

HomeLayout.propTypes = {
  children: PropTypes.node.isRequired,
};
