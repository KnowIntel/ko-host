type RegistryMetadata = {
  title?: string;
  store?: string;
  price?: string;
  imageUrl?: string;
};

function extractStoreFromUrl(url: string) {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./i, "").toLowerCase();

    if (hostname.includes("amazon")) return "Amazon";
    if (hostname.includes("target")) return "Target";
    if (hostname.includes("walmart")) return "Walmart";
    if (hostname.includes("etsy")) return "Etsy";
    if (hostname.includes("wayfair")) return "Wayfair";
    if (hostname.includes("crateandbarrel")) return "Crate & Barrel";
    if (hostname.includes("potterybarn")) return "Pottery Barn";

    return hostname.split(".")[0] || "";
  } catch {
    return "";
  }
}

function extractPriceFromHtml(html: string) {
  const patterns = [
    /\$ ?\d{1,3}(?:,\d{3})*(?:\.\d{2})?/,
    /content=["'](\$ ?\d{1,3}(?:,\d{3})*(?:\.\d{2})?)["']/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) {
      return match[1] || match[0];
    }
  }

  return "";
}

function extractMetaContent(html: string, keys: string[]) {
  for (const key of keys) {
    const regex = new RegExp(
      `<meta[^>]+(?:property|name)=["']${key}["'][^>]+content=["']([^"']+)["']`,
      "i",
    );
    const match = html.match(regex);
    if (match?.[1]) return match[1];
  }

  return "";
}

export async function fetchRegistryMetadata(url: string): Promise<RegistryMetadata> {
  try {
    const res = await fetch(`/api/registry/metadata?url=${encodeURIComponent(url)}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return {
        title: "",
        store: extractStoreFromUrl(url),
        price: "",
        imageUrl: "",
      };
    }

    const data = await res.json();

    return {
      title: typeof data?.title === "string" ? data.title : "",
      store:
        typeof data?.store === "string" && data.store.trim()
          ? data.store
          : extractStoreFromUrl(url),
      price: typeof data?.price === "string" ? data.price : "",
      imageUrl: typeof data?.imageUrl === "string" ? data.imageUrl : "",
    };
  } catch {
    return {
      title: "",
      store: extractStoreFromUrl(url),
      price: "",
      imageUrl: "",
    };
  }
}