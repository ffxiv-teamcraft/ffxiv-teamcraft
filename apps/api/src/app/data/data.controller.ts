import { Controller, Get, Header, HttpException, Param, ParseArrayPipe } from '@nestjs/common';
import { LazyDataLoader } from '../lazy-data/lazy-data.loader';
import { lazyFilesList } from '@ffxiv-teamcraft/data/lazy-files-list';
import { LazyData } from '@ffxiv-teamcraft/data/model/lazy-data';
import { map } from 'rxjs/operators';

@Controller({
  path: '/data'
})
export class DataController {

  constructor(private readonly lazyData: LazyDataLoader) {
  }

  @Get(':key/:hash')
  @Header('Cache-Control', '1y')
  getLazyData(
    @Param('key') key: string,
    @Param('hash') hash: string
  ) {
    const contentName = Object.keys(lazyFilesList).find(k => lazyFilesList[k].fileName === `${key}.json`)
    return this.lazyData.get(contentName as keyof LazyData);
  }

  @Get(':key/:hash/:ids')
  getPartialLazyData(
    @Param('key') key: string,
    @Param('hash') hash: string,
    @Param('ids', ParseArrayPipe) ids: string[]
  ) {
    return this.getLazyData(key, hash).pipe(
      map(data => {
        return ids.reduce((acc, id) => {
          return {
            ...acc,
            [id]: data[id]
          }
        }, {})
      })
    )
  }
}
