// Function to update or create a radius circle on the map
window.updateRadiusCircle = function(map, lat, lng, radius) {
  // Remove any existing radius circle
  if (window.radiusCircle) {
    map.removeLayer(window.radiusCircle);
  }
  
  // Create a new radius circle
  window.radiusCircle = L.circle([lat, lng], {
    radius: radius,
    color: '#3388ff',
    fillColor: '#3388ff',
    fillOpacity: 0.1,
    weight: 1,
    dashArray: '5, 5',
    interactive: false
  }).addTo(map);
  
  return window.radiusCircle;
};
