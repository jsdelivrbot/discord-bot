'use strict';
const BotUtil = require('../util/Util');
const RichEmbed = require('discord.js').RichEmbed;

const API_URL_STRAIN = `https://www.cannabisreports.com/api/v1.0/strains?page=${ BotUtil.getRandomNum() }&sort=name`;
const API_URL_EDIBLE = `https://www.cannabisreports.com/api/v1.0/edibles?page=${ BotUtil.getRandomNum() }&sort=name`;

const strain = {
    API_URL_STRAIN: `https://www.cannabisreports.com/api/v1.0/strains?page=${ BotUtil.getRandomNum() }&sort=name`,
    embed: {
        color: 0x00FF00,
        author: {
            name: 'Strain of the Night', pic: 'http://www.animated-gifs.eu/category_flora/flora-cannabis/0006.gif'
        },
        title: 1
    }
};

class Daily {
    constructor(bot) {
        this.bot = bot;

        BotUtil.ajax({ method: 'GET', url: API_URL_STRAIN })
            .then(this.initStrain)
            .catch(console.error);

        BotUtil.ajax({ method: 'GET', url: API_URL_EDIBLE })
                .then(this.initEdible)
                .catch(console.error);

    }

    initStrain(result) {
        result = JSON.parse(result);
        const strain = BotUtil.getRandomItem(result.data);
        var lineages = '';

        for (const lineage in strain.lineage) {
            lineages += `${lineage} :flag_${strain.lineage[lineage].toLowerCase()}:  `;
        }

        this.sotn = strain.name;
        this.embed = new RichEmbed()
            .setColor(0x00FF00)
            .setAuthor('Strain of the Night', 'http://www.animated-gifs.eu/category_flora/flora-cannabis/0006.gif')
            .setTitle(strain.name)
            .setDescription(`Cannabis strain from `
                + `${strain.seedCompany.name.startsWith('Unknown') ? 'an *Unknown Breeder*' : strain.seedCompany.name}`)
            .setURL(strain.url)
            .addField( 'Lineage(s)', lineages || '¯\\_(ツ)_/¯' )
            .setImage(strain.image.endsWith('no_image.png') ? 'http://i.imgur.com/2pIHY2b.jpg' : strain.image)
            .setThumbnail('http://www.animated-gifs.eu/category_flora/flora-cannabis/0006.gif')
            .setFooter(strain.seedCompany.name, 'http://www.animated-gifs.eu/category_flora/flora-cannabis/0006.gif')
            .setTimestamp(strain.createdAt.datetime);
    }

    initEdible(result) {
        result = JSON.parse(result);
        const edible = BotUtil.getRandomItem(result.data);
        var lineages = '';

        for (const lineage in edible.lineage) {
            lineages += `${lineage} :flag_${edible.lineage[lineage].toLowerCase()}:  `;
        }

        this.sotn = edible.name;
        this.embed = new RichEmbed()
            .setColor(0x00FF00)
            .setAuthor('edible of the Night', 'http://www.animated-gifs.eu/category_flora/flora-cannabis/0006.gif')
            .setTitle(edible.name)
            .setDescription(`Cannabis edible from `
                + `${edible.seedCompany.name.startsWith('Unknown') ? 'an *Unknown Breeder*' : edible.seedCompany.name}`)
            .setURL(edible.url)
            .addField( 'Lineage(s)', lineages || '¯\\_(ツ)_/¯' )
            .setImage(edible.image.endsWith('no_image.png') ? 'http://i.imgur.com/2pIHY2b.jpg' : edible.image)
            .setThumbnail('http://www.animated-gifs.eu/category_flora/flora-cannabis/0006.gif')
            .setFooter(edible.seedCompany.name, 'http://www.animated-gifs.eu/category_flora/flora-cannabis/0006.gif')
            .setTimestamp(edible.createdAt.datetime);
    }
}

exports.sotn = function () {
    if (!this.strain) {

    } else {
        
    }
};
