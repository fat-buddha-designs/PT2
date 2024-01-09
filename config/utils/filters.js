const {DateTime} = require('luxon');
const appendSuffix = n => {
  var s = ['th', 'st', 'nd', 'rd'],
    v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};
const lodash = require('lodash');
const timestamp = Math.floor(Date.now() / 1000);

const nth = function (d) {
  if (d > 3 && d < 21) {
    return 'th';
  }
  switch (d % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
};

const month_names = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

const parse = date => new Date(Date.parse(date));

module.exports = {
  iso: date => {
    return parse(date).toISOString();
  },

  w3Date: date => {
    return parse(date).toISOString(zone, 'utc');
  },

  isoShort: date => {
    return parse(date).toISOString().split('T')[0];
  },

  local: date => {
    return parse(date).toLocaleString();
  },

  localShort: date => {
    return parse(date).toLocaleString().split('T')[0];
  },

  utc: date => {
    return parse(date).toUTCString();
  },

  utcShort: date => {
    return parse(date).toUTCString().split('T')[0];
  },

  longDate: date => {
    date = parse(date);
    let day = date.getDate();
    return `${day}${nth(day)} ${month_names[date.getMonth()]}, ${date.getFullYear()}`;
  },

  day: date => {
    return parse(date).getDate();
  },

  dayOrdinal: date => {
    let day = parse(date).getDate();
    return day + nth(day);
  },

  month: date => {
    return parse(date).getMonth() + 1; 
  },

  monthName: date => {
    return month_names[parse(date).getMonth()];
  },

  year: date => {
    return parse(date).getFullYear();
  },

  dateFilter: function (value) {
    const dateObject = new Date(value);
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
    ];
    const dayWithSuffix = appendSuffix(dateObject.getDate());
    return `${dayWithSuffix} ${
      months[dateObject.getMonth()]
    } ${dateObject.getFullYear()}`;
  },

  dateToFormat: function (date) {
    return DateTime.fromJSDate(date, {
      zone: 'utc'
    }).toLocaleString(DateTime.DATE_MED);
  },

  dateToISO: function (date) {
    return DateTime.fromJSDate(date, {
      zone: 'utc'
    }).toISO({
      includeOffset: false,
      suppressMilliseconds: true
    });
  },

  cacheBust: function (value) {
    return `${value}?${timestamp}`;
  },

  head: function (array, n) {
    if (!Array.isArray(array) || array.length === 0) {
      return [];
    }
    if (n < 0) {
      return array.slice(n);
    }
    return array.slice(0, n);
  },

  include: function (arr, path, value) {
    value = lodash.deburr(value).toLowerCase();
    return arr.filter(item => {
      let pathValue = lodash.get(item, path);
      pathValue = lodash.deburr(pathValue).toLowerCase();
      return pathValue.includes(value);
    });
  },

  limit: (array, limit) => {
    return array.slice(0, limit);
  },

  // Return a single random item
  randomItem: arr => {
    arr.sort(() => {
      return 0.5 - Math.random();
    });
    return arr.slice(0, 1);
  },

  // Sort tag pages by title
  sortByTitle: arr => {
    arr.sort((a, b) => (a.title > b.title ? 1 : -1));
    return arr;
  },

  // Sort recently added page by date added
  sortByNewest: arr => {
    arr.sort((b, a) => (a.date > b.date ? 1 : -1));
    return arr;
  },

  min: function (numbers) {
    return Math.min.apply(null, numbers);
  },

  markdown: function (rawString) {
    return markdown.renderInline(rawString);
  },

  nicejson: string => {
    if (!string) {
      return '""';
    }
    return JSON.stringify(string);
  },

  obfuscate: function (str) {
    const chars = [];
    for (var i = str.length - 1; i >= 0; i--) {
      chars.unshift(['&#', str[i].charCodeAt(), ';'].join(''));
    }
    return chars.join('');
  },

  stripmarks: function (value) {
    value = lodash.replace(value, /\"$/, ' ');
    return value;
  },

  capitalize: function (str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  },

  lowercase: function (value) {
    value = lodash.deburr(value).toLowerCase();
    return value;
  },

  uppercase: function (value) {
    value = lodash.deburr(value).toUpperCase();
    return value;
  },

  hidePastItems: function (value) {
    value = event => {
      let now = new Date().getTime();
      if (now > event.Date.getTime()) return false;
      return true;
    };
  },

  hideFutureItems: function (value) {
    value = event => {
      let now = new Date().getTime();
      if (now < event.Date.getTime()) return false;
      return true;
    };
  }
};
