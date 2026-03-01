import { useEffect, useRef, useState } from 'react';
import Globe from 'react-globe.gl';

const ringColorFn = (t: number) => `rgba(255, 75, 75, ${1 - t})`;

const ZOOM_IN_THRESHOLD = 0.7;

export default function GlobeView({
    focusCoords = [19.076, 72.877],
    isAnalyzing = false,
    cityName = '',
    onZoomIn,
}: {
    focusCoords?: [number, number];
    isAnalyzing?: boolean;
    cityName?: string;
    onZoomIn?: (lat: number, lng: number) => void;
}) {
    const globeEl = useRef<any>(null);

    const [rings, setRings] = useState<any[]>([]);
    const [labels, setLabels] = useState<any[]>([]);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const hasTriggeredRef = useRef(false);

    // Configure controls on mount
    useEffect(() => {
        const timer = setTimeout(() => {
            if (!globeEl.current) return;
            const controls = globeEl.current.controls();
            if (!controls) return;

            // Smooth damped orbit
            controls.enableDamping = true;
            controls.dampingFactor = 0.08;
            controls.rotateSpeed = 0.5;
            controls.zoomSpeed = 0.6;
            controls.enablePan = false; // Prevent panning, only rotate + zoom
            controls.autoRotate = true;
            controls.autoRotateSpeed = 0.35;

            // Listen for zoom end with debounce
            controls.addEventListener('change', () => {
                if (hasTriggeredRef.current) return;
                if (debounceRef.current) clearTimeout(debounceRef.current);

                debounceRef.current = setTimeout(() => {
                    if (!globeEl.current || hasTriggeredRef.current) return;
                    const pov = globeEl.current.pointOfView();
                    if (pov && pov.altitude < ZOOM_IN_THRESHOLD) {
                        hasTriggeredRef.current = true;
                        onZoomIn?.(pov.lat, pov.lng);
                    }
                }, 600); // Wait 600ms after last scroll to trigger
            });
        }, 800);

        return () => {
            clearTimeout(timer);
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [onZoomIn]);

    // Reset trigger when coming back from map
    useEffect(() => {
        hasTriggeredRef.current = false;
    }, [focusCoords]);

    // Fly to coords + rings/labels on analyze
    useEffect(() => {
        if (!globeEl.current) return;
        const controls = globeEl.current.controls();
        if (!controls) return;

        if (isAnalyzing) {
            controls.autoRotate = false;
            globeEl.current.pointOfView({
                lat: focusCoords[0], lng: focusCoords[1], altitude: 0.55
            }, 3000); // Slower zoom for cinematic effect

            setRings([{
                lat: focusCoords[0], lng: focusCoords[1],
                maxR: 5, propagationSpeed: 2.5, repeatPeriod: 900,
            }]);
            setLabels([{
                lat: focusCoords[0], lng: focusCoords[1],
                text: cityName || 'Target', color: 'rgba(255,255,255,0.85)', size: 1.2,
            }]);
        } else {
            controls.autoRotate = true;
            controls.autoRotateSpeed = 0.35;
            globeEl.current.pointOfView({
                lat: focusCoords[0], lng: focusCoords[1], altitude: 2.0
            }, 3500);
        }
    }, [focusCoords, isAnalyzing, cityName]);



    return (
        <div className="absolute inset-0 w-full h-full">
            <Globe
                ref={globeEl}
                globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
                bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
                backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"



                ringsData={rings}
                ringColor={() => ringColorFn}
                ringMaxRadius="maxR"
                ringPropagationSpeed="propagationSpeed"
                ringRepeatPeriod="repeatPeriod"

                labelsData={labels}
                labelLat="lat"
                labelLng="lng"
                labelText="text"
                labelColor="color"
                labelSize="size"
                labelDotRadius={0.6}
                labelAltitude={0.01}
                labelResolution={2}

                atmosphereColor="#66FCF1"
                atmosphereAltitude={0.18}
            />
        </div>
    );
}
