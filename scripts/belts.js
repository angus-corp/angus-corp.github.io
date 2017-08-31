window.BELTS = Object.create({
    name(belt) {
        switch (belt) {
            case BELTS.WHITE:   return 'White';
            case BELTS.YELLOW:  return 'Yellow';
            case BELTS.GREEN:   return 'Green';
            case BELTS.BLUE:    return 'Blue';
            case BELTS.RED:     return 'Red';
            case BELTS.BLACK_1: return 'Black 1';
            case BELTS.BLACK_2: return 'Black 2';
            case BELTS.BLACK_3: return 'Black 3';
            case BELTS.BLACK_4: return 'Black 4';
            case BELTS.BLACK_5: return 'Black 5';
            case BELTS.BLACK_6: return 'Black 6';
            case BELTS.BLACK_7: return 'Black 7';
            case BELTS.BLACK_8: return 'Black 8';
            case BELTS.BLACK_9: return 'Black 9';
            default: return 'Unknown';
        }
    }
});

BELTS.WHITE   = 0;
BELTS.YELLOW  = 1;
BELTS.GREEN   = 2;
BELTS.BLUE    = 3;
BELTS.RED     = 4;
BELTS.BLACK_1 = 5;
BELTS.BLACK_2 = 6;
BELTS.BLACK_3 = 7;
BELTS.BLACK_4 = 8;
BELTS.BLACK_5 = 9;
BELTS.BLACK_6 = 10;
BELTS.BLACK_7 = 11;
BELTS.BLACK_8 = 12;
BELTS.BLACK_9 = 13;
