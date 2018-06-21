using Newtonsoft.Json.Linq;
using SaintCoinach;
using SaintCoinach.Ex;
using SaintCoinach.Text;
using SaintCoinach.Xiv;
using System;

namespace Extractor
{
    public class Localize
    {
        private ARealmReversed _realm;
        private readonly XivCollection _data;
        private readonly Tuple<string, Language>[] _langs;

        public Localize(ARealmReversed realm)
        {
            _realm = realm;
            _data = realm.GameData;
            _langs = new Tuple<string, Language>[]
            {
                Tuple.Create(Language.English.GetCode(), Language.English),
                Tuple.Create(Language.Japanese.GetCode(), Language.Japanese),
                Tuple.Create(Language.German.GetCode(), Language.German),
                Tuple.Create(Language.French.GetCode(), Language.French)
            };
        }

        public JObject Strings(IXivRow row, Func<XivString, string> transform, string col)
        {
            JObject obj = new JObject();
            var currentLang = _data.ActiveLanguage;

            foreach (var langTuple in _langs)
            {
                var code = langTuple.Item1;
                var lang = langTuple.Item2;
                _data.ActiveLanguage = lang;
                if(row[col].ToString().Length == 0)
                {
                    return null;
                }
                obj[code] = transform == null ? (row[col].ToString()) : transform((XivString)row[col]);
            }

            _data.ActiveLanguage = currentLang;

            return obj;
        }

        public JObject Strings(IXivRow row, string col)
        {
            return Strings(row, res =>
            {
                return Capitalize(res.ToString()
                    .Replace("<Emphasis>", "")
                    .Replace("</Emphasis>", "")
                    .Replace("<SoftHyphen/>", "")
                    .Replace("</Indent>", ""));
            }
            , col);
        }

        public string Capitalize(string str)
        {
            var characters = str.ToCharArray();
            characters[0] = char.ToUpper(characters[0]);
            return new string(characters);
        }

        public void Column(JObject obj, IXivRow row, Func<XivString, string> transform, string fromColumn, string toColumn)
        {
            var currentLang = _data.ActiveLanguage;

            foreach (var langTuple in _langs)
            {
                var code = langTuple.Item1;
                var lang = langTuple.Item2;
                _data.ActiveLanguage = lang;

                if (!obj.TryGetValue(code, out var strs))
                    obj[code] = strs = new JObject();

                var value = row[fromColumn];
                if (value is XivString && string.IsNullOrEmpty((XivString)value))
                    continue;

                strs[toColumn] = transform == null ? (value.ToString()) : transform((XivString)value);
            }

            _data.ActiveLanguage = currentLang;
        }
    }
}
