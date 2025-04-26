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
  
  // Handle form submission to combine date and time
  initFormSubmission();

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

// Function to handle separate date and time inputs
function initDateTimePickers() {
  // Find forms with date and time inputs
  const forms = document.querySelectorAll('form');
  
  forms.forEach(form => {
    const dateInput = form.querySelector('input[type="date"]');
    const timeInput = form.querySelector('input[type="time"]');
    const datetimeInput = form.querySelector('input[type="datetime-local"]');
    
    if (dateInput && timeInput && datetimeInput) {
      // Initialize with existing datetime value if available
      if (datetimeInput.value) {
        const datetime = new Date(datetimeInput.value);
        dateInput.value = datetime.toISOString().split('T')[0];
        timeInput.value = datetime.toTimeString().substring(0, 5);
      }
      
      // Update datetime-local input when date or time changes
      const updateDatetime = () => {
        if (dateInput.value && timeInput.value) {
          datetimeInput.value = `${dateInput.value}T${timeInput.value}`;
        }
      };
      
      dateInput.addEventListener('change', updateDatetime);
      timeInput.addEventListener('change', updateDatetime);
    }
  });
}

// Function to initialize auto-resize for textareas
function initAutoResizeTextareas() {
  const textareas = document.querySelectorAll('textarea[data-auto-resize]');
  
  textareas.forEach(textarea => {
    // Set initial height
    textarea.style.height = 'auto';
    textarea.style.height = (textarea.scrollHeight) + 'px';
    
    // Resize on input
    textarea.addEventListener('input', function() {
      this.style.height = 'auto';
      this.style.height = (this.scrollHeight) + 'px';
    });
  });
}

// Function to initialize items handling (for picnic items)
function initItemsHandling() {
  const itemsContainer = document.getElementById('items-container');
  const addItemButton = document.getElementById('add-item-button');
  
  if (!itemsContainer || !addItemButton) return;
  
  // Add new item
  addItemButton.addEventListener('click', function() {
    const itemCount = itemsContainer.querySelectorAll('.item-row').length;
    
    const newRow = document.createElement('div');
    newRow.className = 'item-row mb-2 d-flex align-items-center';
    newRow.innerHTML = `
      <input type="text" name="items[${itemCount}][name]" class="form-control me-2" placeholder="Item name" required>
      <input type="number" name="items[${itemCount}][quantity]" class="form-control me-2" placeholder="Qty" min="1" value="1" style="width: 80px;" required>
      <select name="items[${itemCount}][assignedTo]" class="form-control me-2" style="width: 150px;">
        <option value="">Unassigned</option>
        <option value="Me">Me</option>
      </select>
      <button type="button" class="btn btn-outline-danger remove-item-button">
        <i class="bi bi-trash"></i>
      </button>
    `;
    
    itemsContainer.appendChild(newRow);
    
    // Add event listener to the new remove button
    const removeButton = newRow.querySelector('.remove-item-button');
    removeButton.addEventListener('click', function() {
      newRow.remove();
    });
  });
  
  // Remove existing items
  itemsContainer.querySelectorAll('.remove-item-button').forEach(button => {
    button.addEventListener('click', function() {
      this.closest('.item-row').remove();
    });
  });
}

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
  
  // Default coordinates (Lausanne, Switzerland)
  let lat = 46.511870;
  let lng = 6.603551;
  
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
  if (isCreatePage && (!latInput.value || latInput.value === '46.511870')) {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        function(position) {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;
          
          // Update the map view and marker
          map.setView([userLat, userLng], zoomLevel);
          marker.setLatLng([userLat, userLng]);
          
          // Update the form inputs
          updateCoordinates({lat: userLat, lng: userLng});
          
          // Query for amenities at the current location
          window.queryAmenities(map, amenityMarkersGroup, userLat, userLng);
        },
        function(error) {
          console.error('Error getting location:', error.message);
          // If we can't get the user's location, query amenities at the default location
          window.queryAmenities(map, amenityMarkersGroup, lat, lng);
        }
      );
    } else {
      // If geolocation is not available, query amenities at the default location
      window.queryAmenities(map, amenityMarkersGroup, lat, lng);
    }
  } else {
    // Query amenities at the current map location
    window.queryAmenities(map, amenityMarkersGroup, lat, lng);
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
    window.queryAmenities(map, amenityMarkersGroup, latlng.lat, latlng.lng);
    
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
  
  // Update map view when it's moved or zoomed
  map.on('moveend', function() {
    // If in read-only mode, recenter the map on the marker after moving
    if (isReadOnly && !isAdjusting) {
      isAdjusting = true; // Set flag to prevent infinite loop
      const markerPos = marker.getLatLng();
      map.setView(markerPos, map.getZoom(), { animate: true });
      // Reset flag after a short delay to ensure the view has settled
      setTimeout(() => { isAdjusting = false; }, 100);
    } else if (!isReadOnly) {
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
      // Reset flag after a short delay to ensure the view has settled
      setTimeout(() => { isAdjusting = false; }, 100);
    } else if (!isReadOnly) {
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
            map.setView(latlng, zoomLevel);
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

// Function to handle form submission and combine date and time
function initFormSubmission() {
  const form = document.querySelector('form[action="/picnics"]');
  if (!form) return;
  
  form.addEventListener('submit', function(e) {
    // Get the date and time inputs
    const dateInput = document.getElementById('date');
    const timeInput = document.getElementById('time');
    const datetimeInput = document.getElementById('datetime');
    const nameInput = document.getElementById('name');
    const locationInput = document.getElementById('location');
    
    // Ensure the name field has a value before submission
    if (nameInput && (!nameInput.value || nameInput.value.trim() === '')) {
      // If name is empty, use the location value
      if (locationInput && locationInput.value) {
        // Extract street name and city/town/village from the location
        let formattedLocation = locationInput.value;
        
        // Try to format the location to "street name, city/town/village"
        try {
          // Split the location by commas
          const locationParts = locationInput.value.split(',');
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
        
        console.log('Setting name from location before submit:', truncatedLocation);
        nameInput.value = truncatedLocation;
      } else {
        // If no location, use a default name
        nameInput.value = "New Picnic";
        console.log('Setting default name before submit: New Picnic');
      }
    }
    
    // Check for empty attendee name fields and set them to their placeholder value
    const attendeeInputs = form.querySelectorAll('.item-name');
    attendeeInputs.forEach(input => {
      if (!input.value || input.value.trim() === '') {
        // Get the placeholder value
        const placeholderValue = input.getAttribute('placeholder');
        if (placeholderValue) {
          console.log('Setting empty attendee name to placeholder:', placeholderValue);
          input.value = placeholderValue;
        }
      }
    });
    
    if (dateInput && timeInput && datetimeInput) {
      // Combine date and time
      if (dateInput.value && timeInput.value) {
        datetimeInput.value = `${dateInput.value}T${timeInput.value}`;
        console.log('Combined datetime:', datetimeInput.value);
      } else {
        console.error('Date or time is missing');
        e.preventDefault(); // Prevent form submission if date or time is missing
        alert('Please select both date and time');
      }
    }
  });
}
