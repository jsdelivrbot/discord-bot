'use strict';
const Util = require('../../util/Util');
const request = require('request');
const Constants = require('../../util/Constants');
const rtd = require('../../extensions/rtd');
const { RichEmbed } = require('discord.js');
const util = require('util');

exports.commands = {
    'allahsux': {
        usage: 'lol really?',
        desc: 'Bow down to almighty allah',
        minArgs: 0,
        exec: ({ bot, message, promise, args }) => {
            bot.send({ message: `Fuck you ${message.author}`, to: message.channel });
            promise.resolve();
        }
    },
    'sotn': {
        usage: 'lol really',
        desc: 'display strain of the night',
        minArgs: 0,
        exec: ({ bot, message, promise, args }) => {
            if (!this.strain) {
                const initStrain = result => {
                    result = JSON.parse(result);
                    const strain = Util.getRandomItem(result.data);
                    var lineages = '';

                    for (const lineage in strain.lineage) {
                        lineages += `${lineage} :flag_${strain.lineage[lineage].toLowerCase()}:  `;
                    }

                    this.strain = strain.name;
                    this.embed = new RichEmbed()
                        .setColor(0x00FF00)
                        .setAuthor('Strain of the night', 'http://www.animated-gifs.eu/category_flora/flora-cannabis/0006.gif')
                        .setTitle(strain.name)
                        .setDescription(`Cannabis strain from `
                            + `${strain.seedCompany.name.startsWith('Unknown') ? 'an *Unknown Breeder*' : strain.seedCompany.name}`)
                        .setURL(strain.url)
                        .addField( 'Lineage(s)', lineages || '¯\\_(ツ)_/¯' )
                        .setImage(strain.image.endsWith('no_image.png') ? 'http://i.imgur.com/2pIHY2b.jpg' : strain.image)
                        .setThumbnail('http://www.animated-gifs.eu/category_flora/flora-cannabis/0006.gif')
                        .setFooter(strain.seedCompany.name, 'http://www.animated-gifs.eu/category_flora/flora-cannabis/0006.gif')
                        .setTimestamp(strain.createdAt.datetime);

                    bot.send({ message: '<:dank:343246447480930304>', embed: this.embed, to: message.channel });
                    promise.resolve();
                };

                Util.request({ method: 'GET', url: `${ Constants.API_URL_DANK }?page=${ Util.getRandomNum() }&sort=name` })
                    .then(initStrain)
                    .catch(console.error);
            } else {
                bot.send({ message: `Strain of the night: **${this.strain}**\n\n`, embed: this.embed });
            }
        }
    },
    'dotn': {
        usage: 'lol really',
        desc: 'display drink of the night',
        minArgs: 0,
        exec: ({ bot, message, promise, args }) => {
            this.drink = this.drink || Util.getRandomItem(Constants.MSG_DRINKS);
            bot.send({ message: `Drink of the night: ${this.drink}`, to: message.channel });
            promise.resolve();
        }
    },
    'rtd': {
        usage: 'lol really',
        desc: 'rolls the dice and displays a nice message (will do other troll shit in the future :wink:)',
        minArgs: 0,
        exec: ({ bot, message, promise, args }) => {
            rtd(bot); // send all those args
            promise.resolve();
        }
    }
};