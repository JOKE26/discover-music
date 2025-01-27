"use client";

import { fetchWithAuth } from "@/utils/spotify";
import { useState, useEffect } from "react";

// type Track = {
//   id: string;
//   name: string;
//   artists: { name: string }[];
//   album: { name: string; images: { url: string }[] };
// };

export default function Home() {
  const [query, setQuery] = useState("");
  const [code, setCode] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const codeParams = urlParams.get("code");
    if (codeParams) {
      setCode(codeParams);
      fetchToken(codeParams);
    }
  }, []);

  const fetchToken = async (code: string) => {
    try {
      const response = await fetch(`/api/auth?code=${code}`);
      const data = await response.json();
      console.log("Token reçu =", data);

      localStorage.setItem("spotify_access_token", data.access_token);
      localStorage.setItem("spotify_refresh_token", data.refresh_token);

      // Nettoie l'URL
      window.history.replaceState({}, document.title, "/");
    } catch (error) {
      console.error("Erreur lors de la récupération des tokens = ", error);
    }
  };

  const handleLogin = () => {
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID}&response_type=code&redirect_uri=${process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI}&scope=user-read-private`;

    window.location.href = authUrl;
  };

  const searchTracks = async () => {
    setError(null);
    try {
      const data = await fetchWithAuth(
        `https://api.spotify.com/v1/search?q=${query}&type=track`
      );
      setResults(data.tracks.items);
    } catch (error) {
      console.error("Erreur lors de la recherche = ", error);
      setError("Une erreur s'est produite lors de la recherche");
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">
        Bienvenue sur ma plateforme de découverte musicale
      </h1>
      {!code && (
        <button
          onClick={handleLogin}
          className="bg-green-500 text-white p-2 rounded"
        >
          Se connecter avec Spotify
        </button>
      )}
      {code && (
        <div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un artiste ou un morceau"
            className="border p-2 rounded"
          />
          <button
            onClick={searchTracks}
            className="ml-2 bg-blue-500 text-white p-2 rounded"
          >
            Rechercher
          </button>
        </div>
      )}
      {error && <p className="text-red-500 mt-4">{error}</p>}
      {results.length === 0 && !error && (
        <p className="text-gray-500 mt-4">Aucun résultat trouvé</p>
      )}
      <ul className="mt-4">
        {results.map((track) => (
          <li key={track.id} className="mb-2">
            <strong>{track.name}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}
