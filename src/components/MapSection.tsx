import { useEffect } from 'react';
import { MapPin, ExternalLink } from 'lucide-react';

export default function MapSection() {
  useEffect(() => {
    // Load AQICN map widget script
    const script = document.createElement('script');
    script.src = 'https://widget.aqicn.org/overall/v2/?lang=en';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup script when component unmounts
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <MapPin className="w-8 h-8" />
                Live Air Quality Map
              </h1>
              <p className="text-blue-100 text-sm">
                Real-time data powered by AQICN World Air Quality Index
              </p>
            </div>
            <a
              href="https://aqicn.org/map/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
            >
              <ExternalLink className="w-4 h-4" />
              Full Map
            </a>
          </div>
        </div>
      </div>

      {/* Main Map Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-slate-800/70 rounded-xl border border-slate-700 overflow-hidden shadow-2xl">
          {/* Embedded AQICN Map using iframe */}
          <iframe
            src="https://aqicn.org/map/india/kolkata/#@g/22.5726/88.3639/11z"
            className="w-full"
            style={{ height: '800px', border: 'none' }}
            title="AQICN Air Quality Map"
            loading="lazy"
          />
          
          {/* Footer */}
          <div className="p-4 bg-slate-900/50 border-t border-slate-700">
            <div className="flex items-center justify-between text-xs text-slate-400 flex-wrap gap-2">
              <div>
                <span>
                  Data source: <strong className="text-slate-300">AQICN World Air Quality Index Project</strong>
                </span>
              </div>
              <a
                href="https://aqicn.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                Visit AQICN.org
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800/70 rounded-lg p-6 border border-slate-700">
            <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
              🌍 Interactive Map
            </h3>
            <p className="text-slate-300 text-sm">
              Zoom, pan, and click on stations to view detailed air quality data for your area and surrounding regions.
            </p>
          </div>
          
          <div className="bg-slate-800/70 rounded-lg p-6 border border-slate-700">
            <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
              📊 Real-Time Data
            </h3>
            <p className="text-slate-300 text-sm">
              All measurements are updated in real-time from official monitoring stations across the region.
            </p>
          </div>
          
          <div className="bg-slate-800/70 rounded-lg p-6 border border-slate-700">
            <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
              🎯 Multiple Layers
            </h3>
            <p className="text-slate-300 text-sm">
              View AQI heatmaps, weather data, and individual pollutant measurements (PM2.5, PM10, O3, NO2, SO2, CO).
            </p>
          </div>
        </div>

        {/* AQI Scale Reference */}
        <div className="mt-6 bg-slate-800/70 rounded-lg p-6 border border-slate-700">
          <h3 className="text-white font-semibold mb-4">AQI Health Impact Scale</h3>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            <div className="text-center">
              <div className="bg-green-500 text-white py-2 px-3 rounded-lg font-bold mb-1">0-50</div>
              <div className="text-xs text-slate-300">Good</div>
            </div>
            <div className="text-center">
              <div className="bg-yellow-500 text-white py-2 px-3 rounded-lg font-bold mb-1">51-100</div>
              <div className="text-xs text-slate-300">Moderate</div>
            </div>
            <div className="text-center">
              <div className="bg-orange-500 text-white py-2 px-3 rounded-lg font-bold mb-1">101-150</div>
              <div className="text-xs text-slate-300">Unhealthy (Sensitive)</div>
            </div>
            <div className="text-center">
              <div className="bg-red-500 text-white py-2 px-3 rounded-lg font-bold mb-1">151-200</div>
              <div className="text-xs text-slate-300">Unhealthy</div>
            </div>
            <div className="text-center">
              <div className="bg-purple-500 text-white py-2 px-3 rounded-lg font-bold mb-1">201-300</div>
              <div className="text-xs text-slate-300">Very Unhealthy</div>
            </div>
            <div className="text-center">
              <div className="bg-red-900 text-white py-2 px-3 rounded-lg font-bold mb-1">301+</div>
              <div className="text-xs text-slate-300">Hazardous</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}