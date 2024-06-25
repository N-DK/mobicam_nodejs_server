const checkType = {
  null(data) {
    return (
      data != undefined &&
      data != "undefined" &&
      data != this.null &&
      data != "null"
    );
  },
};

module.exports = checkType;
