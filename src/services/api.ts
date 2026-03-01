/**
 * Real API Service — connects to the FastAPI backend (api.py).
 * Connects directly to the deployed backend.
 */

const BASE_URL = 'https://hackx-backend-hkkm.onrender.com';

export interface AnalyzeParams {
    location: string;
    pre_start: string;
    pre_end: string;
    post_start: string;
    post_end: string;
}

export interface DateReport {
    pre_window: string;
    post_window: string;
    s2_pre_count: number;
    s2_post_count: number;
    s1_pre_count: number;
    s1_post_count: number;
}

export interface AnalyzeResult {
    job_id: string;
    status: string;
    city: string;
    aoi_area_km2: number;
    pre_water_area_km2: number;
    post_water_area_km2: number;
    new_flood_area_km2: number;
    raw_flood_area_km2: number;
    false_positive_km2: number;
    flooded_pop: number;
    flooded_urban_km2: number;
    flood_percentage: number;
    permanent_water_area_km2: number;
    sar_threshold: number;
    event_confidence_score: number;
    confidence_category: string;
    is_coastal: boolean;
    model_warnings: string[];
    date_report: DateReport;
    coords: [number, number];
}

// ── Risk Assessment ──────────────────────────────────────────────────────────

export interface RiskParams {
    location: string;
    post_start: string;
    post_end: string;
}

export interface RiskResult {
    risk_job_id: string;
    city: string;
    risk_score_pct: number;
    risk_category: string;
    at_risk_area_km2: number;
    at_risk_pop: number;
    factor_history: number;
    factor_elevation: number;
    factor_rainfall: number;
    factor_proximity: number;
    aoi_area_km2: number;
    coords: [number, number];
}

// ── 7-Day Forecast ───────────────────────────────────────────────────────────

export interface ForecastParams {
    location: string;
}

export interface BiasBreakdown {
    elevation_bias_pct: number;
    rainfall_bias_pct: number;
    proximity_bias_pct: number;
    soil_bias_pct: number;
    regression_contrib_pct: number;
}

export interface HistoricalSignal {
    date: string;
    flood_frac: number;
    rain_mm: number;
}

export interface ForecastResult {
    forecast_job_id: string;
    city: string;
    flood_probability_pct: number;
    rain_probability_pct: number;
    expected_rain_7d_mm: number;
    risk_category: string;
    trend_slope: number;
    at_risk_area_km2: number;
    at_risk_pop: number;
    aoi_area_km2: number;
    bias_breakdown: BiasBreakdown;
    historical_signals: HistoricalSignal[];
    coords: [number, number];
}

// ── API Functions ────────────────────────────────────────────────────────────

export async function runAnalyze(
    params: AnalyzeParams
): Promise<{ job_id: string; status: string; data: AnalyzeResult }> {
    const res = await fetch(`${BASE_URL}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail || `Server error ${res.status}`);
    }
    const data: AnalyzeResult = await res.json();
    return { job_id: data.job_id, status: data.status, data };
}

export async function runRiskAssessment(params: RiskParams): Promise<RiskResult> {
    const res = await fetch(`${BASE_URL}/api/risk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail || `Risk error ${res.status}`);
    }
    return res.json();
}

export async function runForecast(params: ForecastParams): Promise<ForecastResult> {
    const res = await fetch(`${BASE_URL}/api/forecast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail || `Forecast error ${res.status}`);
    }
    return res.json();
}

export async function fetchLayer(jobId: string, layerName: string): Promise<GeoJSON.FeatureCollection | null> {
    try {
        const res = await fetch(`${BASE_URL}/api/layers/${jobId}/${layerName}`);
        if (!res.ok) return null;
        return await res.json();
    } catch {
        return null;
    }
}

export async function fetchRiskZones(riskJobId: string): Promise<GeoJSON.FeatureCollection | null> {
    try {
        const res = await fetch(`${BASE_URL}/api/risk-zones/${riskJobId}`);
        if (!res.ok) return null;
        return await res.json();
    } catch {
        return null;
    }
}

export async function fetchForecastZones(forecastJobId: string): Promise<GeoJSON.FeatureCollection | null> {
    try {
        const res = await fetch(`${BASE_URL}/api/forecast-zones/${forecastJobId}`);
        if (!res.ok) return null;
        return await res.json();
    } catch {
        return null;
    }
}

export async function checkHealth(): Promise<boolean> {
    try {
        const res = await fetch(`${BASE_URL}/api/health`);
        return res.ok;
    } catch {
        return false;
    }
}

export async function getCityCoords(cityName: string): Promise<[number, number]> {
    try {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityName)}&format=json&limit=1`
        );
        const data = await res.json();
        if (data && data.length > 0) {
            return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
        }
    } catch {
        // fall through
    }
    return [20.5937, 78.9629];
}

export function getPipelineStages() {
    return [
        { delay: 1000, messages: ['> Resolving GAUL Level-2 boundary...'] },
        { delay: 5000, messages: ['> Boundary confirmed. Querying JRC Global Surface Water (80% persistence)...', '[OK]'] },
        { delay: 15000, messages: ['> Building Sentinel-2 optical composites...', '> Running NDWI land-only Otsu threshold...', '[OK]'] },
        { delay: 30000, messages: ['> Building Sentinel-1 SAR composites...', '> Running adaptive VV dB threshold ([−20,−13] dB range)...', '[OK]'] },
        { delay: 50000, messages: ['> Fusing optical + SAR engines...', '> Applying slope (< 5°) + HAND (< 15m) false-positive filter...', '[OK]'] },
        { delay: 70000, messages: ['> Computing flood delta (post_clean − pre_clean)...', '[DONE]'] },
        { delay: 90000, messages: ['> Vectorizing flood mask for map rendering...'] },
    ];
}
