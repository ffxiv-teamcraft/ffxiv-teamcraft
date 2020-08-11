import { LayoutRowDisplay } from './layout-row-display';

export interface ListDisplay {
  rows: LayoutRowDisplay[];
  crystalsPanel?: boolean;
  showInventory: boolean;
  showFinalItemsPanel: boolean;
}
