

export type SectorGroup = { codes: string[]; location: string };

/**
 * Source: SG postal sectors table (1st two digits → general location).
 * Groups preserve the exact ranges from your screenshot.
 */
export const sectorInfo: SectorGroup[] = [
  {
    codes: ["01", "02", "03", "04", "05", "06"],
    location: "Raffles Place, Cecil, Marina, People's Park",
  },
  { codes: ["07", "08"], location: "Anson, Tanjong Pagar" },
  { codes: ["14", "15", "16"], location: "Queenstown, Tiong Bahru" },
  { codes: ["09", "10"], location: "Telok Blangah, Harbourfront" },
  {
    codes: ["11", "12", "13"],
    location: "Pasir Panjang, Hong Leong Garden, Clementi New Town",
  },
  { codes: ["17"], location: "High Street, Beach Road (part)" },
  { codes: ["18", "19"], location: "Middle Road, Golden Mile" },
  { codes: ["20", "21"], location: "Little India" },
  { codes: ["22", "23"], location: "Orchard, Cairnhill, River Valley" },
  {
    codes: ["24", "25", "26", "27"],
    location: "Ardmore, Bukit Timah, Holland Road, Tanglin",
  },
  { codes: ["28", "29", "30"], location: "Watten Estate, Novena, Thomson" },
  { codes: ["31", "32", "33"], location: "Balestier, Toa Payoh, Serangoon" },
  { codes: ["34", "35", "36", "37"], location: "Macpherson, Braddell" },
  { codes: ["38", "39", "40", "41"], location: "Geylang, Eunos" },
  { codes: ["42", "43", "44", "45"], location: "Katong, Joo Chiat, Amber Road" },
  {
    codes: ["46", "47", "48"],
    location: "Bedok, Upper East Coast, Eastwood, Kew Drive",
  },
  { codes: ["49", "50", "81"], location: "Loyang, Changi" },
  { codes: ["51", "52"], location: "Tampines, Pasir Ris" },
  {
    codes: ["53", "54", "55", "82"],
    location: "Serangoon Garden, Hougang, Punggol",
  },
  { codes: ["56", "57"], location: "Bishan, Ang Mo Kio" },
  {
    codes: ["58", "59"],
    location: "Upper Bukit Timah, Clementi Park, Ulu Pandan",
  },
  { codes: ["60", "61", "62", "63", "64"], location: "Jurong" },
  {
    codes: ["65", "66", "67", "68"],
    location: "Hillview, Dairy Farm, Bukit Panjang, Choa Chu Kang",
  },
  { codes: ["69", "70", "71"], location: "Lim Chu Kang, Tengah" },
  { codes: ["72", "73"], location: "Kranji, Woodgrove" },
  { codes: ["77", "78"], location: "Upper Thomson, Springleaf" },
  { codes: ["75", "76"], location: "Yishun, Sembawang" },
  { codes: ["79", "80"], location: "Seletar" },
];

/** flat lookup: "03" -> "Raffles Place, Cecil, Marina, People's Park" */
const LOOKUP: Record<string, string> = sectorInfo
  .flatMap(g => g.codes.map(c => [c, g.location] as const))
  .reduce<Record<string, string>>((acc, [c, loc]) => {
    acc[c] = loc;
    return acc;
  }, {});

/** Ensure we always have a 2-digit sector string like "03". */
export function normalizeSector(input: string | number): string {
  const raw = typeof input === "number" ? String(input) : input.trim();
  // take first two digits; pad if needed
  const two = raw.replace(/\D+/g, "").slice(0, 2);
  return two.padStart(2, "0");
}

/** Get the human location for a sector (returns undefined if unknown). */
export function locationFromSector(input: string | number): string | undefined {
  return LOOKUP[normalizeSector(input)];
}
