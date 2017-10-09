(function () {
    if (!navigator.serviceWorker) {
        return;
    }

    var div = document.querySelector('.console-wrapper');
    var sw = navigator.serviceWorker;

    print(div, 'start to run');

    navigator.serviceWorker.getRegistration('/sw-register/')
    .then(function (reg) {
        if (reg && reg.unregister) {
            print(div, 'there is some sw need to unregister');
            console.log(reg);
            return reg.unregister()
            .then(function (re) {
                console.log('unregister success');
                console.log(re);
                print(div, 'unregister success!');
                window.location.reload();
            });
        }

        print(div, 'no unregister');
    })
    .catch(function (e) {
        print(div, 'error catched when unregister');
        print(div, e);
    })
    .then(function () {
        print(div, 'clean store');
        return getStore()
        .then(function (store) {
            return Promise.all([
                store.delete('sw-1').catch(function () {}),
                store.delete('sw-2').catch(function () {})
            ]);
        });
    })
    .catch(function (error) {
        print(div, 'maybe some error happen when delete store');
        print(div, error);
    })
    .then(function () {
        return wait(5000);
    })
    .then(function () {
        print(div, 'start to register sw-1!');
        return sw.register('/sw-register/sw-1.js', {scope: '/sw-register/'});
    })
    .then(function (registration) {
        console.log('register sw-1 ~!');
        console.log(registration);
        // registration.unregister();
        print(div, Date.now() + ': register sw-1 !');
    })
    .catch(function (err) {
        print(div, 'fail to register sw-1 !');
        print(div, err);
    })
    .then(function () {
        print(div, 'now wait 6s for sw-1 running');
        return wait(6000);
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
    .then(function () {
        print(div, 'start to register sw-2!');
        return sw.register('/sw-register/sw-2.js', {scope: '/sw-register/'});
    })
    .then(function (registration) {
        print(div, Date.now() + ': register sw-2 !');
    })
    .catch(function (err) {
        print(div, 'fail to register sw-2 !');
        print(div, err);
    })
    .then(function () {
        print(div, 'now wait 6s for sw-2 running');
        return wait(6000);
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

function wait(time) {
    return new Promise(function (resolve) {
        setTimeout(function () {
            resolve();
        }, time || 0);
    });
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
        'get': function (key) {
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
        'put': function (val, key) {
            return new Promise(function (resolve, reject) {
                var request = store.put(val, key);
                request.onsuccess = function (e) {
                    resolve(e.target.result);
                };
                request.onerror = function (e) {
                    reject(e);
                };
            });
        },
        'delete': function (key) {
            return new Promise(function (resolve, reject) {
                var request = store.delete(key);
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
