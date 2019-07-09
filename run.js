'use strict'

const fs = require('fs');
const path = require('path');
const sleepy = require('system-sleep');
const ffmpeg = require('fluent-ffmpeg');
const specs = require('./specifications');
const slack =require('./slackControl');

//#region Variables
//the folder to watch for changes
//var input = './input/';
//const input;
//the output folder to place encoded videos
//var output = './output/';
const output = specs.output;
// the fps of the video
//var fps = 25;
const fps = specs.fps;
//bitrate is in kilobytes a second (KB/s) : 1mb = 1000kb etc ...
//var bitRate = 1000;
const videoBitRate = specs.bitRate;
//video foramt - https://www.ffmpeg.org/general.html 
//var videoFormat = 'mp4';
const videoFormat = specs.videoFormat;
//sets all the different resolutions
//var resolutions = ['1920x1080', '640x360', '640x480'];
const resolutions = specs.resolutions;
//sets video codec
/*const videoCodec;
//sets audioCodec
const audioCodec;
//sets audio bitrate
const audioBitRate;*/
//#endregion

module.exports = {
    recieveSlackInput : function(filePath){
        fileReady(filePath)
        .catch(console.error);
    }
}
async function fileReady(filePath){
    console.log(filePath);
    // this block will get the file size every 1/10 of a second
    var file1_Size;
    var interval1 = setInterval(function() {
        file1_Size = fs.statSync(filePath).size;
        console.log(file1_Size);
    }, 100,);
    //this block will get the file size every second
    var file2_Size;
    var interval2 = setInterval(function() {
        file2_Size = fs.statSync(filePath).size;
        console.log(file2_Size);
    }, 1500,);
    //this block will compare the two values
    var comp;
    var comparison = setInterval(function() {
        comp = file2_Size - file1_Size; // when the two values are the same as each other the file has finished writing
        if(comp == 0){
            clearInterval(interval1);
            clearInterval(interval2);
            clearInterval(comparison);
            sleepy(1000);
            setUp(filePath);
        }
    }, 1500,);
};
async function setUp(filePath){
    var fileExtension = path.extname(filePath);
    //var fileName = path.basename(filePath, fileExtension);
    var fileName = "190521_CLIENT_REVIEW";
    var newOutput = output + fileName + '/';
    var dirExists = false;
    //creates master folder
    if (!fs.existsSync(newOutput)){
        fs.mkdirSync(newOutput);
        dirExists = true;
    }
    else {
        dirExists = true;
    }
    console.log('filextension: ' + fileExtension + ' filename: ' + fileName + '' + newOutput);
    //checks if the file extension to match a video or audio file
    if(fileExtension == '.mov' || fileExtension == '.mp4' || fileExtension == '.m4a' || fileExtension == '.3gp' || fileExtension == '.3g2' || fileExtension == '.mj2'){
        if(dirExists == true){
            for(var i = 0; i < resolutions.length; i++){
                const num = i;
                //creates sub- folders
                var dir = newOutput + resolutions[i]+ '/';
                if (!fs.existsSync(dir)){
                    fs.mkdirSync(dir);
                    encodeVideo(fileName, filePath, dir, num)
                    .catch(console.error)
                }else{
                    encodeVideo(fileName, filePath, dir, num)
                    .catch(console.error)
                }
            }
        }
        else return;
    }
    //checks if the file extension doesn't match and will ignore it and wait until it does
    else if(fileExtension != '.mov' || fileExtension != '.mp4' || fileExtension != '.m4a' || fileExtension != '.3gp' || fileExtension != '.3g2' || fileExtension != '.mj2'){
        console.log('not video file');
        return null;
    }
};
async function encodeVideo(fileName, filePath, dir, num){
    console.log('start encoding');
    //var message = 'Encoding of ' + fileName + '_' + resolutions[num];
    slack.startMessage(fileName, resolutions[num], 'has Started!!', '#ffcc00');
    ffmpeg()
    .on('progress', function(progress) {
        var i = Math.round((progress.percent / 10) * 10);
        if(i%10 == 0){
            slack.updateMessage(i, num, fileName, resolutions[num]);
            console.log(i + '% done', fileName, resolutions[num])
        }
    })
    .on('error', function(err) {
        slack.errorMessage(fileName, resolutions[num], err.message, '#ff0000', num);
        //console.log('An error occurred: ' + err.message);
    })
    .on('end',function() {
        console.log('Processing finished !');
        slack.finishedMessage(fileName, resolutions[num], 'has Finished!', '#00d80e', num);
    })
    .input(filePath)
    .fps(fps)
    .videoBitrate(videoBitRate)
    .size(resolutions[num])
    .autopad()
    .output(dir + fileName + '_' + resolutions[num] + '.' + videoFormat)
    .run();
};