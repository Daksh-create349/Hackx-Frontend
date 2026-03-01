/**
 * Mock API Service — Simulates backend endpoints with realistic dummy data.
 * Replace these with real fetch/axios calls when the FastAPI backend is running.
 */

// Dummy data per city for realistic variation
const CITY_DATA: Record<string, any> = {
    'pune': {
        city: 'Pune, India',
        aoi_area_km2: 824.12,
        pre_water_area_km2: 15.3,
        post_water_area_km2: 42.8,
        new_flood_area_km2: 27.5,
        flood_percentage: 3.33,
        permanent_water_area_km2: 10.2,
        optical_threshold: 0.0412,
        sar_threshold: -15.8,
        confidence_score_numeric: 1.72,
        confidence_category: 'HIGH',
        exposed_buildings: 412,
        exposed_roads_km: 18.4,
        forecast_probability: 0.82,
        coords: [18.520, 73.856] as [number, number],
    },
    'mumbai': {
        city: 'Mumbai, India',
        aoi_area_km2: 603.4,
        pre_water_area_km2: 22.1,
        post_water_area_km2: 89.6,
        new_flood_area_km2: 67.5,
        flood_percentage: 11.19,
        permanent_water_area_km2: 18.7,
        optical_threshold: 0.038,
        sar_threshold: -14.2,
        confidence_score_numeric: 1.91,
        confidence_category: 'HIGH',
        exposed_buildings: 1847,
        exposed_roads_km: 42.6,
        forecast_probability: 0.91,
        coords: [19.076, 72.877] as [number, number],
    },
    'chennai': {
        city: 'Chennai, India',
        aoi_area_km2: 426.51,
        pre_water_area_km2: 18.9,
        post_water_area_km2: 105.3,
        new_flood_area_km2: 86.4,
        flood_percentage: 20.26,
        permanent_water_area_km2: 12.4,
        optical_threshold: 0.045,
        sar_threshold: -13.6,
        confidence_score_numeric: 1.65,
        confidence_category: 'MEDIUM',
        exposed_buildings: 2340,
        exposed_roads_km: 58.2,
        forecast_probability: 0.78,
        coords: [13.0827, 80.2707] as [number, number],
    },
    'dubai': {
        city: 'Dubai, UAE',
        aoi_area_km2: 1588.0,
        pre_water_area_km2: 2.1,
        post_water_area_km2: 38.4,
        new_flood_area_km2: 36.3,
        flood_percentage: 2.29,
        permanent_water_area_km2: 1.8,
        optical_threshold: 0.052,
        sar_threshold: -16.1,
        confidence_score_numeric: 1.88,
        confidence_category: 'HIGH',
        exposed_buildings: 621,
        exposed_roads_km: 23.7,
        forecast_probability: 0.64,
        coords: [25.2048, 55.2708] as [number, number],
    },
    'dhaka': {
        city: 'Dhaka, Bangladesh',
        aoi_area_km2: 306.4,
        pre_water_area_km2: 35.2,
        post_water_area_km2: 142.8,
        new_flood_area_km2: 107.6,
        flood_percentage: 35.12,
        permanent_water_area_km2: 28.9,
        optical_threshold: 0.033,
        sar_threshold: -12.4,
        confidence_score_numeric: 1.42,
        confidence_category: 'MEDIUM',
        exposed_buildings: 5120,
        exposed_roads_km: 89.3,
        forecast_probability: 0.95,
        coords: [23.8103, 90.4125] as [number, number],
    },
    'bangkok': {
        city: 'Bangkok, Thailand',
        aoi_area_km2: 1568.7,
        pre_water_area_km2: 28.4,
        post_water_area_km2: 112.6,
        new_flood_area_km2: 84.2,
        flood_percentage: 5.37,
        permanent_water_area_km2: 22.1,
        optical_threshold: 0.039,
        sar_threshold: -14.8,
        confidence_score_numeric: 1.68,
        confidence_category: 'HIGH',
        exposed_buildings: 3200,
        exposed_roads_km: 67.4,
        forecast_probability: 0.76,
        coords: [13.7563, 100.5018] as [number, number],
    },
    'jakarta': {
        city: 'Jakarta, Indonesia',
        aoi_area_km2: 661.5,
        pre_water_area_km2: 31.7,
        post_water_area_km2: 98.3,
        new_flood_area_km2: 66.6,
        flood_percentage: 10.07,
        permanent_water_area_km2: 19.8,
        optical_threshold: 0.036,
        sar_threshold: -13.9,
        confidence_score_numeric: 1.58,
        confidence_category: 'MEDIUM',
        exposed_buildings: 4580,
        exposed_roads_km: 74.1,
        forecast_probability: 0.88,
        coords: [-6.2088, 106.8456] as [number, number],
    },
    'delhi': {
        city: 'Delhi, India',
        aoi_area_km2: 1484.0,
        pre_water_area_km2: 8.2,
        post_water_area_km2: 45.6,
        new_flood_area_km2: 37.4,
        flood_percentage: 2.52,
        permanent_water_area_km2: 6.1,
        optical_threshold: 0.044,
        sar_threshold: -15.3,
        confidence_score_numeric: 1.74,
        confidence_category: 'HIGH',
        exposed_buildings: 890,
        exposed_roads_km: 31.5,
        forecast_probability: 0.71,
        coords: [28.6139, 77.2090] as [number, number],
    },
    'london': {
        city: 'London, UK',
        aoi_area_km2: 1572.0,
        pre_water_area_km2: 14.8,
        post_water_area_km2: 52.3,
        new_flood_area_km2: 37.5,
        flood_percentage: 2.39,
        permanent_water_area_km2: 11.2,
        optical_threshold: 0.048,
        sar_threshold: -16.5,
        confidence_score_numeric: 1.82,
        confidence_category: 'HIGH',
        exposed_buildings: 720,
        exposed_roads_km: 28.9,
        forecast_probability: 0.55,
        coords: [51.5074, -0.1278] as [number, number],
    },
    'new york': {
        city: 'New York, USA',
        aoi_area_km2: 783.8,
        pre_water_area_km2: 19.4,
        post_water_area_km2: 61.2,
        new_flood_area_km2: 41.8,
        flood_percentage: 5.33,
        permanent_water_area_km2: 15.6,
        optical_threshold: 0.042,
        sar_threshold: -15.1,
        confidence_score_numeric: 1.79,
        confidence_category: 'HIGH',
        exposed_buildings: 1560,
        exposed_roads_km: 45.2,
        forecast_probability: 0.62,
        coords: [40.7128, -74.0060] as [number, number],
    },
    'tokyo': {
        city: 'Tokyo, Japan',
        aoi_area_km2: 2191.0,
        pre_water_area_km2: 25.3,
        post_water_area_km2: 78.9,
        new_flood_area_km2: 53.6,
        flood_percentage: 2.45,
        permanent_water_area_km2: 20.1,
        optical_threshold: 0.040,
        sar_threshold: -14.7,
        confidence_score_numeric: 1.85,
        confidence_category: 'HIGH',
        exposed_buildings: 2100,
        exposed_roads_km: 52.8,
        forecast_probability: 0.73,
        coords: [35.6762, 139.6503] as [number, number],
    },
    'sydney': {
        city: 'Sydney, Australia',
        aoi_area_km2: 12368.0,
        pre_water_area_km2: 42.1,
        post_water_area_km2: 118.7,
        new_flood_area_km2: 76.6,
        flood_percentage: 0.62,
        permanent_water_area_km2: 35.4,
        optical_threshold: 0.046,
        sar_threshold: -15.9,
        confidence_score_numeric: 1.71,
        confidence_category: 'HIGH',
        exposed_buildings: 950,
        exposed_roads_km: 38.4,
        forecast_probability: 0.58,
        coords: [-33.8688, 151.2093] as [number, number],
    },
};

// Default fallback for any unrecognized city — uses a neutral center
const DEFAULT_DATA = {
    city: 'Unknown Region',
    aoi_area_km2: 550.0,
    pre_water_area_km2: 12.0,
    post_water_area_km2: 34.5,
    new_flood_area_km2: 22.5,
    flood_percentage: 4.09,
    permanent_water_area_km2: 8.3,
    optical_threshold: 0.041,
    sar_threshold: -15.0,
    confidence_score_numeric: 1.55,
    confidence_category: 'MEDIUM',
    exposed_buildings: 280,
    exposed_roads_km: 12.1,
    forecast_probability: 0.68,
    coords: [0, 0] as [number, number],
};

// Log messages simulating each pipeline stage
const PIPELINE_STAGES = [
    { delay: 1500, messages: ['> Boundary resolved. Eliminating open ocean polygons...', '[OK]'] },
    { delay: 3000, messages: ['> Querying JRC Global Surface Water (80% persistence)...', '[OK]'] },
    { delay: 4500, messages: ['> Running Optical Engine (NDWI) on Sentinel-2 array...', '[OK]', '> Running SAR Engine (VV) Adaptive Otsu...', '[OK]'] },
    { delay: 6000, messages: ['> Applying Slope & HAND Urban False Positive Reductions...', '[OK]'] },
    { delay: 7500, messages: ['> Computing new flood delta...', '[DONE]'] },
];

function findCityData(searchCity: string) {
    const key = Object.keys(CITY_DATA).find(k => searchCity.toLowerCase().includes(k));
    if (key) {
        return { ...CITY_DATA[key], city: searchCity };
    }
    return { ...DEFAULT_DATA, city: searchCity };
}

export interface AnalyzeParams {
    location: string;
    pre_start: string;
    pre_end: string;
    post_start: string;
    post_end: string;
}

export interface AnalyzeResult {
    city: string;
    aoi_area_km2: number;
    pre_water_area_km2: number;
    post_water_area_km2: number;
    new_flood_area_km2: number;
    flood_percentage: number;
    permanent_water_area_km2: number;
    optical_threshold: number;
    sar_threshold: number;
    confidence_score_numeric: number;
    confidence_category: string;
    exposed_buildings: number;
    exposed_roads_km: number;
    forecast_probability: number;
}

/**
 * POST /analyze — Pseudo endpoint.
 * Returns a promise that resolves with the analysis result after a simulated delay.
 */
export function mockAnalyze(params: AnalyzeParams): Promise<{ job_id: string; status: string; data: AnalyzeResult }> {
    const data = findCityData(params.location);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { coords, ...resultData } = data;

    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                job_id: crypto.randomUUID(),
                status: 'SUCCESS',
                data: resultData as AnalyzeResult,
            });
        }, 7500);
    });
}

/**
 * Get coordinates for globe focus based on the city string.
 */
export function getCityCoords(searchCity: string): [number, number] {
    const data = findCityData(searchCity);
    return data.coords;
}

/**
 * Returns the pipeline log stages (delays + messages) for the terminal animation.
 */
export function getPipelineStages() {
    return PIPELINE_STAGES;
}
