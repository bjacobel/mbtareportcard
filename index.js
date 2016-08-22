import moment from 'moment';
import request from 'request';
import Vinz from 'vinz';
import Twitter from 'twitter';

Array.prototype.choice = function () {  // eslint-disable-line no-extend-native
  return this[Math.floor(Math.random() * this.length)];
};

const getData = () => {
  return new Promise((resolve, reject) => {
    return request({
      baseUrl: 'http://www.mbtabackontrack.com/performance/',
      uri: 'performance.php?metric=reliability',
      method: 'GET',
      json: true
    }, (error, message, json) => {
      if (error || message.statusCode !== 200) {
        reject({ error, message });
      } else {
        resolve(json);
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
    .all
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
    return ['💃', '⚡️', '🚀', '🎉', '🎆', '😻', '👌', '👍', '😄', '👏', '✅', '🚄', '🌈', '💰', '🎊'].choice();
  case 8:
    return ['⏩', '📈', '😋', '😌', '😎', '😛', '😊', '🙃'].choice();
  case 7:
    return ['🤕', '🙄', '🙇', '😑', '🔔', '🆗', '⏳', '😒'].choice();
  case 6:
    return ['🙀', '😰', '😳', '🚶', '😢', '❗️', '💔', '📉', '🐢', '🙈', '🐛', '🚧'].choice();
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
    `MBTA Report Card for ${moment().add(-1, 'days').format('dddd, MMM Do')}:`
  ];

  for (const line of formatLines(data, ['blue', 'green', 'orange', 'red'])) {
    template.push(line);
  }

  return template.join('\n');
};

const publish = (message) => {
  const vinz = new Vinz('us-east-1');
  return vinz.get(
      'TwitterConsumerKey',
      'TwitterConsumerSecret',
      'TwitterAccessToken',
      'TwitterAccessTokenSecret'
    ).then((secrets) => {
      /* eslint-disable camelcase */
      const [
        consumer_key,
        consumer_secret,
        access_token_key,
        access_token_secret
      ] = secrets;
      /* eslint-enable camelcase */

      const client = new Twitter({
        consumer_key,
        consumer_secret,
        access_token_key,
        access_token_secret
      });

      return new Promise((resolve, reject) => {
        client.post('statuses/update', { status: message }, (error, tweet) => {
          if (error) {
            reject(error);
          } else {
            resolve(tweet.text);
          }
        });
      });
    });
};

export const handler = (event, context, callback) => {
  getData()
    .then(extractData)
    .then(formatData)
    .then(publish)
    .then((tweetText) => {
      callback(null, `Tweeted!:\n${tweetText}`);
    })
    .catch((error) => {
      callback(error);
    });
};
