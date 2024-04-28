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
  return await getTorrent(url, cookies)
}


async function getTorrentList(data, cookies) {
  const url = `${data.baseURL}api/v2/torrents/info?sort=added_on&reverse=true`;
  return await getTorrent(url, cookies)
}


async function getByHashTorrent(data, cookies, hash) {
  const url = `${data.baseURL}api/v2/torrents/info?hashes=${hash}`;
  return await getTorrent(url, cookies)
}

async function getTorrent(url, cookies){
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Cookie: cookies,
      },
    });
    if (response.ok) {
      const data = await response.json();
      return data;
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

async function fixURL(url) {
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "http://" + url;
  }
  
  if (!url.endsWith("/")) {
      url += "/";
  }
  
  return url;
}

export { getTorrentList , addTorrents, getLastTorrents, login, fixURL , getByHashTorrent};
