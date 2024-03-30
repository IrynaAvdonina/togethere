
function closeAlert(element) {
  const alert = element.closest('.alert');
  if (alert) {
    alert.style.display = 'none';
  }
}