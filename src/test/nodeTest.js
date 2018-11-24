//require('dotenv').config();

const Util = require('../util/Util');
const Constants = require('../util/Constants');
const Youtube = require('../../api/Youtube');
const {Collection, RichEmbed} = require('discord.js');

const { Readable } = require('stream');
const ytdl = require('ytdl-core');
const { EventEmitter } = require('events')
const UD = require('../../api/UrbanDictionary');

// var request = require('request');
// var cookieJar = request.jar();

// const yt = new Youtube(process.env.YOUTUBE_KEY);
const now = require('performance-now');
const d = now();

// const emit = new EventEmitter();
// var set = false;
// var i = 0;

// emit.on('event', () => console.log(`${++i}: ${i}`));

// function test(a) {
//     if (!set) {
//         emit.on('event', () => console.log(`${++i}: ${a}`));
//         set = true;
//     }
//     console.log(`${++i}: ${a}`);
// }

// for (var j = 0; j < 10; ++j) {
//     test(j);
// }
// emit.emit('event');
// Util.request({
//     method: 'GET',
//     url: `https://api.r6stats.com/api/v1/players/CHIZZIX/seasons?platform=uplay?season_id=6`
// })
// .then(data => console.log(JSON.parse(data).seasons));
// var T = require('twitter');
// var t = new T ({
//     consumer_key: '6vTTt0SGdhl16CyXG3ld8Mj7B',
//     consumer_secret: 'R0lxverMWopFnaEiqlouAfetBjJGvbOpQkMyLf6mfUvaHchN87',
//     access_token_key: '45661613-ZRPy3TnbfaP2NXXkCGEs3KpzB5kitFJED1ThqR5PC',
//     access_token_secret: 'jYt16WQFy5u2xkdpqnLUiJ18rUAEEPL54kaCVUVZr18UD'
// });
// const users = '45661613,25073877';

// const handleData = data => {
//     // const tweet = processData(data);
//     if ( !(new RegExp(data.user.id).test(users)) ) return;

//     var message;

//     if (data.retweeted_status )
//         message = `RETWEET:\n${data.user.name} Retweeted\n\n${data.retweeted_status.user.name}: ${data.retweeted_status.text}\n\n`;
//     else if (data.quoted_status)
//         message = `QUOTED:\n${data.user.name} -- ${data.text} Retweeted\n\n${data.quoted_status.user.name}: ${data.quoted_status.text}\n\n`;
//     else {
//         message = `TWEET:\n${data.user.name}: ${data.truncated ? data.extended_tweet.full_text : data.text}\n\n`;
//     }

//     console.log(message);
// };

// t.get('account/verify_credentials', {skip_status: true})
//     .then(data => {
//         console.log(`Tweeter logged in as @${data.screen_name}`);
//     })
//     .catch(console.error);


// const stream = t.stream('statuses/filter', { follow: users, track: null, locations: null });

// stream.on('data', handleData); //TRUMP 25073877
// stream.on('error', err => console.error(`Error: ${err}`));
// stream.on('ping', () => console.log('ping'))
// stream.on('end', res => console.log(res))
// stream.on('response', console.log); // res


/**
 * --------
 */
console.log(now() - d);

/*
const reg = /[A-Z0-9]{8}/;
const url = 'http://localhost:8080/ServerAdmin/';

const get = {
    method: 'GET',
    url,
    jar: cookieJar
};
const post = {
    method: 'POST',
    url,
    form: {
        token: '',
        password_hash: `$sha1$${sha1('fuckclineashley')}`,
        username: 'ashley',
        password: 'fuckcline',
        remember: '-1'
    },
    jar: cookieJar
};

Util.ajax(get)
.then(data => {
    post.form.token = data.match(reg)[0];
    console.log(cookieJar.getCookieString(url));
    return Util.ajax(post);
})

.then(data => {
    console.log(data);
});
*/
/*
Util.ajax({
    method: 'POST',
    url: 'http://localhost:8080/ServerAdmin/',
    form: {
        token: '86A938C9',
        password_hash: `$sha1$${sha1('fuckclineashley')}`,
        username: 'ashley',
        password: 'fuckcline',
        remember: '-1'
    }
})
// $sha1$ + hex_sha1(password + username)
    .then(data=> {
        console.log(data);
    })
    .catch(console.error);
*/


/*
const urls = [
    {url: 'httP://youtube/oLLHF7_1za8', valid: false},
    {url: 'httpS://Youtu.be/oLLHF7_1za8', valid: true},
    {url: 'http://youtu.be/oLLHF7_1za8', valid: true},
    {url: 'https://youtube.com/oLLHF7_1za8', valid : true},
    {url: 'https://youtu.be/oLLHF7_1za', valid: true},
    {url: 'http://youtube.com/watch?v=oLLHF7_1za8', valid: true},
    {url: 'youtu.be/oLLHF7_1za8', valid: true},
    {url: 'youtube.com/oLLHF7_1za8', valid: true},
    {url: 'jfhdughjfkjr', valid: false},
    {url: 'httpwww.youtube.com', valid: false},
    {url: 'www.youtube.com', valid: true},
    {url: 'youtube.com', valid: true}
];

for (var chunk of urls) {
    console.log(Util.isValidUrl(chunk.url) === chunk.valid ? 'pass' : 'fail');
}
*/

