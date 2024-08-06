import { Inter } from "next/font/google";
import PropTypes from "prop-types";

const inter = Inter({ subsets: ["latin"] });

export default function AdminLayout({ children }) {
  return (
    <html lang="vi">
      <body className={inter.className}>{children}</body>
    </html>
  );
}

AdminLayout.propTypes = {
  children: PropTypes.node.isRequired,
};
