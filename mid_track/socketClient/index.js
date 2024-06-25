const { io } = require("socket.io-client");
const constant = require("../constant");
const publicTopic = require("../publicTopic");

const alarmConnectSocketInitial = () => {
  console.log(">> Socket.Io Connecting to alarm Server");
  const socket = io(constant?.alarmDomain, {
    extraHeaders: {
      auth_token: constant.pKey,
    },
  });

  socket.on("connect", () => {});

  socket.on(constant.gpsTopic, (payload) => {
    publicTopic(constant.gpsTopic, payload?.data);
  });
  socket.on(constant.vConnectTopic, (payload) => {
    publicTopic(constant.vConnectTopic, payload?.data);
  });

  socket.on("disconnect", () => {
    console.log(">> Track socket.Io alarm disconnected");
  });
};

module.exports = { alarmConnectSocketInitial };
