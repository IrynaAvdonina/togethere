//Calculates the age based on the given date of birth.

export default function calculateAge(date) {
  // get the current date
  const today = new Date();
  let [year, month, day] = date.split('-');

  // create a new date object using the given year, month, and day
  const bday = new Date(+year, +month - 1, +day);

  let age = today.getFullYear() - bday.getFullYear();
  const bdayThisYear = new Date(today.getFullYear(), bday.getMonth(), bday.getDate());

  // if the current date is before the date of birth for the current year, subtract 1 from the age
  if (today < bdayThisYear) {
    age -= 1;
  }
  return age;
}

