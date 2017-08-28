window.TOOLBAR = {
    mount(el) {
        let cel = x => document.createElement(x);

        let a = (text, href) => {
            let x = cel('a');
            x.textContent = text;
            x.href = href;
            return x;
        };

        let logo = a('AHRDA', '/');
        logo.className = 'logo';
        el.appendChild(logo);
        
        el.appendChild(a('Classes', '/classes'));
        el.appendChild(a('Match', '/matches'));

        if (BACKEND.can(PERMISSIONS.READ_DETAILS)) {
            el.appendChild('Users', '/users');
        }

        let id = BACKEND.id();

        if (id !== undefined) {
            el.appendChild(a('Profile', `/users/view?id=${id}`));

            let logout = a('Logout', '#');
            logout.addEventListener('click', ev => {
                ev.preventDefault();
                BACKEND.logout();
            });
            el.appendChild(logout);
        } else {
            el.appendChild(a(
                'Login',
                `/login?then=${encodeURIComponent(location.href)}`
            ));
        }
    }
};
