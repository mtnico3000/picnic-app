// Function to query and display amenities on the map using Overpass API
window.queryAmenities = async function(map, markersGroup, lat, lng) {
  // Clear existing amenity markers
  markersGroup.clearLayers();
  
  // Get the amenities distance from the config
  const configRadius = await window.getAmenitiesDistance();
  
  // Define the search radius based on the map zoom level, but use the config value as a maximum
  const zoomLevel = map.getZoom();
  const zoomBasedRadius = Math.max(500, 3000 - (zoomLevel * 150)); // Adjust radius based on zoom level
  const radius = Math.min(zoomBasedRadius, configRadius); // Use the smaller of the two values
  
  console.log('Using map radius:', radius, 'meters (config value:', configRadius, 'meters)');
  
  // Update or create the radius circle on the map
  window.updateRadiusCircle(map, lat, lng, configRadius);
  
  // Define circle marker options for amenities
  const firepitMarkerOptions = {
    radius: 8,
    fillColor: '#dc3545',
    color: '#dc3545',
    weight: 1,
    opacity: 0.7,
    fillOpacity: 0.3
  };
  
  const bbqMarkerOptions = {
    radius: 8,
    fillColor: '#fd7e14',
    color: '#fd7e14',
    weight: 1,
    opacity: 0.7,
    fillOpacity: 0.3
  };
  
  const waterMarkerOptions = {
    radius: 8,
    fillColor: '#0d6efd',
    color: '#0d6efd',
    weight: 1,
    opacity: 0.7,
    fillOpacity: 0.3
  };
  
  // New amenity marker options
  const picnicSiteMarkerOptions = {
    radius: 8,
    fillColor: '#198754',
    color: '#198754',
    weight: 1,
    opacity: 0.7,
    fillOpacity: 0.3
  };
  
  const picnicTableMarkerOptions = {
    radius: 8,
    fillColor: '#6610f2',
    color: '#6610f2',
    weight: 1,
    opacity: 0.7,
    fillOpacity: 0.3
  };
  
  const toiletsMarkerOptions = {
    radius: 8,
    fillColor: '#6c757d',
    color: '#6c757d',
    weight: 1,
    opacity: 0.7,
    fillOpacity: 0.3
  };
  
  const showerMarkerOptions = {
    radius: 8,
    fillColor: '#20c997',
    color: '#20c997',
    weight: 1,
    opacity: 0.7,
    fillOpacity: 0.3
  };
  
  const wasteBasketMarkerOptions = {
    radius: 8,
    fillColor: '#ffc107',
    color: '#ffc107',
    weight: 1,
    opacity: 0.7,
    fillOpacity: 0.3
  };
  
  const wasteDisposalMarkerOptions = {
    radius: 8,
    fillColor: '#adb5bd',
    color: '#adb5bd',
    weight: 1,
    opacity: 0.7,
    fillOpacity: 0.3
  };
  
  const recyclingMarkerOptions = {
    radius: 8,
    fillColor: '#007bff',
    color: '#007bff',
    weight: 1,
    opacity: 0.7,
    fillOpacity: 0.3
  };
  
  const shelterMarkerOptions = {
    radius: 8,
    fillColor: '#6f42c1',
    color: '#6f42c1',
    weight: 1,
    opacity: 0.7,
    fillOpacity: 0.3
  };
  
  const benchMarkerOptions = {
    radius: 8,
    fillColor: '#17a2b8',
    color: '#17a2b8',
    weight: 1,
    opacity: 0.7,
    fillOpacity: 0.3
  };
  
  const campSiteMarkerOptions = {
    radius: 8,
    fillColor: '#28a745',
    color: '#28a745',
    weight: 1,
    opacity: 0.7,
    fillOpacity: 0.3
  };
  
  const viewpointMarkerOptions = {
    radius: 8,
    fillColor: '#e83e8c',
    color: '#e83e8c',
    weight: 1,
    opacity: 0.7,
    fillOpacity: 0.3
  };
  
  // Build Overpass API query
  // Include all the amenities we want to display on the map
  const overpassQuery = `
    [out:json][timeout:25];
    (
      node["leisure"="firepit"](around:${radius},${lat},${lng});
      node["amenity"="fireplace"](around:${radius},${lat},${lng});
      node["amenity"="bbq"](around:${radius},${lat},${lng});
      node["amenity"="drinking_water"](around:${radius},${lat},${lng});
      node["drinking_water"="yes"](around:${radius},${lat},${lng});
      node["tourism"="picnic_site"](around:${radius},${lat},${lng});
      node["leisure"="picnic_table"](around:${radius},${lat},${lng});
      node["amenity"="toilets"](around:${radius},${lat},${lng});
      node["amenity"="shower"](around:${radius},${lat},${lng});
      node["amenity"="waste_basket"](around:${radius},${lat},${lng});
      node["amenity"="waste_disposal"](around:${radius},${lat},${lng});
      node["amenity"="recycling"](around:${radius},${lat},${lng});
      node["amenity"="shelter"](around:${radius},${lat},${lng});
      node["amenity"="bench"](around:${radius},${lat},${lng});
      node["tourism"="camp_site"](around:${radius},${lat},${lng});
      node["tourism"="viewpoint"](around:${radius},${lat},${lng});
    );
    out body;
    >;
    out skel qt;
  `;
  
  // URL encode the query
  const encodedQuery = encodeURIComponent(overpassQuery);
  const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodedQuery}`;
  
  // Show loading indicator
  const loadingIndicator = document.createElement('div');
  loadingIndicator.id = 'amenities-loading';
  loadingIndicator.className = 'amenities-loading';
  loadingIndicator.innerHTML = '<i class="bi bi-arrow-repeat spinning"></i> Loading amenities...';
  document.body.appendChild(loadingIndicator);
  
  // Fetch amenities data from Overpass API
  fetch(overpassUrl)
    .then(response => response.json())
    .then(data => {
      // Process the results
      const amenitiesCount = {
        firepit: 0,
        bbq: 0,
        water: 0,
        picnicSite: 0,
        picnicTable: 0,
        toilets: 0,
        shower: 0,
        wasteBasket: 0,
        wasteDisposal: 0,
        recycling: 0,
        shelter: 0,
        bench: 0,
        campSite: 0,
        viewpoint: 0
      };
      
      if (data && data.elements) {
        data.elements.forEach(element => {
          if (element.type === 'node') {
            const nodeLat = element.lat;
            const nodeLng = element.lon;
            const tags = element.tags || {};
            
            // Check for firepit/fireplace
            if (tags.leisure === 'firepit' || tags.amenity === 'fireplace') {
              const marker = L.circleMarker([nodeLat, nodeLng], firepitMarkerOptions)
                .bindPopup(`<strong>Fire Pit</strong><br>${tags.name || ''}`)
                .addTo(markersGroup);
              amenitiesCount.firepit++;
            }
            
            // Check for BBQ
            else if (tags.amenity === 'bbq') {
              const marker = L.circleMarker([nodeLat, nodeLng], bbqMarkerOptions)
                .bindPopup(`<strong>BBQ</strong><br>${tags.name || ''}`)
                .addTo(markersGroup);
              amenitiesCount.bbq++;
            }
            
            // Check for drinking water
            else if (tags.amenity === 'drinking_water' || tags.drinking_water === 'yes') {
              const marker = L.circleMarker([nodeLat, nodeLng], waterMarkerOptions)
                .bindPopup(`<strong>Drinking Water</strong><br>${tags.name || ''}`)
                .addTo(markersGroup);
              amenitiesCount.water++;
            }
            
            // Check for picnic site
            else if (tags.tourism === 'picnic_site') {
              const marker = L.circleMarker([nodeLat, nodeLng], picnicSiteMarkerOptions)
                .bindPopup(`<strong>Picnic Site</strong><br>${tags.name || ''}`)
                .addTo(markersGroup);
              amenitiesCount.picnicSite++;
            }
            
            // Check for picnic table
            else if (tags.leisure === 'picnic_table') {
              const marker = L.circleMarker([nodeLat, nodeLng], picnicTableMarkerOptions)
                .bindPopup(`<strong>Picnic Table</strong><br>${tags.name || ''}`)
                .addTo(markersGroup);
              amenitiesCount.picnicTable++;
            }
            
            // Check for toilets
            else if (tags.amenity === 'toilets') {
              const marker = L.circleMarker([nodeLat, nodeLng], toiletsMarkerOptions)
                .bindPopup(`<strong>Toilets</strong><br>${tags.name || ''}`)
                .addTo(markersGroup);
              amenitiesCount.toilets++;
            }
            
            // Check for shower
            else if (tags.amenity === 'shower') {
              const marker = L.circleMarker([nodeLat, nodeLng], showerMarkerOptions)
                .bindPopup(`<strong>Shower</strong><br>${tags.name || ''}`)
                .addTo(markersGroup);
              amenitiesCount.shower++;
            }
            
            // Check for waste basket
            else if (tags.amenity === 'waste_basket') {
              const marker = L.circleMarker([nodeLat, nodeLng], wasteBasketMarkerOptions)
                .bindPopup(`<strong>Waste Basket</strong><br>${tags.name || ''}`)
                .addTo(markersGroup);
              amenitiesCount.wasteBasket++;
            }
            
            // Check for waste disposal
            else if (tags.amenity === 'waste_disposal') {
              const marker = L.circleMarker([nodeLat, nodeLng], wasteDisposalMarkerOptions)
                .bindPopup(`<strong>Waste Disposal</strong><br>${tags.name || ''}`)
                .addTo(markersGroup);
              amenitiesCount.wasteDisposal++;
            }
            
            // Check for recycling
            else if (tags.amenity === 'recycling') {
              const marker = L.circleMarker([nodeLat, nodeLng], recyclingMarkerOptions)
                .bindPopup(`<strong>Recycling</strong><br>${tags.name || ''}`)
                .addTo(markersGroup);
              amenitiesCount.recycling++;
            }
            
            // Check for shelter
            else if (tags.amenity === 'shelter') {
              const marker = L.circleMarker([nodeLat, nodeLng], shelterMarkerOptions)
                .bindPopup(`<strong>Shelter</strong><br>${tags.name || ''}`)
                .addTo(markersGroup);
              amenitiesCount.shelter++;
            }
            
            // Check for bench
            else if (tags.amenity === 'bench') {
              const marker = L.circleMarker([nodeLat, nodeLng], benchMarkerOptions)
                .bindPopup(`<strong>Bench</strong><br>${tags.name || ''}`)
                .addTo(markersGroup);
              amenitiesCount.bench++;
            }
            
            // Check for camp site
            else if (tags.tourism === 'camp_site') {
              const marker = L.circleMarker([nodeLat, nodeLng], campSiteMarkerOptions)
                .bindPopup(`<strong>Camp Site</strong><br>${tags.name || ''}`)
                .addTo(markersGroup);
              amenitiesCount.campSite++;
            }
            
            // Check for viewpoint
            else if (tags.tourism === 'viewpoint') {
              const marker = L.circleMarker([nodeLat, nodeLng], viewpointMarkerOptions)
                .bindPopup(`<strong>Viewpoint</strong><br>${tags.name || ''}`)
                .addTo(markersGroup);
              amenitiesCount.viewpoint++;
            }
          }
        });
      }
      
      // If no amenities were found, just log it
      if (Object.values(amenitiesCount).every(count => count === 0)) {
        console.log('No amenities found in this area');
      }
      
      // Store the amenities data in the hidden input if it exists
      const amenitiesDataInput = document.getElementById('amenities-data');
      if (amenitiesDataInput) {
        amenitiesDataInput.value = JSON.stringify(amenitiesCount);
      }
      
      // Remove loading indicator
      const loadingElement = document.getElementById('amenities-loading');
      if (loadingElement) {
        loadingElement.remove();
      }
    })
    .catch(error => {
      console.error('Error fetching amenities:', error);
      
      // Remove loading indicator
      const loadingElement = document.getElementById('amenities-loading');
      if (loadingElement) {
        loadingElement.remove();
      }
    });
}
