import { NgModule } from '@angular/core';
import { FishDataService } from '../service/fish-data.service';
import { FishContextService } from '../service/fish-context.service';
import * as FishGQLProviders from '../service/fish-data.gql';

@NgModule({
  providers: [FishDataService, FishContextService, ...Object.values(FishGQLProviders)]
})
export class FishDataModule {
}
