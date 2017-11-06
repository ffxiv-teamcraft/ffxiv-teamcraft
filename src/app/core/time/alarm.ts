export interface Alarm {
    itemId: number;
    spawn: number;
    duration: number;
    slot?: number;
    zoneId?: number;
    areaId?: number;
    coords?: number[];
}
