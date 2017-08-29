window.TOOLBAR = {
    mount(el) {
        let cel = x => document.createElement(x);

        let a = (text, href) => {
            let x = cel('a');
            x.textContent = text;
            x.href = href;

            if (location.pathname.startsWith(href)) {
                //TODO: A horrible hack indeed.
                x.classList.add('current');
            }
            
            return x;
        };

        let logo = a('AHRDA', '/');
        logo.className = 'logo';
        el.appendChild(logo);
        
        el.appendChild(a('Classes', '/classes'));

        if (BACKEND.can(PERMISSIONS.READ_DETAILS)) {
            el.appendChild(a('Users', '/users'));
        }

        el.appendChild(a('Match', '/matches'));

        let id = BACKEND.id();

        if (id !== undefined) {
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
