"use client";
import { useEffect, useState } from "react";

export default function ProfilePage() {
    const [user, setUser] = useState<{ name: string } | null>(null);

    useEffect(() => {
        const userData = localStorage.getItem("user");
        if (userData) { setUser(JSON.parse(userData)); }
    }, []);

    return (
        <main className="p-10 max-w-lg mx-auto bg-gray-100 rounded-lg shadow-md">
            <div className="bg-white p-6 rounded-lg shadow-md mb-8 text-black">
                <h1 className="text-3xl font-bold">Profiili</h1>
                <p className="text-gray-600 mt-2">Käyttäjä: {user?.name || "ladataan..."}</p>
            </div>

            <h2 className="text-2xl font-semibold mb-4 text-black">Kuvat</h2>
            {/* tässä myöhemmin backendin logiikka*/}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="aspect-square bg-gray-200 bg-gray-200 rounded-lg flex items-center text-gray-400 text-sm">
                    Ei vielä kuvia
                </div>  
            </div>
        </main>
    );
}