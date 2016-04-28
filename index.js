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
    .map(el => el.categories[0])
    .map((el) => {
      return {
        slug: el.slug,
        value: el.value
      };
    });

  const targets = body;

  return {
    reliability,
    targets
  };
};

const percentage = (data, lineSlug) => {
  return Number((1 - data.filter(line => line.slug === lineSlug)[0].value) * 100).toFixed(0);
};

const formatData = (reliability) => {
  const template = [
    `MBTA Report Card for ${moment().format('dddd, MMM Do')}:`,
    `Blue Line: ${percentage(reliability, 'blue')}%`,
    `Green Line: ${percentage(reliability, 'green')}%`,
    `Orange Line: ${percentage(reliability, 'orange')}%`,
    `Red Line: ${percentage(reliability, 'red')}%`
  ];

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
