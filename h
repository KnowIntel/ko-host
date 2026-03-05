[1mdiff --git a/components/templates/TemplateGrid.tsx b/components/templates/TemplateGrid.tsx[m
[1mindex 186bcb0..e9d9f4e 100644[m
[1m--- a/components/templates/TemplateGrid.tsx[m
[1m+++ b/components/templates/TemplateGrid.tsx[m
[36m@@ -2,7 +2,6 @@[m
 [m
 import { useEffect, useMemo, useState } from "react";[m
 import TemplateCard from "./TemplateCard";[m
[31m-import TemplatePreviewModal, { type PreviewMeta } from "./TemplatePreviewModal";[m
 import { TEMPLATE_DEFS, type TemplateDef } from "@/lib/templates/registry";[m
 [m
 function thumbToImageUrl(thumb: string) {[m
[36m@@ -12,6 +11,18 @@[m [mfunction thumbToImageUrl(thumb: string) {[m
 const CARD = 140; // must match TemplateCard[m
 const GAP = 12;[m
 [m
[32m+[m[32mexport type Category =[m
[32m+[m[32m  | "All"[m
[32m+[m[32m  | "Favorites"[m
[32m+[m[32m  | "Recently viewed"[m
[32m+[m[32m  | "Events"[m
[32m+[m[32m  | "Business"[m
[32m+[m[32m  | "Real Estate"[m
[32m+[m[32m  | "Personal"[m
[32m+[m[32m  | "Career";[m
[32m+[m
[32m+[m[32mexport type Sort = "Recommended" | "A–Z" | "New" | "Popular";[m
[32m+[m
 type Badge = "Popular" | "New" | null;[m
 [m
 function badgeForTemplateKey(key: string): Badge {[m
[36m@@ -26,7 +37,7 @@[m [mfunction badgeForTemplateKey(key: string): Badge {[m
 }[m
 [m
 /**[m
[31m- * Short marketplace descriptions (override registry)[m
[32m+[m[32m * Short “marketplace style” descriptions (override registry where present)[m
  */[m
 const DESC: Record<string, string> = {[m
   wedding_rsvp: "Invite everyone. Track RSVPs.",[m
[36m@@ -48,6 +59,7 @@[m [mconst DESC: Record<string, string> = {[m
   crowdfunding_campaign: "Pitch it. Fund it. Update it.",[m
 [m
   resume_portfolio: "Your story, links, and work.",[m
[32m+[m[32m  resume_portfolio_temp: "Your story, links, and work.",[m
 [m
   placeholder: "A clean page in minutes.",[m
 };[m
[36m@@ -62,123 +74,11 @@[m [mfunction getDescription(t: TemplateDef) {[m
   return "A clean page in minutes.";[m
 }[m
 [m
[31m-/**[m
[31m- * Preview metadata (still used in modal)[m
[31m- */[m
[31m-const PREVIEW_META: Record<string, PreviewMeta> = {[m
[31m-  wedding_rsvp: {[m
[31m-    tags: ["RSVP", "Events"],[m
[31m-    setupMins: 2,[m
[31m-    features: ["RSVP collection", "Event details + schedule", "Shareable link"],[m
[31m-  },[m
[31m-  wedding: {[m
[31m-    tags: ["RSVP", "Events"],[m
[31m-    setupMins: 2,[m
[31m-    features: ["RSVP collection", "Event details + schedule", "Shareable link"],[m
[31m-  },[m
[31m-  baby_shower: {[m
[31m-    tags: ["RSVP", "Events"],[m
[31m-    setupMins: 2,[m
[31m-    features: ["RSVP collection", "Gift / registry links", "Event details"],[m
[31m-  },[m
[31m-  birthday_party: {[m
[31m-    tags: ["RSVP", "Events"],[m
[31m-    setupMins: 2,[m
[31m-    features: ["RSVP collection", "Location + time", "Bring / notes section"],[m
[31m-  },[m
[31m-  family_reunion: {[m
[31m-    tags: ["Events"],[m
[31m-    setupMins: 3,[m
[31m-    features: ["Schedule & locations", "Updates section", "Contact info"],[m
[31m-  },[m
[31m-  memorial_tribute: {[m
[31m-    tags: ["Personal"],[m
[31m-    setupMins: 3,[m
[31m-    features: ["Announcement details", "Photo + message section", "Shareable tribute link"],[m
[31m-  },[m
[31m-[m
[31m-  open_house: {[m
[31m-    tags: ["Leads", "Events", "Real Estate"],[m
[31m-    setupMins: 3,[m
[31m-    features: ["Property highlights", "Lead capture", "Date/time + location"],[m
[31m-  },[m
[31m-  property_listing: {[m
[31m-    tags: ["Listing", "Real Estate"],[m
[31m-    setupMins: 4,[m
[31m-    features: ["Photo gallery", "Highlights & specs", "Inquiry button"],[m
[31m-  },[m
[31m-  rental_listing: {[m
[31m-    tags: ["Listing", "Real Estate"],[m
[31m-    setupMins: 4,[m
[31m-    features: ["Availability + pricing", "Photo gallery", "Inquiry button"],[m
[31m-  },[m
[31m-  property_listing_rental: {[m
[31m-    tags: ["Apply", "Real Estate"],[m
[31m-    setupMins: 5,[m
[31m-    features: ["Availability + pricing", "Apply / inquiry CTA", "Screening info section"],[m
[31m-  },[m
[31m-[m
[31m-  product_launch: {[m
[31m-    tags: ["Launch", "Business"],[m
[31m-    setupMins: 3,[m
[31m-    features: ["Launch details", "Links + media", "Updates section"],[m
[31m-  },[m
[31m-  product_launch_waitlist: {[m
[31m-    tags: ["Waitlist", "Business"],[m
[31m-    setupMins: 3,[m
[31m-    features: ["Waitlist signup", "Value prop section", "Email capture"],[m
[31m-  },[m
[31m-  event_waitlist: {[m
[31m-    tags: ["Waitlist", "Events"],[m
[31m-    setupMins: 2,[m
[31m-    features: ["Signup list", "Basic details", "Confirmation messaging"],[m
[31m-  },[m
[31m-  crowdfunding_campaign: {[m
[31m-    tags: ["Fundraising", "Business"],[m
[31m-    setupMins: 4,[m
[31m-    features: ["Pitch section", "Donation / pledge links", "Updates section"],[m
[31m-  },[m
[31m-[m
[31m-  resume_portfolio: {[m
[31m-    tags: ["Portfolio", "Career"],[m
[31m-    setupMins: 5,[m
[31m-    features: ["Bio + links", "Projects section", "Contact CTA"],[m
[31m-  },[m
[31m-[m
[31m-  placeholder: {[m
[31m-    tags: ["Simple", "Personal"],[m
[31m-    setupMins: 1,[m
[31m-    features: ["Clean layout", "Title + sections", "Shareable link"],[m
[31m-  },[m
[31m-};[m
[31m-[m
[31m-function getPreviewMeta(t: TemplateDef): PreviewMeta {[m
[31m-  return ([m
[31m-    PREVIEW_META[t.key] || {[m
[31m-      tags: ["Template"],[m
[31m-      setupMins: 3,[m
[31m-      features: ["Fast setup", "Mobile-friendly", "Shareable link"],[m
[31m-    }[m
[31m-  );[m
[31m-}[m
[31m-[m
[31m-/**[m
[31m- * Categories[m
[31m- */[m
[31m-export type Category =[m
[31m-  | "All"[m
[31m-  | "Favorites"[m
[31m-  | "Recently viewed"[m
[31m-  | "Events"[m
[31m-  | "Business"[m
[31m-  | "Real Estate"[m
[31m-  | "Personal"[m
[31m-  | "Career";[m
[31m-[m
 const CATEGORY_BY_KEY: Record<[m
   string,[m
   Exclude<Category, "All" | "Favorites" | "Recently viewed">[m
 > = {[m
[32m+[m[32m  // Events[m
   wedding_rsvp: "Events",[m
   wedding: "Events",[m
   baby_shower: "Events",[m
[36m@@ -188,16 +88,21 @@[m [mconst CATEGORY_BY_KEY: Record<[m
   open_house: "Events",[m
   event_waitlist: "Events",[m
 [m
[32m+[m[32m  // Business[m
   product_launch: "Business",[m
   product_launch_waitlist: "Business",[m
   crowdfunding_campaign: "Business",[m
 [m
[32m+[m[32m  // Real Estate[m
   property_listing: "Real Estate",[m
   property_listing_rental: "Real Estate",[m
   rental_listing: "Real Estate",[m
 [m
[32m+[m[32m  // Career[m
   resume_portfolio: "Career",[m
[32m+[m[32m  resume_portfolio_temp: "Career",[m
 [m
[32m+[m[32m  // Personal / misc[m
   placeholder: "Personal",[m
 };[m
 [m
[36m@@ -207,8 +112,6 @@[m [mfunction getCategoryForTemplateKey([m
   return CATEGORY_BY_KEY[key] || "Personal";[m
 }[m
 [m
[31m-export type Sort = "Recommended" | "A–Z" | "New" | "Popular";[m
[31m-[m
 function readStringArray(key: string): string[] {[m
   if (typeof window === "undefined") return [];[m
   try {[m
[36m@@ -223,30 +126,11 @@[m [mfunction readStringArray(key: string): string[] {[m
 function writeStringArray(key: string, arr: string[]) {[m
   try {[m
     window.localStorage.setItem(key, JSON.stringify(arr));[m
[31m-  } catch {}[m
[31m-}[m
[31m-[m
[31m-type StatsMap = Record<string, { views: number; creates: number; updatedAt: number }>;[m
[31m-[m
[31m-function readStats(): StatsMap {[m
[31m-  if (typeof window === "undefined") return {};[m
[31m-  try {[m
[31m-    const raw = window.localStorage.getItem("kht:stats");[m
[31m-    const parsed = raw ? JSON.parse(raw) : {};[m
[31m-    return parsed && typeof parsed === "object" ? parsed : {};[m
   } catch {[m
[31m-    return {};[m
[32m+[m[32m    // ignore[m
   }[m
 }[m
 [m
[31m-function popularityScore(stats: StatsMap, key: string) {[m
[31m-  const s = stats[key];[m
[31m-  if (!s) return 0;[m
[31m-  const views = Number(s.views || 0);[m
[31m-  const creates = Number(s.creates || 0);[m
[31m-  return creates * 5 + views * 1;[m
[31m-}[m
[31m-[m
 export default function TemplateGrid(props: {[m
   searchQuery: string;[m
   category: Category;[m
[36m@@ -255,50 +139,32 @@[m [mexport default function TemplateGrid(props: {[m
 }) {[m
   const { searchQuery, category, sort, onCountChange } = props;[m
 [m
[32m+[m[32m  // IMPORTANT: do not filter here (keep registry as source of truth)[m
   const allTemplates: TemplateDef[] = useMemo(() => {[m
[31m-    const base = Array.isArray(TEMPLATE_DEFS) ? TEMPLATE_DEFS : [];[m
[31m-    return base.filter((t) => t.key !== "resume_portfolio_temp");[m
[32m+[m[32m    return Array.isArray(TEMPLATE_DEFS) ? TEMPLATE_DEFS : [];[m
   }, []);[m
 [m
   const [favorites, setFavorites] = useState<string[]>([]);[m
   const [recent, setRecent] = useState<string[]>([]);[m
[31m-  const [stats, setStats] = useState<StatsMap>({});[m
 [m
   useEffect(() => {[m
     setFavorites(readStringArray("kht:favorites"));[m
     setRecent(readStringArray("kht:recent"));[m
[31m-    setStats(readStats());[m
   }, []);[m
 [m
[32m+[m[32m  // Keep recent fresh (back nav / tab focus)[m
   useEffect(() => {[m
[31m-    const refreshAll = () => {[m
[31m-      setRecent(readStringArray("kht:recent"));[m
[31m-      setStats(readStats());[m
[31m-      setFavorites(readStringArray("kht:favorites"));[m
[31m-    };[m
[32m+[m[32m    const refresh = () => setRecent(readStringArray("kht:recent"));[m
 [m
[31m-    window.addEventListener("kht:recent", refreshAll as any);[m
[31m-    window.addEventListener("kht:stats", refreshAll as any);[m
[31m-[m
[31m-    const onStorage = (e: StorageEvent) => {[m
[31m-      if (!e.key) return;[m
[31m-      if (e.key === "kht:recent" || e.key === "kht:stats" || e.key === "kht:favorites") {[m
[31m-        refreshAll();[m
[31m-      }[m
[31m-    };[m
[31m-    window.addEventListener("storage", onStorage);[m
[31m-[m
[31m-    window.addEventListener("focus", refreshAll);[m
[31m-    window.addEventListener("pageshow", refreshAll);[m
[31m-    window.addEventListener("visibilitychange", refreshAll);[m
[32m+[m[32m    refresh();[m
[32m+[m[32m    window.addEventListener("focus", refresh);[m
[32m+[m[32m    window.addEventListener("pageshow", refresh);[m
[32m+[m[32m    window.addEventListener("visibilitychange", refresh);[m
 [m
     return () => {[m
[31m-      window.removeEventListener("kht:recent", refreshAll as any);[m
[31m-      window.removeEventListener("kht:stats", refreshAll as any);[m
[31m-      window.removeEventListener("storage", onStorage);[m
[31m-      window.removeEventListener("focus", refreshAll);[m
[31m-      window.removeEventListener("pageshow", refreshAll);[m
[31m-      window.removeEventListener("visibilitychange", refreshAll);[m
[32m+[m[32m      window.removeEventListener("focus", refresh);[m
[32m+[m[32m      window.removeEventListener("pageshow", refresh);[m
[32m+[m[32m      window.removeEventListener("visibilitychange", refresh);[m
     };[m
   }, []);[m
 [m
[36m@@ -310,20 +176,12 @@[m [mexport default function TemplateGrid(props: {[m
     });[m
   }[m
 [m
[31m-  const effectiveCategory: Category = useMemo(() => {[m
[31m-    if (category === "Favorites" && favorites.length === 0) return "All";[m
[31m-    if (category === "Recently viewed" && recent.length === 0) return "All";[m
[31m-    return category;[m
[31m-  }, [category, favorites.length, recent.length]);[m
[31m-[m
[31m-  // Modal state[m
[31m-  const [previewOpen, setPreviewOpen] = useState(false);[m
[31m-  const [previewKey, setPreviewKey] = useState<string | null>(null);[m
[31m-[m
[31m-  const previewTemplate = useMemo(() => {[m
[31m-    if (!previewKey) return null;[m
[31m-    return allTemplates.find((t) => t.key === previewKey) || null;[m
[31m-  }, [allTemplates, previewKey]);[m
[32m+[m[32m  function openPreview(templateKey: string) {[m
[32m+[m[32m    // If your TemplateCard already triggers the modal via onPreview, keep it.[m
[32m+[m[32m    // This function is here so TemplateGrid compiles regardless of modal wiring.[m
[32m+[m[32m    // eslint-disable-next-line no-console[m
[32m+[m[32m    console.log("preview", templateKey);[m
[32m+[m[32m  }[m
 [m
   const filteredTemplates = useMemo(() => {[m
     const q = (searchQuery || "").trim().toLowerCase();[m
[36m@@ -332,15 +190,17 @@[m [mexport default function TemplateGrid(props: {[m
     recent.forEach((k, idx) => recentOrder.set(k, idx));[m
 [m
     const filtered = allTemplates.filter((t) => {[m
[31m-      if (effectiveCategory === "Favorites") {[m
[32m+[m[32m      // category filter[m
[32m+[m[32m      if (category === "Favorites") {[m
         if (!favorites.includes(t.key)) return false;[m
[31m-      } else if (effectiveCategory === "Recently viewed") {[m
[32m+[m[32m      } else if (category === "Recently viewed") {[m
         if (!recent.includes(t.key)) return false;[m
[31m-      } else if (effectiveCategory !== "All") {[m
[32m+[m[32m      } else if (category !== "All") {[m
         const cat = getCategoryForTemplateKey(t.key);[m
[31m-        if (cat !== effectiveCategory) return false;[m
[32m+[m[32m        if (cat !== category) return false;[m
       }[m
 [m
[32m+[m[32m      // search filter[m
       if (!q) return true;[m
 [m
       const catForSearch = getCategoryForTemplateKey(t.key);[m
[36m@@ -359,7 +219,7 @@[m [mexport default function TemplateGrid(props: {[m
 [m
     const sorted = [...filtered];[m
 [m
[31m-    if (effectiveCategory === "Recently viewed") {[m
[32m+[m[32m    if (category === "Recently viewed") {[m
       sorted.sort((a, b) => {[m
         const ra = recentOrder.get(a.key) ?? 9999;[m
         const rb = recentOrder.get(b.key) ?? 9999;[m
[36m@@ -379,9 +239,9 @@[m [mexport default function TemplateGrid(props: {[m
       });[m
     } else if (sort === "Popular") {[m
       sorted.sort((a, b) => {[m
[31m-        const pa = popularityScore(stats, a.key);[m
[31m-        const pb = popularityScore(stats, b.key);[m
[31m-        if (pa !== pb) return pb - pa;[m
[32m+[m[32m        const ra = badgeRank(badgeForTemplateKey(a.key), "Popular");[m
[32m+[m[32m        const rb = badgeRank(badgeForTemplateKey(b.key), "Popular");[m
[32m+[m[32m        if (ra !== rb) return ra - rb;[m
         return byTitle(a, b);[m
       });[m
     } else {[m
[36m@@ -389,21 +249,18 @@[m [mexport default function TemplateGrid(props: {[m
     }[m
 [m
     return sorted;[m
[31m-  }, [allTemplates, searchQuery, effectiveCategory, sort, favorites, recent, stats]);[m
[32m+[m[32m  }, [allTemplates, searchQuery, category, sort, favorites, recent]);[m
 [m
   useEffect(() => {[m
     onCountChange?.(filteredTemplates.length);[m
   }, [filteredTemplates.length, onCountChange]);[m
 [m
[31m-  // Mobile: portrait = 2 cols, landscape = dynamic, desktop = dynamic[m
   const [isDesktop, setIsDesktop] = useState(false);[m
[31m-  const [isLandscape, setIsLandscape] = useState(false);[m
 [m
   useEffect(() => {[m
     function compute() {[m
       const w = window.innerWidth || 0;[m
       setIsDesktop(w >= 1024);[m
[31m-      setIsLandscape(window.matchMedia?.("(orientation: landscape)")?.matches ?? false);[m
     }[m
     compute();[m
     window.addEventListener("resize", compute);[m
[36m@@ -411,27 +268,17 @@[m [mexport default function TemplateGrid(props: {[m
   }, []);[m
 [m
   const gridStyle = useMemo(() => {[m
[31m-    const columns =[m
[31m-      isDesktop || isLandscape ? `repeat(auto-fit, ${CARD}px)` : `repeat(2, ${CARD}px)`;[m
[31m-[m
     return {[m
       display: "grid" as const,[m
       gap: `${GAP}px`,[m
       justifyContent: "center" as const,[m
       paddingLeft: "12px",[m
       paddingRight: "12px",[m
[31m-      gridTemplateColumns: columns,[m
[32m+[m[32m      gridTemplateColumns: isDesktop[m
[32m+[m[32m        ? `repeat(auto-fit, ${CARD}px)`[m
[32m+[m[32m        : `repeat(3, ${CARD}px)`,[m
     };[m
[31m-  }, [isDesktop, isLandscape]);[m
[31m-[m
[31m-  function openPreview(key: string) {[m
[31m-    setPreviewKey(key);[m
[31m-    setPreviewOpen(true);[m
[31m-  }[m
[31m-[m
[31m-  function closePreview() {[m
[31m-    setPreviewOpen(false);[m
[31m-  }[m
[32m+[m[32m  }, [isDesktop]);[m
 [m
   return ([m
     <div className="mt-6 w-full">[m
[36m@@ -442,44 +289,20 @@[m [mexport default function TemplateGrid(props: {[m
       ) : null}[m
 [m
       <div style={gridStyle}>[m
[31m-        {filteredTemplates.map((t) => {[m
[31m-          const meta = getPreviewMeta(t);[m
[31m-          return ([m
[31m-            <TemplateCard[m
[31m-              key={t.key}[m
[31m-              templateKey={t.key as any}[m
[31m-              title={t.title}[m
[31m-              description={getDescription(t)}[m
[31m-              thumbnailUrl={thumbToImageUrl((t as any).thumb)}[m
[31m-              badge={badgeForTemplateKey(t.key)}[m
[31m-              isFavorite={favorites.includes(t.key)}[m
[31m-              onToggleFavorite={toggleFavorite}[m
[31m-              onPreview={openPreview}[m
[31m-            />[m
[31m-          );[m
[31m-        })}[m
[32m+[m[32m        {filteredTemplates.map((t) => ([m
[32m+[m[32m          <TemplateCard[m
[32m+[m[32m            key={t.key}[m
[32m+[m[32m            templateKey={t.key}[m
[32m+[m[32m            title={t.title}[m
[32m+[m[32m            description={getDescription(t)}[m
[32m+[m[32m            thumbnailUrl={thumbToImageUrl(t.thumb)}[m
[32m+[m[32m            badge={badgeForTemplateKey(t.key)}[m
[32m+[m[32m            isFavorite={favorites.includes(t.key)}[m
[32m+[m[32m            onToggleFavorite={toggleFavorite}[m
[32m+[m[32m            onPreview={openPreview}[m
[32m+[m[32m          />[m
[32m+[m[32m        ))}[m
       </div>[m
[31m-[m
[31m-      <TemplatePreviewModal[m
[31m-        open={previewOpen}[m
[31m-        onClose={closePreview}[m
[31m-        template={previewTemplate}[m
[31m-        description={previewTemplate ? getDescription(previewTemplate) : ""}[m
[31m-        thumbnailUrl={[m
[31m-          previewTemplate[m
[31m-            ? thumbToImageUrl((previewTemplate as any).thumb)[m
[31m-            : "/templates/placeholder.png"[m
[31m-        }[m
[31m-        meta={[m
[31m-          previewTemplate[m
[31m-            ? getPreviewMeta(previewTemplate)[m
[31m-            : {[m
[31m-                tags: ["Template"],[m
[31m-                setupMins: 3,[m
[31m-                features: ["Fast setup", "Mobile-friendly", "Shareable link"],[m
[31m-              }[m
[31m-        }[m
[31m-      />[m
     </div>[m
   );[m
 }[m
\ No newline at end of file[m
