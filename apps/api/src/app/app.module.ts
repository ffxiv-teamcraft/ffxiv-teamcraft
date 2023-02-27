import { Module } from '@nestjs/common';
import { SearchController } from './search/search.controller';
import { SearchService } from './search/search.service';
import { LazyDataLoader } from './lazy-data/lazy-data.loader';
import { DataController } from './data/data.controller';
import { FishTrainController } from './fish-train/fish-train.controller';

@Module({
  imports: [],
  controllers: [SearchController, DataController, FishTrainController],
  providers: [SearchService, LazyDataLoader]
})
export class AppModule {
}
