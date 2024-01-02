import { kayoFlashLineups } from "./lineups/ascent/kayo/flash.js";
import { kayoKnifeLineups} from "./lineups/ascent/kayo/knife.js";
import { kayoMollyLineups} from "./lineups/ascent/kayo/molly.js";

export const Lineups = {
    kayo: {
        ascent: {
            knife: kayoKnifeLineups,
            molly: kayoMollyLineups,
            flash: kayoFlashLineups,
        },
        bind: {

        },
    },
};