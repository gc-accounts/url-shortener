import { UAParser } from "ua-parser-js";
import supabase from "./supabase";

// -------------------- Fetch Clicks --------------------

export async function getClicksForUrls(urlIds) {
  const { data, error } = await supabase
    .from("clicks")
    .select("*")
    .in("url_id", urlIds);

  if (error) {
    console.error("Error fetching clicks:", error);
    return null;
  }

  return data;
}

export async function getClicksForUrl(url_id) {
  const { data, error } = await supabase
    .from("clicks")
    .select("*")
    .eq("url_id", url_id);

  if (error) {
    console.error(error);
    throw new Error("Unable to load Stats");
  }

  return data;
}

// -------------------- Device & Location Tracker --------------------

const parser = new UAParser();

/**
 * ✅ Fetch user location using OdinSchool's deployed API route.
 * The API internally detects user IP correctly via x-forwarded-for header.
 */
const fetchUserLocation = async () => {
  try {
    // 👇 Call your Vercel API (CORS-enabled)
    const response = await fetch("https://www.odinschool.com/api/get-location");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();

    // Handle both ipwho.is-style and wrapped data formats
    const locationData = data.data || data;

    return {
      city: locationData.city || "Unknown",
      country: locationData.country || "Unknown",
    };
  } catch (error) {
    console.error("Error fetching user location:", error);
    return {
      city: "Unknown",
      country: "Unknown",
    };
  }
};

// -------------------- Store Clicks --------------------

export const storeClicks = async ({ id, originalUrl }) => {
  try {
    console.log("🎯 Starting click storage for URL ID:", id);

    // Detect device type
    const res = parser.getResult();
    const device = res.device.type || "desktop";

    // Get location info
    console.log("📍 Fetching location data from OdinSchool API...");
    const location = await fetchUserLocation();

    console.log("📍 Location data:", {
      city: location.city,
      country: location.country,
    });

    // Record the click in Supabase
    console.log("💾 Inserting into database...");
    const { data, error } = await supabase.from("clicks").insert({
      url_id: id,
      city: location.city,
      country: location.country,
      device: device,
    });

    if (error) {
      console.error("❌ Database error:", error);
      throw error;
    }

    console.log("✅ Click stored successfully");
    return data;
  } catch (error) {
    console.error("❌ Error recording click:", error);
    throw error;
  }
};
