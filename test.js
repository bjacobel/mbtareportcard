import { handler } from './main';

handler({}, {}, (error, success) => {
  if (error) {
    console.error(error);
  } else {
    console.log(success);
  }
});
