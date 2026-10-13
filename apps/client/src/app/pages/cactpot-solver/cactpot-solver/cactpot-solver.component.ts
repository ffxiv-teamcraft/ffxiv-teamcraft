import { Component } from "@angular/core";
import { BoardCell } from '../model/board';

@Component({
  selector: 'app-cactpot-solver',
  templateUrl: 'cactpot-solver.component.html',
  styleUrls: ['cactpot-solver.component.less']
})
export class CactpotSolverComponent {
  board: BoardCell[][] = [];

  constructor() {
    this.initializeBoard();
  }

  initializeBoard(): void {
    this.board = [];
    for (let row = 0; row < 3; row++) {
      const rowCells: BoardCell[] = [];
      for (let col = 0; col < 3; col++) {
        rowCells.push({ row, col, value: null });
      }
      this.board.push(rowCells);
    }
  }

  onBoardChange(updatedBoard: BoardCell[][]): void {
    this.board = updatedBoard;
  }

  onBoardReset(): void {
    this.initializeBoard();
  }
}