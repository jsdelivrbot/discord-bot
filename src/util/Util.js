/*jshint esversion: 6 */
'use strict';
const requestNative = require('request');
const DiscordUtil = require('discord.js').Util;
const ytdlUtil = require('ytdl-core').util;

const URL_REG_EXP = /^(?:https?:\/\/)?(?:w{3}\.)?[^https?w][^\.]+\.[^\/]+\/?/i;

class Util extends DiscordUtil {
    constructor() {
        throw new Error(`The Util class cannot be instantiated!`);
    }
    // consider renaming to sanatize ashley
    static ashleyTheStripper(text) {
        return text.replace(/[\\\^|<>{}`'"*]/g, '');
    }

    static isUrl(url) {
        return URL_REG_EXP.test(url);
    }

    static isValidVideo(url) {
        return ytdlUtil.validateLink(url);
    }

    static getVideoID(url) {
        var videoID = ytdlUtil.getVideoID(url);

        return !(videoID instanceof Error) ? videoID : videoID.message;
    }

    static getRandomItem(items) {
        const keys = Object.keys(items);

        return items[ keys[Math.floor(Math.random() * keys.length)] ];
    }

    static getRandomNum(min = 0, max = 100) {
        return Math.floor(Math.random() * (max - min) + min);
    }

    static repeatStr(string, max = 2) {
        if (!string) {
            return '';
        }

        var result = '';

        for (var i = 0; i < max; ++i) {
            result += string;
        }
        
        return result;
    }

    /**
     * Truncates a string or array to a given max length along with some modifier options
     * @param {String|Array} item the string or array to be truncated
     * @param {Object} options the modifier options used to modify the string
     * @param {Number} [options.maxLength=1000] the max length that the string should be. This is not a guaranteed max length as it is dependent on the end character
     * @param {String} [options.joinString=', '] should an array be sent, the string to be used to join the elements of the array. ONLY use this option with an array param
     * @param {String} [options.endChar=' '] the ending character that determines where the string should terminate
     * @param {String} [options.prepend=''] the string that should be prepended to the truncated string
     * @param {String} [options.append=''] the string that should be appended to the truncated string
     * @return {String} a truncated string that represents the original string
     */
    static truncate(item, {maxLength = 1000, joinString = ', ', endChar = ' ', prepend = '', append = ''} = {}) {
        if (item.length > 0) {
            const result = Util.splitMessage(
                Array.isArray(item) ? item.join(joinString) : item,
                {maxLength, char: endChar, prepend, append}
            );
            return Array.isArray(result) ? result[0] : result;
        } else {
            return item;
        }
    }

    // consider switching to request-promise
    static request({ method = 'GET', url, form, jar } = {}) {
        const processRequest = (resolve, reject) => {
            requestNative({ method, url, form, jar }, (err, res, data) => {
                if (err || res.statusCode >= 300) {
                    reject( err || `RequestError: ${res.request.method} `
                        + `${res.request.uri.host.replace(/^www./, '') + res.request.uri.pathname} `
                        + `resulted in status code ${res.statusCode}: ${res.statusMessage}`);
                } else if (res.statusCode === 200) {
                    resolve(data);
                }
            });
        };
        return new Promise(processRequest);
    }
    // wonder if this would work on a day like 30th
    static getMillisecondsUntil(hour = 0, minute = 0, second = 0) {
        var now = new Date();
        var future = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() + (Date.parse(`${now.getMonth() + 1} ${now.getDate()} ${now.getFullYear()} ${hour}:${minute}:${second}`) < Date.now() ? 1 : 0),
            hour, minute, second
        );
        return future.getTime() - now.getTime();
    }
}
module.exports = Util;
