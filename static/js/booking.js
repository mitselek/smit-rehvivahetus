// Disclaimer: avoid semicolons unless inappropriately necessary

function formatDateTime(dateTimeStr) {
    const dt = new Date(dateTimeStr)
    return dt.toLocaleString()
}

async function loadTimes() {
    const now = new Date()
    const tenDaysLater = new Date()
    tenDaysLater.setDate(now.getDate() + 10)
    
    const params = new URLSearchParams({
        start: now.toISOString(),
        end: tenDaysLater.toISOString()
    })

    const apiUrl = '/api/times?' + params.toString()
    console.log('API URL:', apiUrl)
    const response = await fetch(apiUrl)
    const times = await response.json()
    
    const timesList = document.getElementById('timesList')
    timesList.innerHTML = times.map(time => `
        <div class="time-slot">
            <div class="time">${formatDateTime(time.time)}</div>
            <div class="location">${time.location}</div>
            <div class="id">ID: ${time.id}</div>
        </div>
    `).join('')
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    loadTimes()
    // Refresh every minute
    setInterval(loadTimes, 60000)
})
