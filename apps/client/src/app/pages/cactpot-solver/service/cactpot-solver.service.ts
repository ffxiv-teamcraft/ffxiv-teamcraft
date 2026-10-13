import { Injectable } from "@angular/core";
import { BoardCell, LineResult } from "../model/board";
import { PAYOUT_TABLE } from "../model/payout-entry";

@Injectable({
  providedIn: 'root'
})
export class CactpotSolverService {
  // Converting to map for faster results
  private readonly payoutMap: Map<number, number> = new Map(
    PAYOUT_TABLE.map(entry => [entry.sum, entry.mgp])
  );

  // All possible lines on a 3x3 board
  private readonly LINES = [
    // Rows
    { cells: [[0,0], [0,1], [0,2]], name: 'Row 1' },
    { cells: [[1,0], [1,1], [1,2]], name: 'Row 2' },
    { cells: [[2,0], [2,1], [2,2]], name: 'Row 3' },
    // Columns
    { cells: [[0,0], [1,0], [2,0]], name: 'Col 1' },
    { cells: [[0,1], [1,1], [2,1]], name: 'Col 2' },
    { cells: [[0,2], [1,2], [2,2]], name: 'Col 3' },
    // Diagonals
    { cells: [[0,0], [1,1], [2,2]], name: 'Diag 1' },
    { cells: [[0,2], [1,1], [2,0]], name: 'Diag 2' }
  ];

  /**
   * Findes the best line based on the expected value
   * @param board The Board with all values
   * @returns Returns the best Line or null
   */
  getBestLine(board: BoardCell[][]): LineResult | null {
    const lines = this.calculateAllLines(board);

    //Debug Output
    console.log('=== All Lines with expected values');
    lines.forEach((line, index) => {
      const cellPositions = line.cells.map(c => `(${c.row+1},${c.col+1})`).join(',');
      const knownValues = line.cells.filter(c => c.value !== null && c.value !== undefined).map(c => this.getCellValue(c));
      const unknownCount = line.cells.filter(c => c.value === null).length;
      console.log(`${index + 1}: ${cellPositions} | Bekannt: [${knownValues.join(',')}] | Unbekannt: ${unknownCount} | Erwarteter Wert: ${line.expectedValue.toFixed(2)} | Aktuelle Summe: ${line.sum}`);
    })

    return lines.length > 0 ? lines[0] : null;
  }

  /**
   * Suggests the next position to reveal
   * @param board The Board with all values
   * @returns Returns the next cell to reveal
   */
  suggestNextReveal(board: BoardCell[][]): { row: number; col: number } | null {
    const emptyCells: { row: number; col: number; }[] = [];
    for (let row = 0; row < 3; row++)
      for (let col = 0; col < 3; col++)
        if (board[row][col].value === null)
          emptyCells.push({ row, col });
    
    if (emptyCells.length === 0) return null;

    // If less then 4 numbers, choose the cell with highest priority
    const knownCount = board.flat().filter(c => c.value !== null).length;

    if (knownCount < 4) {
      // Choose the cell, with the most promising lines
      const lines = this.calculateAllLines(board);
      const cellScores = new Map<string, number>();

      for (const line of lines)
        for (const cell of line.cells)
          if (cell.value === null) {
            const key = `${cell.row},${cell.col}`;
            cellScores.set(key, (cellScores.get(key) || 0) + line.expectedValue);
          }

      let bestScore = -1;
      let bestCell: { row: number; col: number; } | null = null;

      console.log('=== Cell Scores for next Draw ===');
      for (const [key, score] of cellScores) {
        const [row, col] = key.split(',').map(Number);
        console.log(`(${row+1},${col+1}): ${score.toFixed(2)}`);
        if (score > bestScore) {
          bestScore = score;
          bestCell = { row, col };
        }
      }

      return bestCell || emptyCells[0];
    }

    return emptyCells[0];
  }

  /**
   * Checks if the board is valid (no double numbers)
   * @param board The Board with all values
   * @returns Returns true if the board is valid, false if not
   */
  isValidBoard(board: BoardCell[][]): boolean {
    const values = board.flat()
        .filter(cell => cell.value !== null && cell.value !== undefined)
        .map(cell => this.getCellValue(cell));

    const uniqueValues = new Set(values);
    return values.length === uniqueValues.size;
  }

  /**
   * Returns the Count of revealed numbers
   * @param board The Board with all values
   * @returns Returns the amount of revealed numbers
   */
  getRevealedCount(board: BoardCell[][]): number {
    return board.flat().filter(cell => cell.value !== null).length;
  }

  /**
   * Calculates the payout for a given sum
   * @param sum The Sum that needs to be calculated
   * @returns Returns the calculated MGP Value for the sum
   */
  private getPayoutForSum(sum: number): number {
    return this.payoutMap.get(sum) || 0;
  }

  /**
   * Calculates all available numbers (1-9), that are not used in the board
   * @param board The Board with the used numbers
   * @returns Returns a list of unused numbers
   */
  private getAvailableNumbers(board: BoardCell[][]): number[] {
    const usedNumbers = new Set<number>();
    board.flat().forEach(cell => {
      if (cell.value !== null && cell.value !== undefined)
        usedNumbers.add(this.getCellValue(cell));
    });

    const available: number[] = [];
    for (let i = 1; i <= 9; i++)
      if(!usedNumbers.has(i))
        available.push(i);

    return available;
  }

  /**
   * Helper Function to convert the cell value to a number, to ensure calculations are working correctly
   * @param cell The Cell with the corresponding value
   * @returns Returns the Value as number
   */
  private getCellValue(cell: BoardCell): number {
    if (cell.value === null || cell.value === undefined) return 0;
    return Number(cell.value);
  }

  /**
   * Calculates the expected payout of a line based on known and unknown numbers
   * @param line The content of the line
   * @param availableNumbers The available numbers
   * @returns Returns the expected Payout Value of the Line
   */
  private calculateExpectedValue(line: BoardCell[], availableNumbers: number[]): number {
    const a = this.getCellValue(line[0]);
    const b = this.getCellValue(line[1]);
    const c = this.getCellValue(line[2]);

    // Case 1: 000 - all 3 numbers unknown
    if (a === 0 && b === 0 && c === 0) {
      let totalPayout = 0;
      let count = 0;
      const poss1 = [...availableNumbers];

      for (let i = poss1.length - 1; i >= 0; i--) {
        const index1 = poss1[i];
        const poss2 = poss1.filter((_, idx) => idx !== i);

        for (let j = poss2.length - 1; j >= 0; j--) {
          const index2 = poss2[j];
          const poss3 = poss2.filter((_, idx) => idx !== j);

          for (let k = poss3.length - 1; k >= 0; k--) {
            const sum = index1 + index2 + poss3[k];
            totalPayout += this.getPayoutForSum(sum);
            count++;
          }
        }
      }
      return count > 0 ? totalPayout / count : 0;
    }

    // Case 2: 001 - just last number known
    if (a === 0 && b === 0 && c !== 0) {
      let totalPayout = 0;
      let count = 0;
      const poss1 = [...availableNumbers];

      for (let i = poss1.length - 1; i >= 0; i--) {
        const index1 = poss1[i];
        const poss2 = poss1.filter((_, idx) => idx !== 1);

        for (let j = poss2.length - 1; j >= 0; j--) {
          const sum = index1 + c + poss2[j];
          totalPayout += this.getPayoutForSum(sum);
          count++;
        }
      }
      return count > 0 ? totalPayout / count : 0;
    }

    // Case 3: 010 - just second number known
    if (a === 0 && b !== 0 && c === 0) {
      let totalPayout = 0;
      let count = 0;
      const poss1 = [...availableNumbers];

      for (let i = poss1.length - 1; i >= 0; i--) {
        const index1 = poss1[i];
        const poss2 = poss1.filter((_, idx) => idx !== i);

        for (let j = poss2.length - 1; j >= 0; j--) {
          const sum = index1 + b + poss2[j];
          totalPayout += this.getPayoutForSum(sum);
          count++;
        }
      }
      return count > 0 ? totalPayout / count : 0;
    }

    // Case 4: 011 - first number unknown, rest known
    if (a === 0 && b !== 0 && c !== 0) {
      let totalPayout = 0;
      let count = 0;
      const poss1 = [...availableNumbers];

      for (let i = 0; i < poss1.length; i++) {
        const sum = b + c + poss1[i];
        totalPayout += this.getPayoutForSum(sum);
        count++;
      }
      return count > 0 ? totalPayout / count : 0;
    }

    // Case 5: 100 - just first number is known
    if (a !== 0 && b === 0 && c === 0) {
      let totalPayout = 0;
      let count = 0;
      const poss1 = [...availableNumbers];
      
      for (let i = poss1.length - 1; i >= 0; i--) {
        const index1 = poss1[i];
        const poss2 = poss1.filter((_, idx) => idx !== i);
        
        for (let j = poss2.length - 1; j >= 0; j--) {
          const sum = index1 + a + poss2[j];
          totalPayout += this.getPayoutForSum(sum);
          count++;
        }
      }
      return count > 0 ? totalPayout / count : 0;
    }

    // Case 6: 101 - first and last number is known
    if (a !== 0 && b === 0 && c !== 0) {
      let totalPayout = 0;
      let count = 0;
      const poss1 = [...availableNumbers];
      
      for (let i = 0; i < poss1.length; i++) {
        const sum = a + c + poss1[i];
        totalPayout += this.getPayoutForSum(sum);
        count++;
      }
      return count > 0 ? totalPayout / count : 0;
    }

    // Case 7: 110 - first and second known, last unknown
    if (a !== 0 && b !== 0 && c === 0) {
      let totalPayout = 0;
      let count = 0;
      const poss1 = [...availableNumbers];
      
      for (let i = 0; i < poss1.length; i++) {
        const sum = a + b + poss1[i];
        totalPayout += this.getPayoutForSum(sum);
        count++;
      }
      return count > 0 ? totalPayout / count : 0;
    }

    // Case 8: 111 - all numbers known
    if (a !== 0 && b !== 0 && c !== 0) {
      const sum = a + b + c;
      return this.getPayoutForSum(sum);
    }

    return 0;
  }

  /**
   * Calculates all Lines of the board with their expected values
   * @param board The Board with the corresponding values
   * @returns Returns the Results of the Lines
   */
  private calculateAllLines(board: BoardCell[][]): LineResult[] {
    const availableNumbers = this.getAvailableNumbers(board);
    const results: LineResult[] = [];

    for (const lineDef of this.LINES) {
      const cells = lineDef.cells.map(([row, col]) => board[row][col]);
      const expectedValue = this.calculateExpectedValue(cells, availableNumbers);

      const knownValues = cells.filter(c => c.value !== null && c.value !== undefined).map(c => this.getCellValue(c));
      const currentSum = knownValues.reduce((a, b) => a + b, 0);

      results.push({
        cells: cells,
        sum: currentSum,
        payout: this.getPayoutForSum(currentSum),
        expectedValue: expectedValue
      });
    }

    return results.sort((a, b) => b.expectedValue - a.expectedValue);
  }
}