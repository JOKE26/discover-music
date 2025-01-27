export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  let accessToken = localStorage.getItem("spotify_access_token");

  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem("spotify_refresh_token");

    if (!refreshToken) {
      throw new Error("Refresh Token manquant");
    }

    const response = await fetch("api/refresh", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      throw new Error("Erreur lors du rafraîchissement du token");
    }

    const data = await response.json();
    localStorage.setItem("spotify_access_token", data.access_token);
    return data.access_token;
  };

  const checkTokenValidity = async () => {
    if (!accessToken) {
      throw new Error("Access Token manquant");
    }

    const testResponse = await fetch("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (testResponse.status === 401) {
      accessToken = await refreshAccessToken();
    }
  };

  await checkTokenValidity();

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Erreur API Spotify : ${response.statusText}`);
  }

  return response.json();
};
