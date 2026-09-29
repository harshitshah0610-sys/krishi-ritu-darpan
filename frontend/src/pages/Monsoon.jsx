import React, { useState, useEffect, useContext } from 'react';
import { getMonsoon, getPanchayats } from '../utils/api';
import { AppContext } from '../App';
import { CloudRain, Wind, ThermometerSun, AlertTriangle, CheckCircle2, TrendingUp, CalendarDays, Droplets, MapPin, Volume2, Square } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';

export default function Monsoon() {
  const { lang, t } = useContext(AppContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [panchayats, setPanchayats] = useState([]);
  const [selectedPid, setSelectedPid] = useState("GJ_AMD_DASK_001");
  const [error, setError] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    // Stop speaking when unmounting or changing lang/pid
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [lang, selectedPid]);

  const toggleSpeech = (text) => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Attempt to pick a locale based on language
      if (lang === 'hi') utterance.lang = 'hi-IN';
      else if (lang === 'gu') utterance.lang = 'gu-IN';
      else utterance.lang = 'en-IN';
      
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  useEffect(() => {
    getPanchayats().then(res => setPanchayats(res.data)).catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedPid) {
      setLoading(true);
      setError("");
      getMonsoon(selectedPid)
        .then(res => {
          setData(res.data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setError("Failed to fetch monsoon data.");
          setLoading(false);
        });
    }
  }, [selectedPid]);

  if (loading && !data) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header & Selection */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <CloudRain className="h-8 w-8 text-emerald-600" />
            {t('monsoon_prediction') || 'Monsoon Prediction'}
          </h1>
          <p className="text-gray-500 mt-1">{t('monsoon_desc') || 'Hyperlocal onset & break prediction'}</p>
        </div>
        
        <div className="relative max-w-xs w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MapPin className="h-5 w-5 text-gray-400" />
          </div>
          <select 
            value={selectedPid} 
            onChange={(e) => setSelectedPid(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 bg-white shadow-sm"
          >
            {panchayats.map(p => (
              <option key={p.panchayat_id} value={p.panchayat_id}>
                {p.name} ({p.block})
              </option>
            ))}
          </select>
        </div>
      </div>

      {data && (
        <div className={loading ? 'opacity-50 pointer-events-none transition-opacity duration-200' : 'transition-opacity duration-200'}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">
              Analysis for <span className="text-emerald-700">{data.panchayat}</span>, {data.block} Block
            </h2>
            {loading && <span className="text-sm text-emerald-600 animate-pulse flex items-center gap-1"><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600"></div> Updating...</span>}
          </div>

          {/* Main Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Onset Probability */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <h3 className="text-gray-500 font-medium">{t('onset_probability') || 'Onset Probability'}</h3>
                <TrendingUp className="h-5 w-5 text-emerald-500" />
              </div>
              <div className="mt-4">
                <span className="text-4xl font-bold text-gray-900">{data.onset.composite_probability}%</span>
              </div>
              <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: `${data.onset.composite_probability}%` }}></div>
              </div>
            </div>

            {/* Status */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <h3 className="text-gray-500 font-medium">{t('monsoon_status') || 'Monsoon Status'}</h3>
                {data.onset.status === 'ACTIVE' ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                ) : (
                  <CalendarDays className="h-5 w-5 text-blue-500" />
                )}
              </div>
              <div className="mt-4">
                <span className={`text-2xl font-bold ${
                  data.onset.status === 'ACTIVE' ? 'text-emerald-600' :
                  data.onset.status === 'APPROACHING' ? 'text-blue-600' :
                  'text-amber-600'
                }`}>
                  {t(`monsoon_${data.onset.status.toLowerCase()}`) || data.onset.status}
                </span>
                <p className="text-sm text-gray-500 mt-1">{data.onset.status_detail}</p>
              </div>
            </div>

            {/* Break Detection */}
            <div className={`bg-white rounded-xl shadow-sm border p-6 flex flex-col justify-between ${
              data.break.break_detected ? 'border-amber-200 bg-amber-50' : 'border-gray-100'
            }`}>
              <div className="flex items-center justify-between">
                <h3 className="text-gray-500 font-medium">{t('break_detection') || 'Break Detection'}</h3>
                {data.break.break_detected ? (
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                ) : (
                  <CheckCircle2 className="h-5 w-5 text-gray-400" />
                )}
              </div>
              <div className="mt-4">
                {data.break.break_detected ? (
                  <>
                    <span className="text-2xl font-bold text-amber-600">{data.break.break_days} Dry Days</span>
                    <p className="text-sm text-amber-700 mt-1">Severity: {data.break.severity}</p>
                  </>
                ) : (
                  <>
                    <span className="text-2xl font-bold text-gray-700">No Break</span>
                    <p className="text-sm text-gray-500 mt-1">Normal active conditions</p>
                  </>
                )}
              </div>
            </div>

            {/* Season Progress */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <h3 className="text-gray-500 font-medium">{t('monsoon_progress') || 'Season Progress'}</h3>
                <CloudRain className="h-5 w-5 text-indigo-500" />
              </div>
              <div className="mt-4">
                <span className="text-4xl font-bold text-gray-900">{data.season.progress_pct}%</span>
                <p className="text-sm text-gray-500 mt-1">
                  Expected Withdrawal: {data.season.expected_withdrawal_date}
                </p>
              </div>
            </div>

          </div>

          {/* AI Advisory Banner */}
          <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-lg flex gap-4 items-start shadow-sm relative">
            <CloudRain className="h-6 w-6 text-emerald-600 flex-shrink-0 mt-1" />
            <div className="flex-1 pr-10">
              <h4 className="font-semibold text-emerald-900">{t('monsoon_advisory') || 'Monsoon Advisory'}</h4>
              <p className="text-emerald-800 mt-1 leading-relaxed">{data.advisory[lang]}</p>
            </div>
            
            <button 
              onClick={() => toggleSpeech(data.advisory[lang])}
              className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${
                isSpeaking ? 'bg-emerald-200 text-emerald-700 animate-pulse' : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'
              }`}
              title={isSpeaking ? "Stop Audio" : "Play Audio"}
            >
              {isSpeaking ? <Square className="h-5 w-5 fill-current" /> : <Volume2 className="h-5 w-5" />}
            </button>
          </div>

          {/* Metrics & Components */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Droplets className="h-5 w-5 text-blue-500" />
                <h3 className="font-semibold text-gray-800">{t('sustained_rainfall') || 'Sustained Rainfall (SRI)'}</h3>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-3xl font-bold text-gray-900">{data.indices.sri.max_consecutive_rain_days}</p>
                  <p className="text-sm text-gray-500">Max Consecutive Rainy Days</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-blue-600">{data.indices.sri.sri_score}/100</p>
                  <p className="text-xs text-gray-400">Index Score</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Wind className="h-5 w-5 text-cyan-500" />
                <h3 className="font-semibold text-gray-800">{t('humidity_threshold') || 'Humidity Threshold (HTC)'}</h3>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-3xl font-bold text-gray-900">{data.indices.htc.max_consecutive_humid_days}</p>
                  <p className="text-sm text-gray-500">Days above 70% RH</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-cyan-600">{data.indices.htc.htc_score}/100</p>
                  <p className="text-xs text-gray-400">Index Score</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <ThermometerSun className="h-5 w-5 text-orange-500" />
                <h3 className="font-semibold text-gray-800">{t('thermal_contrast') || 'Thermal Contrast (TCI)'}</h3>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-3xl font-bold text-gray-900">{data.indices.tci.avg_dtr}°C</p>
                  <p className="text-sm text-gray-500">Avg Diurnal Temp Range</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-orange-600">{data.indices.tci.tci_score}/100</p>
                  <p className="text-xs text-gray-400">Index Score</p>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-gray-400" />
              14-Day Monsoon Parameters Timeline
            </h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.daily_analysis} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{fontSize: 12}} tickFormatter={(val) => val.split('-').slice(1).join('/')} />
                  <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" />
                  <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend />
                  <ReferenceLine yAxisId="left" y={2.5} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'Rain Onset Thresh (2.5mm)', fill: '#ef4444', fontSize: 10 }} />
                  
                  <Line yAxisId="left" type="monotone" dataKey="rainfall" name="Rainfall (mm)" stroke="#3b82f6" strokeWidth={3} activeDot={{ r: 6 }} />
                  <Line yAxisId="right" type="monotone" dataKey="humidity" name="Humidity (%)" stroke="#10b981" strokeWidth={2} />
                  <Line yAxisId="right" type="monotone" dataKey="dtr" name="Temp Range (°C)" stroke="#f59e0b" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
