var log = localStorage.getItem('log');
try {
    log = JSON.parse(log);
}
catch (e) {
    log = [];
}
log.push('in sw-1');
log = JSON.stringify(log);
localStorage.setItem('log', log);
