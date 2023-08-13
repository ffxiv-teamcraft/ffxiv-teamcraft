# XIV Data Extraction

This project aims at extracting the data we need from game files in order to generate json and index files for everything related to the game in Teamcraft.

## How to use

 - Define a `SAINT_COINACH_PATH` env var that points to a clone of [xivapi/SaintCoinach](https://github.com/xivapi/SaintCoinach) that you'll have to keep up to date.
 - If your game is not in `one of these paths: https://github.com/ackwell/kobold/blob/master/packages/xiv/src/index.ts#L31-L35 then you'll have to create a symlink from your game folder to one of these locations.
 - Make sure your dependencies are installed (if not, run `yarn install`).
 - Run `yarn data-extrator`
   - The first menu asks you which content you want to extract, be aware that selecting "everything" will most likely take up to 8 minutes depending on your hardware, each line matches an extractor from the `src/extractors` folder.
   - Then it'll ask you if it should update extracts.json, this runs all the extractors from the `src/extractors/extracts` folder, all feeding a large file called extracts.json, which contains sources for every single item in the game.
   - Then it'll ask if you want to update search and finally database pages, for former runs the `src/extractors/search.extractor.ts` filr, the later runs all the extractors in the `src/extractors/db` folder.

## How it works

Let's take a simple extractor as example and comment it to explain everything:

```ts
export class JobsExtractor extends AbstractExtractor {
  // This is the method you need to implement to extract data, xiv being an instance of XivDataService to extract stuff from it.
  protected doExtract(xiv: XivDataService): void {
    // Preparing the index objects for the data to be stored
    const jobAbbrs = {};
    const jobNames = {};
    const gameJobAbbrs = {};
    const indexes = {};
    /**
     * getSheet returns an Observable, which we're subscribing to.
     * The args are:
     *  0: an instance of XivDataService
     *  1: the name of the sheet you want to extract
     *  2: the columns you want to extract, suffix with # if you just want the value and avoid the link from being resolved (helping with perfs !), example: ClassJob#. Columns also support deep fields, like ClassJob.Name for instance
     *  3: <Optional> a boolean to tell the extractor if data at index 0 should be included, defaults to false
     *  4: <Optional> the depth at which we allow the extractor to go, deeper means it'll resolve more links and embed more data, meaning slower
     */
    this.getSheet<any>(xiv, 'ClassJob', ['Abbreviation', 'Name', 'JobIndex', 'DohDolJobIndex', 'BattleClassIndex'])
      .subscribe(entries => {
        // Now that we have all the entries we need, let's feed the indexes with the data we have
        entries.forEach(job => {
          // Entries always come with `index` and `subIndex` properties, which is basically their ID in the sheet
          jobNames[job.index] = {
            // String values are included in all 4 languages present in the game client, in this example, Name means that the object has the following properties:
            // Name, Name_en, Name_fr, Name_de, Name_ja. Name being Name_en.
            en: job.Name_en,
            ja: job.Name_ja,
            de: job.Name_de,
            fr: job.Name_fr
          };
          jobAbbrs[job.index] = {
            // Same as for name, Abbreaviation is a string so we have it in all 4 languages
            en: job.Abbreviation_en,
            ja: job.Abbreviation_ja,
            de: job.Abbreviation_de,
            fr: job.Abbreviation_fr
          };
          gameJobAbbrs[job.index] = job.Abbreviation_en;
          indexes[job.index] = +job.DohDolJobIndex > -1 ? job.DohDolJobIndex : +job.JobIndex || +job.BattleClassIndex;
        });
        // We've got multiple utility methods to persist data, the best ones are `persistToJsonAsset` and `persistToMinifedJsonAsset`. Although data is minified at build time, it's sometimes better to output minifed JSON to avoid github issues with larger files.
        this.persistToJsonAsset('job-name', jobNames);
        this.persistToJsonAsset('job-sort-index', indexes);
        this.persistToJsonAsset('job-abbr', jobAbbrs);
        // Persisting to Typescript should be avoided, this example uses it but be sure of what you're doing if you want to use that as it increases bundle size by a lot if the file is too large.
        this.persistToTypescriptData('job-abbr-en', 'jobAbbrs', gameJobAbbrs);

        /**
         * VERY IMPORTANT
         * Do not forget to call this.done ! else your extractor will never complete and the runner will wait for it to call done.
         */
        this.done();
      });
  }

  /**
   * This just returns the name of the extractor used to display it in the selection list.
   */
  getName(): string {
    return 'jobs';
  }

}
```

## The key components

Data extraction uses three key components:

### SaintCoinach

SaintCoinach is a C# tool used to extract data from game files, it has been created many years ago and is being maintained by few devs, mostly maintaining the definition files so that other tools can use them.
In data extraction, it's used for the definition files and some extracts too (mostly action and trait descriptions for string parsing reasons, if you need to use these, please reach Miu on discord so he can explain it in depth).

### Kobold

Kobold is an alternative to SaintCoinach wrote in Typescript, making it easy to use in a node env, it's also reading stuff in a lazy fashion, meaning that it'll only read what you're asking for, making it faster to operate.
kobold is a project from ackwell that's being maintained by Miu since few months now, a wrapper around it has been made in `src/kobold` to make it more i18n compliant and sheet agnostic too.

### XivDataService

XivDataService combines Kobold and SaintCoinach to extract data sheets with definitions and links applied to them, this is the part that you'll always want to use to extract data, as it does a lot of heavy lifting for you so you just need to tell it "Give me this sheet, I want these columns, go this deep" and you're done.
It is a home-made solution that's all implemented in the `src/xiv` folder.

## Reverse engineering and data exploration

To understand how data works, the best way is to dive into it by yourself, right? For that you can use Godbert, which is part of the SaintCoinach project (which you'll have to clone anyways). Running godbert allows you to explore data, see which sheets exist, what they contain, etc.
Using `https://xivapi.com/<SheetName>/<ID>` also helps a lot to understand structure as it's returning a JSON that's easier to follow.

:warning: be aware that column names don't match 1:1 what `XivDataService` will return or ask for, here are the differences:

 - `{}[]<>()` characters are removed (`src/xiv/definition-parser#L48`).
 - Arrays are properly handled as arrays (xivapi flattens arrays by suffixing props with index, so a foo array with 2 values will make it foo0 and foo1).
 - Few exceptions exist with columns named `Something[0]` directly instead of declared as arrays in Definition files, in which case XivDataService will read it as `Something0`.

Always check Definition files (`<SaintCoinach root>/SaintCoinach/Definitions/<sheet>.json`) when you want to see how it'll be parsed, or add a breakpoint and check the data once it arrives.
