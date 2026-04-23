// app/register/page.tsx
"use client";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); //nollataan vanhat virheet

    if (password !== confirmPassword) {
        setError("Salasanat eivät täsmää");
        return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
      });

      if (res.ok) {
        router.push("/login");
      } else {
        const errorData = await res.json();
        setError(errorData.error || "Rekisteröityminen epäonnistui");
      }
    } catch (err) {
      console.error("Verkkovirhe tai palvelin alhaalla", err);
      setError("Yhteys palvelimeen epäonnistui");
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center p-4" >
        
        <Image
            src="/naail-hussain-XGLXYn6XOrQ-unsplash.jpg"
            alt="Taustakuva"
            layout="fill"
            priority
            className="-z-10"
        ></Image>

      <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-800">Luo uusi tili</h1>
        
        <form onSubmit={handleRegister} className="space-y-4">
          {error && <p className="text-red-500 text-sm">{error}</p>
          }
          <div>
            <label className="block text-sm font-medium text-gray-700">Käyttäjätunnus</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="mt-1 w-full rounded-md border border-gray-300 p-2 text-black" 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Salasana</label>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Vähintään 8 merkkiä" 
              required
              className="mt-1 w-full rounded-md border border-gray-300 p-2 text-black" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Vahvista salasana</label>
            <input 
              type="password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Vahvista salasana" 
              required
              className="mt-1 w-full rounded-md border border-gray-300 p-2 text-black" 
            />
          </div>

          <button 
            type="submit"
            className="w-full rounded-md bg-green-600 py-2 font-semibold text-white hover:bg-green-700 transition-colors">
            Rekisteröidy
          </button>
        </form>
      </div>
    </main>
  );
}