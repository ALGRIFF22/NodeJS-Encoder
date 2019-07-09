const { WebClient } = require('@slack/web-api');
const colorBetween = require('color-between');

// An access token (from your Slack app or custom integration - xoxp, xoxb)
const apiToken = 'xoxb-6147421574-611161462931-P43vLJT9TRDxRgK9j2S5dT6B';

const web = new WebClient(apiToken);

const timestamps = [];


// This argument can be a channel ID, a DM ID, a MPDM ID, or a group ID
const conversationId = 'CJVE3KS3A';
//'GJKC0SXL4'
var i = 0;

module.exports = {
    startMessage: function (fileName, resolution, text, color){
      startMessage(fileName, resolution, text, color)
      .catch(console.error);
    },
    updateMessage: function(percent, num, fileName, resolution){
      updateMessage(percent, num, fileName, resolution)
      .catch(console.error);
    },
    finishedMessage: function(fileName, resolution, text, color, num){
      finishedMessage(fileName, resolution, text, color, num)
      .catch(console.error);
    },
    settingsMessage: function(link){
      settingsMessage(link)
      .catch(console.error);
    },
    errorMessage: function(fileName, resolution, text, color, num){
      errorMessage(fileName, resolution, text, color, num)
      .catch(console.error);
    }
  };

async function startMessage (fileName, resolution, text, color) {
  
  const s = await web.chat.postMessage({ 
    channel: conversationId,
    as_user: true,
    attachments:[{
      title: fileName + '_' + resolution,
      pretext: "Encoding...",
      color: color,
      text: text,
      mrkdwn_in: [
        "text",
        "pretext"
      ]
    }]
  });
  timestamps.push(s.ts);
};
  
async function updateMessage(percent, num, fileName, resolution) {
  p = percent / 100;
  const color = colorBetween('#ffcc00', '#00d80e', p, 'hex');
  // Use the `chat.postMessage` method to send a message from this app
  const u = await web.chat.update({
  channel: conversationId,
  as_user: true,
  ts: timestamps[num],
  attachments:[{
    title: fileName + '_' + resolution,
    pretext: "Encoding...",
    color: color,
    text: percent + '%',
    mrkdwn_in: [
      "text",
      "pretext"
    ]
  }]
});
};

async function finishedMessage(fileName, resolution, text, color, num){
  const f = await web.chat.update({ 
    channel: conversationId,
    as_user: true,
    ts: timestamps[num],
    attachments:[{
      title: fileName + '_' + resolution,
      pretext: "Encoding...",
      color: color,
      text: text,
      mrkdwn_in: [
        "text",
        "pretext"
      ]
    }]
  });

  i = i + 1;
  if(i == timestamps.length){
    timestamps.length = 0;
    i= 0;
  }
}
async function settingsMessage(link){
  const f = await web.chat.postMessage({ 
    channel: conversationId,
    as_user: true,
    attachments:[{
      pretext: "Change encoding settings here: ",
      title: "Encoding Settings",
      title_link: link,
      text: 'click the link above to change the encoding settings',
      color: '#f442f4',
      mrkdwn_in: [
        "text",
        "pretext"
      ]
    }]
  });
}
async function errorMessage(fileName, resolution, text, color, num){
  const e = await web.chat.update({ 
    channel: conversationId,
    as_user: true,
    ts: timestamps[num],
    attachments:[{
      pretext: "There has been an error...",
      title: "ERROR! " + fileName + '_' + resolution,
      title_link: link,
      text: text,
      color: color,
      mrkdwn_in: [
        "text",
        "pretext"
      ]
    }]
  });
}
async function deleteMessage(num){
  const dlt = await web.chat.delete({
    channel: conversationId,
    as_user: true,
    ts: timestamps[num],
  });
  return dlt;
};