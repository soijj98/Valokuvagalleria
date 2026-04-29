"use client";
import { useEffect, useState } from "react"; 
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";


function getCookie(name: string) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}


export default function Navbar() {
  const [isLoggedin, setIsLoggedIn] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  //ollaanko kirjautumissivulla
  const isAuthPage = pathname === "/login" || pathname === "/register";

  useEffect(() => {
    // jos ollaan login- tai register-sivulla, ei tarvitse hakea login-statusia, koska käyttäjä ei voi olla kirjautuneena niillä sivuilla
    if (isAuthPage) {
      return;
    }

    

    const checkLoginStatus = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/check-auth/`, {
          credentials: "include",
          cache: "no-store", // Varmistaa, että saadaan tuore status joka kerta
        });

        // Jos status on 200 OK, käyttäjä on oikeasti kirjautunut sisään Djangon päässä
        if (response.ok) {
          const data = await response.json();
          setIsLoggedIn(data.is_logged_in);
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error("Network or server error:", error);
        setIsLoggedIn(false);
      }
    };

    checkLoginStatus();
  }, [pathname, isAuthPage]); // Ajaa tarkistuksen aina, kun sivu (polku) vaihtuu

  const handleLogout = async () => {
    try {
          // 1. Haetaan CSRF-token selaimen evästeistä
          const csrftoken = getCookie('csrftoken');

          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/logout/`, {
            method: "POST",
            headers: {
              // 2. Lisätään token pyynnön otsakkeisiin
              "X-CSRFToken": csrftoken || "",
            },
            credentials: "include"
          });
          
          if (response.ok) {
            setIsLoggedIn(false);
            router.push("/login");
          }
        } catch (error) {
          console.log("Uloskirjautuminen epäonnistui", error);
        }
      };

  const showAsLoggedIn = isLoggedin && !isAuthPage;

  return (
    <nav className="flex gap-4 p-4 bg-gray-100 text-black shadow-sm">
      <Link href="/" className="font-bold">Etusivu</Link>
      <div className="flex gap-4 ml-auto">
        {!showAsLoggedIn ? (
          <>
            <Link href="/login">Kirjaudu</Link>
            <Link href="/register" className="bg-blue-500 text-white px-3 py-1 rounded">Luo tunnus</Link>
          </>
        ) : (
          <>
            <Link href="/upload">Lataa kuva</Link>
            <Link href="/profile">Profiili</Link>
            <button onClick={handleLogout} className="hover:text-red-400 font-semibold">Kirjaudu ulos</button>
          </>
        )}
      </div>
    </nav>
  );
}
