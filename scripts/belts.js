window.BELTS = Object.create({
    name(belt) {
        switch (belt) {
            case BELTS.WHITE: return 'White Belt';
            case BELTS.BLACK: return 'Black Belt';
            default: return 'Unknown Belt';
        }
    }
});

BELTS.WHITE = 0;
BELTS.BLACK = 1;
