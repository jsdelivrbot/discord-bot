
/* eslint-disable no-useless-escape */

/*
    throw all the whole word matches into its own regex
    match based on results

    throw all the expression matches into its own regex
    create a table of individual regex stuff
    match based on source

    debug this
*/
const Constants = require('../../util/Constants');
const Util = require('../../util/Util');

exports.wholeWords = {
    '\ballah\b': message => message.reply(Util.getRandomItem(Constants.MSG_ALLAH)),
    '\bfp\b': message => message.reply(Util.getRandomItem(Constants.MSG_FP)),
    '\bsc\b': message => message.reply(Util.getRandomItem(Constants.MSG_SC)),
    '\bincoming\b': message => message.reply(`Dude shut the fuck up`),
    '\btrump\b': message => {
        message.react('332283392341049344');
        message.reply(`${Util.getRandomItem(Constants.MSG_TRUMP_SHIT)}`);
    },
    '\bnazi\b': message => message.reply(`Sieg heil!`),
    '\brocket\b': message => message.reply('join dee best rocket league clan featuring j0n_negroman ^-^ on https://exhentai.org'),
    '\brokit\b': message => message.reply('join dee best rokit leeg clan featuring j0n_niggerman ^-^ on https://beeg.com'),
    '\bseeg\b': message => message.reply('seeg heil'),
    '\ballahuakbar\b': message => message.reply('Praise be Allah!'),
    '\bfurredi\b': message => {
        message.react('😡');
        message.reply('waHhhHhH my thumb got fukt by daddyz sig sour!!! ban all guns!!!');
    },
    '\bgg\b': message => message.reply('gg wite power'),
    '\bgay\b': message => {
        message.react('😡');
        message.reply('Watch your language, SJW LGBTQIA+ mite git niggered ');
    },
    '\bfag\b': message => {
        message.react('😡');
        message.reply('Watch your language, faggit pride whores will not approve');
    },
    '\bqueer\b': message => {
        message.react('😡');
        message.reply('Watch your language, queer traps mite git queered out');
    },
    '\bchink\b': message => {
        message.react('😡');
        message.reply('Watch your language, chink op whores mite git chinked out')
    }

};

exports.partWords = {
    'n[1i]g': message => message.reply('dats raycist'),
    '[0o]p': message => message.reply('op'),
    'alb': message => message.reply('albae did nothing wrong you whore'),

    'whit': message => {
        message.react('😡');
        message.reply('no whiteys allowed');
    },
    '\\bbl[@a](?:k)?(?:ck)?\\b': message => {
        message.react('😡');
        message.reply('no darkies allowed');
    },

    '[a@]ut[1i]': message => {
        message.react('😡');
        message.reply('Watch your language, autcraft kiddies might git triggered');
    }
};
