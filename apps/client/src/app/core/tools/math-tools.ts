import { Injectable } from '@angular/core';
import { Vector2 } from './vector2';

@Injectable()
export class MathToolsService {

  public distance(start: Vector2, target: Vector2): number {
    return Math.sqrt(Math.pow((target.x - start.x), 2) + Math.pow((target.y - start.y), 2));
  }
}
