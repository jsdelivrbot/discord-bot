
/* eslint-disable no-useless-escape */

const Constants = require('../src/util/Constants');
const Util = require('../src/util/Util');
const { defaultResponseToKeywords:keyword, maxRepeatedResponse:max } = require(`${process.env.PWD}/config.json`);

exports.keywords = {
    '\\ballah\\b': (message, bot) => message.reply(Util.getRandomItem(Constants.MSG_ALLAH)),
    '\\bfp\\b': (message, bot) => message.reply(Util.getRandomItem(Constants.MSG_FP)),
    '\\bsc\\b': (message, bot) => message.reply(Util.getRandomItem(Constants.MSG_SC)),
    '\\bincoming\\b': (message, bot) => message.reply(`Dude shut the fuck up`),
    '\\btrump\\b': (message, bot) => {
        message.react('332283392341049344');
        message.reply(`${Util.getRandomItem(Constants.MSG_TRUMP_SHIT)}`);
    },
    '\\bnazi\\b': (message, bot) => bot.send({ message: 'seeg fucking heil', to: message.channel }),
    '\\brocket\\b': (message, bot) => bot.send({ message: 'join dee best rocket league clan featuring j0n_negroman ^-^ on https://exhentai.org', to: message.channel }),
    '\\brokit\\b': (message, bot) => bot.send({ message: 'join dee best rokit leeg clan featuring j0n_niggerman ^-^ on https://beeg.com', to: message.channel }),
    '\\bseeg\\b': (message, bot) => bot.send({ message: 'seeg fucking heil', to: message.channel }),
    '\\ballahuakbar\\b': (message, bot) => bot.send({ message: 'Bow down to almighty ALLAH', to: message.channel }),
    '\\bfurredi\\b': (message, bot) => {
        message.react('😡');
        bot.send({ message: 'waHhhHhH my thumb got fukt by ptars sig sour!!! ban all guns!!!', to: message.channel })
    },
    '\\bgg\\b': (message, bot) => bot.send({ message: 'gg ezpz', to: message.channel }),
    '\\bgay\\b': (message, bot) => {
        message.react('😡');
        bot.send({ message: Util.repeatStr(keyword, Util.getRandomNum(0, max)), to: message.channel });
    },
    '\\bfag\\b': (message, bot) => {
        message.react('😡');
        bot.send({ message: Util.repeatStr(keyword, Util.getRandomNum(0, max)), to: message.channel });
    },
    '\\bqueer\\b': (message, bot) => {
        message.react('😡');
        bot.send({ message: Util.repeatStr(keyword, Util.getRandomNum(0, max)), to: message.channel });
    },
    '\\bchink\\b': (message, bot) => {
        message.react('😡');
        bot.send({ message: Util.repeatStr(keyword, Util.getRandomNum(0, max)), to: message.channel });
    },
    'n[1i]g': (message, bot) => bot.send({ message: 'dats raycist', to: message.channel }),
    '[0o]p': (message, bot) => bot.send({ message: 'op', to: message.channel }),
    'alb': (message, bot) => bot.send({ message: 'albae did nothing wrong you whore', to: message.channel }),
    'whit': (message, bot) => {
        message.react('😡');
        bot.send({ message: 'no whiteys allowed', to: message.channel });
    },
    '\\bbl[@a](?:k)?(?:ck)?\\b': (message, bot) => {
        message.react('😡');
        bot.send({ message: 'no darkies allowed', to: message.channel });
    },
    '[a@]ut[1i]': (message, bot) => {
        message.react('😡');
        bot.send({ message: Util.repeatStr(keyword, Util.getRandomNum(0, max)), to: message.channel });
    },
    'win(?:bl)?(?:d)?[o0]ws': (message, bot) => {
        message.react('😡');
        bot.send({ message: 'fuck shitty ass winblows', to: message.channel });
    }
};