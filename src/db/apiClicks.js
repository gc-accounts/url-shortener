import {UAParser} from "ua-parser-js";
import supabase from "./supabase";

export async function getClicksForUrls(urlIds) {
  const {data, error} = await supabase
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
  const {data, error} = await supabase
    .from("clicks")
    .select("*")
    .eq("url_id", url_id);

  if (error) {
    console.error(error);
    throw new Error("Unable to load Stats");
  }

  return data;
}

const parser = new UAParser();

// Function to fetch user location using ipinfo.io
const fetchUserLocation = async (token = '30d6ad207d1162') => {
  try {
    const response = await fetch(`https://ipinfo.io/json?token=${token}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching user location:', error);
    return null;
  }
};

export const storeClicks = async ({id, originalUrl}) => {
  try {
    console.log('🎯 Starting click storage for URL ID:', id);
    
    const res = parser.getResult();
    const device = res.device.type || "desktop";

    let city = "Unknown";
    let country = "Unknown";
    // let region = "Unknown";

    try {
      console.log('📍 Fetching location data from ipinfo.io...');
      const locationData = await fetchUserLocation();
      
      if (locationData) {
        city = locationData.city || "Unknown";
        country = locationData.country || "Unknown";
        // region = locationData.region || "Unknown";
        console.log('📍 Location data:', { city, country });
      } else {
        console.warn('⚠️ Location data unavailable, using defaults');
      }
    } catch (locationError) {
      console.warn('⚠️ Location fetch failed, using defaults:', locationError);
    }

    // Record the click
    console.log('💾 Inserting into database...');
    const { data, error } = await supabase.from("clicks").insert({
      url_id: id,
      city: city,
      country: country,
      // region: region,
      device: device,
    });

    if (error) {
      console.error('❌ Database error:', error);
      throw error;
    }

    console.log('✅ Click stored successfully');
    return data;
  } catch (error) {
    console.error('❌ Error recording click:', error);
    throw error;
  }
};