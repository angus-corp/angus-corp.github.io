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

        let divider = cel('div');
        divider.className = 'divider';

        let logo = a('AHRDA', '/');
        logo.className = 'logo';
        el.appendChild(logo);
        
        el.appendChild(a('Classes', '/classes'));

        if (BACKEND.can(PERMISSIONS.READ_DETAILS)) {
            el.appendChild(a('Users', '/users'));
        }

        el.appendChild(a('Tournament', '/matches/tournament'));
        el.appendChild(divider);

        let id = BACKEND.id();
        if (id !== undefined) {
            let profileLink = cel('a');
            let logout = a('Logout', '#');

            profileLink.textContent = 'Profile';
            profileLink.href = `/users/view?id=${id}`;

            logout.addEventListener('click', ev => {
                ev.preventDefault();
                BACKEND.logout();
            });

            el.appendChild(profileLink);
            el.appendChild(logout);
        } else {
            el.appendChild(a(
                'Login',
                `/login?then=${encodeURIComponent(location.href)}`
            ));
        }
    }
};
