"use client";

import { usePathname } from "next/navigation";

export default function FixedBackground() {
  const pathname = usePathname();
  
  // ไม่แสดง FixedBackground ในหน้า authentication
  const authPages = ['/login', '/signup', '/forget-password', '/reset-password', '/update-password'];
  const isAuthPage = authPages.includes(pathname);
  
  if (isAuthPage) {
    return null;
  }

  return (
    <div
      className="top-0 left-0 -z-10 fixed bg-[length:80%] bg-[url('/assets/images/bg-main.jpg')] bg-zinc-950 bg-no-repeat bg-right-bottom opacity-30 w-screen h-screen"
    ></div>
  );
}