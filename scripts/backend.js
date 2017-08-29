window.BACKEND = (function () {

let token;
let tokenString;

try {
    tokenString = localStorage.getItem('token');
    token = tokenString === null ? null : JSON.parse(atob(tokenString));
    
    if (new Date(token.expiry) < Date.now()) {
        token = null;
        tokenString = null;
    }
} catch (e) {
    token = null;
    tokenString = null;
}

return {
    //TODO: url: 'https://salty-pasta.herokuapp.com',
    url: 'http://localhost:8000',

    token: token,
    tokenString: tokenString,

    get(endpoint) {
        return fetch(new Request(BACKEND.url + endpoint, {
            method: 'GET',
            mode: 'cors',
            headers: getHeaders()
        }));
    },

    post(endpoint, body) {
        let headers = getHeaders();
        headers['Content-Type'] = 'application/json';

        return fetch(new Request(BACKEND.url + endpoint, {
            method: 'POST',
            mode: 'cors',
            headers: headers,
            body: typeof body === 'undefined' ? undefined : JSON.stringify(body)
        }));
    },

    delete(endpoint) {
        return fetch(new Request(BACKEND.url + endpoint, {
            method: 'DELETE',
            mode: 'cors',
            headers: getHeaders()
        }));
    },

    put(endpoint, body) {
        let headers = getHeaders();
        headers['Content-Type'] = 'application/json';

        return fetch(new Request(BACKEND.url + endpoint, {
            method: 'PUT',
            mode: 'cors',
            headers: getHeaders(),
            body: typeof body === 'undefined' ? undefined : JSON.stringify(body)
        }));
    },

    can(perm) {
        if (BACKEND.token && Array.isArray(BACKEND.token.perms)) {
            return BACKEND.token.perms.indexOf(perm) > -1;
        } else {
            return false;
        }
    },

    is(user) {
        if (BACKEND.token && typeof BACKEND.token.user === 'number') {
            return BACKEND.token.user === user;
        } else {
            return false;
        }
    },

    logout() {
        delete localStorage['token'];
        location.reload();
    },

    id() {
        if (BACKEND.token && typeof BACKEND.token.user === 'number') {
            return BACKEND.token.user;
        } else {
            return undefined;
        }
    }
};

function getHeaders() {
    let headers = {};
    
    if (BACKEND.tokenString !== null) {
        headers['Authorization'] = `Custom ${BACKEND.tokenString}`;
    }

    return headers;
}

})();
