import { handler } from './index';

handler({}, {}, (error, success) => {
  if (error) {
    console.error(error);
  } else {
    console.log(success);
  }
});
