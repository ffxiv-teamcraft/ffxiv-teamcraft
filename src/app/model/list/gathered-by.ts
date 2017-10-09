import {GatheringNode} from '../garland-tools/gathering-node';

export interface GatheredBy {
    type: number;
    icon: string;
    level: number;
    nodes: GatheringNode[];
    stars_tooltip: string;
    legend?: any;
}
