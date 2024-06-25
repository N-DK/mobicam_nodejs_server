const constant = require("../constant");

const publicTopic = (chanel, payload) => {
  const __trackTopicList = Object.values(__trackTopic) || [];
  // console.log("topic length:", __trackTopicList?.length);
  __trackTopicList.forEach?.((topic) => {
    const topicChn = topic?.chanel;
    const callback = topic?.callback;
    const fTopic = constant.topicSub;

    if (chanel == constant?.gpsTopic) {
      const isSubGps = topicChn == fTopic.subGps;
      const isSubLostGps =
        topicChn == fTopic.subLostGps && payload?.status == 0;
      const isSubHasGps = topicChn == fTopic.subHasGps && payload?.status == 1;

      isSubGps && callback?.(payload);
      isSubLostGps && callback?.(payload);
      isSubHasGps && callback?.(payload);
    }

    if (chanel == constant?.vConnectTopic) {
      const isSubConnect = topicChn == fTopic.subConnect;
      const isSubLostConnect =
        topicChn == fTopic.subLostConnect && payload?.status == 0;
      const isSubReConnect =
        topicChn == fTopic.subReConnect && payload?.status == 1;

      isSubConnect && callback?.(payload);
      isSubLostConnect && callback?.(payload);
      isSubReConnect && callback?.(payload);
    }
  });
};

module.exports = publicTopic;
