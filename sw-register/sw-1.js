
self.addEventListener('install', function (event) {
    console.log('on install');
    // console.log(Object.keys(self))
// self.oninstall = function (event) {
    if (event.waitUntil) {
        event.waitUntil(
            getStore()
            .then(function (store) {
                return store.get('sw-1')
                .then(function (data) {
                    if (!data) {
                        data = {log: '', id: 'sw-1'};
                    }

                    data.log += '|' + Date.now() + ': sw 1 on install';

                    return store.put(data);
                })
                .then(function (data) {
                    console.log('on install sw 1 before wait');
                    console.log(data);
                });
            })
            .catch(function (error) {
                console.log('error happen when get store');
                console.log(error);
            })
            .then(function () {
                return wait(1000);
            })
            .then(function () {
                return getStore();
            })
            .then(function (store) {
                return store.get('sw-1')
                .then(function (data) {
                    if (!data) {
                        data = {log: '', id: 'sw-1'};
                    }

                    data.log += '|' + Date.now() + ': sw 1 on install after 3s';

                    return store.put(data);
                })
                .then(function (data) {
                    console.log('on install sw 1 after wait');
                    console.log(data);
                });
            })
        );
    }
    else {
        getStore()
        .then(function (store) {
            store.get('sw-1')
            .then(function (data) {
                if (!data) {
                    data = {log: '', id: 'sw-1'};
                }

                data.log += '|' + Date.now() + ': sw 1 install does not have wait until';
                return store.put(data);
            });
        });
    }

    self.skipWaiting();
});

self.addEventListener('activate', function (event) {
    console.log('on activate');
// self.onactivate = function (event) {
    event.waitUntil(
        getStore()
        .then(function (store) {
            return store.get('sw-1')
            .then(function (data) {
                if (!data) {
                    data = {log: '', id: 'sw-1'};
                }

                data.log += '|' + Date.now() + ': sw 1 on activate';

                return store.put(data);
            })
            .then(function (data) {
                console.log('on activate sw 1 before wait');
                console.log(data);
            });
        })
        .then(function () {
            return wait(1000);
        })
        .then(function () {
            return getStore();
        })
        .then(function (store) {
            return store.get('sw-1')
            .then(function (data) {
                if (!data) {
                    data = {log: '', id: 'sw-1'};
                }

                data.log += '|' + Date.now() + ': sw-1 activate';

                return store.put(data);
            })
            .then(function (data) {
                console.log('on activate sw 1 after wait');
                console.log(data);
            });
        })
    );
});

// self.addEventListener('installing', function (event) {
//     console.log('on installing');
// });

// self.addEventListener('installed', function (event) {
//     console.log('on installed');
// });

// self.addEventListener('activating', function (event) {
//     console.log('on activating');
// });

// self.addEventListener('activated', function (event) {
//     console.log('on activated');
// });

function wait(time) {
    return new Promise(function (resolve) {
        setTimeout(function () {
            resolve();
        }, time || 0);
    });
}

// function put(data) {
//     return getStore()
//     .then(function (store) {
//         return store.put(data);
//     });
// }

// function get(key) {
//     return getStore()
//     .then(function (store) {
//         return store.get(key);
//     });
// }

// function del(key) {
//     return getStore()
//     .then(function (store) {
//         return store.delete(key);
//     });
// }

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
