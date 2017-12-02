export interface Alarm {
    itemId: number;
    icon: number;
    spawn: number;
    duration: number;
    slot?: number;
    zoneId?: number;
    areaId?: number;
    coords?: number[];
}
