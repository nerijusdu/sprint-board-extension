export default {
  addSeconds(date, seconds) {
    const newDate = new Date(date);
    newDate.setSeconds(date.getSeconds() + seconds);
    return newDate;
  },
  now() {
    return new Date();
  },
  isBefore(date1, date2) {
    return date1 < date2;
  }
};
