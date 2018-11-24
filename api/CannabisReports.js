const Util = require('../src/util/Util');

const API_URL = {
    strains: 'https://www.cannabisreports.com/api/v1.0/strains',
    extracts: 'https://www.cannabisreports.com/api/v1.0/extracts',
    edibles: 'https://www.cannabisreports.com/api/v1.0/edibles'
};

class CannabisReports {
    constructor() {
        throw new Error(`This class cannot be instantiated`);
    }

    /**
     * @typedef {Object} StrainInfo
     * @property {String} name the name of the cannabis strain
     * @property {URL} url a link to the strain listing on the Cannabis Reports website
     * @property {URL} image a link to the full size image for this strain on Cannabis Reports
     * @property {String} seedCompanyName the name of the seed company for the strain
     * @property {Array<String>} geneticNames a list of any genetic names associated with the strain
     * @property {Object} lineage Countries of origin for the genetics for the strain. Object keys are the country name and the values are the two character country codes
     * @property {Object} reviews up to you if you wanna do this
     * @property {Date} createdAt the date the strain was added to Cannabis Reports
     */

    /**
     * Searches urbandictionary with the specified search query
     * @param {String} query the search query to lookup in urbandictionary
     * @param {Object} options the options used to provide results
     * @param {Boolean} [options.random] whether or not a random entry should be obtained.
     * @param {Number} [options.maxEntries=0] (maybe implement some day?) the max number of entries that should be obtained. Defaults to 0, which obtains all entries

     * @return {Promise<StrainInfo>} the results of the search query
     */
    static getProduct(product, { maxResults = 1, random = false } = {}) {
        return new Promise((resolve, reject) => {
            if (!API_URL[product]) {
                reject(new Error(`${product} is not a valid cannabis product. `));
            } else {
                Util.request({
                    method: 'GET',
                    url: `${ API_URL[product] }?page=${ Util.getRandomNum() }`
                }).then(CannabisReports.parse)
                .then(resolve)
                .catch(reject);
            }
        });
    }

    static parse(data) {
        const result = JSON.parse(data);
        const entry = Util.getRandomItem(result.data);

        return entry;
    }
}

module.exports = CannabisReports;