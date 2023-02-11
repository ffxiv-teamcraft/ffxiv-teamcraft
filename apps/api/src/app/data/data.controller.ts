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
    const contentName = key === 'extracts' ? key : Object.keys(lazyFilesList).find(k => lazyFilesList[k].fileName === `${key}.json`);
    if (!contentName) {
      throw new HttpException(`${contentName} is not available`, 404);
    }
    return this.lazyData.get(contentName as keyof LazyData);
  }

  @Get(['//:prefix/:key/:hash/:ids', '/:prefix/:key/:hash/:ids'])
  getZhPartialLazyData(
    @Param('prefix') prefix: string,
    @Param('key') key: string,
    @Param('hash') hash: string,
    @Param('ids', ParseArrayPipe) ids: string[]
  ) {
    return this.getLazyData(`/${prefix}/${key}`, hash).pipe(
      map(data => {
        return ids.reduce((acc, id) => {
          return {
            ...acc,
            [id]: data[id]
          };
        }, {});
      })
    );
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
          };
        }, {});
      })
    );
  }
}
