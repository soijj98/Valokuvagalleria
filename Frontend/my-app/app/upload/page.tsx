"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";



export default function UploadPage() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [AlbumId, setAlbumId] = useState("");
    const [Image, setImage] = useState<File | null>(null);
    const [albums, setAlbums] = useState<{ id: number; name: string }[]>([]);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const router = useRouter();


    //haetaan albumit
    useEffect(() => {
        const fetchAlbums = async () => {
            const res = await fetch("http://localhost:3000/api/albums");
            setAlbums(await res.json());

            //testidata, jos tarvii
            // setAlbums([]{ id: 1, name: "Lomamatka" }, { id: 2, name: "Perhe" }]);
        };
        fetchAlbums();
    
    }, []);

    const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    //KUN LÄHETETÄÄN KUVIA, pitää käyttää FormData -objektia, jotta saadaan lähetettyä myös tiedosto
    const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        formData.append("albumId", AlbumId);
        if (Image) {
            formData.append("image", Image);
        }

        console.log("Lähetetään Django-backendille:", Object.fromEntries(formData)); //tarkistetaan mitä dataa lähetetään
        alert("valmiina lähetykseen!");
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImage(file);
            setPreviewUrl(URL.createObjectURL(file)); //väliaikainen URL esikatselua varten
        }
    };

    // const handleUpload = async (e: React.FormEvent) => {
    //     e.preventDefault();
    //     //simuloidaan lataus
    //     alert("kuva lähetetty (simulaatio)!");
    //     router.push("/profile"); //ohjataan profiiliin latauksen jälkeen
    // };
  
  
    return (
        <main className="p-10 max-w-lg mx-auto bg-gray-100 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-6 text-black">Lataa kuva</h1>
            <form onSubmit ={handleUpload} className="space-y-4">   
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
                    disabled={!selectImage}
                    className="mt-4 rounded-md bg-blue-600 py-2 px-4 font-semibold text-white hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    Lataa kuva
                </button>
            </form>
        </main>
    );
}