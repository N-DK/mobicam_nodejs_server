const constant = require("./constant");
const { alarmConnectSocketInitial } = require("./socketClient");
const { makeId } = require("./utils/makeId");

global.__trackTopic = {};

const midTrack = {
  init() {
    alarmConnectSocketInitial();
  },
  track(chanel, callback) {
    if (!chanel || !callback) return;

    const topicArray = Object.values(constant?.topicSub) || [];
    if (!topicArray?.includes(chanel))
      return console.log(
        ">> module__midTrack >> WRONG TOPIC PLEASE subcribe one of below:",
        topicArray?.join?.(", ")
      );

    const id = makeId(20);

    __trackTopic[id] = {
      chanel,
      callback,
    };

    console.log(">> module__midTrack >> CREATED NEW TRACK TOPIC", chanel, id);

    return id;
  },

  destroy(trackId) {
    if (__trackTopic?.[trackId]) {
      delete __trackTopic?.[trackId];
    }
  },
};

module.exports = midTrack;
