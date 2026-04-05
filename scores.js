var ArcadeScores = (function () {
  var KEY_V1 = 'arcade_highscores_v1';
  var KEY_V2 = 'arcade_highscores_v2';

  var _regions = [
    { key: 'all',           label: 'All'           },
    { key: 'Europe',        label: 'Europe'        },
    { key: 'South America', label: 'South America' },
    { key: 'Africa',        label: 'Africa'        },
    { key: 'Asia',          label: 'Asia'          },
    { key: 'North America', label: 'North America' },
  ];
  var _langRegions = [
    { key: 'en_all',           label: 'EN · All'           },
    { key: 'en_Africa',        label: 'EN · Africa'        },
    { key: 'en_Asia',          label: 'EN · Asia'          },
    { key: 'en_Europe',        label: 'EN · Europe'        },
    { key: 'en_North America', label: 'EN · N. America'    },
    { key: 'en_South America', label: 'EN · S. America'    },
    { key: 'en_Oceania',       label: 'EN · Oceania'       },
    { key: 'de_all',           label: 'DE · All'           },
    { key: 'de_Africa',        label: 'DE · Africa'        },
    { key: 'de_Asia',          label: 'DE · Asia'          },
    { key: 'de_Europe',        label: 'DE · Europe'        },
    { key: 'de_North America', label: 'DE · N. America'    },
    { key: 'de_South America', label: 'DE · S. America'    },
    { key: 'de_Oceania',       label: 'DE · Oceania'       },
  ];
  var _langCats = [
    { key: 'en_animals',    label: 'EN · Animals'  },
    { key: 'en_countries',  label: 'EN · Countries'},
    { key: 'en_food',       label: 'EN · Food'     },
    { key: 'en_nature',     label: 'EN · Nature'   },
    { key: 'en_cities',     label: 'EN · Cities'   },
    { key: 'de_de_tiere',   label: 'DE · Tiere'    },
    { key: 'de_de_laender', label: 'DE · Länder'   },
    { key: 'de_de_essen',   label: 'DE · Essen'    },
    { key: 'de_de_natur',   label: 'DE · Natur'    },
    { key: 'de_de_staedte', label: 'DE · Städte'   },
  ];

  var CATEGORIES = [
    {
      name: 'Football', color: '#10b981',
      games: [
        { id: 'guess-the-player',        name: 'Guess the Player',  unit: 'correct' },
        { id: 'guess-the-footballer',    name: 'Guess Footballer',  unit: 'correct' },
        { id: 'guess-the-birth-country', name: 'Birth Country',     unit: 'correct' },
      ]
    },
    {
      name: 'Geography', color: '#6366f1',
      games: [
        { id: 'fun-with-flags',    name: 'Fun with Flags',    unit: 'correct' },
        { id: 'guess-the-capital', name: 'Guess the Capital', unit: 'correct' },
        { id: 'guess-the-river',   name: 'Guess the River',   unit: 'correct' },
      ]
    },
    {
      name: 'Words', color: '#a78bfa',
      games: [
        { id: 'word-hunt', name: 'Word Hunt', unit: 'found',
          levels: [
            { key: 'en_easy',   label: 'EN · Easy'   },
            { key: 'en_medium', label: 'EN · Medium'  },
            { key: 'en_hard',   label: 'EN · Hard'    },
            { key: 'de_easy',   label: 'DE · Easy'    },
            { key: 'de_medium', label: 'DE · Medium'  },
            { key: 'de_hard',   label: 'DE · Hard'    },
          ]
        },
        { id: 'scattergories', name: 'Scattergories', unit: '/ 9',
          levels: [
            { key: 'en', label: 'English' },
            { key: 'de', label: 'Deutsch' },
          ]
        },
        { id: 'word-chain',    name: 'Word Chain',    unit: 'words' },
        { id: 'hangman',       name: 'Hangman',       unit: 'wins'  },
        { id: 'anagram-blast', name: 'Anagram Blast', unit: 'words' },
        { id: 'missing-vowels',name: 'Missing Vowels',unit: 'words' },
        { id: 'speed-typing',  name: 'Speed Typing',  unit: 'WPM'   },
      ]
    },
    {
      name: 'Brain & Math', color: '#f59e0b',
      games: [
        { id: 'math-blitz', name: 'Math Blitz', unit: 'correct',
          levels: [
            { key: 'little',    label: 'Little Stars' },
            { key: 'junior',    label: 'Juniors'      },
            { key: 'champion',  label: 'Champions'    },
            { key: 'master',    label: 'Masters'      },
          ]
        },
        { id: 'tic-tac-toe',  name: 'Tic Tac Toe',  unit: 'wins'  },
        { id: 'puzzle-rush',  name: 'Puzzle Rush',   unit: 'stars' },
        { id: 'four-wins',    name: 'Four Wins',     unit: 'wins'  },
      ]
    },
  ];

  var GAMES = CATEGORIES.reduce(function(acc, cat) { return acc.concat(cat.games); }, []);

  // ── Storage (v2 supports per-level scores and optional time metadata) ─────────
  // Structure: { gameId: { levelKey: { score, time? } } }
  // Migration from v1 (flat { gameId: score }) wraps into { gameId: { default: { score } } }

  function _load() {
    try {
      var raw = localStorage.getItem(KEY_V2);
      if (raw) return JSON.parse(raw);
      // Migrate from v1
      var v1raw = localStorage.getItem(KEY_V1);
      if (v1raw) {
        var v1 = JSON.parse(v1raw);
        var v2 = {};
        Object.keys(v1).forEach(function(id) {
          v2[id] = { default: { score: v1[id] } };
        });
        _persist(v2);
        return v2;
      }
    } catch (e) {}
    return {};
  }

  function _persist(data) {
    try { localStorage.setItem(KEY_V2, JSON.stringify(data)); } catch (e) {}
  }

  function getAll() {
    return _load();
  }

  // Returns { score, time? } for gameId+level, or null if no record exists.
  function get(gameId, level) {
    level = level || 'default';
    var all = _load();
    return (all[gameId] && all[gameId][level]) ? all[gameId][level] : null;
  }

  // Saves score if it beats the existing record for that level.
  // level: string key for difficulty/category (default 'default')
  // time:  optional number (e.g. remaining seconds) stored alongside the score
  // Returns true if a new record was set.
  function save(gameId, score, level, time) {
    level = level || 'default';
    var all = _load();
    if (!all[gameId]) all[gameId] = {};
    var existing = all[gameId][level];
    if (!existing || score > existing.score) {
      var entry = { score: score };
      if (time !== undefined && time !== null) entry.time = time;
      all[gameId][level] = entry;
      _persist(all);
      return true;
    }
    return false;
  }

  function clear() {
    try {
      localStorage.removeItem(KEY_V1);
      localStorage.removeItem(KEY_V2);
    } catch (e) {}
  }

  return { GAMES: GAMES, CATEGORIES: CATEGORIES, getAll: getAll, get: get, save: save, clear: clear };
})();
