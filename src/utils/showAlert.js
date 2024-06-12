// Hides the alert element that is closest to the given element.

function closeAlert(element) {
  // find the closest alert element to the given element
  const alert = element.closest('.alert');

  // if it was found, hide it
  if (alert) {
    alert.style.display = 'none';
  }
}
