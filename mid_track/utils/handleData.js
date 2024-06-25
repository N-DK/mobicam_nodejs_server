const checkType = require("./checkType");

const handleData = {
  parseCardList(cardList, type) {
    return cardList?.map?.((rc) => {
      //   console.log(checkType.null(rc?.vehicleList) || []);
      const data = {
        ...rc,

        topics: JSON.parse(checkType.null(rc?.topics) ? rc?.topics : "[]"),
        devIdList: JSON.parse(
          checkType.null(rc?.devIdList) ? rc?.devIdList : "[]"
        ),
        vehicleList: JSON.parse(
          checkType.null(rc?.vehicleList) ? rc?.vehicleList : "[]"
        ),
        telegramId: JSON.parse(
          checkType.null(rc?.telegramId) ? rc?.telegramId : "[]"
        ),
      };

      if (type == "object") {
        const vehicleListObj = {};
        const devIdListObj = {};
        const topicListObject = {};
        data?.vehicleList?.forEach?.((v) => (vehicleListObj[v] = true));
        data?.devIdList?.forEach?.((v) => (devIdListObj[v] = true));
        data?.topics?.forEach?.((v) => (topicListObject[v] = true));
        return {
          ...data,
          vehicleListObj,
          devIdListObj,
          topicListObject,
        };
      } else {
        return data;
      }
    });
  },
};

module.exports = handleData;
