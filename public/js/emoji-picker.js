// Emoji Picker for Picnic App

// Common emoji categories and emojis
const emojiCategories = [
  {
    name: "Smileys & People",
    emojis: [
      "😎", "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", 
      "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙",
      "👋", "👌", "👍", "👎", "🤙", "🤘", "🤝", "🤗", "🤔", "🤫"
    ]
  },
  {
    name: "Camping Related",
    emojis: [
      "🏕️", "⛺", "🔥", "🪵", "🌲", "🌳", "🌄", "🌅", "🌌", "🌙",
      "🔦", "🧭", "🧰", "🪓", "🔪", "🧶", "🧴", "🧼", "🧻", "🧹",
      "🥾", "🎒", "🛖", "🚵", "🚣", "🏞️", "🦟", "🦗", "🐜", "🐝"
    ]
  },
  {
    name: "Nature & Animals",
    emojis: [
      "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯",
      "🦁", "🐮", "🐷", "🐸", "🐵", "🐔", "🐧", "🐦", "🐤", "🦆",
      "🌱", "🌲", "🌳", "🌴", "🌵", "🌷", "🌸", "🌹", "🌺", "🌻"
    ]
  },
  {
    name: "Food & Drink",
    emojis: [
      "🍏", "🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🍈",
      "🍒", "🍑", "🥭", "🍍", "🥥", "🥝", "🍅", "🍆", "🥑", "🥦",
      "🍔", "🍟", "🍕", "🌭", "🍿", "🧂", "🥓", "🥚", "🍳", "🧇"
    ]
  },
  {
    name: "Activities & Places",
    emojis: [
      "⚽", "🏀", "🏈", "⚾", "🥎", "🎾", "🏐", "🏉", "🎱", "🏓",
      "🎯", "🎮", "🎲", "🧩", "🎭", "🎨", "🎬", "🎤", "🎧", "🎼",
      "🏔️", "⛰️", "🌋", "🗻", "🏕️", "🏖️", "🏜️", "🏝️", "🏞️", "🌅"
    ]
  },
  {
    name: "Picnic Related",
    emojis: [
      "🧺", "🥪", "🍗", "🥤", "🧃", "🍺", "🍷", "🍹", "🧉", "🥂",
      "🌞", "⛅", "🌈", "🌻", "🌳", "🌲", "🏞️", "🍉", "🍓", "🍒",
      "🧁", "🍰", "🍦", "🍨", "🍧", "🥧", "🧀", "🥗", "🥙", "🥘"
    ]
  }
];

// Initialize emoji picker
function initEmojiPicker() {
  // Create emoji picker buttons for title and message fields
  createEmojiPickerButton('name', 'Picnic Name');
  createEmojiPickerButton('message', 'Message');
}

// Create emoji picker button for a specific field
function createEmojiPickerButton(fieldId, fieldName) {
  const field = document.getElementById(fieldId);
  if (!field) return;
  
  // Create emoji button
  const emojiButton = document.createElement('button');
  emojiButton.type = 'button';
  emojiButton.className = 'btn btn-sm btn-outline-secondary emoji-picker-btn';
  emojiButton.innerHTML = '😎';
  emojiButton.title = `Add emoji to ${fieldName}`;

  // Create a container for the field and button if it doesn't exist
  const fieldContainer = field.parentNode;
  if (fieldContainer.classList.contains('d-flex')) {
    // If the parent already has d-flex class, just append the button
    fieldContainer.appendChild(emojiButton);
  } else {
    // Create a wrapper div with d-flex
    const wrapper = document.createElement('div');
    wrapper.className = 'd-flex align-items-center';
    
    // Replace the field with the wrapper containing the field and button
    field.parentNode.replaceChild(wrapper, field);
    wrapper.appendChild(field);
    wrapper.appendChild(emojiButton);
  }
  
  // Add click event to show emoji picker
  emojiButton.addEventListener('click', function(e) {
    e.preventDefault();
    showEmojiPicker(field);
  });
}

// Show emoji picker for a field
function showEmojiPicker(targetField) {
  // Remove any existing emoji picker
  const existingPicker = document.querySelector('.emoji-picker-container');
  if (existingPicker) {
    existingPicker.remove();
  }
  
  // Create emoji picker container
  const pickerContainer = document.createElement('div');
  pickerContainer.className = 'emoji-picker-container card';
  
  // Create header
  const header = document.createElement('div');
  header.className = 'card-header d-flex justify-content-between align-items-center';
  header.innerHTML = '<h6 class="mb-0">Select an Emoji</h6>';
  
  // Create close button
  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.className = 'btn-close';
  closeButton.addEventListener('click', function() {
    pickerContainer.remove();
  });
  header.appendChild(closeButton);
  
  // Create body
  const body = document.createElement('div');
  body.className = 'card-body';
  
  // Create emoji content container as a long list
  const emojiContent = document.createElement('div');
  emojiContent.className = 'emoji-list';
  
  // Add categories as sections in a long list
  emojiCategories.forEach((category) => {
    // Create section title
    const sectionTitle = document.createElement('h6');
    sectionTitle.className = 'emoji-category-title';
    sectionTitle.textContent = category.name;
    emojiContent.appendChild(sectionTitle);
    
    // Create emoji container for this section
    const emojiSection = document.createElement('div');
    emojiSection.className = 'emoji-section';
    
    // Add emojis to section
    category.emojis.forEach(emoji => {
      const emojiButton = document.createElement('button');
      emojiButton.type = 'button';
      emojiButton.className = 'btn btn-light emoji-btn';
      emojiButton.textContent = emoji;
      emojiButton.addEventListener('click', function() {
        insertEmoji(targetField, emoji);
        pickerContainer.remove();
      });
      emojiSection.appendChild(emojiButton);
    });
    
    emojiContent.appendChild(emojiSection);
    
    // Add a divider after each section (except the last one)
    if (category !== emojiCategories[emojiCategories.length - 1]) {
      const divider = document.createElement('hr');
      divider.className = 'emoji-section-divider';
      emojiContent.appendChild(divider);
    }
  });
  
  // Assemble the picker
  body.appendChild(emojiContent);
  pickerContainer.appendChild(header);
  pickerContainer.appendChild(body);
  
  // Position the picker near the target field
  const fieldRect = targetField.getBoundingClientRect();
  pickerContainer.style.position = 'absolute';
  pickerContainer.style.top = `${window.scrollY + fieldRect.bottom + 5}px`;
  pickerContainer.style.left = `${fieldRect.left}px`;
  pickerContainer.style.zIndex = '1000';
  
  // Add to document
  document.body.appendChild(pickerContainer);
}

// Insert emoji into field
function insertEmoji(field, emoji) {
  // For input fields
  if (field.tagName === 'INPUT') {
    const start = field.selectionStart || 0;
    const end = field.selectionEnd || 0;
    const text = field.value;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);
    
    field.value = before + emoji + after;
    field.focus();
    field.selectionStart = field.selectionEnd = start + emoji.length;
  } 
  // For textareas
  else if (field.tagName === 'TEXTAREA') {
    const start = field.selectionStart || 0;
    const end = field.selectionEnd || 0;
    const text = field.value;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);
    
    field.value = before + emoji + after;
    field.focus();
    field.selectionStart = field.selectionEnd = start + emoji.length;
    
    // Trigger input event to adjust height if auto-resize is enabled
    const event = new Event('input', { bubbles: true });
    field.dispatchEvent(event);
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initEmojiPicker);
