import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");
  const SPOTIFY_TOKEN = "1POdFZRZbvb...qqillRxMr2z";

  try {
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${query}&type=track`,
      {
        headers: {
          Authorization: `Bearer ${SPOTIFY_TOKEN}`,
        },
      }
    );
    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      {
        error: "Erreur lors de la récupération des données Spotify",
      },
      { status: 500 }
    );
  }
}
