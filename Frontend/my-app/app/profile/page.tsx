"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

type Photo = {
    id: number;
    image: string;
    album: number; // Oletetaan, että kuva liittyy albumiin album-kentän kautta
    title: string;
    description: string;
    image_url: string;
};

type Album = {
    id: number;
    name: string;
    //description: string; // Voidaan lisätä myöhemmin, jos halutaan näyttää albumin kuvaus
    //cover_image?: string; // Voidaan lisätä myöhemmin, jos halutaan näyttää albumin kansikuva
};

// Apufunktio CSRF-tokenille (jos poistofunktio tarvitsee)
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

export default function ProfilePage() {
    //const [view, setView] = useState<"photos" | "albums" | "album-detail">("photos");
    //välilehden hallinta
    const [view, setView] = useState<"photos" | "albums" | "album-detail">('photos');
    
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [albums, setAlbums] = useState<Album[]>([]);
    
    const [loading, setLoading] = useState(true);
    const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
    const [albumPhotos, setAlbumPhotos] = useState<Photo[]>([]); //albumin kuvat erikseen, jotta voidaan näyttää vain albumin kuvat album-detail-näkymässä

    //lightbox-albuminäkymän tilat
    const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);



    useEffect(() => {
        const fetchData = async () => {
            try {
                const photosRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/photos/`, {
                    credentials: "include",
                });
                if (photosRes.ok) setPhotos(await photosRes.json());

                const albumsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/albums/`, {
                    credentials: "include",
                });
                if (albumsRes.ok) setAlbums(await albumsRes.json());

            } catch (err) {
                console.error("Virhe datan haussa:", err);
            }
        };
        fetchData();
    }, []);


    const handleAlbumClick = async (album: Album) => {

        setSelectedAlbum(album);
        const filteredPhotos = photos.filter(photo => photo.album === album.id);
        setAlbumPhotos(filteredPhotos);
        setView('album-detail');


    };
    //     setLoading(true);
    //     setSelectedAlbum(album);
    //     try {
    //         const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/albums/${album.id}/photos/`, {
    //             credentials: "include",
    //         });
    //         if (res.ok) {
    //             const fetchedPhotos = await res.json();
    //             setAlbumPhotos(fetchedPhotos);
    //             setView('album-detail');
    //         }   else {
    //             console.error("Virhe albumin kuvien haussa:", res.status);
    //             alert("Albumin kuvien haku epäonnistui.");
    //         }
    //     } catch (err) {
    //         console.error("Virhe albumin kuvien haussa:", err);
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    const handleDeletePhoto = async (photoId: number) => {
        const confrimDelete = window.confirm("Haluatko varmasti poistaa tämän kuvan? Toimintoa ei voi peruuttaa.");
        if (!confrimDelete) return;

        const csrftoken = getCookie('csrftoken'); 
    
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/photos/${photoId}/`, {
                method: "DELETE",
                headers: {
                    "X-CSRFToken": csrftoken || "",
                },
                credentials: "include"
            });

            if (response.ok) {
                // poistetaan kuva sekä päälistasta että albumin listasta
                setPhotos(photos.filter(p => p.id !== photoId));
                setAlbumPhotos(albumPhotos.filter(p => p.id !== photoId));
                setSelectedPhoto(null); //suljetaan lightbox, jos poistettu kuva oli auki
                alert("Kuva on poistettu.");
            } else {
                alert("Kuvan poisto epäonnistui.");
            }
        } catch (error) {
            console.error("Virhe kuvan poistossa:", error);
            alert("Kuvan poisto epäonnistui.");
        }
    };




    return (
        <main className="p-10 max-w-screen bg-gray-100 rounded-lg shadow-md">
            <h1 className="text-3xl text-black font-bold mb-8">Oma profiili</h1>
            
            {/* Välilehdet */}
            <div className="flex gap-4 mb-8 border-b pb-4">
                <button
                    onClick={() => { setView('photos'); /* Tässä pitäisi ehkä hakea kaikki kuvat uudestaan jos ne muuttuivat */}}
                    className={`font-semibold px-4 py-2 rounded ${view === 'photos' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                    Kaikki kuvat
                </button> 
                <button
                    onClick={() => {
                        setView('albums');
                        setSelectedAlbum(null); //varmistetaan, että album-detail-näkymä sulkeutuu, jos vaihdetaan suoraan albumit-välilehdelle
                        setAlbumPhotos([]); //tyhjennetään albumin kuvat, jotta vanhan albumin kuvat ei jää näkyviin, jos uusi albumi on tyhjä
                    }}
                    className={`font-semibold px-4 py-2 rounded 
                        ${view === 'album-detail' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                    Albumit
                </button>
            </div>
                {/* NÄKYMÄ 1: Kaikki kuvat */}

                {view === 'photos' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {photos.map(photo => (
                            <div 
                                key={photo.id}
                                onClick={() => setSelectedPhoto(photo)} 
                                className="aspect-square relative overflow-hidden rounded-lg shadow hover:opacity-90 transition"
                                >
                                    
                                <Image src={photo.image} alt={photo.title} fill className="object-cover unoptimized" />
                            </div>
                        ))}
                        {photos.length === 0 && <p className="col-span-full text-gray-500">Ei vielä ladattuja kuvia</p>}  
                    </div>
                )}

                {/* NÄKYMÄ 2: Albumit */}
                {view === 'albums' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {albums.map(album => (
                            <div 
                                key={album.id}
                                onClick={() => handleAlbumClick(album)}
                                className="p-6 border rounded-lg bg-gray-50 shadow-sm cursor-pointer text-black hover:bg-gray-200 transition"
                                >
                                    <h3 className="font-bold text-xl">{album.name}</h3>
                                  {/*  <p className="text-sm text-gray-600 mt-2">{album.description}</p>
                                */}
                                
                                {/*<div className="aspect-video relative bg-gray-200 rounded-xl overflow-hidden mb-2">
                                     Voidaan näyttää albumin kansikuva, jos sellainen on */
                                        /*album.cover_image ? (
                                            <Image src={album.cover_image} alt={album.name} fill className="object-cover" />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-gray-500">
                                                Kansikuva puuttuu
                                            </div>
                                        )
                                    
                                </div>*/}
                            </div>
                        ))}
                            {albums.length === 0 && <p className="col-span-full text-gray-500">Ei vielä luotuja albumeita</p>}
                    </div>    
                        
                )}  
                        
                {/* YKSITTÄINEN ALBUMIN NÄKYMÄ */}
                {view === 'album-detail' && selectedAlbum && (
                    <div>
                        <button
                            onClick={() => {
                                setView('albums');
                                setSelectedAlbum(null);
                            }}
                            className="mb-4 text-blue-600 hover:underline font-semibold"
                        >
                        ← Takaisin albumeihin
                        </button>
                        <h2 className="text-2xl font-bold mb-6 text-black">{selectedAlbum.name}</h2>

                        <div className="grid grid-cols sm:grid-cols-2 md:grid-cols-3 gap-6">
                            {albumPhotos.length > 0 ? (
                                albumPhotos.map(photo => (
                                    <div 
                                        key={photo.id} 
                                        onClick={() => setSelectedPhoto(photo)}
                                        className="aspect-square relative overflow-hidden rounded-lg shadow cursor-pointer hover:opacity-80 transition"
                                    >   
                                        {/* HUOM: Varmista että photo.image on se kenttä missä URL on */}
                                        <Image 
                                            src={photo.image} 
                                            alt={photo.title} 
                                            fill 
                                            className="object-cover" 
                                            unoptimized 
                                        />
                                    </div>
                                ))
                            ) : (
                                <p className="col-span-full text-gray-500">Tässä albumissa ei ole vielä kuvia.</p>
                            )}
                        </div>
                    </div>
                )}

                  
                

                {/* Lightbox-albuminäkymässä */}

                {selectedPhoto && (
                    <div className="fixed inset-0 bg-black/90 z-50 flex flex-col impact-0 items-center justify-center p-4">
                        <button
                            onClick={() => setSelectedPhoto(null)}
                            className="absolute top-6 right-6 text-white text-4xl font-bold hover:text-gray-300"
                        >
                            &times;
                        </button>

                        <div
                            className="relative w-full max-w-4xl h-[70vh] mb-4"
                        >

                        <Image 
                            src={selectedPhoto.image}
                            alt={selectedPhoto.title}
                            fill 
                            className="object-contain"
                            unoptimized
                        />  
                        </div>
                    
                        <div className="text-white text-center">
                            <h2 className="text-2xl font-bold mb-2">{selectedPhoto.title}</h2>
                            <p className="mb-6">{selectedPhoto.description}</p>
                            <button
                                onClick={() => handleDeletePhoto(selectedPhoto.id)}
                                className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded text-white font-semibold">
                                Poista kuva
                            </button>
                        </div>
                    </div>
                )}
        </main>
    );
}
