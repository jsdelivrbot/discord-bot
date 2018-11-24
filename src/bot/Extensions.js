const fs = require('fs');
const config = JSON.parse(fs.readFileSync('../../config.json'));

class Extensions {
    /**
    * idea: create a json file with extension details like dir path,
    */
    init(bot) {
        // consider figuring out if extension is class or function
        for (const extension of config.extensions) {
            bot.extensions[extension] = new require(`../../${extension.}`);
        }
    }

    constructor() {
        fs.readdir('../extensions/', (err, result) => {
            if (err) {
                console.error(`Warning: could not find the extensions directory. Extensions will be unavailable`);
            }
            result.forEach(file => {
                console.log(file);
            });
        });
    }
}

module.exports = Extensions;
