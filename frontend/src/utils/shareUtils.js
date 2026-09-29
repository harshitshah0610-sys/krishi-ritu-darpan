export function generateWhatsAppMessage(panchayat, forecast, advisory) {
  const today = new Date().toLocaleDateString('en-IN')
  const maxTemp = forecast?.downscaled_forecast?.daily?.temp_max?.[0] ?? 'N/A'
  const rain = forecast?.downscaled_forecast?.daily?.rainfall_sum?.[0] ?? 0
  const advisoryText = advisory?.en ?? ''
  return `🌾 *Krishi Ritu Darpan | कृषि ऋतु दर्पण*\n📍 ${panchayat?.name}, ${panchayat?.block}\n📅 ${today}\n\n🌡️ Max Temp: ${maxTemp}°C\n🌧️ Rain: ${rain}mm\n\n💡 Advisory: ${advisoryText}\n\n_Powered by Krishi Ritu Darpan — Hyperlocal Weather for Farmers_`
}

export function generateSMSMessage(panchayat, forecast, advisory) {
  const maxTemp = forecast?.downscaled_forecast?.daily?.temp_max?.[0] ?? 'N/A'
  const rain = forecast?.downscaled_forecast?.daily?.rainfall_sum?.[0] ?? 0
  return `Krishi Ritu Darpan: ${panchayat?.name} - Temp:${maxTemp}C Rain:${rain}mm - ${advisory?.en?.substring(0, 100)}`
}

export function shareViaWhatsApp(message) {
  window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank')
}

export function shareViaSMS(message) {
  window.open(`sms:?body=${encodeURIComponent(message)}`)
}
