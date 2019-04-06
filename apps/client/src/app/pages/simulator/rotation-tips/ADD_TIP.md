# How to add a rotation tip

 1. Create a file inside tips folder, export a new class (you can check how the simple tips like `UseReclaim` are made for the structure).
 2. Implement your tip (you can check all the other tips for implementation, or ping Miu#1568 on discord), don't forget to give it a translation key.
 3. Once the tip is implemented add it inside the `tips` array in `rotation-tips.module.ts` file.
 4. Open `apps/client/src/assets/i18n/en.json` and add a new entry under `ROTATION_TIPS`.
