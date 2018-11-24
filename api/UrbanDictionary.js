const Util = require('../src/util/Util');

class UrbanDictionary {
    constructor() {
        throw new Error(`This class cannot be instantiated`);
    }

    /**
     * @typedef {Object} UrbanInfo
     * @property {UrbanEntry} entry an entry that contains information about the query
     * @property {Array<String>} tags the tags associated with the query
     * @property {Array<String>} sounds the urls to any sounds associated with the query
     * @property {String} result_type whether the query resulted in an exact match or relevant match
     */

    /**
     * @typedef {Object} UrbanEntry
     * @property {String} word the search query
     * @property {String} definition the definition text for the query
     * @property {String} example the example text for the query
     * @property {String} permalink the tags associated with the query
     * @property {Number} thumbs_up number of thumbs up votes
     * @property {Number} thumbs_down number of thumbs down votes
     * @property {String} author the author of the entry
     * @property {Number} defid the unique id that correlates to the query
     */

    /**
     * Searches urbandictionary with the specified search query
     * @param {String} query the search query to lookup in urbandictionary
     * @param {Object} options the options used to provide results
     * @param {Boolean} [options.random] whether or not a random entry should be obtained.
     * @param {Number} [options.maxEntries=0] (maybe implement some day?) the max number of entries that should be obtained. Defaults to 0, which obtains all entries

     * @return {Promise<UrbanInfo>} the results of the search query
     */
    static search(query, { maxEntries = 0, random = false } = {}) {
        return new Promise((resolve, reject) => {
            Util.request({
                method: 'GET',
                url: `https://api.urbandictionary.com/v0/define?term=${query}`
            }).then(data => {
                const { list } = JSON.parse(data);
                const entry = list.length === 0 ? null
                    : random ? Util.getRandomItem(list) 
                    : list[0];

                resolve(entry);
            })
            .catch(reject); 
        })
    }
}

module.exports = UrbanDictionary;