export function convertToUTC(time, timeZone) {
  const date = new Date(time);
  const options = { timeZone };
  const formatter = new Intl.DateTimeFormat("en-US", options);

  const localTime = formatter.format(date);
  const utcTime = Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
    date.getMilliseconds()
  );

  return { localTime, utcTime };

  // Example usage
  // const time = '2023-03-26T01:30:00';
  // const timeZone = 'America/New_York';

  // const convertedTime = convertToUTC(time, timeZone);
  // console.log('Local time:', convertedTime.localTime);
  // console.log('UTC time:', new Date(convertedTime.utcTime));

  //OUTPPUT:
  // Local time: 3/26/2023, 1:30:00 AM
  // UTC time: 2023-03-26T05:30:00.000Z
}

export function convertToDateTimeObject(timeString) {
  const [hours, minutes, seconds] = timeString.split(":");
  const date = new Date();
  date.setHours(parseInt(hours, 10));
  date.setMinutes(parseInt(minutes, 10));
  date.setSeconds(parseInt(seconds, 10));
  return date;

  // Example usage
  // const timeString = '14:30:00';
  // const timeObject = convertToTimeObject(timeString);
  // console.log(timeObject);

  //output:Sun Mar 27 2022 14:30:00 GMT+0800 (Taipei Standard Time)
}
