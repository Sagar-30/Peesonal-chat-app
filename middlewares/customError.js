export default class customError extends Error{
  constructor(msg,code){
    super(),
      this.message = msg;
  }
}