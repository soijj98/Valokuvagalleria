"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

type Photo = {
    id: number;
    image: string;
    title: string;
    description: string;
    image_url: string;
};

type Album = {
    id: number;
    name: string;
    //cover_image?: string; // Voidaan lisätä myöhemmin, jos halutaan näyttää albumin kansikuva
};

export default function ProfilePage() {
    const [view, setView] = useState<"photos" | "albums" | "album-detail">("photos");
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [albums, setAlbums] = useState<Album[]>([]);
    const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        const fetchData = async () => {
            try {
                const [photosRes, albumsRes] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/photos/`, {
                        credentials: "include",
                    }),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/albums/`, {
                        credentials: "include",
                    }),
                ]);

                if (photosRes.ok) setPhotos(await photosRes.json());
                if (albumsRes.ok) setAlbums(await albumsRes.json());
            } catch (err) {
                console.error("Virhe datan haussa:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);


    const handleAlbumClick = async (album: Album) => {
        setLoading(true);
        setSelectedAlbum(album);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/albums/${album.id}/photos/`, {
                credentials: "include",
            });
            if (res.ok) {
                const albumPhotos = await res.json();
                setPhotos(albumPhotos);
                setView("album-detail");
            }   
        } catch (err) {
            console.error("Virhe albumin kuvien haussa:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p>Ladataan...</p>
            </div>
        );
    }


    return (
        <main className="p-10 max-w-lg mx-auto bg-gray-100 rounded-lg shadow-md">
            <h1 className="text-3xl text-black font-bold mb-8">Oma profiili</h1>
            <div className="flex gap-4 mb-8 border-b pb-4">
                <button
                    onClick={() => { setView("photos"); /* Tässä pitäisi ehkä hakea kaikki kuvat uudestaan jos ne muuttuivat */}}
                    className={`pb-2 px-4 ${view === "albums" ? "border-b-2 border-blue-500 font-bold" : "text-gray-600"}`}
                >
                    Albumit
                </button> 
                </div>
                {/* NÄKYMÄ 1: Kaikki kuvat */}

                {view === "photos" && (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {photos.map(photo => (
                            <div key={photo.id} className="aspect-square relative overflow-hidden rounded-lg shadow hover:opacity-90 transition">   
                            <Image src={photo.image} alt={photo.title} fill className="object-cover" />
                            </div>
                        ))}
                        {photos.length === 0 && <p className="col-span-full text-gray-500">Ei vielä ladattuja kuvia</p>}  
                    </div>
                )}

                {/* NÄKYMÄ 2: Albumit */}
                {view === "albums" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {albums.map(album => (
                            <div 
                                key={album.id}
                                onClick={() => handleAlbumClick(album)}
                                className="cursor-pointer group"
                                >
                                <div className="aspect-video relative bg-gray-200 rounded-xl overflow-hidden mb-2">
                                    {/* Voidaan näyttää albumin kansikuva, jos sellainen on */
                                        /*album.cover_image ? (
                                            <Image src={album.cover_image} alt={album.name} fill className="object-cover" />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-gray-500">
                                                Kansikuva puuttuu
                                            </div>
                                        )
                                    */}
                                </div>
                                <h3 className="font-semibold text-lg">{album.name}</h3>
                            </div>
                        ))}
                    </div>
                )}
                {/* NÄKYMÄ 3: Albumin kuvat */}
                {view === "album-detail" && (
                    <div>
                        <button
                            onClick={() => setView("albums")}
                            className="mb-6 text-blue-600 hover:underline flex items-center gap-2"
                        >
                        ← Takaisin albumeihin
                        </button>
                        <h2 className="text-2xl font-bold mb-6">{selectedAlbum?.name}</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {photos.map(photo => (
                                <div key={photo.id} className="aspect-square relative overflow-hidden rounded-lg shadow">
                                    <Image src={photo.image} alt={photo.title} fill className="object-cover" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
        </main>
    );
}