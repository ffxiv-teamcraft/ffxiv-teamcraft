/**
 * Lists all the indexes one can search on /Search endpoint.
 */
export enum SearchIndex {
  ACHIEVEMENT = "achievement",
  TITLE = "title",
  ACTION = "action",
  CRAFT_ACTION = "craftaction",
  TRAIT = "trait",
  PVP_ACTION = "PvPAction",
  PVP_TRAIT = "PvPTrait",
  STATUS = "status",
  /**
   * Enemies index.
   */
  BNPCNAME = "bnpcname",
  /**
   * NPCs index.
   */
  ENPCRESIDENT = "enpcresident",
  /**
   * Minions index.
   */
  COMPANION = "companion",
  MOUNT = "mount",
  LEVE = "leve",
  EMOTE = "emote",
  INSTANCECONTENT = "instancecontent",
  ITEM = "item",
  RECIPE = "recipe",
  FATE = "fate",
  QUEST = "quest",
  BALLOON = "balloon",
  BUDDY_EQUIP = "buddyequip",
  ORCHESTRION = "orchestrion",
  PLACENAME = "placename",
  WEATHER = "weather",
  WORLD = "world"
}
