"use client"
import Image from "next/image";
import { useEffect, useState } from "react";

type Photo = {
    id: number;
    title: string;
    description: string;
    image: string;
    thumbnail: string;
    tags: string[];
    uploaded_at: string;
    uploader_username: string; 
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
                            src={photo.thumbnail || photo.image} 
                            alt={photo.title} 
                            fill 
                            className="object-cover transition-transform duration-300 group-hover:scale-105" 
                            unoptimized 
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gray-900/60 backdrop-blur-sm p-2">
                                <p className="text-white text-xs font-medium truncate">
                                    @{photo.uploader_username || "Käyttäjä"}
                                </p>
                        </div>

                        {/* Pieni himmennys ja otsikko hoverilla */}
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white font-bold px-4 text-center">{photo.title}</span>
                        </div>
                    </div>
                ))}
                
                {photos.length === 0 && (
                    <p className="col-span-full text-center text-gray-500 py-10">
                        Galleria on vielä tyhjä. Ole ensimmäinen ja lataa kuva!
                    </p>
                )}
            </div>

            {/* LIGHTBOX */}
            {selectedPhoto && (
                <div className="fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-center p-2 sm:p-4 md:p-8">
                    {/* Käyttäjänimi kuvan yläpuolella */}
                <div className="mb-4 text-center">
                    <span className="text-blue-400 font-semibold tracking-wide uppercase text-sm">Ladannut:</span>
                    <h3 className="text-white text-xl font-bold">@{selectedPhoto.uploader_username}</h3>
                    <p className="text-gray-400 text-xs">
                        Ladattu: {new Date(selectedPhoto.uploaded_at).toLocaleDateString("fi-FI")}
                    </p>
                </div>
                    <button 
                        onClick={() => setSelectedPhoto(null)}
                        className="absolute top-4 right-4 md:top-6 md:right-6 text-white text-4xl md:text-5xl font-bold hover:text-gray-300 p-2 z-50"
                    >
                        &times;
                    </button>
                    
                    <div className="relative w-full max-w-5xl h-[60vh] md:h-[75vh] mb-4 md:mb-6 mt-8 md:mt-0">
                        <Image 
                            src={selectedPhoto.image} 
                            alt={selectedPhoto.title} 
                            fill 
                            className="object-contain" 
                            unoptimized 
                        />
                    </div>
                    
                    <div className="text-white text-center max-w-2xl px-4 w-full">
                        <h2 className="text-xl md:text-3xl font-bold mb-2">{selectedPhoto.title}</h2>
                        <p className="text-sm md:text-lg text-gray-300 mb-6">{selectedPhoto.description}</p>
                            <div className="flex flex-wrap justify-center gap-2 mb-4">
                                {selectedPhoto.tags && selectedPhoto.tags.map((tag, index) => (
                                    <span key={index} className="bg-blue-600/30 border border-blue-500 text-blue-300 px-2 py-1 rounded-full text-xs font-semibold">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                    </div>
                </div>
            )}
        </main>
    );
}