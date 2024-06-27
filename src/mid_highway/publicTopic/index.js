const publicTopic = (chanel, payload) => {
    const __trackTopicList = Object.values(__trackTopic) || [];
    __trackTopicList.forEach?.((topic) => {
        const callback = topic?.callback;
        callback?.(payload);
    });
};

module.exports = publicTopic;
