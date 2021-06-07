const createStorageInteraction = function () {
  const storage = chrome.storage.local;

  const USER_VOCAB = 'user_vocab';
  // handle errors [chrome.runtime.lastError is where errors are set]
  return {
    // Generic helpers

    async set(key, value, cb = () => {}) {
      return new Promise((resolve) => {
        storage.set({ [key]: value }, () => {
          cb();
        });
      });
    },
    async get(key, cb = () => {}) {
      return new Promise((resolve) => {
        storage.get(key, (items) => {
          resolve(items);
          cb();
        });
      });
    },
    async remove(key) {
      return new Promise((resolve) => {
        storage.remove(key, () => {});
      });
    },

    clear() {
      storage.clear();
    },

    // User text saving
    //bad name? actually whole object entry (text, context, lang etc)

    getTextObject: async function (text, lang) {
      let item = await this.get({ [USER_VOCAB]: {} });
      let vocab = item[USER_VOCAB];
      if (!vocab[lang]) {
        return 'no text';
      }
      let exists = vocab[lang].hasOwnProperty(text);
      if (!exists) {
        return 'no text';
      }
      return vocab[text];
    },

    setTextObject: async function (object, cb = () => {}) {
      let lang = object.lang;
      let item = await this.get({ [USER_VOCAB]: {} });
      let vocab = item[USER_VOCAB];
      if (!(lang in vocab)) {
        vocab[lang] = {};
      }

      // don't overwrite if word already exists:
      // let exists = vocab[lang].hasOwnProperty(object.text);
      // if (!exists) {
      //   vocab[lang][object.text] = object;
      //   this.set(USER_VOCAB, vocab);
      // }

      // do overwrite:
      vocab[lang][object.text] = object;

      // filter out any empty language categories
      vocab = this._cleanEmptyLanguages(vocab);
      //save
      this.set(USER_VOCAB, vocab, cb);
      return vocab;
    },

    removeTextObject: async function (object, cb) {
      let lang = object.lang;
      let item = await this.get({ [USER_VOCAB]: {} });
      let vocab = item[USER_VOCAB];

      let exists = vocab[lang].hasOwnProperty(object.text);
      if (!exists) {

        return;
      }
      delete vocab[lang][object.text];

      vocab = this._cleanEmptyLanguages(vocab);

      this.set(USER_VOCAB, vocab, cb);
    },
    editTextObject: async function (object, newObject, cb) {
      this.removeTextObject(object, () => {
        this.setTextObject(newObject, cb);
      });
    },

    getUserWords: async function () {
      let item = await this.get({ [USER_VOCAB]: {} });
      return item[USER_VOCAB];
    },

    _cleanEmptyLanguages: function (vocab) {
      return Object.fromEntries(
        Object.entries(vocab).filter(
          ([key, val]) => Object.keys(val).length !== 0
        )
      );
    },
  };
};

export default createStorageInteraction;
