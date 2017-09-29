(function () {
    if (!navigator.serviceWorker) {
        return;
    }

    var div = document.querySelector('.console-wrapper');
    var sw = navigator.serviceWorker;

    print(div, 'start to run');

    sw.register('/sw-register/sw-1.js', {scope: '/sw-register/'})
    .then(function (registration) {
        print(div, 'register sw-1 !');
    })
    .catch(function (err) {
        print(div, 'fail to register sw-1 !');
        print(div, err);
    })
    .then(function () {
        var log = localStorage.getItem('log');

        if (log) {
            print(div, log);
        }
        else {
            print(div, 'after sw 1 no any log info');
        }
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
        var log = localStorage.getItem('log');

        if (log) {
            print(div, log);
        }
        else {
            print(div, 'after sw 2 no any log info');
        }
    });
})();

function print(wrapper, msg) {
    var div = document.createElement('div');
    div.style.wordBreak = 'break-all';
    div.style.paddingBottom = '10px';
    div.innerText = JSON.stringify(msg);
    wrapper.appendChild(div);
}

