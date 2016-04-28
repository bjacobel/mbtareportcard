import request from 'request';
import moment from 'moment';

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
  const reliability = body
    .dashboard
    .metricCategories
    .reliability
    .detailMetrics
    .filter(el => el.name === 'Subway')[0]
    .childMetrics
    .map(el => el.categories[0]);

  const targets = body;

  return {
    reliability,
    targets
  };
};

const emoji = (lineReliability, lineTargets) => {
  // for a given slug and reliability expected value return an emoji that indicates how the line is doing
  return ':)';
};

const formatLines = (data, lines) => {
  return lines.map((line) => {
    const lineReliability = data.reliability.filter(x => x.slug === line)[0];
    const lineTargets = {};
    const percentage = Number((1 - lineReliability.value) * 100).toFixed(0);
    return `${lineReliability.name}: ${percentage}% ${emoji(lineReliability, lineTargets)}`;
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
