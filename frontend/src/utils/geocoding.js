/**
 * Geocoding utilities for converting coordinates to addresses and vice versa
 * Uses OpenStreetMap's Nominatim API for free geocoding
 */

/**
 * Convert coordinates (latitude, longitude) to a human-readable address
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<string>} - Formatted address string
 */
export async function reverseGeocode(lat, lng) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'en-US,en;q=0.9',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch address');
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    // Build a readable address from the components
    const address = data.address;
    const parts = [];

    // Add specific location details
    if (address.road) parts.push(address.road);
    if (address.neighbourhood) parts.push(address.neighbourhood);
    if (address.suburb) parts.push(address.suburb);
    if (address.city || address.town || address.village) {
      parts.push(address.city || address.town || address.village);
    }
    if (address.state) parts.push(address.state);
    if (address.country) parts.push(address.country);

    // If we have components, join them with commas
    if (parts.length > 0) {
      return parts.join(', ');
    }

    // Fallback to display_name if we couldn't build a custom address
    return data.display_name;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    // Return coordinates as fallback
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  }
}

/**
 * Search for a location by address/place name
 * @param {string} query - The search query (address or place name)
 * @returns {Promise<Array>} - Array of location results with lat, lng, and display_name
 */
export async function searchLocation(query) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
      {
        headers: {
          'Accept-Language': 'en-US,en;q=0.9',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to search location');
    }

    const data = await response.json();

    return data.map(result => ({
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      displayName: result.display_name,
      address: result.address,
    }));
  } catch (error) {
    console.error('Location search error:', error);
    return [];
  }
}

/**
 * Get user's current location using browser's geolocation API
 * @returns {Promise<{lat: number, lng: number}>} - User's current coordinates
 */
export function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  });
}
