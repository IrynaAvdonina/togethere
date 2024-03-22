export default function calculateAge(date) {
  var today = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
  var d = date.split('-');
  d[1] = +d[1];
  var dob = new Date(+d[0], d[1] - 1, +d[2]);
  var dobnow = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
  var age = today.getFullYear() - dob.getFullYear();
  if (today < dobnow) {
    age = age - 1;
  }
  return age;
}