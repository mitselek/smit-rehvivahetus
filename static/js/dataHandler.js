// Description: Functions for fetching and updating data from the API
// Path: static/js/dataHandler.js

export async function fetchTimesData(apiHost) {
  const url = `${apiHost}/api/times`
  const response = await fetch(url)
  if (!response || !response.ok) {
    throw new Error(`Failed to fetch available times: ${response ? response.status : 'No response'}`)
  }
  return await response.json()
}

export function updateLocationFilter(locationSelect, times) {
  while (locationSelect.options.length > 1) {
    locationSelect.remove(1)
  }
  
  const locations = [...new Set(times.map(time => time.location))].sort()
  const fragment = document.createDocumentFragment()
  
  locations.forEach(location => {
    const option = document.createElement('option')
    option.value = location
    option.textContent = location
    fragment.appendChild(option)
  })
  
  locationSelect.appendChild(fragment)
}
