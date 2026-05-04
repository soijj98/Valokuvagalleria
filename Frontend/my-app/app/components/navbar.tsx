"use client";
import { useEffect, useState } from "react"; 
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Home, ImagePlus, User, LogOut, LogIn, Menu, X, UserPlus } from "lucide-react";


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
  const [isOpen, setIsOpen] = useState(false);
  const isAuthPage = pathname === "/login" || pathname === "/register";

  useEffect(() => {

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

    <nav className="bg-white text-black shadow-sm sticky top-0 z-50">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-extrabold text-blue-600 flex items-center gap-2">
              <Home className="w-6 h-6" />
              <span>Valokuvagalleria</span>
            </Link>
          </div>

          {/* Desktop-navigointi */}
          <div className="hidden md:flex space-x-8 items-center">
            <Link href="/" className="flex items-center gap-2 font-semibold hover:text-blue-600 transition-colors">
              <Home className="w-5 h-5" />
                Etusivu
            </Link>

            {showAsLoggedIn ? (
                <>
                    <Link href="/upload" className="flex items-center gap-2 font-semibold hover:text-blue-600 transition-colors">
                        <ImagePlus className="w-5 h-5" /> Lataa kuva
                    </Link>
                    <Link href="/profile" className="flex items-center gap-2 font-semibold hover:text-blue-600 transition-colors">
                        <User className="w-5 h-5" /> Profiili
                    </Link>
                    <button 
                        onClick={handleLogout} 
                        className="flex items-center gap-2 font-semibold text-red-600 hover:text-red-800 transition-colors"
                    >
                        <LogOut className="w-5 h-5" /> Kirjaudu ulos
                    </button>
                </>
            ) : (
                <>
                <Link href="/login" className="flex items-center gap-2 font-semibold hover:text-blue-600 transition-colors">
                  <LogIn className="w-5 h-5" /> Kirjaudu
                </Link>
                <Link href="/register" className="flex items-center gap-2 font-semibold hover:text-blue-600 transition-colors">
                    <UserPlus className="w-5 h-5" /> Rekisteröidy
                </Link>
                </>
            )}

          </div>

                    <div className="md:hidden flex items-center">
                        <button 
                            onClick={() => setIsOpen(!isOpen)} 
                            className="text-gray-600 hover:text-black focus:outline-none p-2"
                        >
                            {isOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
                        </button>
                    </div>
                </div>
            </div>
        

            {isOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 shadow-lg absolute w-full">
                    <div className="px-4 pt-2 pb-6 space-y-2 flex flex-col">
                        <Link 
                            href="/" 
                            onClick={() => setIsOpen(false)} 
                            className="flex items-center gap-3 p-3 font-semibold hover:bg-gray-100 rounded-lg"
                        >
                            <Home className="w-6 h-6 text-gray-500" /> Etusivu
                        </Link>

                      {showAsLoggedIn ? (
                          <>
                              <Link 
                                  href="/upload" 
                                  onClick={() => setIsOpen(false)} 
                                  className="flex items-center gap-3 p-3 font-semibold hover:bg-gray-100 rounded-lg"
                              >
                                  <ImagePlus className="w-6 h-6 text-gray-500" /> Lataa kuva
                              </Link>
                              <Link 
                                  href="/profile" 
                                  onClick={() => setIsOpen(false)} 
                                  className="flex items-center gap-3 p-3 font-semibold hover:bg-gray-100 rounded-lg"
                              >
                                  <User className="w-6 h-6 text-gray-500" /> Profiili
                              </Link>
                              <button 
                                  onClick={() => { handleLogout(); setIsOpen(false); }} 
                                  className="flex items-center gap-3 p-3 font-semibold text-red-600 hover:bg-red-50 rounded-lg w-full text-left"
                              >
                                  <LogOut className="w-6 h-6" /> Kirjaudu ulos
                              </button>
                          </>
                      ) : (
                          <>
                            <Link 
                                href="/login" 
                                onClick={() => setIsOpen(false)} 
                                className="flex items-center gap-3 p-3 font-semibold hover:bg-gray-100 rounded-lg"
                            >
                                <LogIn className="w-6 h-6 text-gray-500" /> Kirjaudu
                            </Link>
                            <Link 
                              href="/register" 
                              onClick={() => setIsOpen(false)} 
                              className="flex items-center gap-3 p-3 font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg"
                            >
                              <UserPlus className="w-6 h-6" /> Rekisteröidy
                            </Link>
                        </>
                      )}
                  </div>
              </div>
          )}


    </nav>
  );
}
