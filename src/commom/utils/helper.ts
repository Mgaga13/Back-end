import axios from 'axios';

import { readdirSync } from 'fs';
import { join } from 'path';

export const getOffset = (timeZone = 'UTC', date = new Date()) => {
  const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
  const tzDate = new Date(date.toLocaleString('en-US', { timeZone }));
  return (tzDate.getTime() - utcDate.getTime()) / 6e4 / 60;
};

export const shuffle = (array: any[]) => {
  let currentIndex = array.length;
  let temporaryValue;
  let randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
};

/**
 * Create an object composed of the picked object properties.
 * @param {Object} obj The source object.
 * @param {...(string|string[])} props The property names to pick, specified
 * individually or in arrays.
 * @returns {Object} Returns the new object.
 * @example
 * const object = { 'a': 1, 'b': '2', 'c': 3 }
 * pick(object, ['a', 'c'])
 * => { 'a': 1, 'c': 3 }
 */
export const pick = (object = {}, keys: string[]): any => {
  return keys.reduce((obj, key) => {
    if (object && Object.prototype.hasOwnProperty.call(object, key)) {
      obj[key] = object[key];
    }
    return obj;
  }, {});
};

/**
 * Chunk array
 * @param {any[]} array
 * @param {number} size
 * @returns {any[][]}
 * @example
 * chunk([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 3)
 * => [[1, 2, 3], [4, 5, 6], [7, 8, 9], [10]]
 * chunk([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 4)
 * => [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10]]
 */
export const chunk = (array: any[], size: number) => {
  const chunked_arr = [];
  let index = 0;

  while (index < array.length) {
    chunked_arr.push(array.slice(index, size + index));
    index += size;
  }

  return chunked_arr;
};

/**
 * Find key in object and returns the object of the first element predicate returns truthy for instead of the element itself.
 * @param {Object} obj
 * @param {Function} predicate
 * @returns {Object}
 * @example
 * findKey({ a: 1, b: 2, c: 3 }, n => n % 2 === 0)
 * => { b: 2 }
 * findKey({ a: 1, b: 2, c: 3 }, n => n % 2 === 1)
 * => { a: 1 }
 */
export const findKey = (obj: any, predicate: any) => {
  for (const key in obj) {
    if (obj.hasOwnProperty(key) && predicate(obj[key])) {
      return obj[key];
    }
  }
};

/**
 * Get all files in a directory
 * @param {string} dir
 * @returns {object[]}
 */
export const getPartialFiles = (dir: string) => {
  const files = readdirSync(dir + '/partials').filter((file) =>
    file.includes('.hbs'),
  );

  const partials = files.reduce((acc, file) => {
    acc[file.replace('.hbs', '')] = join('partials', file);
    return acc;
  }, {});

  return partials;
};

export const removeVietnameseTones = (str) => {
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
  str = str.replace(/đ/g, 'd');
  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, 'A');
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, 'E');
  str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, 'I');
  str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, 'O');
  str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, 'U');
  str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, 'Y');
  str = str.replace(/Đ/g, 'D');
  // Some system encode vietnamese combining accent as individual utf-8 characters
  str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ''); // ̀ ́ ̃ ̉ ̣  huyền, sắc, ngã, hỏi, nặng
  str = str.replace(/\u02C6|\u0306|\u031B/g, ''); // ˆ ̆ ̛  Â, Ê, Ă, Ơ, Ư
  // Remove extra spaces
  str = str.replace(/ + /g, ' ');
  str = str.trim();
  // Remove punctuations
  str = str.replace(
    /!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g,
    ' ',
  );
  return str;
};

/**
 * Get days between two dates
 * @param {Date} startDate
 * @param {Date} endDate
 * @returns {number}
 * @example
 * getDaysBetweenDates(new Date(2020, 0, 1), new Date(2020, 0, 2))
 * => 1
 */
export const getTenureBetweenDates = (startDate: Date, endDate: Date) => {
  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  const days = Math.round(
    (endDate.getTime() - startDate.getTime()) / millisecondsPerDay,
  );

  if (days <= 3) {
    return 1;
  } else if (days <= 10) {
    return 2;
  } else if (days <= 30) {
    return 3;
  } else if (days <= 90) {
    return 4;
  } else if (days <= 180) {
    return 5;
  } else if (days <= 365) {
    return 6;
  } else {
    return 7;
  }
};

export const getLifetimeDollarsPurchased = (money: number) => {
  if (money === 0) {
    return 1;
  } else if (money <= 49.99) {
    return 2;
  } else if (money <= 99.99) {
    return 3;
  } else if (money <= 499.99) {
    return 4;
  } else if (money <= 999.99) {
    return 5;
  } else if (money <= 1999.99) {
    return 6;
  } else {
    return 7;
  }
};

export const getLifetimeDollarsRefunded = (money: number) => {
  if (money === 0) {
    return 1;
  } else if (money <= 49.99) {
    return 2;
  } else if (money <= 99.99) {
    return 3;
  } else if (money <= 499.99) {
    return 4;
  } else if (money <= 999.99) {
    return 5;
  } else if (money <= 1999.99) {
    return 6;
  } else {
    return 7;
  }
};
