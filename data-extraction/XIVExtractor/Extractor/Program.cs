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
    static string BASE_ANGULAR_PATH = "..\\..\\..\\..\\..\\apps\\client\\";

    static void Main(string[] args)
    {
      const string GameDirectory = @"E:\SquareEnix\FINAL FANTASY XIV - A Realm Reborn";
      ARealmReversed realm = new ARealmReversed(GameDirectory, "SaintCoinach.History.zip", SaintCoinach.Ex.Language.English, "app_data.sqlite");
      Localize localize = new Localize(realm);
      ExtractItemNames(localize, realm);
      ExtractNames(localize, realm.GameData.GetSheet<PlaceName>(), "Name", "places");
      ExtractNames(localize, realm.GameData.GetSheet<Weather>(), "Name", "weathers");
      //ExtractMobNames(localize, realm);
      ExtractNames(localize, realm.GameData.GetSheet<CraftAction>(), "Name", "craft-actions");
      ExtractNames(localize, realm.GameData.GetSheet<SaintCoinach.Xiv.Action>(), "Name", "actions");
      //ExtractAetheryteNames(localize, realm);
      ExtractVentureNames(localize, realm);
      //ExtractNodesPosition(realm.GameData.GetSheet<GatheringPoint>());
      ExtractActionIcons(realm.GameData);
      ExtractNames(localize, realm.GameData.GetSheet<ClassJob>(), "Abbreviation", "job-abbr");
      ExtractNames(localize, realm.GameData.GetSheet<ClassJob>(), "Name", "job-name");
      ExtractConsumables(realm.GameData);
      //ExtractNpcs(localize, realm);
    }

    static void ExtractConsumables(XivCollection gameData)
    {
      int[] foods = { 844, 845 };
      JArray foodsArray = ExtractFoodTypes(gameData, foods);
      string foodsJson = Regex.Replace(foodsArray.ToString(Newtonsoft.Json.Formatting.Indented), "(\"(?:[^\"\\\\]|\\\\.)*\")|\\s+", "$1");
      File.WriteAllText(AppDomain.CurrentDomain.BaseDirectory + BASE_ANGULAR_PATH + "src\\app\\core\\data\\sources\\foods.json", foodsJson);

      int[] medicines = { 846 };
      JArray medicinesArray = ExtractFoodTypes(gameData, medicines);
      string medicinesJson = Regex.Replace(medicinesArray.ToString(Newtonsoft.Json.Formatting.Indented), "(\"(?:[^\"\\\\]|\\\\.)*\")|\\s+", "$1");
      File.WriteAllText(AppDomain.CurrentDomain.BaseDirectory + BASE_ANGULAR_PATH + "src\\app\\core\\data\\sources\\medicines.json", medicinesJson);
    }

    static JArray ExtractFoodTypes(XivCollection gameData, int[] types)
    {
      JArray res = new JArray();
      foreach (var item in gameData.GetSheet<Item>())
      {
        foreach (int type in types)
        {
          if (item.ItemAction.Type == type)
          {
            if (gameData.GetSheet<ItemFood>().ContainsRow(item.ItemAction.GetData(1)))
            {
              var food = gameData.GetSheet<ItemFood>()[item.ItemAction.GetData(1)];
              if (food != null)
              {
                JObject foodRow = new JObject();
                foreach (var param in food.Parameters)
                {
                  if (param.BaseParam.DefaultValue.ToString() == "CP" || param.BaseParam.DefaultValue.ToString() == "Control" || param.BaseParam.DefaultValue.ToString() == "Craftsmanship")
                  {
                    if (foodRow.GetValue("itemId") == null)
                    {
                      foodRow.Add("itemId", item.Key);
                    }
                    JArray paramRow = new JArray();
                    foreach (var value in param.Values)
                    {
                      var valueRow = new JObject();
                      valueRow.Add("amount", ((ParameterValueRelativeLimited)value).Amount);
                      valueRow.Add("max", ((ParameterValueRelativeLimited)value).Maximum);
                      paramRow.Add(valueRow);
                    }
                    foodRow.Add(param.BaseParam.DefaultValue.ToString(), paramRow);
                  }
                }
                if (foodRow.HasValues)
                {
                  res.Add(foodRow);
                }
              }
            }
          }
        }
      }
      return res;
    }

    static void ExtractActionIcons(XivCollection gameData)
    {
      JObject res = new JObject();
      foreach (var action in gameData.GetSheet<CraftAction>())
      {
        int iconId = GetIconId(action.Icon);
        if (iconId != 405 && iconId > 0)
        {
          res.Add(action.Key.ToString(), iconId);
        }
      }
      foreach (var action in gameData.GetSheet<SaintCoinach.Xiv.Action>())
      {
        int iconId = GetIconId(action.Icon);
        if (iconId != 405 && iconId > 0)
        {
          res.Add(action.Key.ToString(), iconId);
        }
      }
      string json = Regex.Replace(res.ToString(), "(\"(?:[^\"\\\\]|\\\\.)*\")|\\s+", "$1");
      File.WriteAllText(AppDomain.CurrentDomain.BaseDirectory + BASE_ANGULAR_PATH + "src\\app\\core\\data\\sources\\action-icons.json", json);
    }

    public static int GetIconId(SaintCoinach.Imaging.ImageFile icon)
    {
      return int.Parse(System.IO.Path.GetFileNameWithoutExtension(icon.Path));
    }

    static void ExtractNpcs(Localize localize, ARealmReversed realm)
    {
      JObject npcs = JObject.Parse(File.ReadAllText(@"..\..\..\..\xivapi\output\npcs.json"));
      JObject res = new JObject();
      var sheet = realm.GameData.GetSheet<ENpcResident>();
      foreach (var npc in sheet)
      {
        JObject npcData = localize.Strings(npc, "Singular");
        if (npcData != null)
        {
          npcData.Add("position", npcs.GetValue(npc.Key.ToString()));
          res.Add(npc.Key.ToString(), npcData);
        }
      }
      File.WriteAllText(AppDomain.CurrentDomain.BaseDirectory + BASE_ANGULAR_PATH + "src\\app\\core\\data\\sources\\npcs.json", res.ToString(Newtonsoft.Json.Formatting.Indented));
    }

    static void ExtractAetheryteNames(Localize localize, ARealmReversed realm)
    {
      JArray aetherytes = JArray.Parse(File.ReadAllText(@"..\..\..\..\xivapi\output\aetherytes.json"));
      JArray res = new JArray();
      var sheet = realm.GameData.GetSheet("Aetheryte");
      foreach (var row in aetherytes)
      {
        JObject jRow = row.Value<JObject>();
        jRow.Add("nameid", ((SaintCoinach.Xiv.PlaceName)sheet[Int32.Parse(jRow.GetValue("id").ToString())]["PlaceName"]).Key);
        res.Add(row);
      }
      WriteTypescript(AppDomain.CurrentDomain.BaseDirectory + BASE_ANGULAR_PATH + "src\\app\\core\\data\\sources\\aetherytes.ts", "aetherytes", res);
    }

    static void ExtractNodesPosition(IEnumerable<GatheringPoint> rows)
    {
      JObject positions = JObject.Parse(File.ReadAllText(@"..\..\..\..\xivapi\output\nodes-position.json"));
      JObject res = new JObject();
      foreach (var row in rows)
      {
        if (positions.GetValue(row.Key.ToString()) != null && res.GetValue(row.Base.Key.ToString()) == null && row.TerritoryType != null)
        {
          JToken nodeInformations = positions.GetValue(row.Key.ToString());
          JObject node = new JObject();
          node.Merge(nodeInformations);
          JArray items = new JArray();
          foreach (var item in row.Base.Items)
          {
            if (item.Key > 0)
            {
              items.Add(item.Item.Key);
            }
          }
          node.Add("level", row.Base.GatheringLevel);
          node.Add("type", row.Base.Type.Key);
          node.Add("items", items);
          res.Add(row.Base.Key.ToString(), node);
        }
      }
      File.WriteAllText(AppDomain.CurrentDomain.BaseDirectory + BASE_ANGULAR_PATH + "src\\app\\core\\data\\sources\\node-positions.json", res.ToString(Newtonsoft.Json.Formatting.Indented));
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
          res.Add("draft" + draft.Key.ToString(), itemName);
        }
      }
      string json = Regex.Replace(res.ToString(Newtonsoft.Json.Formatting.Indented), "(\"(?:[^\"\\\\]|\\\\.)*\")|\\s+", "$1");
      File.WriteAllText(AppDomain.CurrentDomain.BaseDirectory + BASE_ANGULAR_PATH + "src\\app\\core\\data\\sources\\items.json", json);
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
      string json = Regex.Replace(res.ToString(Newtonsoft.Json.Formatting.Indented), "(\"(?:[^\"\\\\]|\\\\.)*\")|\\s+", "$1");
      File.WriteAllText(AppDomain.CurrentDomain.BaseDirectory + BASE_ANGULAR_PATH + "src\\app\\core\\data\\sources\\mobs.json", json);
    }

    static void ExtractVentureNames(Localize localize, ARealmReversed realm)
    {
      JObject res = new JObject();
      foreach (var task in realm.GameData.GetSheet<RetainerTask>())
      {
        if (task.Task is RetainerTaskNormal)
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
      string json = Regex.Replace(res.ToString(Newtonsoft.Json.Formatting.Indented), "(\"(?:[^\"\\\\]|\\\\.)*\")|\\s+", "$1");
      File.WriteAllText(AppDomain.CurrentDomain.BaseDirectory + BASE_ANGULAR_PATH + "src\\app\\core\\data\\sources\\ventures.json", json);

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
      string json = Regex.Replace(res.ToString(Newtonsoft.Json.Formatting.Indented), "(\"(?:[^\"\\\\]|\\\\.)*\")|\\s+", "$1");
      File.WriteAllText(AppDomain.CurrentDomain.BaseDirectory + BASE_ANGULAR_PATH + "src\\app\\core\\data\\sources\\" + fileName + ".json", json);
    }

    static void WriteTypescript(string path, string contentName, JToken content)
    {
      var contentString = "export const " + contentName + " = " + content.ToString(Newtonsoft.Json.Formatting.Indented);
      File.WriteAllText(path, contentString);
    }
  }
}
