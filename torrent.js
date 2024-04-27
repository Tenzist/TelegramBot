async function login(data) {
  const url = `${data.baseURL}api/v2/auth/login`;
  const params = new URLSearchParams();
  params.append("username", data.username);
  params.append("password", data.password);

  try {
    const response = await fetch(url, {
      method: "POST",
      body: params,
      headers: {
        Referer: url,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      redirect: "manual",
    });

    if (response.status === 200) {
      const cookies = response.headers.get("set-cookie");
      return cookies;
    } else {
      console.error("Login failed with status:", response.status);
      return null;
    }
  } catch (error) {
    console.error("Error during login:", error);
    return null;
  }
}

async function getLastTorrents(data, cookies) {
  const url = `${data.baseURL}api/v2/torrents/info?sort=added_on&reverse=true&limit=1`;
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Cookie: cookies,
      },
    });
    if (response.ok) {
      const data = await response.json();
      const dataNames = data.map((data) => data.name);
      return dataNames;
    } else {
      console.error("Failed to fetch torrents, status:", response.status);
    }
  } catch (error) {
    console.error("Error fetching torrents:", error);
  }
}

async function addTorrents(data, torrentUrls, cookies) {
  const url = `${data.baseURL}api/v2/torrents/add`;
  const params = new URLSearchParams();
  params.append("urls", torrentUrls);

  try {
    const response = await fetch(url, {
      method: "POST",
      body: params,
      headers: {
        Cookie: cookies,
      },
    });
    if (response.ok) {
      console.log(response);

      await new Promise((resolve) => setTimeout(resolve, 500));
      const torrentName = await getLastTorrents(data, cookies);
      return torrentName;
    } else {
      console.error("Failed to add torrent:", response.status);
    }
  } catch (error) {
    console.error("Error adding torrent:", error);
  }
}

async function getTorrents(data, cookies) {
  const url = `${data.baseURL}api/v2/torrents/info?sort=added_on&reverse=true`;
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Cookie: cookies,
      },
    });
    if (response.ok) {
      const data = await response.json();
      const dataNames = data.map((data) => data.name);
      return data;
    } else {
      console.error("Failed to fetch torrents, status:", response.status);
    }
  } catch (error) {
    console.error("Error fetching torrents:", error);
  }
}


async function fixURL(url) {
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "http://" + url;
  }
  
  if (!url.endsWith("/")) {
      url += "/";
  }
  
  return url;
}

export { getTorrents, addTorrents, getLastTorrents, login, fixURL };
