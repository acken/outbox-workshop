var request = require('request');

var services = {
    active: [],
    pending: [],
    unreachable: [],
    reported: []
};

function has(services, service) {
    return services.some(function (s) { return s.type == service.type && s.url == service.url; });
}

function is(a, b) {
    return a.type == b.type && a.url == b.url;;
}

function isGone(service) {
    return services.reported.some(function (s) { return s.type == service.type && s.reason == "GONE!"; });
}

setInterval(function () {
    services.pending.forEach(function (s) {
        request(s.heartbeat, function (error, response, body) {
            if (error || response.statusCode != 200) { 
                if (has(services.active, s)) {
                    services.active = services.active.filter(function (as) {
                        return !is(as, s);
                    });
                }
                if (!has(services.unreachable, s)) {
                    services.unreachable.push(s);
                }
            } else {
                s.tasksProcessed = 0;
                if (body) {
                    try {
                        var o = JSON.parse(body);
                        if (o.tasksProcessed !== undefined) {
                            s.tasksProcessed = o.tasksProcessed;
                        }
                        if (o.backlog !== undefined) {
                            s.backlog = o.backlog;
                        }
                    } catch (ex) {
                        console.log(ex);
                    }
                }
                if (has(services.unreachable, s)) {
                    services.unreachable = services.unreachable.filter(function (as) {
                        return !is(as, s);
                    });
                }
                if (!has(services.active, s)) {
                    services.active.push(s);
                }
            }
        })
    });
}, 2000);

module.exports = {
    register: function (service) {
        if (has(services.pending, service)) {
            services.pending = services.pending.filter(function (as) {
                return !is(as, service);
            });
        }
        if (isGone(service)) {
            services.reported = services.reported.filter(function (as) {
                return as.type != service.type;
            });
        }
        services.reported = services.reported.filter(function (as) {
            return as.type != service.type && as.url != service.url;
        });
        services.pending.push(service);
    },
    report: function (service) {
        if (!has(services.reported, service)) {
            services.reported.push(service);
            if (!has(services.pending, service)) {
                services.pending = services.pending.filter(function (as) {
                    return !is(as, service);
                });
            }
        }
    },
    get: function () {
        return services.active
            .map(function (s) {
                if (s.backlog === undefined) {
                    s.backlog = "";
                }
                return s;
            });
    },
    getByName: function (name) {
        return services.active.filter(function (i) {
            return i.type === name;
        }).map(function (i) {
            return i.url;
        });
    },
    getFailing: function () {
        return services.unreachable;
    },
    getReported: function () {
        return services.reported;
    }
};
