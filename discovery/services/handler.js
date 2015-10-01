var request = require('request');

var services = {
    active: [],
    pending: [],
    unreachable: []
};

function has(services, service) {
    return services.some(function (s) { return s.name == service.name && s.heartbeat == service.heartbeat; });
}

setInterval(function () {
    services.pending.forEach(function (s) {
        request(s.heartbeat, function (error, response, body) {
            if (error || response.statusCode != 200) { 
                if (has(services.active, s)) {
                    services.active = services.active.filter(function (as) {
                        return as != s;
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
                    } catch (ex) {
                        console.log(ex);
                    }
                }
                if (has(services.unreachable, s)) {
                    services.unreachable = services.unreachable.filter(function (as) {
                        return as != s;
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
                return as != service;
            });
        }
        services.pending.push(service);
    },
    get: function () {
        return services.active;
    },
    getFailing: function () {
        return services.unreachable;
    }
};
