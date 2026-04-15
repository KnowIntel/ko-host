export function getStoreMeta(url?: string) {
  if (!url) return {};

  try {
    const hostname = new URL(url).hostname.replace(/^www\./i, "").toLowerCase();

    if (hostname.includes("aldi")) {
      return { name: "Aldi", logo: "/store-logos/aldi.png" };
    }

    if (hostname.includes("amazon")) {
      return { name: "Amazon", logo: "/store-logos/amazon.png" };
    }

    if (hostname.includes("apple")) {
      return { name: "Apple", logo: "/store-logos/apple.png" };
    }

    if (hostname.includes("bestbuy")) {
      return { name: "Best Buy", logo: "/store-logos/bestbuy.png" };
    }

    if (hostname.includes("etsy")) {
      return { name: "Etsy", logo: "/store-logos/etsy.png" };
    }

    if (hostname.includes("jcpenney") || hostname.includes("jcp")) {
      return { name: "JCPenney", logo: "/store-logos/jcp.png" };
    }

    if (hostname.includes("lowes")) {
      return { name: "Lowe's", logo: "/store-logos/lowes.png" };
    }

    if (hostname.includes("macys")) {
      return { name: "Macy's", logo: "/store-logos/macys.png" };
    }

    if (hostname.includes("oldnavy")) {
      return { name: "Old Navy", logo: "/store-logos/oldnavy.png" };
    }

    if (hostname.includes("sephora")) {
      return { name: "Sephora", logo: "/store-logos/sephora.png" };
    }

    if (hostname.includes("target")) {
      return { name: "Target", logo: "/store-logos/target.png" };
    }

    if (hostname.includes("temu")) {
      return { name: "Temu", logo: "/store-logos/temu.png" };
    }

    if (hostname.includes("wayfair")) {
      return { name: "Wayfair", logo: "/store-logos/wayfair.png" };
    }

    return {
      name: hostname.split(".")[0],
      logo: "",
    };
  } catch {
    return {};
  }
}