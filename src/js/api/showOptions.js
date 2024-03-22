
export default function showOptions(options) {
  let html = '';
  for (let i = 0; i < options.length; i++) {
    html += `<option value="${options[i].id}">${options[i].text}</option>`;
  }
  return html;
}


