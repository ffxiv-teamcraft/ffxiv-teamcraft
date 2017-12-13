export interface Alarm {
    itemId: number;
    icon: number;
    spawn: number;
    duration: number;
    slot?: number | string;
    zoneId?: number;
    areaId?: number;
    coords?: number[];
}
