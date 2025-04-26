// Function to update the amenities display with a bullet list of amenities
window.updateAmenitiesList = async function(lat, lng) {
  const amenitiesField = document.getElementById('amenities');
  const amenitiesContent = document.getElementById('amenities-content');
  
  console.log('updateAmenitiesList called with:', lat, lng);
  console.log('amenitiesContent element:', amenitiesContent);
  
  // Show loading message in the amenities content
  if (amenitiesContent) {
    amenitiesContent.innerHTML = '<div class="text-center"><i class="bi bi-arrow-repeat spinning"></i> Loading amenities...</div>';
    
    // Add a border to make it visible
    amenitiesContent.style.border = '1px solid var(--light-border)';
    amenitiesContent.style.padding = '10px';
    amenitiesContent.style.borderRadius = '5px';
    amenitiesContent.style.backgroundColor = 'var(--light-surface-lighter)';
  } else {
    console.error('amenities-content element not found');
  }
  
  // Get the amenities distance from the config
  const radius = await window.getAmenitiesDistance();
  console.log('Using amenities distance:', radius, 'meters');
  
  // Get enabled amenities from the config
  const enabledAmenities = await window.getEnabledAmenities();
  
  // If no amenities are enabled, return early
  if (enabledAmenities.length === 0) {
    console.log('No amenities enabled in config');
    if (amenitiesContent) {
      amenitiesContent.innerHTML = '<p>No amenities enabled in config.</p>';
    }
    return;
  }
  
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
  
  // Fetch amenities data from Overpass API
  fetch(overpassUrl)
    .then(response => response.json())
    .then(data => {
      // Process the results
      const amenities = {
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
        playground: 0,
        park: 0,
        viewpoint: 0
      };
      
      if (data && data.elements) {
        data.elements.forEach(element => {
          if (element.type === 'node') {
            const tags = element.tags || {};
            
            // Count each type of amenity
            if (tags.leisure === 'firepit' || tags.amenity === 'fireplace') {
              amenities.firepit++;
            } else if (tags.amenity === 'bbq') {
              amenities.bbq++;
            } else if (tags.amenity === 'drinking_water' || tags.drinking_water === 'yes') {
              amenities.water++;
            } else if (tags.tourism === 'picnic_site') {
              amenities.picnicSite++;
            } else if (tags.leisure === 'picnic_table') {
              amenities.picnicTable++;
            } else if (tags.amenity === 'toilets') {
              amenities.toilets++;
            } else if (tags.amenity === 'shower') {
              amenities.shower++;
            } else if (tags.amenity === 'waste_basket') {
              amenities.wasteBasket++;
            } else if (tags.amenity === 'waste_disposal') {
              amenities.wasteDisposal++;
            } else if (tags.amenity === 'recycling') {
              amenities.recycling++;
            } else if (tags.amenity === 'shelter') {
              amenities.shelter++;
            } else if (tags.amenity === 'bench') {
              amenities.bench++;
            } else if (tags.tourism === 'camp_site') {
              amenities.campSite++;
            } else if (tags.leisure === 'playground') {
              amenities.playground++;
            } else if (tags.leisure === 'park') {
              amenities.park++;
            } else if (tags.tourism === 'viewpoint') {
              amenities.viewpoint++;
            }
          }
        });
      }
      
      // Create a colored bullet list of amenities
      let bulletList = '';
      let foundAmenities = false;
      
      // Define colors for each amenity type
      const amenityColors = {
        firepit: '#dc3545',
        bbq: '#fd7e14',
        water: '#0d6efd',
        picnicSite: '#198754',
        picnicTable: '#6610f2',
        toilets: '#6c757d',
        shower: '#20c997',
        wasteBasket: '#ffc107',
        wasteDisposal: '#adb5bd',
        recycling: '#007bff',
        shelter: '#6f42c1',
        bench: '#17a2b8',
        campSite: '#28a745',
        playground: '#6c757d',
        park: '#198754',
        viewpoint: '#e83e8c'
      };
      
      if (amenities.firepit > 0) {
        bulletList += `• <span style="color: ${amenityColors.firepit}">Fire Pits</span>: ${amenities.firepit}\n`;
        foundAmenities = true;
      }
      
      if (amenities.bbq > 0) {
        bulletList += `• <span style="color: ${amenityColors.bbq}">BBQs</span>: ${amenities.bbq}\n`;
        foundAmenities = true;
      }
      
      if (amenities.water > 0) {
        bulletList += `• <span style="color: ${amenityColors.water}">Drinking Water</span>: ${amenities.water}\n`;
        foundAmenities = true;
      }
      
      if (amenities.picnicSite > 0) {
        bulletList += `• <span style="color: ${amenityColors.picnicSite}">Picnic Sites</span>: ${amenities.picnicSite}\n`;
        foundAmenities = true;
      }
      
      if (amenities.picnicTable > 0) {
        bulletList += `• <span style="color: ${amenityColors.picnicTable}">Picnic Tables</span>: ${amenities.picnicTable}\n`;
        foundAmenities = true;
      }
      
      if (amenities.toilets > 0) {
        bulletList += `• <span style="color: ${amenityColors.toilets}">Toilets</span>: ${amenities.toilets}\n`;
        foundAmenities = true;
      }
      
      if (amenities.shower > 0) {
        bulletList += `• <span style="color: ${amenityColors.shower}">Showers</span>: ${amenities.shower}\n`;
        foundAmenities = true;
      }
      
      if (amenities.wasteBasket > 0) {
        bulletList += `• <span style="color: ${amenityColors.wasteBasket}">Waste Baskets</span>: ${amenities.wasteBasket}\n`;
        foundAmenities = true;
      }
      
      if (amenities.wasteDisposal > 0) {
        bulletList += `• <span style="color: ${amenityColors.wasteDisposal}">Waste Disposal</span>: ${amenities.wasteDisposal}\n`;
        foundAmenities = true;
      }
      
      if (amenities.recycling > 0) {
        bulletList += `• <span style="color: ${amenityColors.recycling}">Recycling</span>: ${amenities.recycling}\n`;
        foundAmenities = true;
      }
      
      if (amenities.shelter > 0) {
        bulletList += `• <span style="color: ${amenityColors.shelter}">Shelters</span>: ${amenities.shelter}\n`;
        foundAmenities = true;
      }
      
      if (amenities.bench > 0) {
        bulletList += `• <span style="color: ${amenityColors.bench}">Benches</span>: ${amenities.bench}\n`;
        foundAmenities = true;
      }
      
      if (amenities.campSite > 0) {
        bulletList += `• <span style="color: ${amenityColors.campSite}">Camp Sites</span>: ${amenities.campSite}\n`;
        foundAmenities = true;
      }
      
      if (amenities.playground > 0) {
        bulletList += `• <span style="color: ${amenityColors.playground}">Playgrounds</span>: ${amenities.playground}\n`;
        foundAmenities = true;
      }
      
      if (amenities.park > 0) {
        bulletList += `• <span style="color: ${amenityColors.park}">Parks</span>: ${amenities.park}\n`;
        foundAmenities = true;
      }
      
      if (amenities.viewpoint > 0) {
        bulletList += `• <span style="color: ${amenityColors.viewpoint}">Viewpoints</span>: ${amenities.viewpoint}\n`;
        foundAmenities = true;
      }
      
      if (!foundAmenities) {
        bulletList += '• No amenities found in this area.\n';
      }
      
      
      // Update the amenities content div with the colored amenities list
      if (amenitiesContent) {
        // Convert newlines to <br> tags for HTML display
        const htmlBulletList = bulletList.replace(/\n/g, '<br>');
        amenitiesContent.innerHTML = htmlBulletList || '<p>No amenities found in this area.</p>';
        console.log('Updated amenitiesContent with:', htmlBulletList);
      }
      
      // Update the hidden amenities field with the same data
      if (amenitiesField) {
        amenitiesField.value = bulletList;
        console.log('Updated amenities field with:', bulletList);
      }
      
      // For debugging purposes, log the value of the amenities field
      console.log('Amenities field value:', amenitiesField ? amenitiesField.value : 'amenitiesField not found');
      
      // Remove any existing amenities text that might have been added outside the amenities-content div
      // This is a more aggressive approach to remove the second instance of amenities
      document.querySelectorAll('.card-body').forEach(cardBody => {
        // Get all text nodes in the card body
        const walker = document.createTreeWalker(
          cardBody,
          NodeFilter.SHOW_TEXT,
          null,
          false
        );
        
        const nodesToRemove = [];
        let node;
        
        // Find text nodes that contain amenities information
        while (node = walker.nextNode()) {
          if (node.textContent.includes('Drinking Water') && 
              node.textContent.includes('Picnic Tables') &&
              node.parentNode.id !== 'amenities-content' &&
              !node.parentNode.closest('#amenities-display')) {
            nodesToRemove.push(node);
          }
        }
        
        // Remove the found nodes
        nodesToRemove.forEach(node => {
          if (node.parentNode) {
            node.parentNode.removeChild(node);
          }
        });
      });
    })
    .catch(error => {
      console.error('Error fetching amenities for description:', error);
      if (amenitiesContent) {
        amenitiesContent.innerHTML = '<p>Error loading amenities. Please try again.</p>';
      }
    });
}

// Function to get the amenities distance from the config
window.getAmenitiesDistance = async function() {
  try {
    const response = await fetch('/config');
    if (!response.ok) {
      throw new Error('Failed to fetch config');
    }
    
    // Parse the HTML response
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Get the amenitiesDistance value from the slider
    const amenitiesDistanceSlider = doc.getElementById('amenitiesDistance');
    if (amenitiesDistanceSlider) {
      return parseInt(amenitiesDistanceSlider.value) || 1000;
    }
    
    return 1000; // Default value if not found
  } catch (error) {
    console.error('Error fetching amenities distance:', error);
    return 1000; // Default value on error
  }
}

// Function to get the enabled amenities from the config
window.getEnabledAmenities = async function() {
  try {
    const response = await fetch('/config');
    if (!response.ok) {
      throw new Error('Failed to fetch config');
    }
    
    // Parse the HTML response
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Get all checked amenity checkboxes
    const enabledAmenities = [];
    const amenityCheckboxes = doc.querySelectorAll('input[name="amenities"]:checked');
    
    amenityCheckboxes.forEach(checkbox => {
      enabledAmenities.push(checkbox.value);
    });
    
    // If no amenities are checked, return all amenities as enabled (default behavior)
    if (enabledAmenities.length === 0) {
      return [
        'firepit', 'bbq', 'water', 'picnicSite', 'picnicTable', 
        'toilets', 'shower', 'wasteBasket', 'wasteDisposal', 
        'recycling', 'shelter', 'bench', 'campSite', 'viewpoint'
      ];
    }
    
    return enabledAmenities;
  } catch (error) {
    console.error('Error fetching enabled amenities:', error);
    // Return all amenities as enabled on error (default behavior)
    return [
      'firepit', 'bbq', 'water', 'picnicSite', 'picnicTable', 
      'toilets', 'shower', 'wasteBasket', 'wasteDisposal', 
      'recycling', 'shelter', 'bench', 'campSite', 'viewpoint'
    ];
  }
}
