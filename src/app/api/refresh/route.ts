import { NextResponse } from "next/server";
import SpotifyWebApi from "spotify-web-api-node";

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
});

export async function POST(request: Request) {
  const { refresh_token } = await request.json();

  if (!refresh_token) {
    return NextResponse.json(
      { error: "Refresh Token manquant" },
      { status: 400 }
    );
  }

  try {
    spotifyApi.setRefreshToken(refresh_token);
    const data = await spotifyApi.refreshAccessToken();
    const { access_token } = data.body;
    return NextResponse.json({ access_token });
  } catch (error) {
    console.error("Erreur lors du rafraîssissement du token :", error);
    return NextResponse.json(
      {
        error: "Erreur lors du rafraîchissement de du token",
      },
      { status: 500 }
    );
  }
}
