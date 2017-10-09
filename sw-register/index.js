(function () {
    if (!navigator.serviceWorker) {
        return;
    }

    var div = document.querySelector('.console-wrapper');
    var sw = navigator.serviceWorker;

    print(div, 'start to run');

    navigator.serviceWorker.getRegistration()
    .then(function (reg) {
        if (reg && reg.unregister) {
            print(div, 'there is some sw need to unregister');
            return reg.unregister()
            .then(function () {
                print(div, 'unregister success!');
            });
        }

        print(div, 'no unregister');
    })
    .catch(function (e) {
        print(div, 'error catched when unregister');
        print(div, e);
    })
    .then(function () {
        return sw.register('/sw-register/sw-1.js', {scope: '/sw-register/'});
    })
    .then(function (registration) {
        print(div, 'register sw-1 !');
    })
    .catch(function (err) {
        print(div, 'fail to register sw-1 !');
        print(div, err);
    })
    .then(function () {
        return getStore()
        .then(function (store) {
            return store.get('sw-1')
            .then(function (data) {
                print(div, 'get log from sw-1');
                print(div, data);
            });
        })
        .catch(function (error) {
            print(div, 'Error catched when get store');
            print(div, error);
        });
    })
    .then(sw.register.bind(sw, '/sw-register/sw-2.js', {scope: '/sw-register/'}))
    .then(function (registration) {
        print(div, 'register sw-2 !');
    })
    .catch(function (err) {
        print(div, 'fail to register sw-2 !');
        print(div, err);
    })
    .then(function () {
        return getStore()
        .then(function (store) {
            return store.get('sw-2')
            .then(function (data) {
                print(div, 'get log from sw-2');
                print(div, data);
            });
        })
        .catch(function (error) {
            print(div, 'Error catched when get store');
            print(div, error);
        });
    });
})();

function print(wrapper, msg) {
    var div = document.createElement('div');
    div.style.wordBreak = 'break-all';
    div.style.paddingBottom = '10px';
    div.innerText = JSON.stringify(msg);
    wrapper.appendChild(div);
}

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
