// app/login/page.tsx

import Image from "next/image";
export default function LoginPage() {
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
                
                <form className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Käyttäjätunnus</label>
                    <input 
                    type="text" 
                    className="mt-1 w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-blue-500 text-black"
                    placeholder="Syötä tunnus"
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700">Salasana</label>
                    <input 
                    type="password" 
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