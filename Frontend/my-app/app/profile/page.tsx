"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

type Photo = {
    id: number;
    image: string;
    album: number; 
    title: string;
    description: string;
    thumbnail: string;
    tags: string[];
    uploaded_at: string;
    image_url: string;
};

type Album = {
    id: number;
    name: string;
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
    const [view, setView] = useState<"photos" | "albums" | "album-detail">('photos');
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [albums, setAlbums] = useState<Album[]>([]);
    const [user, setUser] = useState<string | null>(null);
    const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
    const [albumPhotos, setAlbumPhotos] = useState<Photo[]>([]); 
    const [isEditingAlbum, setIsEditingAlbum] = useState(false); 
    const [editAlbumName, setEditAlbumName] = useState(""); 
    const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
    const [isEditingPhoto, setIsEditingPhoto] = useState(false);
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editTags, setEditTags] = useState("");
    const [editAlbumId, setEditAlbumId] = useState("");



    useEffect(() => {
        const fetchData = async () => {
            try {
                
                const userRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/home/`, {
                    credentials: "include",
                });

                if (userRes.ok) {
                    const data = await userRes.json();
                    setUser(data.message.replace('Hei ', '').replace('!', ''));
                }

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

    const handleDeletePhoto = async (photoId: number) => {
        const confirmDelete = window.confirm("Haluatko varmasti poistaa tämän kuvan? Toimintoa ei voi peruuttaa.");
        if (!confirmDelete) return;

        const csrftoken = getCookie('csrftoken'); 
    
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/photos/${photoId}/delete/`, {
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
                alert(`Kuvan poisto epäonnistui. Virhekoodi: ${response.status}`);
            }
        } catch (error) {
            console.error("Virhe kuvan poistossa:", error);
            alert("Kuvan poisto epäonnistui.");
        }
    };


    const startEditingPhoto = () => {
        if (!selectedPhoto) return;
        setEditTitle(selectedPhoto.title);
        setEditDescription(selectedPhoto.description);
        setEditTags(selectedPhoto.tags ? selectedPhoto.tags.join(", ") : "");
        setEditAlbumId(selectedPhoto.album.toString());
        setIsEditingPhoto(true);
    };

    // Lähettää päivitetyt tiedot backendille
    const handleUpdatePhoto = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPhoto) return;

        const csrftoken = getCookie('csrftoken');
        const tagArray = editTags.split(/[, ]+/).filter(t => t.trim() !== "");

        const payload = {
            title: editTitle,
            description: editDescription,
            album: editAlbumId,
            tags: tagArray
        };

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/photos/${selectedPhoto.id}/update/`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": csrftoken || "",
                },
                body: JSON.stringify(payload),
                credentials: "include",
            });

            if (res.ok) {
                const updatedPhoto = await res.json();
        
                setSelectedPhoto(updatedPhoto);
                setPhotos(photos.map(p => p.id === updatedPhoto.id ? updatedPhoto : p));
                
                setIsEditingPhoto(false);
            } else {
                const errData = await res.json();
                alert("Virhe tallennuksessa: " + JSON.stringify(errData));
            }
        } catch (error) {
            console.error("Verkkovirhe muokkauksessa:", error);
        }
    };

    const handleDeleteAlbum = async (albumId: number) => {
        const confirmDelete = window.confirm("Haluatko varmasti poistaa tämän albumin? Toimintoa ei voi peruuttaa. Albumin mukana poistuvat myös kaikki albumin kuvat.");
        if (!confirmDelete) return;

        const csrftoken = getCookie('csrftoken');

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/albums/${albumId}/delete/`, {
                method: "DELETE",
                headers: {
                    "X-CSRFToken": csrftoken || "",
                },
                credentials: "include"
            });

            if (response.ok) {
                // poistetaan albumi albumilistasta
                setAlbums(albums.filter(a => a.id !== albumId));
                setPhotos(photos.filter(p => p.album !== albumId));
                setView('albums');
                setSelectedAlbum(null);
            }   else {
                alert("Albumin poisto epäonnistui.");
            }
        } catch (error) {
            console.error("Virhe albumin poistossa:", error);
            alert("Albumin poisto epäonnistui.");
        }
    };

    const handleSaveAlbumName = async () => {
        if (!selectedAlbum || !editAlbumName) return;
        
        const csrftoken = getCookie('csrftoken');
    
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/albums/${selectedAlbum.id}/`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": csrftoken || "",
                },
                credentials: "include",
                body: JSON.stringify({ name: editAlbumName })
            });

            if (response.ok) {
                
                const updatedAlbum = await response.json();

                setAlbums(albums.map(a => a.id === updatedAlbum.id ? updatedAlbum : a));
                setSelectedAlbum(updatedAlbum);
                setIsEditingAlbum(false);
                
            } else {
                alert("Albumin nimen päivitys epäonnistui.");
            }
        } catch (error) {
            console.error("Virhe albumin nimen päivityksessä:", error);
            alert("Albumin nimen päivitys epäonnistui.");
        }
    }



    return (
        <main className="p-10 max-w-screen bg-gray-100 rounded-lg shadow-md">
            <h1 className="text-3xl text-black font-bold mb-2">Oma profiili</h1>
            {user && (
                <p className="text-lg text-gray-600">
                    Kirjautuneena: <span className="font-semibold text-blue-600">{user}</span>
                </p>
            )}
            
            {/* Välilehdet */}
            <div className="flex gap-4 mb-8 border-b pb-4">
                <button
                    onClick={() => { setView('photos'); }}
                    className={`font-semibold px-4 py-2 rounded ${view === 'photos' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                    Kaikki kuvat
                </button> 
                <button
                    onClick={() => {
                        setView('albums');
                        setSelectedAlbum(null); 
                        setAlbumPhotos([]); 
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
                                    
                                <Image 
                                    src={photo.thumbnail || photo.image} 
                                    alt={photo.title}
                                    fill 
                                    className="object-cover
                                    unoptimized" />
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
                                setIsEditingAlbum(false);
                            }}
                            className="mb-4 text-blue-600 hover:underline font-semibold"
                        >
                        ← Takaisin albumeihin
                        </button>

                        <div className="flex items-center justify-between mb-6">
                            {isEditingAlbum ? (
                                <div className="flex gap-2 w-full max-w-md">
                                    <input 
                                        type="text" 
                                        value={editAlbumName}
                                        onChange={(e) => setEditAlbumName(e.target.value)}
                                        className="border p-2 rounded flex-1 text-black"
                                    />
                                    <button onClick={handleSaveAlbumName} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
                                        Tallenna
                                    </button>
                                    <button onClick={() => setIsEditingAlbum(false)} className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded">
                                        Peruuta
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-wrap sm:flex-row sm:items-center gap-4">
                                    <h2 className="text-2xl font-bold text-black">{selectedAlbum.name}</h2>
                                    <div className="w-full flex gap-3">
                                        <button 
                                            onClick={() => { setIsEditingAlbum(true); setEditAlbumName(selectedAlbum.name); }} 
                                            className="w-1/2 text-sm text-blue-600 hover:underline"
                                        >
                                            Muokkaa nimeä
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteAlbum(selectedAlbum.id)} 
                                            className="w-1/2 text-sm text-red-600 hover:underline"
                                        >
                                            Poista albumi
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        

                        <div className="grid grid-cols border border-gray-300 sm:grid-cols-2 md:grid-cols-3 gap-6">
                            {albumPhotos.length > 0 ? (
                                albumPhotos.map(photo => (
                                    <div 
                                        key={photo.id} 
                                        onClick={() => setSelectedPhoto(photo)}
                                        className="aspect-square relative overflow-hidden rounded-lg shadow cursor-pointer hover:opacity-80 transition"
                                    >   

                                        <Image 
                                            src={photo.thumbnail || photo.image} 
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
                    <div className="fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-center p-2 sm:p-4 md:p-8">
                        
                        {/* Sulkemisnappi: Isompi touch-alue mobiilissa, sijoitettu paremmin */}
                        <button 
                            onClick={() => setSelectedPhoto(null)}
                            className="absolute top-4 right-4 md:top-6 md:right-6 text-white text-4xl md:text-5xl font-bold hover:text-gray-300 p-2 z-50"
                        >
                            &times;
                        </button>
                        
                        {/* Kuva-alue: Pienempi korkeus puhelimella (60vh) ja isompi koneella (75vh) */}
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
                            {isEditingPhoto ? (
                                /* MUOKKAUSLOMAKE */
                                <form onSubmit={handleUpdatePhoto} className="bg-gray-800 p-6 rounded-lg text-left shadow-xl space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold mb-1 text-gray-300">Otsikko</label>
                                        <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500" />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-semibold mb-1 text-gray-300">Siirrä albumiin</label>
                                        <select value={editAlbumId} onChange={(e) => setEditAlbumId(e.target.value)} className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500">
                                            {albums.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold mb-1 text-gray-300">Tägit (pilkulla erotettuna)</label>
                                        <input type="text" value={editTags} onChange={(e) => setEditTags(e.target.value)} className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500" />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold mb-1 text-gray-300">Kuvaus</label>
                                        <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500" rows={3}></textarea>
                                    </div>

                                    <div className="flex gap-2 pt-2">
                                        <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white font-semibold">Tallenna</button>
                                        <button type="button" onClick={() => setIsEditingPhoto(false)} className="flex-1 bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded text-white font-semibold">Peruuta</button>
                                    </div>
                                </form>
                            ) : (
                                /* NORMAALI NÄKYMÄ JA NAPIT */
                                <>
                                    <h2 className="text-xl md:text-3xl font-bold mb-2">{selectedPhoto.title}</h2>
                                    
                                    <div className="flex flex-wrap justify-center gap-2 mb-4">
                                        {selectedPhoto.tags && selectedPhoto.tags.map((tag, index) => (
                                            <span key={index} className="bg-blue-600/30 border border-blue-500 text-blue-300 px-2 py-1 rounded-full text-xs font-semibold">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>

                                    <p className="text-sm md:text-lg text-gray-300 mb-6">{selectedPhoto.description}</p>
                                    
                                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                                        <button 
                                            onClick={startEditingPhoto}
                                            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 px-6 py-3 md:py-2 rounded text-white font-semibold shadow-lg"
                                        >
                                            Muokkaa
                                        </button>
                                        {handleDeletePhoto && (
                                            <button 
                                                onClick={() => handleDeletePhoto(selectedPhoto.id)}
                                                className="w-full sm:w-auto bg-red-600 hover:bg-red-700 px-6 py-3 md:py-2 rounded text-white font-semibold shadow-lg"
                                            >
                                                Poista kuva
                                            </button>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
      </main>
    );
}
