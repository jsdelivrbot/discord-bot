const Twitter = require('twitter');
const { RichEmbed } = require('discord.js');
const Util = require('../util/Util');

class Tweeter extends Twitter {
    constructor(bot, key) {
        super(key);

        this.bot = bot;

        this._verifyCredentials()
            .then(response => {
                this.bot.log(response);
                this.bot.emit('tweeterReady');
            })
            .catch(err => this.bot.log(`Tweeter failed to log in\n${err}`));
    }

    _verifyCredentials() {
        return new Promise((resolve, reject) => {
            this.get('account/verify_credentials', { skip_status: true })
                .then(data => resolve(`Tweeter logged in as @${data.screen_name}`))
                .catch(reject);
        });
    }

    _processData(data) {
        var tweet = {
            is_retweet: data.retweeted_status ? true : false,
            is_quote: data.is_quote_status,
            author: `${data.user.name}${data.user.verified ? ' ✅' : ''}`,
            author_url: `https://twitter.com/${data.user.screen_name}`,
            username: data.user.screen_name,
            tweet_url: `https://twitter.com/${data.user.screen_name}/status/${data.id_str}`,
            avatar_url: data.user.profile_image_url_https,
            text: data.truncated ? data.extended_tweet.full_text : data.text,
            date_created: data.created_at,
            media_pic_url: data.entities.media && data.entities.media[0].media_url_https,
            sub_tweet: null
        };

        if (tweet.is_retweet || tweet.is_quote) {
            const sub_tweet = data.retweeted_status || data.quoted_status;

            tweet.sub_tweet = {
                author: `${sub_tweet.user.name}${sub_tweet.user.verified ? ' ✅' : ''}`,
                author_url: `https://twitter.com/${sub_tweet.user.screen_name}`,
                username: sub_tweet.user.screen_name,
                tweet_url: `https://twitter.com/${sub_tweet.user.screen_name}/status/${sub_tweet.id_str}`,
                avatar_url: sub_tweet.user.profile_image_url_https,
                text: sub_tweet.truncated ? sub_tweet.extended_tweet.full_text : sub_tweet.text,
                date_created: sub_tweet.created_at,
                media_pic_url: sub_tweet.entities.media && sub_tweet.entities.media[0].media_url_https
            };
        }
        return tweet;
    }

    streamTweets({ to:channel = this.bot.channels.find('type', 'text'), follow, track, locations } = {}) {
        const handleData = data => {
            if ( follow && !(new RegExp(data.user.id).test(follow)) ) return; // make a table of follow and compare

            const tweet = this._processData(data);
            var embed = new RichEmbed()
                .setColor(0xADD8E6)
                .setFooter('Twatter', 'http://i.imgur.com/mWLfOX7.png')
                .setTimestamp(new Date(tweet.date_created).toISOString()) // think about making this dependent on tweet or sub_tweet
                .setThumbnail('http://i.imgur.com/NTaqa5U.png');
            var message = '\n\n';

            if (tweet.is_retweet || tweet.is_quote) {
                embed.setAuthor(`${tweet.sub_tweet.author} · @${tweet.sub_tweet.username}`, tweet.sub_tweet.avatar_url, tweet.sub_tweet.tweet_url)
                    .setDescription(tweet.sub_tweet.text)
                    .setThumbnail(tweet.avatar_url)
                    .setURL(tweet.sub_tweet.tweet_url);

                if (tweet.sub_tweet.media_pic_url) {
                    try {
                        embed.setImage(tweet.sub_tweet.media_pic_url);
                    } catch(err) {
                        this.bot.log(`TweeterError: setImage failed with ${tweet.sub_tweet.media_pic_url}`);
                    }
                }

                message = `:repeat: **${tweet.author}** Retweeted${ tweet.is_quote ? `\n\n${tweet.text}\n` : `\n\n` }`;
            } else {
                embed.setAuthor(`${tweet.author} · @${tweet.username}`, tweet.avatar_url, tweet.tweet_url)
                    .setDescription(tweet.text)
                    .setURL(tweet.tweet_url);
                if (tweet.media_pic_url) {
                    try {
                        embed.setImage(tweet.media_pic_url);
                    } catch(err) {
                        this.bot.log(`TweeterError: setImage failed with ${tweet.media_pic_url}`);
                    }
                }
            }

            this.bot.send({ message, embed, to: channel });
        };

        // handle stalls and rate limting pls
        this.stream('statuses/filter', { follow, track, locations }, // events: response, error, data, end, ping
            stream => {
                stream.on('data', handleData);
                stream.on('error', err => this.bot.log(`TweeterError: ${err}`));
                stream.on('end', res => this.bot.log(`Stream ended with status code ${res.statusCode}: ${res.statusMessage}`));
                // stream.on('ping', () => console.log('ping'));
            });
    }
}

module.exports = Tweeter;
