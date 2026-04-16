
"use client";
import {useEffect, useState} from "react"; 
import Link from "next/link";
import { useRouter } from "next/navigation";


export default function Navbar() {
  const [isLoggedin, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const status = localStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(status);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    router.push("/login");
  }
  

  return (
    <nav className="flex gap-4 p-4 bg-gray-100 text-black">
      <Link href="/">Etusivu</Link>
      <div className="flex gap-4">
        {isLoggedin ? (
          <>
            <Link href="/upload">Lataa kuva</Link>
            <Link href="/profile">Profiili</Link>
            <button onClick={handleLogout} className="hover:text-red-400">Kirjaudu ulos</button>
          </>
        ) : (
          <>
            <Link href="/login">Kirjaudu</Link>
            <Link href="/register">Luo tunnus</Link>
          </>
        )}
      </div>
    </nav>
  );

}