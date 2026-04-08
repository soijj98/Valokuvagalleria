// app/register/page.tsx
import Image from "next/image";

export default function RegisterPage() {
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
        
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Käyttäjätunnus</label>
            <input type="text" className="mt-1 w-full rounded-md border border-gray-300 p-2 text-black" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Salasana</label>
            <input type="password" placeholder="Vähintään 8 merkkiä" className="mt-1 w-full rounded-md border border-gray-300 p-2 text-black" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Vahvista salasana</label>
            <input type="password" className="mt-1 w-full rounded-md border border-gray-300 p-2 text-black" />
          </div>

          <button className="w-full rounded-md bg-green-600 py-2 font-semibold text-white hover:bg-green-700 transition-colors">
            Rekisteröidy
          </button>
        </form>
      </div>
    </main>
  );
}