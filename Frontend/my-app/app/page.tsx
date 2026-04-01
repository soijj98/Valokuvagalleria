import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="p-10">
        <h1 className="text-5xl font-bold mb-10">Tervetuloa valokuvagalleriaan!</h1>
        <p className="text-xl mb-10">Tämä on esimerkki Next.js-sovelluksesta, jossa on kirjautumissivu ja navigaatiopalkki.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <Image src="/ana-curcan-WOzS69lhz_U-unsplash.jpg" alt="Esimerkkikuva" width={600} height={400} className="rounded-lg shadow-lg" />
          <Image src="/harrison-lin-QNKVNphoqHU-unsplash.jpg" alt="Esimerkkikuva" width={600} height={400} className="rounded-lg shadow-lg mt-10" />
        </div>
      
      </main>
    </div>
  );
}
