const config = {
  baseURL: "http://192.168.0.200:8080/api/v2",
  username: "admin",
  password: "Admin1",
};


async function login() {
  const url = `${config.baseURL}/auth/login`;
  const params = new URLSearchParams();
  params.append("username", config.username);
  params.append("password", config.password);

  try {
    const response = await fetch(url, {
      method: "POST",
      body: params,
      headers: {
        Referer: config.baseURL,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      redirect: "manual", 
    });

    if (response.status === 200) {
      const cookies = response.headers.get("set-cookie");
      console.log("Login successful!");
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

async function getTorrents(cookies) {
  const url = `${config.baseURL}/torrents/info`;
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
      console.log("Torrents:", dataNames);
    } else {
      console.error("Failed to fetch torrents, status:", response.status);
    }
  } catch (error) {
    console.error("Error fetching torrents:", error);
  }
}

async function getLastTorrents(cookies) {
  const url = `${config.baseURL}/torrents/info?sort=added_on&reverse=true&limit=1`;
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

async function addTorrents(torrentUrls, cookies) {
  const url = `${config.baseURL}/torrents/add`;
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
      console.log("Torrent added");
      return true;
    } else {
      console.error("Failed to add torrent:", response.status);
    }
  } catch (error) {
    console.error("Error adding torrent:", error);
  }
}

async function main(torrentUrls) {
  const cookies = await login();
  if (cookies) {
    const added = await addTorrents(torrentUrls, cookies);
    if (added) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const torrents = await getLastTorrents(cookies);
      return torrents
    }
  }
}

// main();
export { main };
