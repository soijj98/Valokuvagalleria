
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

      //kokeillaan localStoragea ekaksi
      const localStatus = localStorage.getItem("IsLoggedIn") === "true";
      if (localStatus) {
        setIsLoggedIn(true);
      }
      
      try {
        const response = await fetch("http://127.0.0.1:8000/api/home/", {
          credentials: "include",
        });

       // if(response.status === 401) {
       //   setIsLoggedIn(false);
      //  localStorage.removeItem("IsLoggedIn");
         // return;
        //}
      
        // setIsLoggedIn(response.ok); //jos status on 200, ollaan kirjautuneena, muuten ei
        if(!response.ok) {
          setIsLoggedIn(true);
          localStorage.setItem("IsLoggedIn", "true");
        } else {
          setIsLoggedIn(false);
          localStorage.removeItem("IsLoggedIn");
        }

      } catch (error) {
        
        console.error("Network or server error:", error);
        //setIsLoggedIn(false)
      }
    };

    checkLoginStatus();

    window.addEventListener("storage", checkLoginStatus); //kuuntelee localStorage muutoksia, jotta saadaan päivitettyä navbarin tila kirjautumisen jälkeen

    return () => {
      window.removeEventListener("storage", checkLoginStatus);
    };
  }, [pathname]); //ajaa tarkistuksen aina, kun sivu (polku) vaihtuu


  const handleLogout = async () => {
    try  {
      await fetch("http://127.0.0.1:8000/api/logout/", {
        method: "POST",
        credentials: "include"
      });
      localStorage.removeItem("IsLoggedIn");
      setIsLoggedIn(false);
      router.push("/login");
    } catch (error) {
      console.log("Uloskirjautuminen epäonnistui", error);
    }
  };
  

  return (
    <nav className="flex gap-4 p-4 bg-gray-100 text-black shadow-sm">
      <Link href="/" className="font-bold">Etusivu</Link>
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