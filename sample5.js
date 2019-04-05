const path = require("path");
const express = require("express");
const line = require("@line/bot-sdk");

const lineConfig = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET
};
const lineClient = new line.Client(lineConfig);

function createReplyMessage(input) {
  const hands = ["グー", "チョキ", "パー"];
  const messages = [];
  let text = "";
 
  function message(str) {
    return {
      type: "text",
      text: str
    }
  }

  if (hands.indexOf(input) === -1) {
    text = "グー・チョキ・パーのどれかを入力してね";
    messages.push(message(text));
  } else {
    let user_hand = hands.indexOf(input);
    let cpu_hand = Math.floor(hands.length * Math.random());
    text = hands[cpu_hand];
    messages.push(message(text));
    let judge_text = "";
    let judge = (user_hand - cpu_hand + 3) % 3; //じゃんけんの判定
    if (judge === 0){                           //あいこ
      judge_text = `aiko`;
    } else if (judge === 1) {                   //botの勝ち
      judge_text = `わいの勝ちや！`;
    } else if (judge === 2) {                   //userの勝ち
      judge_text = `負けた(;_;)`;
    }
    text = judge_text;
    messages.push(message(text));
  }
  
  return messages;
}

const server = express();

server.use("/images", express.static(path.join(__dirname, "images")));

server.post("/webhook", line.middleware(lineConfig), (req, res) => {
  // LINEのサーバーに200を返す
  res.sendStatus(200);

  for (const event of req.body.events) {
    if (event.type === "message" && event.message.type === "text") {
      const message = createReplyMessage(event.message.text);
      lineClient.replyMessage(event.replyToken, message);
    }
  }
});

server.listen(process.env.PORT || 8080);
