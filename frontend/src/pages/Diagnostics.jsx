import React, { useState, useRef, useContext } from 'react'
import { UploadCloud, Camera, Leaf, Bug, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react'
import { predictDisease, predictPest } from '../utils/api'
import clsx from 'clsx'
import { AppContext } from '../App'

export default function Diagnostics() {
  const { t } = useContext(AppContext)
  
  const [activeTab, setActiveTab] = useState('disease')
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  
  const fileInputRef = useRef(null)

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0]
    if (!selectedFile) return
    setFile(selectedFile)
    setPreview(URL.createObjectURL(selectedFile))
    setResult(null)
    setError(null)
  }

  const handlePredict = async () => {
    if (!file) return
    setLoading(true)
    setError(null)
    
    const formData = new FormData()
    formData.append('file', file)

    try {
      let res
      if (activeTab === 'disease') {
        res = await predictDisease(formData)
      } else {
        res = await predictPest(formData)
      }
      
      if (res.data.success) {
        setResult(res.data)
      } else {
        setError(res.data.error || 'Failed to analyze image.')
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Server error during analysis.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#F7F8FA] p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-[#1B4332] p-3 rounded-lg">
            {activeTab === 'disease' ? <Leaf className="text-white" size={24} /> : <Bug className="text-white" size={24} />}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A]">{t('ai_diagnostics')}</h1>
            <p className="text-[#64748B] text-sm">Upload a photo of your crop to instantly identify diseases or pest infestations.</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-[#E2E8F0] pb-2">
          <button 
            onClick={() => {setActiveTab('disease'); setResult(null); setError(null)}}
            className={clsx(
              "px-4 py-2 font-semibold text-sm rounded-t-lg transition-colors flex items-center gap-2",
              activeTab === 'disease' ? "bg-[#1B4332] text-white" : "bg-white text-[#64748B] hover:bg-[#F1F5F9] border border-b-0 border-[#E2E8F0]"
            )}
          >
            <Leaf size={16} /> {t('crop_disease')}
          </button>
          <button 
            onClick={() => {setActiveTab('pest'); setResult(null); setError(null)}}
            className={clsx(
              "px-4 py-2 font-semibold text-sm rounded-t-lg transition-colors flex items-center gap-2",
              activeTab === 'pest' ? "bg-[#1B4332] text-white" : "bg-white text-[#64748B] hover:bg-[#F1F5F9] border border-b-0 border-[#E2E8F0]"
            )}
          >
            <Bug size={16} /> {t('pest_infestation')}
          </button>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm flex flex-col md:flex-row gap-8">
          
          {/* Upload Section */}
          <div className="flex-1">
            <h3 className="text-[#0F172A] font-bold mb-3">{t('upload_image')}</h3>
            
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileSelect} 
            />
            
            <div 
              className="border-2 border-dashed border-[#CBD5E1] bg-[#F8FAFC] hover:bg-[#F1F5F9] transition-colors rounded-xl h-64 flex flex-col items-center justify-center cursor-pointer relative overflow-hidden"
              onClick={() => fileInputRef.current?.click()}
            >
              {preview ? (
                <img src={preview} alt="Crop Preview" className="absolute inset-0 w-full h-full object-contain" />
              ) : (
                <div className="text-center p-4">
                  <UploadCloud className="mx-auto mb-3 text-[#94A3B8]" size={40} />
                  <p className="font-semibold text-[#475569] text-sm">{t('click_upload')}</p>
                  <p className="text-[#94A3B8] text-xs mt-1">JPEG, PNG up to 10MB</p>
                </div>
              )}
            </div>

            <div className="mt-4 flex gap-3">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-2.5 bg-white border border-[#CBD5E1] text-[#475569] font-semibold rounded-lg text-sm hover:bg-[#F8FAFC] flex items-center justify-center gap-2 transition-colors"
              >
                <Camera size={16} /> {t('retake')}
              </button>
              <button 
                onClick={handlePredict}
                disabled={!file || loading}
                className="flex-1 py-2.5 bg-[#1B4332] text-white font-semibold rounded-lg text-sm hover:bg-[#143425] disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
              >
                {loading ? <span className="animate-pulse">Analyzing...</span> : <>{t('analyze_ai')} <ChevronRight size={16}/></>}
              </button>
            </div>
          </div>

          {/* Result Section */}
          <div className="w-full md:w-[350px] shrink-0 border-t md:border-t-0 md:border-l border-[#E2E8F0] pt-6 md:pt-0 md:pl-8 flex flex-col">
            <h3 className="text-[#0F172A] font-bold mb-4">{t('diagnosis_result')}</h3>
            
            {loading ? (
              <div className="flex-1 flex items-center justify-center flex-col text-[#64748B]">
                <div className="w-10 h-10 border-4 border-[#E2E8F0] border-t-[#1B4332] rounded-full animate-spin mb-3"></div>
                <p className="font-medium text-sm">Running deep learning inference...</p>
              </div>
            ) : result ? (
              <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl p-5 relative overflow-hidden flex-1">
                <CheckCircle2 className="text-[#16A34A] mb-3" size={32} />
                <div className="text-xs font-bold text-[#15803D] uppercase tracking-wider mb-1">Identified Issue</div>
                <h2 className="text-xl font-black text-[#0F172A] capitalize mb-3">{result.prediction.replace(/_/g, ' ')}</h2>
                
                <div className="bg-white rounded-lg p-3 border border-[#BBF7D0]">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-semibold text-[#64748B] uppercase">{t('confidence')}</span>
                    <span className="text-xs font-bold text-[#1B4332]">{(result.confidence * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-[#E2E8F0] rounded-full h-1.5 overflow-hidden">
                    <div className="bg-[#1B4332] h-full rounded-full transition-all duration-1000" style={{ width: `${result.confidence * 100}%` }}></div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-[#BBF7D0]">
                  <p className="text-[#15803D] text-sm font-medium leading-relaxed">
                    Based on the analysis, we recommend applying appropriate localized treatments as suggested by your Gram Panchayat advisory.
                  </p>
                </div>
              </div>
            ) : error ? (
              <div className="bg-[#FEF2F2] border border-[#FCA5A5] rounded-xl p-5 flex-1">
                <AlertCircle className="text-[#DC2626] mb-3" size={32} />
                <div className="text-xs font-bold text-[#991B1B] uppercase tracking-wider mb-1">Analysis Failed</div>
                <p className="text-[#7F1D1D] text-sm">{error}</p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-dashed border-[#CBD5E1] rounded-xl bg-[#F8FAFC]">
                <div className="w-12 h-12 bg-[#E2E8F0] rounded-full flex items-center justify-center mb-3">
                  <Leaf className="text-[#94A3B8]" size={20} />
                </div>
                <p className="text-[#475569] text-sm font-medium">No image analyzed yet</p>
                <p className="text-[#94A3B8] text-xs mt-1">Upload a photo to see the AI diagnosis here.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
