const fs = require('fs');
const t = fs.readFileSync('C:/Users/PC/.gemini/antigravity/brain/45177e3d-d537-47c7-86b6-371d498bd45f/.system_generated/steps/2217/content.md', 'utf8');

const extract = (id) => {
  const regex = new RegExp('<select[^>]*id="' + id + '"[^>]*>([\\s\\S]*?)<\\/select>', 'i');
  const m = t.match(regex);
  if (!m) return [];
  const matches = [...m[1].matchAll(/<option value="([^"]+)"[^>]*>([^<]+)<\/option>/g)];
  return matches.map(x => ({ code: x[1], name: x[2].trim() })).filter(x => x.code !== '');
};

const provinces = extract('tinh-moi');
const wards = extract('xa-moi');

fs.writeFileSync('frontend/public/addresses.json', JSON.stringify({ provinces, wards }, null, 2));
console.log('Provinces:', provinces.length, 'Wards:', wards.length);
