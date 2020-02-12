function isValidDate(date: string): boolean {
  return /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(date);
}

function isValidDateTime(date: string): boolean {
  return /^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}$/.test(date);
}

function isFirstDateIsAfterSecondDate(firstDate: Date, secondeDate: Date): boolean {
  return firstDate < secondeDate;
}

export { isValidDate, isValidDateTime, isFirstDateIsAfterSecondDate };
