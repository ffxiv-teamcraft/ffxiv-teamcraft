import {Vector2} from '../../core/tools/vector2';

export interface NavigationStep extends Vector2 {
    isTeleport: boolean;
}
