// Generates HTML option elements from an array of options.

export default function showOptions(options) {
  let html = '';

  for (let i = 0; i < options.length; i++) {
    // add an option element to the HTML string
    html += `<option value="${options[i].id}">${options[i].text}</option>`;
  }
  return html;
}


