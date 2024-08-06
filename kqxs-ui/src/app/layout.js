import { Inter } from "next/font/google";
import PropTypes from "prop-types";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Kết quả xổ số hàng ngày",
  description: "KQXS - Kết quả xổ số hàng ngày - KQXS",
};

export default function RootLayout({ children }) {
  RootLayout.propTypes = {
    children: PropTypes.node.isRequired,
  };

  return (
    <html lang="vi">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
