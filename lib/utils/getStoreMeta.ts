export function getStoreMeta(url?: string) {
  if (!url) return {};

  try {
    const hostname = new URL(url).hostname.replace(/^www\./i, "").toLowerCase();

    if (hostname.includes("amazon")) {
      return { name: "Amazon", logo: "/store-logos/amazon.png" };
    }

    if (hostname.includes("target")) {
      return { name: "Target", logo: "/store-logos/target.png" };
    }

    if (hostname.includes("walmart")) {
      return { name: "Walmart", logo: "/store-logos/walmart.png" };
    }

    if (hostname.includes("etsy")) {
      return { name: "Etsy", logo: "/store-logos/etsy.png" };
    }

    return {
      name: hostname.split(".")[0],
      logo: "",
    };
  } catch {
    return {};
  }
}