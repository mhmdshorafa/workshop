'use strict';

const Hapi = require('hapi');
const env = require('env2')('./config.env');
const Wreck = require('wreck');
const qs = require('querystring');
var accesstoken = '';
const server = new Hapi.Server();
server.connection({
    port: 3000,
    host: 'localhost'
});
server.route([{
    method: 'GET',
    path: '/',
    handler: function(request, reply) {
        reply('Hello, world!');
    }
}, {
    method: 'GET',
    path: '/login',
    handler: function(request, reply) {
        reply.redirect(`https://github.com/login/oauth/authorize?client_id=${process.env.CLIENT_ID}&redurect_uri=http://localhost:3000/welcome`)
    }
}, {
    method: 'GET',
    path: '/welcome',
    handler: function(request, reply) {
        Wreck.post('https://github.com/login/oauth/access_token', {
            payload: {
                client_id: `${process.env.CLIENT_ID}`,
                client_secret: `${process.env.CLIENT_SECRET}`,
                code: `${reply.request.url.query.code}`
            }
        }, (err, res, payload) => {
            var text = payload.toString().split('=')
            var access = text[1].split('&')
            accesstoken = access[0];

        });
        Wreck.get(`https://api.github.com/user?access_token=${accesstoken}`, {
            headers: {
                'user-agent': 'node.js'
            }
        }, (err, res, payload) => {
            var data = JSON.parse(payload.toString());
            var name = data.login;

        });
    }
}]);
server.start((err) => {

    if (err) {
        throw err;
    }
    console.log(`Server running at: ${server.info.uri}`);
});
