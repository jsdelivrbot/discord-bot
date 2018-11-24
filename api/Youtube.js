const ytdl = require('ytdl-core');
const Util = require('../src/util/Util'); // consider packing your project into a module for npm

const API_URI_SEARCH = 'https://www.googleapis.com/youtube/v3/search';
const API_URI_VIDEOS = 'https://www.googleapis.com/youtube/v3/videos';
const URL_REG_EXP = /^(?:https?:\/\/)?(?:w{3}\.)?(?:youtu\.be\/|youtube\.com\/watch\?v=)[\w-]{11}$/i;
const ID_REG_EXP = /[\w-]{11}/;

// TODO: transform this whole thing into a bunch of subclasses for various operations listed in https://developers.google.com/youtube/v3/docs
class Youtube {
    constructor(key, bot) {
        this.bot = bot;
        this._key = key;

        this._verify(key);
    }

    /**
     * @typedef {Object} VideoInfo
     * @property {String} url the url of the video
     * @property {String} title the name of the video
     * @property {String} description the description of the video
     * @property {String} thumbnail the url to the video thumbnail image
     * @property {String} publishedAt the creation date and time of the video in ISO 8601 format
     * @property {Object} statistics the views, likes, dislikes and comment count the video has
     * @property {String} duration the time length of the video in ISO 8601 format
     * @property {Array<String>} tags a list of keyword tags associated with the video
     * @property {String} channelTitle the name of the channel that published the video
     * @property {String} channelUrl the url to the channel that published the video
     */

    _verify(key) {
        Util.request({
            method: 'GET',
            url: `${API_URI_VIDEOS}?part=snippet&id=LDxcfTm1QTc&key=${key}`
        })
        .then(response => {
            if (response.error) {
                this._error(response.error);
            } else {
                //this.bot.log('YoutubeAPI: logged in successfully');
            }
        })
        .catch(this._error);
    }

    _error(err) {
        if (typeof err === 'string') {
            throw new Error(`YoutubeAPI: ${err}`);
            // log bot
        }

        var message = `YouTubeAPI: Error code ${err.error.code}: ${err.error.message}\n\t`;

        for (const error of err.error.errors) {
            message += `${error.reason}: ${error.message}\n\t`;
        }

        throw new Error(message);
    }

    static isVideoUrl(url) {
        return URL_REG_EXP.test(url);
    }

    static createStream(url) {
        if (/^youtu\.be/.test(url)) {
            url = `https://${url}`;
        }

        const stream = ytdl(url, { filter : 'audioonly', quality: 'highestaudio' });

        // throw this into streammanager
        // stream.once('response', res => {
        //     this.bot.log(`${url} --- ${res.statusCode}: ${res.statusMessage}`);
        // })
        // .once('error', this.bot.log);

        return stream;
    }

    /**
     * Searches youtube for video info with the given search query
     * @param {String} query the query to search youtube for
     * @return {Promise<VideoInfo>} an object containing video info the query yielded from youtube
     */
    search(query, resources = 'snippet') { // TODO: create options object as second param, include options for type: video channel or playlist, maxVideos: 1
        // search:list operation used if user sends a non video link 
        const apiSearch = (resolve, reject) => {
            Util.request({
                method: 'GET',
                url: `${API_URI_SEARCH}?part=snippet&type=video&q=${query}&maxvideoInfos=1&key=${this._key}`, // inject options here
            })
            .then(data => {
                const response = JSON.parse(data);

                if (response.error) {
                    this._error(response.error);
                    reject(response.error);
                } else if (response.pageInfo.totalResults > 0 && response.items[0].id.kind === 'youtube#video') {
                    // first element, response.items[0] should always be a youtube video if type=video parameter is used
                    this.getVideoInfo(response.items[0].id.videoId, resources)
                        .then(resolve)
                        .catch(reject);
                } else {
                    resolve(null);
                }
            })
            .catch(reject);
        }

        if (!resources.includes('snippet')) {
            resources += ',snippet';
        }

        return new Promise((resolve, reject) => {
            if (this.constructor.isVideoUrl(query)) { 
                // get video id if user sends a youtube link to conserve api quota costs
                this.getVideoInfo(query.match(ID_REG_EXP)[0], resources)
                    .then(resolve)
                    .catch(reject)
            } else {
                apiSearch(resolve, reject);
            }
        });
    }

    getVideoInfo(id, resources = 'snippet') {
        return new Promise ((resolve, reject) => {
            Util.request({
                method: 'GET',
                url: `${API_URI_VIDEOS}?part=${resources}&id=${id}&key=${this._key}`, // inject options here
            })
            .then(data => {
                const response = JSON.parse(data);

                if (response.error) {
                    this._error(response.error);
                    reject(response.error);
                } else if (response.pageInfo.totalResults > 0 && response.items[0].kind === 'youtube#video') {
                    // first element, response.items[0] should always be a youtube video if type=video parameter is used
                    const item = response.items[0];

                    resolve({
                        url: `https://youtu.be/${item.id}`,
                        title: item.snippet.title,
                        description: item.snippet.description,
                        thumbnail: item.snippet.thumbnails.medium.url,
                        publishedAt: item.snippet.publishedAt,
                        statistics: resources.includes('statistics') ? item.statistics : undefined,
                        duration: resources.includes('contentDetails') ? item.contentDetails.duration : undefined,
                        tags: item.snippet.tags,
                        channelTitle: item.snippet.channelTitle,
                        channelUrl: `https://youtube.com/channel/${item.snippet.channelId}`,
                    });
                } else {
                    resolve(null);
                }
            })
            .catch(reject);
        });

        /** Operations 
         * 
         *  search:list - 100
         *  videos:list - 1
         */

        /** Resources
         * 
         *  contentDetails: 2 - duration property is in iso format 
         *      If the video is less than one minute, the duration is in the format PT#S
         *      If the video is at least one minute long and less than one hour long, the duration is in the format PT#M#S
         *      If the video is at least one hour long, the duration is in the format PT#H#M#S
         *      If the video is at least one day long, the letters P and T are separated, and the value's format is P#DT#H#M#S.
         *  fileDetails: 1
         *  id: 0
         *  liveStreamingDetails: 2
         *  localizations: 2
         *  player: 0
         *  processingDetails: 1
         *  recordingDetails: 2
         *  snippet: 2
         *  statistics: 2 - likes and dislikes and views
         *  status: 2
         *  suggestions: 1
         *  topicDetails: 2
         */
    }
}

module.exports = Youtube;
