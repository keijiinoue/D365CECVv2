/// <reference path="cv.connectorcontrol.ts" />
/// <reference path="cv.options.ts" />
/// <reference path="cv.helper.ts" />
/// <reference path="cv.config.ts" />
var CV;
(function (CV) {
    /**
    * 複数のコンフィグ情報を束ねて格納するクラス。
    * ユーザーが1つのコンフィグ情報を選択できることを想定している。
    * @class
    */
    var ConfigSet = (function () {
        /**
        * コンストラクタ。もし受け取ったConfigの配列の中で、IDに重複がある場合には、エラーを投げる。
        * @constructor
        */
        function ConfigSet(configArray) {
            this.ConfigArray = configArray;
            if (!ConfigSet.checkIDUnique(configArray)) {
                throw "IDに重複があります。";
            }
        }
        /**
        * 受け取ったConfigの配列の中で、IDがユニークであること（重複がないこと）をチェックする。
        * @function
        * @return すべてユニークであればtrueを返す。
        */
        ConfigSet.checkIDUnique = function (configArray) {
            var idArray = [];
            for (var i = 0; i < configArray.length; i++) {
                var id = configArray[i].ID;
                if (0 <= idArray.indexOf(id)) {
                    // 重複あり
                    return false;
                }
                idArray.push(id);
            }
            // すべて重複なし
            return true;
        };
        /**
        * デフォルトのConfigSet情報を返す。
        * @function
        */
        ConfigSet.getDefaultConfigSet = function () {
            var configArray = [];
            configArray.push(CV.Config.getDefaultConfig());
            configArray.push(CV.Config.getDefaultConfigForSalesRectangle());
            configArray.push(CV.Config.getDefaultConfigForService());
            return new ConfigSet(configArray);
        };
        /**
        * CRMのXmlタイプのWebリソースで管理しているConfigSetを表すXml文字列を受け取って、
        * 内容を解析し、簡単なチェックをした上で、ConfigSetのインスタンスを返す。
        * エラーが発生した場合には、その説明テキストを含むエラーをthrowする。
        * @function
        * @param {string} CRMのXmlタイプのWebリソースで管理しているConfigSetを表すXml文字列。
        * @return {ConfigSet} ConfigSetのインスタンス。
        */
        ConfigSet.parseConfigSetXmlText = function (configSetXmlText) {
            var configSetToCheck;
            try {
                configSetToCheck = JSON.parse(configSetXmlText);
            }
            catch (error) {
                throw new Error("ConfigSetのJSON.parse()でエラーが発生しました。フォーマットを確認ください。");
            }
            if (!configSetToCheck.ConfigArray)
                throw new Error("ConfigSetのConfigArrayが見つかりません。");
            if (configSetToCheck.ConfigArray.length == 0)
                throw new Error("ConfigSetのConfigArrayの中身が1つも見つかりません。");
            for (var i = 0; i < configSetToCheck.ConfigArray.length; i++) {
                var configToCheck = configSetToCheck.ConfigArray[i];
                try {
                    CV.Config.validate(configToCheck);
                }
                catch (e) {
                    throw new Error("ConfigSetのConfigArrayの" + (i + 1).toString() + "つ目が有効ではありません。" + e.message);
                }
            }
            return configSetToCheck;
        };
        return ConfigSet;
    }());
    CV.ConfigSet = ConfigSet;
})(CV || (CV = {}));
//# sourceMappingURL=cv.configset.js.map