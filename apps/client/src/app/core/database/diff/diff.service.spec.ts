import { inject, TestBed } from '@angular/core/testing';

import { DiffService } from './diff.service';
import { Diff } from './diff';

describe('DiffService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DiffService]
    });
  });

  it('should be created', inject([DiffService], (service: DiffService) => {
    expect(service).toBeTruthy();
  }));

  it('should find modified value', inject([DiffService], (service: DiffService) => {
    const diff = service.diff({ foo: 'bar' }, { foo: 'babar' });
    const expectedResult = new Diff();
    expectedResult.modified.push({
      path: '/foo',
      value: 'babar'
    });
    expect(diff).toEqual(expectedResult);
  }));

  it('should find added value', inject([DiffService], (service: DiffService) => {
    const diff = service.diff({}, { foo: 'babar' });
    const expectedResult = new Diff();
    expectedResult.added.push({
      path: '/foo',
      value: 'babar'
    });
    expect(diff).toEqual(expectedResult);
  }));

  it('should find deleted value', inject([DiffService], (service: DiffService) => {
    const diff = service.diff({ foo: 'babar' }, {});
    const expectedResult = new Diff();
    expectedResult.deleted.push({
      path: '/foo'
    });
    expect(diff).toEqual(expectedResult);
  }));

  it('should find modified value in child array', inject([DiffService], (service: DiffService) => {
    const diff = service.diff({ foo: ['bar'] }, { foo: ['babar'] });
    const expectedResult = new Diff();
    expectedResult.modified.push({
      path: '/foo/0',
      value: 'babar'
    });
    expect(diff).toEqual(expectedResult);
  }));

  it('should find added value in child array', inject([DiffService], (service: DiffService) => {
    const diff = service.diff({ foo: ['bar'] }, { foo: ['bar', 'lol'] });
    const expectedResult = new Diff();
    expectedResult.added.push({
      path: '/foo/1',
      value: 'lol'
    });
    expect(diff).toEqual(expectedResult);
  }));

  it('should find added value in child array', inject([DiffService], (service: DiffService) => {
    const diff = service.diff({ foo: ['bar', 'lol'] }, { foo: ['bar'] });
    const expectedResult = new Diff();
    expectedResult.deleted.push({
      path: '/foo/1'
    });
    expect(diff).toEqual(expectedResult);
  }));

  it('should find modified value in child object', inject([DiffService], (service: DiffService) => {
    const diff = service.diff({ foo: { bar: 'bar' } }, { foo: { bar: 'baz' } });
    const expectedResult = new Diff();
    expectedResult.modified.push({
      path: '/foo/bar',
      value: 'baz'
    });
    expect(diff).toEqual(expectedResult);
  }));
});
