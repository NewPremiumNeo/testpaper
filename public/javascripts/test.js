function toggleInput(inputId) {
    const inputElement = document.getElementById(inputId);
    if (inputElement.type === 'radio') {
        inputElement.checked = true; // Check the radio button
    } else if (inputElement.type === 'checkbox') {
        inputElement.checked = !inputElement.checked; // Toggle checkbox
    }
    // Update progress if needed
    inputElement.dispatchEvent(new Event('change')); // Trigger change event for progress update
}
