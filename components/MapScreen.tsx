
import React, { useState, useEffect } from 'react';
import { ChevronLeft, Search, MapPin, Navigation, Loader2, Map as MapIcon, Compass, Star, ArrowRight } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default icon issue

const iconUrl = 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png';
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: iconUrl,
  iconRetinaUrl: iconRetinaUrl,
  shadowUrl: shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapScreenProps {
  onBack: () => void;
  initialQuery?: string;
}

interface PlaceResult {
  title: string;
  uri: string;
  position: [number, number];
  address?: string;
  snippet?: string;
}

// Component to update map center when user location changes
const MapUpdater: React.FC<{ center: [number, number], zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom);
  }, [center, zoom, map]);
  return null;
};

export const MapScreen: React.FC<MapScreenProps> = ({ onBack, initialQuery }) => {
  const [query, setQuery] = useState(initialQuery || '');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number]>([-23.5505, -46.6333]); // Default: São Paulo
  const [mapCenter, setMapCenter] = useState<[number, number]>([-23.5505, -46.6333]);
  const [zoom, setZoom] = useState(13);

  useEffect(() => {
    // Obter localização real
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserLocation(coords);
        setMapCenter(coords);
        setZoom(15);
        if (initialQuery) {
          handleSearch(initialQuery, coords);
        }
      },
      (err) => console.warn("GPS Access denied", err),
      { enableHighAccuracy: true }
    );
  }, []);

  const handleSearch = async (overrideQuery?: string, overrideLoc?: [number, number]) => {
    const activeQuery = overrideQuery || query;
    const activeLoc = overrideLoc || userLocation;

    if (!activeQuery.trim()) return;

    setIsLoading(true);
    setResults([]);

    try {
      // Nominatim Search (OpenStreetMap)
      // Calculate a simple bounding box (approx 50km ~ 0.5 deg)
      const lat = activeLoc[0];
      const lon = activeLoc[1];
      const delta = 0.5; // ~50km box
      const viewbox = `${lon - delta},${lat + delta},${lon + delta},${lat - delta}`; // left,top,right,bottom

      // Helper to map generic terms to specific POIs to avoid city/neighborhood matches
      const refineQuery = (q: string): string => {
        const lower = q.toLowerCase().trim();
        const map: Record<string, string> = {
          'café': 'coffee shop',
          'cafe': 'coffee shop',
          'padaria': 'bakery',
          'restaurante': 'restaurant',
          'parque': 'park',
          'mercado': 'supermarket',
          'supermercado': 'supermarket',
          'farmácia': 'pharmacy',
          'farmacia': 'pharmacy',
          'posto': 'fuel station',
          'academia': 'gym',
          'hospital': 'hospital',
          'banco': 'bank'
        };
        return map[lower] || q;
      };

      const finalQuery = refineQuery(activeQuery);

      const params = new URLSearchParams({
        q: finalQuery,
        format: 'json',
        limit: '10',
        addressdetails: '1',
        viewbox: viewbox,
        bounded: '1', // Restrict results to the viewbox
      });

      const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`);
      const data = await response.json();

      const places: PlaceResult[] = data.map((item: any) => ({
        title: item.name || item.display_name.split(',')[0],
        uri: `https://www.google.com/maps/search/?api=1&query=${item.lat},${item.lon}`,
        position: [parseFloat(item.lat), parseFloat(item.lon)],
        address: item.display_name,
        snippet: item.type
      }));

      setResults(places);

      if (places.length > 0) {
        setMapCenter(places[0].position);
        setZoom(14);
      }

    } catch (e) {
      console.error("Search failed", e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-50 flex flex-col animate-in slide-in-from-right duration-500 overflow-hidden">

      {/* Background Map */}
      <div className="absolute inset-0 z-0">
        <MapContainer
          center={userLocation}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
          attributionControl={false} // Cleaner look for Glass app, keep in mind OSM attribution requirements usually required visible
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
          <MapUpdater center={mapCenter} zoom={zoom} />

          {/* User Location Marker */}
          <Marker position={userLocation}>
            <Popup>Você está aqui</Popup>
          </Marker>

          {/* Result Markers */}
          {results.map((res, i) => (
            <Marker key={i} position={res.position}>
              <Popup>
                <div className="font-bold">{res.title}</div>
                <div className="text-xs">{res.snippet}</div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
        {/* OSM Attribution floating small */}
        <div className="absolute bottom-1 right-1 px-1 bg-white/50 text-[8px] z-[400] text-slate-500 pointer-events-none">
          © OpenStreetMap, © CARTO
        </div>
      </div>

      {/* Overlay Content */}
      <div className="relative z-10 flex flex-col h-full pointer-events-none">

        {/* Header Fixo */}
        <div className="p-6 pb-2 pointer-events-auto">
          <div className="flex items-center gap-4 max-w-md mx-auto mb-8">
            <button
              onClick={onBack}
              className="p-3.5 rounded-2xl bg-white/60 backdrop-blur-xl text-slate-800 shadow-sm border border-white/80 active:scale-90 transition-all"
            >
              <ChevronLeft size={24} />
            </button>
            <div className="flex-1">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-none mix-blend-hard-light">Explorar</h2>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mix-blend-hard-light">Satélite Ativo</p>
              </div>
            </div>
          </div>

          {/* Search Bar Premium */}
          <div className="max-w-md mx-auto relative mb-6">
            <div className="absolute inset-0 bg-white/60 backdrop-blur-xl rounded-[2rem] border border-white/60 shadow-xl shadow-indigo-100/20" />
            <div className="relative flex items-center px-6 py-2 gap-3">
              <Search size={20} className="text-indigo-400" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="Cafés, parques, piscinas..."
                className="flex-1 bg-transparent py-4 text-base font-bold text-slate-800 outline-none placeholder:text-slate-400"
              />
              {isLoading ? (
                <Loader2 size={20} className="animate-spin text-indigo-500" />
              ) : (
                <button
                  onClick={() => handleSearch()}
                  disabled={!query.trim()}
                  className="p-2.5 rounded-xl bg-slate-900 text-white shadow-lg active:scale-95 disabled:opacity-20 transition-all"
                >
                  <Navigation size={18} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Lista de Resultados - Push to bottom on desktop, scrollable on mobile */}
        <div className="flex-1 overflow-y-auto px-6 pb-32 no-scrollbar pointer-events-auto mask-gradient-to-t">
          <div className="max-w-md mx-auto space-y-4 pt-40">
            {results.length === 0 && !isLoading && query === '' && (
              <div className="py-20 flex flex-col items-center justify-center text-center opacity-60 mix-blend-multiply">
                <div className="w-20 h-20 rounded-[2.5rem] bg-indigo-50/50 backdrop-blur-sm flex items-center justify-center text-indigo-400 mb-6 shadow-sm border border-white/40">
                  <Compass size={40} />
                </div>
                <p className="text-sm font-black text-slate-700 uppercase tracking-widest">Mapa Global Pronto</p>
              </div>
            )}

            {results.map((res, i) => (
              <GlassCard
                key={i}
                className="animate-in slide-in-from-bottom-4 duration-500 fill-mode-backwards group bg-white/70 hover:bg-white/90"
                padding="p-6"
                interactive
                onClick={() => {
                  setMapCenter(res.position);
                  setZoom(16);
                }}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                        <MapPin size={16} />
                      </div>
                      <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.1em]">Encontrado</span>
                    </div>
                    <h3 className="text-lg font-black text-slate-800 tracking-tight leading-snug group-hover:text-indigo-600 transition-colors">
                      {res.title}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium mt-1 truncate">{res.address}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star size={14} fill="currentColor" />
                      <span className="text-xs font-black">--</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <div className="flex -space-x-2 opacity-50 grayscale group-hover:grayscale-0 transition-all">
                    {/* Placeholders for reviewers since nominatim doesn't provide them */}
                    {[1, 2, 3].map(n => (
                      <div key={n} className="w-6 h-6 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center overflow-hidden">
                        <div className="w-full h-full bg-slate-200"></div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(res.uri, '_blank');
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200 active:scale-95 transition-all group-hover:bg-indigo-600"
                  >
                    Abrir no Maps
                    <ArrowRight size={14} />
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* Footer Branding */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center pointer-events-none opacity-40 mix-blend-multiply">
          <div className="flex items-center gap-2">
            <MapIcon size={14} />
            <span className="text-[9px] font-black uppercase tracking-[0.5em] text-slate-800">Aura Navigation System</span>
          </div>
        </div>
      </div>
    </div>
  );
};
