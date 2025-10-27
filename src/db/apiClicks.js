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
 * Fetch user location using ipwho.is (Free API)
 * Docs: https://ipwho.is/
 */
const fetchUserLocation = async () => {
  try {
    const response = await fetch("https://ipwho.is/");
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error("Invalid location data");
    }

    return {
      city: data.city || "Unknown",
      // region: data.region || "Unknown",
      country: data.country || "Unknown",
      // ip: data.ip || "Unknown",
      // isp: data.connection?.isp || "Unknown",
    };
  } catch (error) {
    console.error("Error fetching user location:", error);
    return {
      city: "Unknown",
      // region: "Unknown",
      country: "Unknown",
      // ip: "Unknown",
      // isp: "Unknown",
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
    console.log("📍 Fetching location data from ipwho.is...");
    const location = await fetchUserLocation();

    console.log("📍 Location data:", {
      city: location.city,
      country: location.country,
      // ip: location.ip,
      // isp: location.isp,
    });

    // Record the click in Supabase
    console.log("💾 Inserting into database...");
    const { data, error } = await supabase.from("clicks").insert({
      url_id: id,
      city: location.city,
      country: location.country,
      // region: location.region,
      device: device,
      // ip_address: location.ip,
      // isp: location.isp,
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
