// Main JavaScript file for Picnic App

document.addEventListener('DOMContentLoaded', function() {
  // Initialize Bootstrap tooltips
  var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });

  // Initialize Bootstrap popovers
  var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
  var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
    return new bootstrap.Popover(popoverTriggerEl);
  });
  
  // Initialize auto-resize for textareas
  initAutoResizeTextareas();
  
  // Initialize map if container exists
  initMap();

  // Form validation
  const forms = document.querySelectorAll('.needs-validation');
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      }
      form.classList.add('was-validated');
    }, false);
  });

  // Date formatting
  const dateElements = document.querySelectorAll('.format-date');
  dateElements.forEach(element => {
    const dateStr = element.textContent;
    if (dateStr) {
      const date = new Date(dateStr);
      element.textContent = date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  });

  // Initialize datetime-local inputs with enhanced time picker
  initDateTimePickers();

  // Add item functionality
  initItemsHandling();

  // Confirmation for delete actions
  const deleteButtons = document.querySelectorAll('.btn-danger[type="submit"]');
  deleteButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
        e.preventDefault();
      }
    });
  });

  console.log('Picnic App JavaScript initialized');
});

// Map initialization and handling
function initMap() {
  const mapContainer = document.getElementById('map-container');
  if (!mapContainer) return;
  
  // Check if we're on the show page
  const isShowPage = window.location.pathname.includes('/picnics/') && !window.location.pathname.includes('/edit');
  
  // If we're on the show page, we need to check if we should query for amenities
  if (isShowPage) {
    console.log('Show page detected');
    
    // Get the coordinates from the hidden inputs
    const lat = parseFloat(document.getElementById('lat').value);
    const lng = parseFloat(document.getElementById('lng').value);
    
    console.log('Coordinates:', lat, lng);
    
    // Check if the amenities content is empty or says "No amenities data available"
    const amenitiesContent = document.getElementById('amenities-content');
    if (amenitiesContent && 
        (amenitiesContent.textContent.trim() === 'No amenities data available' || 
         amenitiesContent.textContent.trim() === '')) {
      console.log('No amenities data in database, querying for amenities');
      // Query for amenities at the current location
      updateAmenitiesList(lat, lng);
    } else {
      console.log('Amenities data found in database, using that');
    }
  }
  
  // Default coordinates (New York Central Park)
  let lat = 40.785091;
  let lng = -73.968285;
  
  // Check if we have existing coordinates from the form
  const latInput = document.getElementById('lat');
  const lngInput = document.getElementById('lng');
  
  if (latInput && latInput.value && lngInput && lngInput.value) {
    lat = parseFloat(latInput.value);
    lng = parseFloat(lngInput.value);
  }
  
  // Check if map is read-only
  const readonlyInput = document.getElementById('readonly');
  const isReadOnly = readonlyInput && readonlyInput.value === 'true';
  
  // Flag to prevent infinite loops when programmatically moving the map
  let isAdjusting = false;
  
  // Get the zoom level from the input if available
  const zoomLevelInput = document.getElementById('zoomLevel');
  let zoomLevel = 13; // Default zoom level
  
  if (zoomLevelInput && zoomLevelInput.value) {
    zoomLevel = parseInt(zoomLevelInput.value);
  }
  
  // Initialize the map with appropriate options
  const mapOptions = isReadOnly ? 
    { 
      dragging: false,  // Disable panning in view mode
      touchZoom: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      boxZoom: false,
      zoomControl: true,
      zoomAnimation: true
    } : {};
  
  const map = L.map('map', mapOptions).setView([lat, lng], zoomLevel);
  
  // Add OpenStreetMap tile layer
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);
  
  // Add a marker at the current position
  let marker = L.marker([lat, lng], {
    draggable: !isReadOnly
  }).addTo(map);
  
  // Store amenity markers in a layer group for easy management
  const amenityMarkersGroup = L.layerGroup().addTo(map);
  
  // If we're on the create page and don't have coordinates yet, try to get the user's current location
  const isCreatePage = document.querySelector('form[action="/picnics"]') && !document.querySelector('form[action="/picnics"]').action.includes('/picnics/');
  if (isCreatePage && (!latInput.value || latInput.value === '40.785091')) {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        function(position) {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;
          
          // Update the map view and marker
          map.setView([userLat, userLng], 13);
          marker.setLatLng([userLat, userLng]);
          
          // Update the form inputs
          updateCoordinates({lat: userLat, lng: userLng});
          
          // Query for amenities at the current location
          queryAmenities(map, amenityMarkersGroup, userLat, userLng);
        },
        function(error) {
          console.error('Error getting location:', error.message);
          // If we can't get the user's location, query amenities at the default location
          queryAmenities(map, amenityMarkersGroup, lat, lng);
        }
      );
    } else {
      // If geolocation is not available, query amenities at the default location
      queryAmenities(map, amenityMarkersGroup, lat, lng);
    }
  } else {
    // Query amenities at the current map location
    queryAmenities(map, amenityMarkersGroup, lat, lng);
  }
  
  // Update coordinates display and hidden inputs when marker is moved
  function updateCoordinates(latlng) {
    if (latInput && lngInput) {
      latInput.value = latlng.lat.toFixed(6);
      lngInput.value = latlng.lng.toFixed(6);
    }
    
    const coordsDisplay = document.getElementById('coordinates-display');
    if (coordsDisplay) {
      coordsDisplay.textContent = `Latitude: ${latlng.lat.toFixed(6)}, Longitude: ${latlng.lng.toFixed(6)}`;
    }
    
    // Update location field with reverse geocoding if available
    reverseGeocode(latlng);
    
    // Query for amenities at the new location
    queryAmenities(map, amenityMarkersGroup, latlng.lat, latlng.lng);
    
    // Update amenities content with amenities list
    updateAmenitiesList(latlng.lat, latlng.lng);
    
    // Ensure the picnic name is updated when coordinates change
    if (isCreatePage) {
      setTimeout(updatePicnicName, 500); // Small delay to ensure location is updated first
    }
  }
  
  // Initialize with current coordinates
  updateCoordinates(marker.getLatLng());
  
  // Only add interactive features if not in read-only mode
  if (!isReadOnly) {
    // Update when marker is dragged
    marker.on('dragend', function(e) {
      updateCoordinates(e.target.getLatLng());
      // Ensure the name is updated when the marker is dragged
      setTimeout(updatePicnicName, 500); // Small delay to ensure location is updated first
    });
    
    // Update when map is clicked
    map.on('click', function(e) {
      marker.setLatLng(e.latlng);
      updateCoordinates(e.latlng);
      // Ensure the name is updated when the map is clicked
      setTimeout(updatePicnicName, 500); // Small delay to ensure location is updated first
    });
  }
  
  // Update amenities when map is moved or zoomed
  map.on('moveend', function() {
    // If in read-only mode, recenter the map on the marker after moving
    if (isReadOnly && !isAdjusting) {
      isAdjusting = true; // Set flag to prevent infinite loop
      const markerPos = marker.getLatLng();
      map.setView(markerPos, map.getZoom(), { animate: true });
      queryAmenities(map, amenityMarkersGroup, markerPos.lat, markerPos.lng);
      updateAmenitiesList(markerPos.lat, markerPos.lng);
      // Reset flag after a short delay to ensure the view has settled
      setTimeout(() => { isAdjusting = false; }, 100);
    } else if (!isReadOnly) {
      const center = map.getCenter();
      queryAmenities(map, amenityMarkersGroup, center.lat, center.lng);
      updateAmenitiesList(center.lat, center.lng);
      
      // Update picnic name when map is moved (if we're on create page)
      if (isCreatePage) {
        setTimeout(updatePicnicName, 500); // Small delay to ensure location is updated first
      }
    }
  });
  
  map.on('zoomend', function() {
    // Update the zoom level input with the current zoom level
    if (zoomLevelInput) {
      zoomLevelInput.value = map.getZoom();
    }
    
    // If in read-only mode, recenter the map on the marker after zooming
    if (isReadOnly && !isAdjusting) {
      isAdjusting = true; // Set flag to prevent infinite loop
      const markerPos = marker.getLatLng();
      map.setView(markerPos, map.getZoom(), { animate: true });
      queryAmenities(map, amenityMarkersGroup, markerPos.lat, markerPos.lng);
      updateAmenitiesList(markerPos.lat, markerPos.lng);
      // Reset flag after a short delay to ensure the view has settled
      setTimeout(() => { isAdjusting = false; }, 100);
    } else if (!isReadOnly) {
      const center = map.getCenter();
      queryAmenities(map, amenityMarkersGroup, center.lat, center.lng);
      updateAmenitiesList(center.lat, center.lng);
      
      // Update picnic name when map is zoomed (if we're on create page)
      if (isCreatePage) {
        setTimeout(updatePicnicName, 500); // Small delay to ensure location is updated first
      }
    }
  });
  
  // Simple reverse geocoding using Nominatim
  function reverseGeocode(latlng) {
    const locationInput = document.getElementById('location');
    if (!locationInput) return;
    
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}&zoom=18&addressdetails=1`)
      .then(response => response.json())
      .then(data => {
        if (data && data.display_name) {
          locationInput.value = data.display_name;
          
          // Update picnic name when location is updated via reverse geocoding
          if (isCreatePage) {
            updatePicnicName();
          }
        }
      })
      .catch(error => console.error('Error during reverse geocoding:', error));
  }
  
  // Search for location if location field changes
  const locationInput = document.getElementById('location');
  if (locationInput) {
    locationInput.addEventListener('blur', function() {
      if (this.value.trim() === '') return;
      
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(this.value)}`)
        .then(response => response.json())
        .then(data => {
          if (data && data.length > 0) {
            const result = data[0];
            const latlng = { lat: parseFloat(result.lat), lng: parseFloat(result.lon) };
            
            marker.setLatLng(latlng);
            map.setView(latlng, 13);
            updateCoordinates(latlng);
          }
        })
        .catch(error => console.error('Error during geocoding:', error));
    });
    
    // Update picnic name when location changes
    locationInput.addEventListener('input', updatePicnicName);
    locationInput.addEventListener('change', updatePicnicName);
    locationInput.addEventListener('blur', function() {
      // Update picnic name when location field loses focus
      if (isCreatePage) {
        setTimeout(updatePicnicName, 100);
      }
    });
  }
  
  // Set default date to today and update picnic name when date changes
  const dateInput = document.getElementById('date');
  if (dateInput && isCreatePage) {
    // Set default date to today
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    dateInput.value = formattedDate;
    
    // Update picnic name when date changes
    dateInput.addEventListener('change', updatePicnicName);
    
    // Initial update of picnic name
    updatePicnicName();
  }
  
  // Function to update picnic name based on location only
  function updatePicnicName() {
    console.log('updatePicnicName called');
    
    const nameInput = document.getElementById('name');
    const locationInput = document.getElementById('location');
    
    console.log('Inputs:', {
      nameInput: nameInput ? 'found' : 'not found',
      locationInput: locationInput ? 'found' : 'not found'
    });
    
    if (!nameInput || !locationInput) {
      console.log('Missing required inputs');
      return;
    }
    
    console.log('userEdited:', nameInput.getAttribute('data-user-edited'));
    
    // Only update if the user hasn't manually edited the name
    if (nameInput.getAttribute('data-user-edited') !== 'true') {
      const locationValue = locationInput.value;
      
      console.log('Location value:', locationValue);
      
      if (locationValue) {
        // Extract street name and city/town/village from the location
        let formattedLocation = locationValue;
        
        // Try to format the location to "street name, city/town/village"
        try {
          // Split the location by commas
          const locationParts = locationValue.split(',');
          if (locationParts.length >= 2) {
            // First part is usually the street name
            const streetName = locationParts[0].trim();
            // Second part is usually the city/town/village
            const cityTownVillage = locationParts[1].trim();
            formattedLocation = `${streetName}, ${cityTownVillage}`;
          }
        } catch (e) {
          console.error('Error formatting location:', e);
        }
        
        // Truncate location if it's too long
        const truncatedLocation = formattedLocation.length > 50 
          ? formattedLocation.substring(0, 50) 
          : formattedLocation;
        
        console.log('Setting new name:', truncatedLocation);
        
        // Set the name
        nameInput.value = truncatedLocation;
      } else {
        console.log('Missing location value');
      }
    } else {
      console.log('Name was manually edited, not updating');
    }
  }
  
  // Track if user manually edits the name field
  const nameInput = document.getElementById('name');
  if (nameInput && isCreatePage) {
    // Explicitly set the userEdited attribute to 'false' as a string
    nameInput.setAttribute('data-user-edited', 'false');
    
    nameInput.addEventListener('input', function() {
      // Mark as user-edited only if the user actually typed something
      if (this.value.trim() !== '') {
        this.setAttribute('data-user-edited', 'true');
      }
    });
    
    // If user clears the field, allow auto-updates again
    nameInput.addEventListener('change', function() {
      if (this.value.trim() === '') {
        this.setAttribute('data-user-edited', 'false');
        updatePicnicName();
      }
    });
  }
}

// Function to update the amenities display with a bullet list of amenities
function updateAmenitiesList(lat, lng) {
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
  
  // Build Overpass API query for a 1000 meter radius
  const radius = 1000; // Fixed 1000 meter radius as requested
  
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
        park: 0
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
        park: '#198754'
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

// Function to handle separate date and time inputs
function initDateTimePickers() {
  // Find forms with date and time inputs
  const forms = document.querySelectorAll('form');
  
  forms.forEach(form => {
    const dateInput = form.querySelector('input[name="picnic_date"]');
    const timeInput = form.querySelector('input[name="picnic_time"]');
    const datetimeInput = form.querySelector('input[name="date"]');
    
    if (dateInput && timeInput && datetimeInput) {
      // Set default date to today if empty
      if (!dateInput.value) {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        dateInput.value = `${year}-${month}-${day}`;
      }
      
      // Set default time to 18:00 if empty
      if (!timeInput.value) {
        timeInput.value = '18:00';
      }
      
      // Combine date and time before form submission
      form.addEventListener('submit', function(e) {
        // Get the date and time values
        const dateValue = dateInput.value;
        const timeValue = timeInput.value;
        
        if (dateValue && timeValue) {
          // Combine them into a single datetime string
          datetimeInput.value = `${dateValue}T${timeValue}:00`;
        }
        
        // Check if the first attendee name field is empty and use placeholder if needed
        const firstAttendeeInput = form.querySelector('.item-name');
        if (firstAttendeeInput && firstAttendeeInput.value.trim() === '') {
          // Get the placeholder value
          const placeholderValue = firstAttendeeInput.getAttribute('placeholder');
          
          // If the placeholder is not "Attendee Name" (meaning it's the configName), use it
          if (placeholderValue && placeholderValue !== 'Attendee Name') {
            firstAttendeeInput.value = placeholderValue;
          }
        }
      });
    }
  });
}

// Function to initialize auto-resize for textareas
function initAutoResizeTextareas() {
  const textareas = document.querySelectorAll('.auto-resize');
  
  // Function to adjust textarea height based on content
  function adjustHeight(textarea) {
    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto';
    // Set the height to match the content (plus a small buffer)
    textarea.style.height = (textarea.scrollHeight + 2) + 'px';
  }
  
  // Initialize all textareas
  textareas.forEach(textarea => {
    // Set initial height
    adjustHeight(textarea);
    
    // Add event listeners for input and change events
    textarea.addEventListener('input', function() {
      adjustHeight(this);
    });
    
    textarea.addEventListener('change', function() {
      adjustHeight(this);
    });
    
    // Also adjust when window is resized
    window.addEventListener('resize', function() {
      adjustHeight(textarea);
    });
  });
  
  // Add a MutationObserver to handle dynamically added textareas
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.addedNodes && mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach(function(node) {
          if (node.nodeType === 1) { // Element node
            const newTextareas = node.querySelectorAll('.auto-resize');
            if (newTextareas.length > 0) {
              newTextareas.forEach(textarea => {
                adjustHeight(textarea);
                textarea.addEventListener('input', function() {
                  adjustHeight(this);
                });
              });
            } else if (node.classList && node.classList.contains('auto-resize')) {
              adjustHeight(node);
              node.addEventListener('input', function() {
                adjustHeight(this);
              });
            }
          }
        });
      }
    });
  });
  
  // Start observing the document body for changes
  observer.observe(document.body, { childList: true, subtree: true });
}

// Function to handle adding and removing item rows
function initItemsHandling() {
  const itemsContainer = document.getElementById('items-container');
  if (!itemsContainer) return;
  
  // Function to add a new item row
  function addItemRow() {
    // Get the current number of rows
    const currentRows = itemsContainer.querySelectorAll('.item-row').length;
    
    // Create a new row
    const newRow = document.createElement('div');
    newRow.className = 'item-row mb-2 d-flex';
    
    // Create name input
    const nameCol = document.createElement('div');
    nameCol.className = 'col-md-4 pe-2';
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'form-control item-name';
    nameInput.name = `items[${currentRows}][name]`;
    nameInput.placeholder = `Attendee Name ${currentRows + 1}`;
    nameCol.appendChild(nameInput);
    
    // Create items input
    const itemsCol = document.createElement('div');
    itemsCol.className = 'col-md-7 pe-2';
    const itemsInput = document.createElement('input');
    itemsInput.type = 'text';
    itemsInput.className = 'form-control item-list';
    itemsInput.name = `items[${currentRows}][list]`;
    itemsInput.placeholder = `Items ${currentRows + 1} (comma-separated)`;
    itemsCol.appendChild(itemsInput);
    
    // Create button column
    const buttonCol = document.createElement('div');
    buttonCol.className = 'col-md-1';
    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.className = 'btn btn-sm btn-danger remove-item-btn';
    removeButton.textContent = '-';
    removeButton.addEventListener('click', function() {
      itemsContainer.removeChild(newRow);
      renumberRows();
    });
    buttonCol.appendChild(removeButton);
    
    // Add all columns to the row
    newRow.appendChild(nameCol);
    newRow.appendChild(itemsCol);
    newRow.appendChild(buttonCol);
    
    // Add the row to the container
    itemsContainer.appendChild(newRow);
  }
  
  // Function to renumber all rows after deletion
  function renumberRows() {
    const rows = itemsContainer.querySelectorAll('.item-row');
    rows.forEach((row, index) => {
      const nameInput = row.querySelector('.item-name');
      const itemsInput = row.querySelector('.item-list');
      
      if (nameInput) {
        nameInput.name = `items[${index}][name]`;
        if (nameInput.placeholder.startsWith('Attendee Name')) {
          nameInput.placeholder = `Attendee Name ${index + 1}`;
        }
      }
      
      if (itemsInput) {
        itemsInput.name = `items[${index}][list]`;
        if (itemsInput.placeholder.startsWith('Items')) {
          itemsInput.placeholder = `Items ${index + 1} (comma-separated)`;
        }
      }
      
      // Update the button in the first row to be an add button
      if (index === 0) {
        const buttonCol = row.querySelector('.col-md-1');
        if (buttonCol) {
          buttonCol.innerHTML = '';
          const addButton = document.createElement('button');
          addButton.type = 'button';
          addButton.className = 'btn btn-sm btn-success add-item-btn';
          addButton.textContent = '+';
          addButton.addEventListener('click', addItemRow);
          buttonCol.appendChild(addButton);
        }
      }
    });
  }
  
  // Add event listeners to existing add buttons
  const addButtons = itemsContainer.querySelectorAll('.add-item-btn');
  addButtons.forEach(button => {
    button.addEventListener('click', addItemRow);
  });
  
  // Add event listeners to existing remove buttons
  const removeButtons = itemsContainer.querySelectorAll('.remove-item-btn');
  removeButtons.forEach(button => {
    button.addEventListener('click', function() {
      const row = this.closest('.item-row');
      if (row) {
        itemsContainer.removeChild(row);
        renumberRows();
      }
    });
  });
}

// Function to query and display amenities on the map using Overpass API
function queryAmenities(map, markersGroup, lat, lng) {
  // Clear existing amenity markers
  markersGroup.clearLayers();
  
  // Define the search radius based on the map zoom level
  const zoomLevel = map.getZoom();
  const radius = Math.max(500, 3000 - (zoomLevel * 150)); // Adjust radius based on zoom level
  
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
        campSite: 0
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
