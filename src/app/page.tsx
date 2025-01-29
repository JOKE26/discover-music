"use client";

import { fetchWithAuth } from "@/utils/spotify";
import { useState, useEffect, useRef } from "react";

export default function Home() {
  const [query, setQuery] = useState("");
  const [code, setCode] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentPlaying, setCurrentPlaying] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const codeParams = urlParams.get("code");
    if (codeParams) {
      setCode(codeParams);
      fetchToken(codeParams);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        cleanupAudio();
      }
    };
  }, []);

  const cleanupAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeEventListener("timeupdate", updateProgress);
      audioRef.current.removeEventListener("ended", handleAudioEnd);
      audioRef.current = null;
    }
  };

  const fetchToken = async (code: string) => {
    try {
      const response = await fetch(`/api/auth?code=${code}`);
      const data = await response.json();
      localStorage.setItem("spotify_access_token", data.access_token);
      localStorage.setItem("spotify_refresh_token", data.refresh_token);
      window.history.replaceState({}, document.title, "/");
    } catch (error) {
      console.error("Erreur lors de la récupération des tokens = ", error);
    }
  };

  const handleLogin = () => {
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID}&response_type=code&redirect_uri=${process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI}&scope=streaming%20user-read-email%20user-read-private%20user-read-playback-state`;
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

  const handleTrackClick = (track: any) => {
    if (!track.preview_url) {
      console.log("Aucun extrait disponible pour cette piste");
      return;
    }

    // Si c'est la même piste, toggle play/pause
    if (currentPlaying === track.id) {
      if (audioRef.current?.paused) {
        audioRef.current?.play();
      } else {
        audioRef.current?.pause();
      }
      return;
    }

    // Nouvelle piste
    cleanupAudio();
    setCurrentPlaying(track.id);

    audioRef.current = new Audio(track.preview_url);
    audioRef.current.play();

    audioRef.current.addEventListener("timeupdate", updateProgress);
    audioRef.current.addEventListener("ended", handleAudioEnd);
  };

  const updateProgress = () => {
    if (audioRef.current) {
      const progress =
        (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(progress);
    }
  };

  const handleAudioEnd = () => {
    setCurrentPlaying(null);
    setProgress(0);
    cleanupAudio();
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">
        Bienvenue sur ma plateforme de découverte musicale
      </h1>

      {!code && (
        <div className="flex justify-center">
          <button
            onClick={handleLogin}
            className="bg-green-500 text-white p-2 rounded gird"
          >
            Se connecter avec Spotify
          </button>
        </div>
      )}

      {code && (
        <div className="flex justify-center">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un artiste ou un morceau"
            className="border p-2 rounded w-96"
          />
          <button
            onClick={searchTracks}
            className="ml-2 bg-blue-500 text-white p-2 rounded"
          >
            Rechercher
          </button>
        </div>
      )}

      {error && <p className="text-red-500 mt-4 text-center">{error}</p>}

      {code && results.length === 0 && !error && (
        <p className="text-gray-500 mt-4 text-center">Aucun résultat trouvé</p>
      )}

      <ul className="mt-6 grid grid-cols-4 gap-4">
        {results.map((track) => (
          <li
            key={track.id}
            className="mb-2 p-4 border rounded-lg cursor-pointer bg-white-300"
            onClick={() => track.preview_url && handleTrackClick(track)}
          >
            <strong>{track.name}</strong> -{" "}
            {track.artists.map((artist: any) => artist.name).join(", ")}
            <br />
            <small>{track.album.name}</small>
            <br />
            {track.album.images.length > 0 && (
              <img
                src={track.album.images[0].url}
                alt={track.album.name}
                className="w-40 h-40 mt-2"
              />
            )}
            <br />
            <div>
              {currentPlaying === track.id ? (
                <span className="mr-2">⏸</span>
              ) : (
                <span className="mr-2">▶</span>
              )}
              {currentPlaying === track.id && (
                <div className="h-1 bg-gray-200 mt-2">
                  <div
                    className="h-full bg-green-500 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
