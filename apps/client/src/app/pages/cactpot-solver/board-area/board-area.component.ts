import { Component, EventEmitter, Output, Input, OnChanges, SimpleChanges, inject } from "@angular/core";
import { BoardCell, LineResult } from '../model/board';
import { CactpotSolverService } from '../service/cactpot-solver.service';

@Component({
  selector: 'app-board-area',
  templateUrl: 'board-area.component.html',
  styleUrls: ['board-area.component.less']
})
export class BoardAreaComponent implements OnChanges {
  @Input() board: BoardCell[][] = [];
  @Output() boardChange = new EventEmitter<BoardCell[][]>();
  @Output() boardReset = new EventEmitter<void>();
  
  private solver: CactpotSolverService = inject(CactpotSolverService);

  availableNumbers: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  suggestedCell: { row: number; col: number } | null = null;
  bestLine: LineResult | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['board'])
      this.updateSuggestions();
  }

  onCellChange(row: number, col: number, value: number | null): void {
    const revealedCount = this.solver.getRevealedCount(this.board);
    const oldValue = this.board[row][col].value;
    
    // Prevent adding a new number when already 4 numbers are revealed
    if (value !== null && oldValue === null && revealedCount >= 4) return;

    this.board[row][col].value = value;

    // Check for duplicate numbers
    if (!this.solver.isValidBoard(this.board)) {
      // Reset the value
      this.board[row][col].value = null;
      this.boardChange.emit(this.board);
      return;
    }

    this.boardChange.emit(this.board);
    this.updateSuggestions();
  }

  updateSuggestions(): void {
    const count = this.solver.getRevealedCount(this.board);

    // Only show suggestions after at least one number is revealed
    if (count > 0 && count < 4) {
      this.suggestedCell = this.solver.suggestNextReveal(this.board);
      this.bestLine = null;
    } else if (count === 4) {
      this.suggestedCell = null;
      this.bestLine = this.solver.getBestLine(this.board);
    } else {
      // count === 0 or count > 4
      this.suggestedCell = null;
      this.bestLine = null;
    }
  }

  resetBoard(): void {
    for (let row = 0; row < 3; row++)
      for (let col = 0; col < 3; col++)
        this.board[row][col].value = null;

    this.suggestedCell = null;
    this.bestLine = null;
    this.boardChange.emit(this.board);
    this.boardReset.emit();
  }

  getRevealedCount(): number {
    return this.solver.getRevealedCount(this.board);
  }

  isSuggestedCell(row: number, col: number): boolean {
    return this.suggestedCell !== null &&
          this.suggestedCell.row === row &&
          this.suggestedCell.col === col;
  }

  isInBestLine(row: number, col: number): boolean {
    if (!this.bestLine) return false;
    return this.bestLine.cells.some((cell: BoardCell) => cell.row === row && cell.col === col);
  }

  formatLine(cells: BoardCell[]): string {
    return cells.map(cell => `(${cell.row + 1},${cell.col + 1})`).join(', ');
  }
}