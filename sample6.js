const path = require("path");
const express = require("express");
const line = require("@line/bot-sdk");

const lineConfig = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET
};
const lineClient = new line.Client(lineConfig);

function createReplyMessage(input, name) {
  return {
    type: "text",
    text: `${name}さんが${input}と言いました`
  };
}

const server = express();

server.use("/images", express.static(path.join(__dirname, "images")));

server.post("/webhook", line.middleware(lineConfig), (req, res) => {
  // LINEのサーバーに200を返す
  res.sendStatus(200);

  for (const event of req.body.events) {
    if (event.type === "message" && event.message.type === "text") {
      lineClient.getProfile(event.source.userId)
      .then((profile) => {
        const message = createReplyMessage(event.message.text, profile.displayName);
        lineClient.replyMessage(event.replyToken, message);
      });
    }
  }
});

server.listen(process.env.PORT || 8080);
