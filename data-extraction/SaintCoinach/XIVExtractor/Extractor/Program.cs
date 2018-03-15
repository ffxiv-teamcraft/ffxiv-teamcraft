using SaintCoinach;
using Newtonsoft.Json.Linq;
using System;
using System.IO;
using System.Text.RegularExpressions;
using System.Collections.Generic;
using SaintCoinach.Xiv;

namespace Extractor
{
    class Program
    {
        static void Main(string[] args)
        {
            const string GameDirectory = @"F:\SquareEnix\FINAL FANTASY XIV - A Realm Reborn";
            ARealmReversed realm = new ARealmReversed(GameDirectory, "SaintCoinach.History.zip", SaintCoinach.Ex.Language.English, "app_data.sqlite");
            Localize localize = new Localize(realm);
            /**
            ExtractItemNames(localize, realm);
            ExtractNames(localize, realm.GameData.GetSheet<ENpcResident>(),"Singular", "npcs");
            ExtractNames(localize, realm.GameData.GetSheet<PlaceName>(), "Name", "places");
            ExtractNames(localize, realm.GameData.GetSheet<Weather>(), "Name", "weathers");
            ExtractMobNames(localize, realm);
            ExtractNodesPosition(realm.GameData.GetSheet<GatheringPoint>());
            ExtractNames(localize, realm.GameData.GetSheet<CraftAction>(), "Name", "craft-actions");
            ExtractNames(localize, realm.GameData.GetSheet<SaintCoinach.Xiv.Action>(), "Name", "actions");
            ExtractAetheryteNames(localize, realm);
            **/
            ExtractVentureNames(localize, realm);
        }

        static void ExtractAetheryteNames(Localize localize, ARealmReversed realm)
        {
            JArray aetherytes = JArray.Parse(File.ReadAllText(@"..\..\..\..\..\xivdb-mapper\output\aetherytes.json"));
            JArray res = new JArray();
            var sheet = realm.GameData.GetSheet("Aetheryte");
            foreach(var row in aetherytes)
            {
                JObject jRow = row.Value<JObject>();
                jRow.Add("nameid", ((SaintCoinach.Xiv.PlaceName)sheet[Int32.Parse(jRow.GetValue("id").ToString())]["PlaceName"]).Key);
                res.Add(row);
            }
            File.WriteAllText(AppDomain.CurrentDomain.BaseDirectory + "output\\aetherytes.json", res.ToString());
        }

        static void ExtractNodesPosition(IEnumerable<GatheringPoint> rows)
        {
            JObject positions = JObject.Parse(File.ReadAllText(@"..\..\..\..\..\xivdb-mapper\output\nodes-position.json"));
            JObject res = new JObject();
            foreach(var row in rows)
            {
                if (positions.GetValue(row.Key.ToString()) != null && res.GetValue(row.Base.Key.ToString()) == null) { 
                    res.Add(row.Base.Key.ToString(), positions.GetValue(row.Key.ToString()));
                }
            }
            File.WriteAllText(AppDomain.CurrentDomain.BaseDirectory + "..\\..\\..\\..\\..\\..\\src\\app\\core\\data\\sources\\node-positions.json", res.ToString());
        }

        static void ExtractItemNames(Localize localize, ARealmReversed realm)
        {
            JObject res = new JObject();
            var itemRows = realm.GameData.Items;
            foreach (var item in itemRows)
            {
                JObject itemName = localize.Strings(item, "Name");
                if (itemName != null)
                {
                    res.Add(item.Key.ToString(), itemName);
                }
            }
            var draftRows = realm.GameData.GetSheet<CompanyCraftDraft>();
            foreach (var draft in draftRows)
            {
                JObject itemName = localize.Strings(draft, "Name");
                if (itemName != null)
                {
                    res.Add("draft"+draft.Key.ToString(), itemName);
                }
            }
            string json = Regex.Replace(res.ToString(), "(\"(?:[^\"\\\\]|\\\\.)*\")|\\s+", "$1");
            File.WriteAllText(AppDomain.CurrentDomain.BaseDirectory + "..\\..\\..\\..\\..\\..\\src\\app\\core\\data\\sources\\items.json", json);
        }

        static void ExtractMobNames(Localize localize, ARealmReversed realm)
        {
            // , realm.GameData.BNpcs.NameSheet, "Singular", "mobs"
            JObject res = new JObject();
            foreach (var bnpc in realm.GameData.BNpcs)
            {
                JObject itemName = localize.Strings(bnpc.Name, "Singular");
                if (itemName != null)
                {
                    res.Add(bnpc.Key.ToString(), itemName);
                }
            }
            string json = Regex.Replace(res.ToString(), "(\"(?:[^\"\\\\]|\\\\.)*\")|\\s+", "$1");
            File.WriteAllText(AppDomain.CurrentDomain.BaseDirectory + "..\\..\\..\\..\\..\\..\\src\\app\\core\\data\\sources\\mobs.json", json);
        }

        static void ExtractVentureNames(Localize localize, ARealmReversed realm)
        {
            JObject res = new JObject();
            foreach (var task in realm.GameData.GetSheet<RetainerTask>())
            {
                if(task.Task is RetainerTaskNormal)
                {
                    Item item = null;
                    using (IEnumerator<Item> enumer = task.Task.Items.GetEnumerator())
                    {
                        if (enumer.MoveNext()) item = enumer.Current;
                    }
                    JObject name = localize.Strings(item, "Name");
                    if (name != null)
                    {
                        res.Add(task.Key.ToString(), name);
                    }
                }
                else if (task.Task is RetainerTaskRandom)
                {
                    JObject name = localize.Strings(task.Task, "Name");
                    if (name != null)
                    {
                        res.Add(task.Key.ToString(), name);
                    }
                }
            }
            string json = Regex.Replace(res.ToString(), "(\"(?:[^\"\\\\]|\\\\.)*\")|\\s+", "$1");
            File.WriteAllText(AppDomain.CurrentDomain.BaseDirectory + "..\\..\\..\\..\\..\\..\\src\\app\\core\\data\\sources\\ventures.json", json);
            
        }

        static void ExtractNames(Localize localize, IEnumerable<IXivRow> rows, string col, string fileName)
        {
            JObject res = new JObject();
            foreach (var item in rows)
            {
                JObject itemName = localize.Strings(item, col);
                if (itemName != null)
                {
                    res.Add(item.Key.ToString(), itemName);
                }
            }
            string json = Regex.Replace(res.ToString(), "(\"(?:[^\"\\\\]|\\\\.)*\")|\\s+", "$1");
            File.WriteAllText(AppDomain.CurrentDomain.BaseDirectory  + "..\\..\\..\\..\\..\\..\\src\\app\\core\\data\\sources\\" + fileName + ".json", json);
        }

    }
}
