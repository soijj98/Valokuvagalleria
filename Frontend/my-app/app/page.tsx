"use client"
import Image from "next/image";
import { useEffect, useState } from "react";

type Photo = {
    id: number;
    title: string;
    description: string;
    image: string;
    // uploader_username: string; // Tämän voi lisätä myöhemmin, kun backend palauttaa lataajan nimen
};

export default function HomePage() {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

    useEffect(() => {
        const fetchFeed = async () => {
            try {
                // Haetaan kaikkien käyttäjien kuvat uudesta feed-reitistä
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/feed/`);
                if (res.ok) {
                    const data = await res.json();
                    setPhotos(data);
                } else {
                    console.error("Virhe feedin haussa:", res.status);
                }
            } catch (error) {
                console.error("Verkkovirhe etusivun haussa:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchFeed();
    }, []);

    if (loading) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-gray-100 text-black">
                <p className="text-xl font-semibold">Ladataan galleriaa...</p>
            </main>
        );
    }


// eri näkymät kirjautuneelle vs ei

    return (
        <main className="p-10 max-w-screen ">

            <h3 className="text-3xl font-bold mb-6 text-center">Valokuvagalleria</h3>

            {/* KUVAGRIDI */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {photos.map(photo => (
                    <div 
                        key={photo.id}
                        onClick={() => setSelectedPhoto(photo)}
                        className="group aspect-square relative overflow-hidden rounded-xl shadow-md cursor-pointer bg-gray-200"
                    >
                        <Image 
                            src={photo.image} 
                            alt={photo.title} 
                            fill 
                            className="object-cover transition-transform duration-300 group-hover:scale-105" 
                            unoptimized 
                        />
                        {/* Pieni himmennys ja otsikko hoverilla */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                            <h3 className="text-white font-bold truncate">{photo.title || "Nimetön kuva"}</h3>
                        </div>
                    </div>
                ))}
                
                {photos.length === 0 && (
                    <p className="col-span-full text-center text-gray-500 py-10">
                        Galleria on vielä tyhjä. Ole ensimmäinen ja lataa kuva!
                    </p>
                )}
            </div>

            {/* LIGHTBOX / SUURENNETTU KUVA */}
            {selectedPhoto && (
                <div className="fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-center p-4">
                    <button 
                        onClick={() => setSelectedPhoto(null)}
                        className="absolute top-6 right-6 text-white text-4xl font-bold hover:text-gray-300"
                    >
                        &times;
                    </button>
                    
                    <div className="relative w-full max-w-5xl h-[75vh] mb-6">
                        <Image 
                            src={selectedPhoto.image} 
                            alt={selectedPhoto.title} 
                            fill 
                            className="object-contain" 
                            unoptimized 
                        />
                    </div>
                    
                    <div className="text-white text-center max-w-2xl">
                        <h2 className="text-3xl font-bold mb-2">{selectedPhoto.title}</h2>
                        <p className="text-gray-300 text-lg">{selectedPhoto.description}</p>
                    </div>
                </div>
            )}
        </main>
    );
}
// export default function Home() {

//   const [user, setUser] = useState(null);

//   useEffect(() => {
//     const fetchHome = async () => {
//       try {
//         const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/home/`, {
//           credentials:"include",
//         });

//         if (res.ok) {  
//           const data = await res.json();
          
//           if (data.message) {
//             setUser(data.message.replace('Hei ', '').replace('!', ''));
//           } else {
//             setUser(null); //jos message tyhjä, käyttäjä on null
//           } 
//         }
//       } catch (err) {
//         console.log("Verkkovirhe tai palvelin alhaalla", err);
//       }
//     };
//     fetchHome();
//   }, []);

//   return (
//     <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
//       <main className="p-10">
//         {user ? (
//         <h1 className="text-5xl font-bold mb-10">Tervetuloa valokuvagalleriaan {user} !</h1>
//         ) : (
//           <h1 className="text-3xl font-bold">Tervetuloa kuvagalleriaan! Kirjaudu sisään nähdäksesi kuvat</h1>
//        )}
//           <p className="text-xl mb-10">Tämä on esimerkki Next.js-sovelluksesta, jossa on kirjautumissivu ja navigaatiopalkki.</p> 
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
//           <Image src="/ana-curcan-WOzS69lhz_U-unsplash.jpg" alt="Esimerkkikuva" width={600} height={400} className="rounded-lg shadow-lg" />
//           <Image src="/harrison-lin-QNKVNphoqHU-unsplash.jpg" alt="Esimerkkikuva" width={600} height={400} className="rounded-lg shadow-lg mt-10" />
//         </div>
      
//       </main>
//     </div>
//   );
// }
