import { Injectable } from '@angular/core';
import { Vector2 } from './vector2';
import { Vector3 } from './vector3';

@Injectable()
export class MathToolsService {

  public distance(start: Vector2 | Vector3, target: Vector2 | Vector3): number {
    return Math.sqrt(
      Math.pow((target.x - start.x), 2)
      + Math.pow((target.y - start.y), 2)
      + Math.pow(((<Vector3>target).z || 0 - (<Vector3>start).z || 0), 2));
  }
}
