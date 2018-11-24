const Command = require('../../src/bot/command/CommandPlus');
const CannabisReports = require('../../api/CannabisReports');
const Util = require('../../src/util/Util');
const { RichEmbed } = require('discord.js');

class Strain extends Command {
    constructor(bot, options) {
        super(bot, {
            name: 'sotn',
            cooldownTime: 1,
            minArgs: 0,
            hasMultipleArgs: false,
            usage: `!sotn [options]\n\n`
            + `Use !sotn by itself to display the strain of the night\n\n`
            + `Options Short / Long\n`
            + `\t-t -toggle     : Toggles random strains on or off. If on, a random strain is obtained everytime command is ran\n`
            + `Example:\n`
            + `\t!sotn`
            + `\t!sotn -t\t\t!sotn -toggle`,
            description: 'Displays strain of the night'
        })
        this.strain = null;
        this.toggle = false;
        
        this.getNewStrain();
    }

    /**
     * entry point for command
     * @param {ArgInfo} argInfo information about the arguments sent to this command
     * @param {Promise} promise resolve to signal successful execution of command, reject to signal command failure
     */
    run(argInfo, promise) {
        const toggle = argInfo.argv.includes('-t') || argInfo.argv.includes('-toggle');
        const send = message => this.bot.send({ message, to: argInfo.message.channel })

        if (toggle) {
            this.toggle = !this.toggle;
            this.bot.send({ message: `Random strains has been toggled ${this.toggle ? 'on' : 'off'}`, to: argInfo.message.channel });
        } else if (this.toggle) { // display a random strain
            this.getNewStrain()
                .then(send)
                .then(promise.resolve)
                .catch(promise.reject);
        } else { // display the strain saved in this.strain
            send(this.strain);
            promise.resolve();
        }
    }

    getNewStrain() {
        return CannabisReports.getProduct('strains')
            .then(this.createRichEmbed)
            .then(embed => {
                this.strain = embed;
                return embed;
            });
    }

    createRichEmbed(entry) {
        const { name, ucpc, link, url, image, seedCompany, genetics, lineage, reviews, createdAt } = entry;
        const embed = new RichEmbed();
        var lineages = '';

        for (const country in lineage) {
            lineages += `${country} :flag_${lineage[country].toLowerCase()}:  `;
        }

        embed.setColor(0x00FF00)
            .setAuthor('Strain of the Night', 'http://www.animated-gifs.eu/category_flora/flora-cannabis/0006.gif')
            .setTitle(name)
            .setDescription(`Cannabis strain from `
                + `${seedCompany.name.startsWith('Unknown') ? 'an *Unknown Breeder*' : seedCompany.name}`)
            .setURL(url)
            .addField( 'Lineage(s)', lineages || '¯\\_(ツ)_/¯' )
            .addField('Genetic(s)', genetics.names || '¯\\_(ツ)_/¯')
            .setImage(image.endsWith('no_image.png') ? 'http://i.imgur.com/2pIHY2b.jpg' : image)
            .setThumbnail('http://www.animated-gifs.eu/category_flora/flora-cannabis/0006.gif')
            .setFooter('CannabisReports', 'http://www.animated-gifs.eu/category_flora/flora-cannabis/0006.gif')
            .setTimestamp(createdAt.datetime);
        
        return embed;
    }
}

module.exports = Strain;

// const a = {
//     usage: 'lol really',
//     desc: 'display strain of the night',
//     minArgs: 0,
//     exec: ({ bot, message, promise, args }) => {
//         if (!this.strain) {
//             const initStrain = result => {
//                 result = JSON.parse(result);
//                 const strain = Util.getRandomItem(result.data);
//                 var lineages = '';

//                 for (const lineage in strain.lineage) {
//                     lineages += `${lineage} :flag_${strain.lineage[lineage].toLowerCase()}:  `;
//                 }

//                 this.strain = strain.name;
//                 this.embed = new RichEmbed()
//                     .setColor(0x00FF00)
//                     .setAuthor('Strain of the night', 'http://www.animated-gifs.eu/category_flora/flora-cannabis/0006.gif')
//                     .setTitle(strain.name)
//                     .setDescription(`Cannabis strain from `
//                         + `${strain.seedCompany.name.startsWith('Unknown') ? 'an *Unknown Breeder*' : strain.seedCompany.name}`)
//                     .setURL(strain.url)
//                     .addField( 'Lineage(s)', lineages || '¯\\_(ツ)_/¯' )
//                     .setImage(strain.image.endsWith('no_image.png') ? 'http://i.imgur.com/2pIHY2b.jpg' : strain.image)
//                     .setThumbnail('http://www.animated-gifs.eu/category_flora/flora-cannabis/0006.gif')
//                     .setFooter(strain.seedCompany.name, 'http://www.animated-gifs.eu/category_flora/flora-cannabis/0006.gif')
//                     .setTimestamp(strain.createdAt.datetime);

//                 bot.send({ message: '<:dank:343246447480930304>', embed: this.embed, to: message.channel });
//                 promise.resolve();
//             };

//             Util.request({ method: 'GET', url: `${ Constants.API_URL_DANK }?page=${ Util.getRandomNum() }&sort=name` })
//                 .then(initStrain)
//                 .catch(console.error);
//         } else {
//             bot.send({ message: `Strain of the night: **${this.strain}**\n\n`, embed: this.embed });
//         }
//     }
