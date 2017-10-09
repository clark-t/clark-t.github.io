self.oninstall = function (event) {
    self.skipWaiting();
};

self.onactivate = function (event) {
    event.waitUntil(
        getStore()
        .then(function (store) {
            return store.put({log: 'sw-1 activate', id: 'sw-1'});
        })
    );
};


function getStore() {
    return new Promise(function (resolve, reject) {
        var req = indexedDB.open('sw-register', 1);
        req.onsuccess = function (e) {
            var db = e.target.result;
            var t = db.transaction(['register'], 'readwrite');
            var store = t.objectStore('register');
            resolve(pifyStore(store));
        };

        req.onupgradeneeded = function (e) {
            var db = e.target.result;
            if(!db.objectStoreNames.contains('register')) {
                db.createObjectStore('register', {keyPath: 'id'});
            }
        };

        req.onerror = function (e) {
            reject(e);
        };
    });
}

function pifyStore(store) {
    var obj = {
        get: function (key) {
            return new Promise(function (resolve, reject) {
                var request = store.get(key);
                request.onsuccess = function (e) {
                    resolve(e.target.result);
                };
                request.onerror = function (e) {
                    reject(e);
                };
            });
        },
        put: function (val, key) {
            return new Promise(function (resolve, reject) {
                var request = store.put(val, key);
                request.onsuccess = function (e) {
                    resolve(e.target.result);
                };
                request.onerror = function (e) {
                    reject(e);
                };
            });
        }
    };

    return obj;
}
