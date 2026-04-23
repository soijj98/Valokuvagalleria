// app/login/page.tsx
"use client";
import Image from "next/image";

import { useState } from "react";
import { useRouter } from "next/navigation";


export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); //nollataan vanhat virheet


    try {
        const response = await fetch("http://127.0.0.1:8000/api/login/", {
            method: "POST",
            headers: {
                "Content-type": "application/json",
            },
            body: JSON.stringify({ username, password }),

            credentials: "include",
        });

        if (response.ok) {
            const data = await response.json();
            console.log("Kirjautuminen onnistui:", data);

            localStorage.setItem("IsLoggedIn", "true");
            
            window.dispatchEvent(new Event("storage"));
            //ohjataan profiiliin / etusivulle kirjautumisen jälkeen
            router.push("/profile"); //(" / ") etusivulle

        
        } else {
            //jos status on 401 (unauthorized)
            const errorData = await response.json();
            setError(errorData.error || "Väärä käyttäjänimi tai salasana.");
        }
    } catch (err) {
        console.error("Verkkovirhe:", err);
        setError("Yhteys palvelimeen epäonnistui.");
    }
  };

 
 
    return (
    
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">

        <Image
            src="/naail-hussain-XGLXYn6XOrQ-unsplash.jpg"
            alt="Taustakuva"
            layout="fill"
            priority
            className="-z-10"
        ></Image>

          <div className="w-full max-auto max-w-sm rounded-xl bg-white p-8 shadow-md">
                
                <h1 className="mb-6 text-center text-2xl font-bold text-gray-800">Kirjaudu sisään</h1>
                
                <form onSubmit={handleLogin} className="space-y-4">
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Käyttäjätunnus</label>
                        <input 
                        type="text" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="mt-1 w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-blue-500 text-black"
                        placeholder="Syötä tunnus"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Salasana</label>
                        <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mt-1 w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-blue-500 text-black"
                        placeholder="********"
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="w-full rounded-md bg-blue-600 py-2 font-semibold text-white hover:bg-blue-700 transition-colors"
                    >
                        Kirjaudu
                    </button>
                </form>
                
                <p className="mt-6 text-center text-sm text-gray-600">
                Eikö sinulla ole tunnusta? <a href="/register" className="text-blue-600 hover:underline">Luo uusi tästä</a>
                </p>
            </div>
            
            
        </main>

 
  );
}