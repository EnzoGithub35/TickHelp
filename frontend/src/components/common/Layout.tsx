import Header from "./Header";
import Sidebar from "./Sidebar";
import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => (
  <div className="layout">
    <Header />
    <div className="main-content">
      <Sidebar />
      <main className="page-content">{children}</main>
    </div>
  </div>
);

export default Layout;
