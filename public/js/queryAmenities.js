// Function to query and display amenities on the map using Overpass API
window.queryAmenities = async function(map, markersGroup, lat, lng) {
  // Clear existing amenity markers
  markersGroup.clearLayers();
  
  // Get the amenities distance from the config
  const configRadius = await window.getAmenitiesDistance();
  
  // Get enabled amenities from the config
  const enabledAmenities = await window.getEnabledAmenities();
  
  // If no amenities are enabled, return early
  if (enabledAmenities.length === 0) {
    console.log('No amenities enabled in config');
    return;
  }
  
  // Define the search radius based on the map zoom level, but use the config value as a maximum
  const zoomLevel = map.getZoom();
  const zoomBasedRadius = Math.max(500, 3000 - (zoomLevel * 150)); // Adjust radius based on zoom level
  const radius = Math.min(zoomBasedRadius, configRadius); // Use the smaller of the two values
  
  console.log('Using map radius:', radius, 'meters (config value:', configRadius, 'meters)');
  
  // Update or create the radius circle on the map
  window.updateRadiusCircle(map, lat, lng, configRadius);
  
  // Define circle marker options for amenities
  const markerOptions = {
    firepit: {
      radius: 8,
      fillColor: '#dc3545',
      color: '#dc3545',
      weight: 1,
      opacity: 0.7,
      fillOpacity: 0.3
    },
    bbq: {
      radius: 8,
      fillColor: '#fd7e14',
      color: '#fd7e14',
      weight: 1,
      opacity: 0.7,
      fillOpacity: 0.3
    },
    water: {
      radius: 8,
      fillColor: '#0d6efd',
      color: '#0d6efd',
      weight: 1,
      opacity: 0.7,
      fillOpacity: 0.3
    },
    picnicSite: {
      radius: 8,
      fillColor: '#198754',
      color: '#198754',
      weight: 1,
      opacity: 0.7,
      fillOpacity: 0.3
    },
    picnicTable: {
      radius: 8,
      fillColor: '#6610f2',
      color: '#6610f2',
      weight: 1,
      opacity: 0.7,
      fillOpacity: 0.3
    },
    toilets: {
      radius: 8,
      fillColor: '#6c757d',
      color: '#6c757d',
      weight: 1,
      opacity: 0.7,
      fillOpacity: 0.3
    },
    shower: {
      radius: 8,
      fillColor: '#20c997',
      color: '#20c997',
      weight: 1,
      opacity: 0.7,
      fillOpacity: 0.3
    },
    wasteBasket: {
      radius: 8,
      fillColor: '#ffc107',
      color: '#ffc107',
      weight: 1,
      opacity: 0.7,
      fillOpacity: 0.3
    },
    wasteDisposal: {
      radius: 8,
      fillColor: '#adb5bd',
      color: '#adb5bd',
      weight: 1,
      opacity: 0.7,
      fillOpacity: 0.3
    },
    recycling: {
      radius: 8,
      fillColor: '#007bff',
      color: '#007bff',
      weight: 1,
      opacity: 0.7,
      fillOpacity: 0.3
    },
    shelter: {
      radius: 8,
      fillColor: '#6f42c1',
      color: '#6f42c1',
      weight: 1,
      opacity: 0.7,
      fillOpacity: 0.3
    },
    bench: {
      radius: 8,
      fillColor: '#17a2b8',
      color: '#17a2b8',
      weight: 1,
      opacity: 0.7,
      fillOpacity: 0.3
    },
    campSite: {
      radius: 8,
      fillColor: '#28a745',
      color: '#28a745',
      weight: 1,
      opacity: 0.7,
      fillOpacity: 0.3
    },
    viewpoint: {
      radius: 8,
      fillColor: '#e83e8c',
      color: '#e83e8c',
      weight: 1,
      opacity: 0.7,
      fillOpacity: 0.3
    }
  };
  
  // Build Overpass API query based on enabled amenities
  let overpassQueryParts = [];
  
  // Only include enabled amenities in the query
  if (enabledAmenities.includes('firepit')) {
    overpassQueryParts.push(`node["leisure"="firepit"](around:${radius},${lat},${lng});`);
    overpassQueryParts.push(`node["amenity"="fireplace"](around:${radius},${lat},${lng});`);
  }
  
  if (enabledAmenities.includes('bbq')) {
    overpassQueryParts.push(`node["amenity"="bbq"](around:${radius},${lat},${lng});`);
  }
  
  if (enabledAmenities.includes('water')) {
    overpassQueryParts.push(`node["amenity"="drinking_water"](around:${radius},${lat},${lng});`);
    overpassQueryParts.push(`node["drinking_water"="yes"](around:${radius},${lat},${lng});`);
  }
  
  if (enabledAmenities.includes('picnicSite')) {
    overpassQueryParts.push(`node["tourism"="picnic_site"](around:${radius},${lat},${lng});`);
  }
  
  if (enabledAmenities.includes('picnicTable')) {
    overpassQueryParts.push(`node["leisure"="picnic_table"](around:${radius},${lat},${lng});`);
  }
  
  if (enabledAmenities.includes('toilets')) {
    overpassQueryParts.push(`node["amenity"="toilets"](around:${radius},${lat},${lng});`);
  }
  
  if (enabledAmenities.includes('shower')) {
    overpassQueryParts.push(`node["amenity"="shower"](around:${radius},${lat},${lng});`);
  }
  
  if (enabledAmenities.includes('wasteBasket')) {
    overpassQueryParts.push(`node["amenity"="waste_basket"](around:${radius},${lat},${lng});`);
  }
  
  if (enabledAmenities.includes('wasteDisposal')) {
    overpassQueryParts.push(`node["amenity"="waste_disposal"](around:${radius},${lat},${lng});`);
  }
  
  if (enabledAmenities.includes('recycling')) {
    overpassQueryParts.push(`node["amenity"="recycling"](around:${radius},${lat},${lng});`);
  }
  
  if (enabledAmenities.includes('shelter')) {
    overpassQueryParts.push(`node["amenity"="shelter"](around:${radius},${lat},${lng});`);
  }
  
  if (enabledAmenities.includes('bench')) {
    overpassQueryParts.push(`node["amenity"="bench"](around:${radius},${lat},${lng});`);
  }
  
  if (enabledAmenities.includes('campSite')) {
    overpassQueryParts.push(`node["tourism"="camp_site"](around:${radius},${lat},${lng});`);
  }
  
  if (enabledAmenities.includes('viewpoint')) {
    overpassQueryParts.push(`node["tourism"="viewpoint"](around:${radius},${lat},${lng});`);
  }
  
  // Combine all query parts
  const overpassQuery = `
    [out:json][timeout:25];
    (
      ${overpassQueryParts.join('\n      ')}
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
            if ((tags.leisure === 'firepit' || tags.amenity === 'fireplace') && enabledAmenities.includes('firepit')) {
              const marker = L.circleMarker([nodeLat, nodeLng], markerOptions.firepit)
                .bindPopup(`<strong>Fire Pit</strong><br>${tags.name || ''}`)
                .addTo(markersGroup);
              amenitiesCount.firepit++;
            }
            
            // Check for BBQ
            else if (tags.amenity === 'bbq' && enabledAmenities.includes('bbq')) {
              const marker = L.circleMarker([nodeLat, nodeLng], markerOptions.bbq)
                .bindPopup(`<strong>BBQ</strong><br>${tags.name || ''}`)
                .addTo(markersGroup);
              amenitiesCount.bbq++;
            }
            
            // Check for drinking water
            else if ((tags.amenity === 'drinking_water' || tags.drinking_water === 'yes') && enabledAmenities.includes('water')) {
              const marker = L.circleMarker([nodeLat, nodeLng], markerOptions.water)
                .bindPopup(`<strong>Drinking Water</strong><br>${tags.name || ''}`)
                .addTo(markersGroup);
              amenitiesCount.water++;
            }
            
            // Check for picnic site
            else if (tags.tourism === 'picnic_site' && enabledAmenities.includes('picnicSite')) {
              const marker = L.circleMarker([nodeLat, nodeLng], markerOptions.picnicSite)
                .bindPopup(`<strong>Picnic Site</strong><br>${tags.name || ''}`)
                .addTo(markersGroup);
              amenitiesCount.picnicSite++;
            }
            
            // Check for picnic table
            else if (tags.leisure === 'picnic_table' && enabledAmenities.includes('picnicTable')) {
              const marker = L.circleMarker([nodeLat, nodeLng], markerOptions.picnicTable)
                .bindPopup(`<strong>Picnic Table</strong><br>${tags.name || ''}`)
                .addTo(markersGroup);
              amenitiesCount.picnicTable++;
            }
            
            // Check for toilets
            else if (tags.amenity === 'toilets' && enabledAmenities.includes('toilets')) {
              const marker = L.circleMarker([nodeLat, nodeLng], markerOptions.toilets)
                .bindPopup(`<strong>Toilets</strong><br>${tags.name || ''}`)
                .addTo(markersGroup);
              amenitiesCount.toilets++;
            }
            
            // Check for shower
            else if (tags.amenity === 'shower' && enabledAmenities.includes('shower')) {
              const marker = L.circleMarker([nodeLat, nodeLng], markerOptions.shower)
                .bindPopup(`<strong>Shower</strong><br>${tags.name || ''}`)
                .addTo(markersGroup);
              amenitiesCount.shower++;
            }
            
            // Check for waste basket
            else if (tags.amenity === 'waste_basket' && enabledAmenities.includes('wasteBasket')) {
              const marker = L.circleMarker([nodeLat, nodeLng], markerOptions.wasteBasket)
                .bindPopup(`<strong>Waste Basket</strong><br>${tags.name || ''}`)
                .addTo(markersGroup);
              amenitiesCount.wasteBasket++;
            }
            
            // Check for waste disposal
            else if (tags.amenity === 'waste_disposal' && enabledAmenities.includes('wasteDisposal')) {
              const marker = L.circleMarker([nodeLat, nodeLng], markerOptions.wasteDisposal)
                .bindPopup(`<strong>Waste Disposal</strong><br>${tags.name || ''}`)
                .addTo(markersGroup);
              amenitiesCount.wasteDisposal++;
            }
            
            // Check for recycling
            else if (tags.amenity === 'recycling' && enabledAmenities.includes('recycling')) {
              const marker = L.circleMarker([nodeLat, nodeLng], markerOptions.recycling)
                .bindPopup(`<strong>Recycling</strong><br>${tags.name || ''}`)
                .addTo(markersGroup);
              amenitiesCount.recycling++;
            }
            
            // Check for shelter
            else if (tags.amenity === 'shelter' && enabledAmenities.includes('shelter')) {
              const marker = L.circleMarker([nodeLat, nodeLng], markerOptions.shelter)
                .bindPopup(`<strong>Shelter</strong><br>${tags.name || ''}`)
                .addTo(markersGroup);
              amenitiesCount.shelter++;
            }
            
            // Check for bench
            else if (tags.amenity === 'bench' && enabledAmenities.includes('bench')) {
              const marker = L.circleMarker([nodeLat, nodeLng], markerOptions.bench)
                .bindPopup(`<strong>Bench</strong><br>${tags.name || ''}`)
                .addTo(markersGroup);
              amenitiesCount.bench++;
            }
            
            // Check for camp site
            else if (tags.tourism === 'camp_site' && enabledAmenities.includes('campSite')) {
              const marker = L.circleMarker([nodeLat, nodeLng], markerOptions.campSite)
                .bindPopup(`<strong>Camp Site</strong><br>${tags.name || ''}`)
                .addTo(markersGroup);
              amenitiesCount.campSite++;
            }
            
            // Check for viewpoint
            else if (tags.tourism === 'viewpoint' && enabledAmenities.includes('viewpoint')) {
              const marker = L.circleMarker([nodeLat, nodeLng], markerOptions.viewpoint)
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
