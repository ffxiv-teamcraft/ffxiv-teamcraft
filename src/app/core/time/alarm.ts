export interface Alarm {
    itemId: number;
    icon: number;
    spawn: number;
    duration: number;
    slot?: number | string;
    zoneId?: number;
    areaId?: number;
    coords?: number[];
    /**
     * Type of the node.
     * 0,1 = MIN
     * 2,3 = BOT
     * 4 = FSH (Spearfishing)
     */
    type: number;
}
