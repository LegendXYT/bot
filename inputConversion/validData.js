import { Lineups } from "../lineups.js";
import {readFileSync} from 'fs';
import { fileURLToPath } from 'url';
import {dirname, join} from 'path';
import yaml from 'js-yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const aliasFilePath = join(__dirname, '..', 'aliases.yaml');
const aliasData = yaml.load(readFileSync(aliasFilePath, 'utf-8'))
export const validSides = ['a', 'attack', 'd', 'defence', 'def', 'pp', 'post', 'postplant'];
export const kayoValidAbilities = {
    abilityOne: ['molly', 'fragment'],
    abilityTwo: ['flash', 'flashpoint'],
    abilityThree: ['knife', 'zero/point', 'zero-point']
}

const AtkDef_Aliases = {
    a: 'attack',
    attack: 'attack',

    d: 'defence',
    defence: 'defence',
    def: 'defence',

    pp: 'postPlant',
    post: 'postPlant',
    postplant: 'postPlant',
}
const abilityAliases = {
    'molly': 'molly', 'fragment': 'molly', 'flash': 'flashpoint', 'flash': 'flash', 'knife': 'knife', 'zero/point': 'knife', 'zero-point': 'knife'
}

function getAbilityAlias(ability){
    return abilityAliases[ability.toLowerCase()] || ability.toLowerCase()
}

function getLocationAlias(location, map, ability, side){
    return aliasData.locationAliases[map][location.toLowerCase()] || location.toLowerCase();
}
export function getLineupContent(agent, map, ability, side, location) {
    // Assuming the Lineups data is already defined
    const lineup = Lineups[agent]?.[map]?.[ability]?.[side]?.[location];
    map = map.toLowerCase()

  if (!validSides.includes(side)) {
    console.error('Debug: Invalid side:', side);
    return null;
  }

  const flattenedAbilities = [].concat(...Object.values(kayoValidAbilities));
if (!flattenedAbilities.includes(ability)) {
  console.error('Debug: Invalid ability:', ability);
  return null;
}

  const abilityAlias = getAbilityAlias(ability)
  const sideAlias = AtkDef_Aliases[side.toLowerCase()] || side.toLowerCase();
  const locationAlias = getLocationAlias(location, map)
  // Check if the lineup exists
  if (
    Lineups[agent] &&
    Lineups[agent][map] && // Ensure that map is correctly used here
    Lineups[agent][map][abilityAlias] &&
    Lineups[agent][map][abilityAlias][sideAlias] &&
    Lineups[agent][map][abilityAlias][sideAlias][locationAlias] // Ensure that locationAlias is used correctly
  ) {
    // console.log('Debug: Lineup found:', Lineups[agent][map][abilityAlias][sideAlias][locationAlias]);
    return Lineups[agent][map][abilityAlias][sideAlias][locationAlias];
  } else {
    console.error('Debug: Lineup not found.');
    return null;
  }
}