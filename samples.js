const path = require("path");
const express = require("express");
const line = require("@line/bot-sdk");
const axios = require('axios');

const lineConfig = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET
};
const lineClient = new line.Client(lineConfig);

function createReplyMessage(input, profile) {
  const message = profile.displayName + "さん、ようこそ！\nLINEbotでできることの一部を紹介するサンプルです。\n「画像」、「位置情報」、「スタンプ」、「ボタン」、「天気」と話しかけてみてください。";
  const hands = ["グー", "チョキ", "パー"];
  const userHandNum = hands.indexOf(input);
 
  function textMessage(str) {
    return {
      type: "text",
      text: str
    };
  }

  if (input == "画像") {
    const appUrl = process.env.HEROKU_APP_URL;
    return {
      type: "image",
      previewImageUrl: `${appUrl}images/question.png`,
      originalContentUrl: `${appUrl}images/answer.png`
    };
  } else if (input == "スタンプ") {
    return {
      type: "sticker",
      packageId: "1",
      stickerId: "1"
    };
  } else if (input == "位置情報") {
    return {
      type: "location",
      title: "九州工業大学",
      address: "〒804-8550 福岡県北九州市戸畑区仙水町１−１",
      latitude: 33.894936000000001,
      longitude: 130.83838929999999
    };
  } else if (input == "ボタン") {
    return {
      type: "template",
      altText: "This is a buttons templete",
      template: {
        type: "buttons",
        text: "じゃんけんしよう！",
        actions: [
          {
            type: "message",
            label: "グー",
            text: "グー"
          }, {
            type: "message",
            label: "チョキ",
            text: "チョキ"
          }, {
            type: "message",
            label: "パー",
            text: "パー"
          }
        ]
      }
    };
  } else if (!(userHandNum == -1)) {
    const messages = [];
    const botHandNum = Math.floor(hands.length * Math.random());
    const botHand = hands[botHandNum];
    messages.push(textMessage(botHand));
    let judgeText = "";
    const judge = (userHandNum - botHandNum + 3) % 3; //じゃんけんの判定
    if (judge == 0) {                           //あいこ
      judgeText = `aiko`;
    } else if (judge == 1) {                   //botの勝ち
      judgeText = `わいの勝ちや！`;
    } else if (judge == 2) {                   //userの勝ち
      judgeText = `負けた(;_;)`;
    }
    messages.push(textMessage(judgeText));

    return messages;
  } else if (input == '天気') {
    getNodeVer(profile.userId);
  } else {
    return {
      type: "text",
      text: message
    };  
  }
}

const server = express();

server.use("/images", express.static(path.join(__dirname, "images")));

server.post("/webhook", line.middleware(lineConfig), (req, res) => {

  // LINEのサーバーに200を返す
  res.sendStatus(200);

  for (const event of req.body.events) {
    lineClient.getProfile(event.source.userId)
    .then((profile) => {
      const message = createReplyMessage(event.message.text, profile);
      lineClient.replyMessage(event.replyToken, message);
    });
  }
});

const getNodeVer = async (userId) => {
  const res = await axios.get('http://weather.livedoor.com/forecast/webservice/json/v1?city=400040');
  const item = res.data;

  await lineClient.pushMessage(userId, {
      type: 'text',
      text: item.description.text,
  });
}

server.listen(process.env.PORT || 8080);
