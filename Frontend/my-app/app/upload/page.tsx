"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

function getCookie(name: string) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + "=")) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

export default function UploadPage() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [albumId, setAlbumId] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [albums, setAlbums] = useState<{ id: number; name: string }[]>([]);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isCreatingAlbum, setIsCreatingAlbum] = useState(false);
    const [newAlbumName, setNewAlbumName] = useState("");
    const router = useRouter();


    //haetaan albumit
    useEffect(() => {
        const fetchAlbums = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/albums/`, {
                    method: 'GET',
                    credentials: 'include',
                });

                if (response.ok) {
                    const data = await response.json();
                    setAlbums(data);
                } else {
                    console.error("Haku epäonnistui, status:", response.status);
                }
            } catch (error) {
                console.error("Virhe albumien haussa:", error);
            }
        };

        fetchAlbums();
    }, []);

    const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    //KUN LÄHETETÄÄN KUVIA, pitää käyttää FormData -objektia, jotta saadaan lähetettyä myös tiedosto

        
        if (!image || !albumId) {
            alert("Valitse kuva ja albumi!");
            return;
        }   
    
        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        formData.append("album", albumId);
        formData.append("image", image);
      
    

        try {
            const csrftoken = getCookie('csrftoken'); //haetaan CSRF-token evästeistä

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/photos/upload/`, {
                method: "POST",
                headers: {
                    "X-CSRFToken": csrftoken || "", //lisätään token otsakkeisiin
                },
                body: formData,
                credentials: "include", //lähetetään cookiet, jos backend vaatii autentikointia
            });

            if (response.ok) {
                alert("Kuva ladattu onnistuneesti!");
                router.push("/profile"); //ohjataan profiiliin latauksen jälkeen
            } else {
                const errorData = await response.json();
                alert("Virhe: " + (errorData.error || "Lataus epäonnistui"));
            }
        } catch (error) {
            console.error("Virhe kuvan latauksessa:", error);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImage(file);
            setPreviewUrl(URL.createObjectURL(file)); //väliaikainen URL esikatselua varten
        }
    };

    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        }
    }, [previewUrl]);

    const handleCreateAlbum = async () => {
        if (!newAlbumName) return;
        try {
            const csrftoken = getCookie('csrftoken');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/albums/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": csrftoken || "",
                },
                body: JSON.stringify({ name: newAlbumName }),
                credentials: "include",
            });

            if (response.ok) {
                const createdAlbum = await response.json();
                setAlbums([...albums, createdAlbum]);
                setAlbumId(createdAlbum.id.toString());
                setIsCreatingAlbum(false);
                setNewAlbumName("");
                alert("Albumi luotu onnistuneesti!");
            }
        } catch (error) {
            console.error("Virhe albumin luomisessa:", error);
        }
    };
    
    return (
        <main className="p-10 max-w-lg mx-auto bg-gray-100 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-6 text-black">Lataa kuva</h1>
            <form onSubmit ={handleUpload} className="space-y-4">   
                
                {/* Otsikko */}
                <input
                    type="text"
                    placeholder="Kuvan otsikko"
                    className="w-full p-2 border rounded border-gray-300 text-black"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />

                {/* Albuminvalinta */}
             {/*   <select
                    className="w-full p-2 border rounded border-gray-300 text-black"
                    value={albumId}
                    onChange={(e) => setAlbumId(e.target.value)}
                >                
                <option value="">Valitse albumi</option>
                {albums.map((album) => (
                    <option key={album.id} value={album.id}>
                        {album.name}
                    </option>
                ))}
                </select>
                */}
                <div className="flex gap-2 items-end">
                    {!isCreatingAlbum ? (
                        <div className="flex-1">
                            <label className="block text-sm text-gray-700 mb-1">Uusi albumi</label>
                            <select 
                                className="w-full p-2 border rounded border-gray-300 text-black"
                                value={albumId}
                                onChange={(e) => setAlbumId(e.target.value)}
                            >
                                <option value="">Valitse albumi</option>
                                {albums.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                             </select>
                    </div>
                    ) : (
                        <div className="flex-1">
                            <label className="block text-sm text-gray-700 mb-1">Uuden albumin nimi</label>
                            <input 
                            type = "text"
                            className="w-full p-2 border rounded border-gray-300 text-black"
                            value={newAlbumName}
                            onChange={(e) => setNewAlbumName(e.target.value)}
                            />
                        </div>
                    )}
                    <button
                        type="button"
                        onClick={(isCreatingAlbum) ? handleCreateAlbum : () => setIsCreatingAlbum(true)}
                        className="bg-gray-200 px-3 py-2 rounded text-sm text-black hover:bg-gray-300"
                    >
                        {isCreatingAlbum ? "Tallenna" : "Uusi albumi"}
                    </button>
                </div>
                <textarea 
                    placeholder="Kuvaus"
                    className="w-full p-2 border rounded border-gray-300 text-black"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)} // Tämä pitää löytyä!
/> 
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {previewUrl && (
                    <div className="mt-4">
                        <p className="text-sm text-gray-500 mb-2">Esikatselu:</p>
                        <img src={previewUrl} alt="Esikatselu" className="w-full h-64 object-cover rounded-lg shadow" />
                    </div>
                )}

                <button
                    type="submit"
                    disabled={!image || !albumId}
                    className="mt-4 rounded-md bg-blue-600 py-2 px-4 font-semibold text-white hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    Lataa kuva
                </button>
            </form>
        </main>
    );
}