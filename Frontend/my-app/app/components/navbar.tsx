
"use client";
import {useEffect, useState} from "react"; 
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";


export default function Navbar() {
  const [isLoggedin, setIsLoggedIn] = useState(false);
  const router = useRouter();
  const pathname = usePathname();


  useEffect(() => {

    const checkLoginStatus = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/home/", {
          credentials: "include",
        });
      
      if (response.ok) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false)
        }
      } catch (error) {
        setIsLoggedIn(false)
      }
    };

    checkLoginStatus();
  }, [pathname]); //ajaa tarkistuksen aina, kun sivu (polku) vaihtuu


  const handleLogout = async () => {
    try  {
      await fetch("http://127.0.0.1:8000/api/logout/", {
        method: "POST",
        credentials: "include"
      });
      setIsLoggedIn(false);
      router.push("/login");
    } catch (error) {
      console.log("Uloskirjautuminen epäonnistui", error);
    }
  };
  

  return (
    <nav className="flex gap-4 p-4 bg-gray-100 text-black shadow-sm">
      <Link href="/home" className="font-bold">Etusivu</Link>
      <div className="flex gap-4 ml-auto">
        {isLoggedin ? (
          <>
            <Link href="/upload">Lataa kuva</Link>
            <Link href="/profile">Profiili</Link>
            <button onClick={handleLogout} className="hover:text-red-400 font-semibold">Kirjaudu ulos</button>
          </>
        ) : (
          <>
            <Link href="/login">Kirjaudu</Link>
            <Link href="/register" className="bg-blue-500 text-white px-3 py-1 rounded">Luo tunnus</Link>
          </>
        )}
      </div>
    </nav>
  );

}