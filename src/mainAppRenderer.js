function getPrayerTimes() {
    const latitude = parseFloat(document.getElementById('latitude').value);
    const longitude = parseFloat(document.getElementById('longitude').value);
    const method = document.getElementById('method').value;
  
    fetchPrayerTimes({ latitude, longitude, method })
      .then(timings => {
        document.getElementById('fajr-time').textContent = timings.Fajr;
        document.getElementById('dhuhr-time').textContent = timings.Dhuhr;
        document.getElementById('asr-time').textContent = timings.Asr;
        document.getElementById('maghrib-time').textContent = timings.Maghrib;
        document.getElementById('isha-time').textContent = timings.Isha;
      })
      .catch(error => console.error('Failed to fetch prayer times:', error));
  }
  