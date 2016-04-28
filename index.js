import request from 'request';
import moment from 'moment';

Array.prototype.choice = function () {  // eslint-disable-line no-extend-native
  return this[Math.floor(Math.random() * this.length)];
};

const getData = () => {
  return new Promise((resolve, reject) => {
    request({
      uri: 'http://www.mbtabackontrack.com/performance/performance.php?metric=reliability',
      json: true
    }, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        resolve(body);
      } else {
        reject(error, response);
      }
    });
  });
};

const extractData = (body) => {
  const metrics = body
    .dashboard
    .metricCategories
    .reliability
    .detailMetrics
    .filter(el => el.name === 'Subway')[0]
    .childMetrics;

  const reliability = metrics
    .map(el => el.categories[0]);

  const targets = metrics
    .map((metric) => {
      return {
        slug: metric.slug,
        target: metric.series.filter(el => el.slug === 'target_goal')[0].data[0]
      };
    });

  return {
    reliability,
    targets
  };
};

const emoji = (lineReliability) => {
  // for a given slug and reliability expected value return an emoji that indicates how the line is doing

  const perf = 1 - lineReliability.value;
  switch (Math.floor(perf * 10)) {
  case 9:
    return ['💯', '💃', '⚡️', '🚀', '🎉', '🎆', '😻'].choice();
  case 8:
    return ['👍', '😄', '👏', '👌', '✅', '⏩', '📈', '😋', '😌', '😎', '😛', '😊', '🙃'].choice();
  case 7:
    return ['🤕', '🙄', '🙇', '😑', '🔔', '🆗', '⏳', '😒'].choice();
  case 6:
    return ['🙀', '😰', '😳', '🚶', '😢', '❗️', '💔', '📉', '🐢', '🙈', '🐛'].choice();
  default:
    return ['💩', '😭', '💀', '🚨', '👹', '⁉️', '🚫', '🆘', '🙅', '😲', '😡'].choice();
  }
};

const formatLines = (data, lines) => {
  return lines.map((line) => {
    const lineReliability = data.reliability.filter(x => x.slug === line)[0];
    const percentage = Number((1 - lineReliability.value) * 100).toFixed(0);
    return `${lineReliability.name}: ${percentage}% ${emoji(lineReliability)}`;
  });
};

const formatData = (data) => {
  const template = [
    `MBTA Report Card for ${moment().format('dddd, MMM Do')}:`
  ];

  for (const line of formatLines(data, ['blue', 'green', 'orange', 'red'])) {
    template.push(line);
  }

  return template.join('\n');
};

const publish = (message) => {
  console.log(message);
};

(() => {
  getData()
    .then(extractData)
    .then(formatData)
    .then(publish)
    .catch((error, response) => {
      console.error(error, response);
    });
})();
