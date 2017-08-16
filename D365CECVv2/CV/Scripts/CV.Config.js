/// <reference path="cv.connectorcontrol.ts" />
/// <reference path="cv.options.ts" />
/// <reference path="cv.helper.ts" />
var CV;
(function (CV) {
    /**
    * コンフィグ情報を格納するクラス
    * @class
    */
    var Config = (function () {
        /**
        * 対象とする情報を指定するコンストラクタ
        * つながりデータ、1:N、N:1およびN:Nの関連付けに対応している。
        * @constructor
        * @param id このコンフィグのIDとなるものの文字列
        * @param description コンフィグの内容を説明するユーザー向けの文字列
        * @param cardStyle このコンフィグで採用するカードスタイル。デフォルトは
        * @param cardsLayoutEnabled カードレイアウトを保存／読み込みする機能を利用するかしないかのフラグ
        * @param entitiesForConnectionList つながりデータの対象とするエンティティの配列
        * @param relationshipSchemaNameList 関連データの対象とするスキーマ名の配列。
        */
        function Config(id, description, cardStyle, smallerSizeEnabled, cardsLayoutEnabled, defaultCardsLayoutDescription, isDefault, entitiesForConnectionList, relationshipSchemaNameList) {
            if (cardStyle === void 0) { cardStyle = CardStyleEnum.Circle; }
            if (defaultCardsLayoutDescription === void 0) { defaultCardsLayoutDescription = "カードレイアウト"; }
            this.ID = id;
            this.Description = description;
            this.CardStyle = cardStyle;
            this.SmallerSizeEnabled = smallerSizeEnabled;
            this.CardsLayoutEnabled = cardsLayoutEnabled;
            this.DefaultCardsLayoutDescription = defaultCardsLayoutDescription;
            this.IsDefault = isDefault;
            this.EntitiesForConnectionList = entitiesForConnectionList;
            this.RelationshipSchemaNameList = relationshipSchemaNameList;
        }
        /**
        * 有効なConfigを1つ返す。そのロジックは以下の通り。
        * ①ユーザーオプションとしてブラウザに保存されているConfigのIDがあれば、そのConfigのIDに対応するConfigインスタンスを返す。
        * さもなければ、②与えられたConfigSetの中から、デフォルトフラグのついている（複数あればそのうちの最初の）Configインスタンスを返す。
        * さもなければ、③与えられたConfigSetの最初のConfigインスタンスを返す。
        * さもなければ、④プログラムでハードコードされた既定のConfigインスタンスを返す。
        * なお、ここでどのConfig情報が返されようと、ユーザーオプションを更新しない。
        * @function
        * @return コンフィグ情報。エラーが発生したら null を返す。
        */
        Config.initConfigWithOptions = function (configSet) {
            try {
                var userOptions = CV.Options.getUserOptions();
                if (userOptions) {
                    // ①
                    // Config IDを元に、Configのインスタンスを取得する。
                    for (var i = 0; i < CV.connectionViewer.configSet.ConfigArray.length; i++) {
                        var config = CV.connectionViewer.configSet.ConfigArray[i];
                        if (config.ID == userOptions.ConfigID) {
                            return config;
                        }
                    }
                }
                // ②
                for (var i = 0; i < CV.connectionViewer.configSet.ConfigArray.length; i++) {
                    var config = CV.connectionViewer.configSet.ConfigArray[i];
                    if (config.IsDefault) {
                        return config;
                    }
                }
                // ③
                if (0 < CV.connectionViewer.configSet.ConfigArray.length) {
                    return CV.connectionViewer.configSet.ConfigArray[0];
                }
                // ④
                return Config.getDefaultConfig();
            }
            catch (e) {
                return null;
            }
        };
        /**
        * 与えられたConfigSetを解析して、既定のConfigとみなされるConfigを1つ返す。そのロジックは以下の通り。
        * ①与えられたConfigSetの中から、デフォルトフラグのついている（複数あればそのうちの最初の）Configインスタンスを返す。
        * さもなければ、②与えられたConfigSetの最初のConfigインスタンスを返す。
        * さもなければ、③プログラムでハードコードされた既定のConfigインスタンスを返す。
        * @function
        * @return コンフィグ情報。
        */
        Config.getCurrentDefaultConfig = function (configSet) {
            // ①
            for (var i = 0; i < CV.connectionViewer.configSet.ConfigArray.length; i++) {
                var config = CV.connectionViewer.configSet.ConfigArray[i];
                if (config.IsDefault) {
                    return config;
                }
            }
            // ②
            if (0 < CV.connectionViewer.configSet.ConfigArray.length) {
                return CV.connectionViewer.configSet.ConfigArray[0];
            }
            // ③
            return Config.getDefaultConfig();
        };
        /**
        * デフォルトのコンフィグ情報を返す。
        * @return デフォルトのコンフィグのインスタンス。営業部門向け。
        */
        Config.getDefaultConfig = function () {
            var id = "Sales";
            var description = "営業部門向けのコンフィグです。取引先企業と取引先担当者、およびつながりレコードとして営業案件が対象です。";
            var cardStyle = CardStyleEnum.Circle;
            var smallerSizeEnabled = true;
            var cardsLayoutEnabled = true;
            var defaultCardsLayoutDescription = "営業部門向けのカードレイアウト";
            var isDefault = true;
            /*
            * つながりレコードの対象とするエンティティ名を指定する。
            */
            var entitiesForConnectionList = [
                "account",
                "contact",
                "opportunity"
            ];
            /*
            * 関連付けのスキーマ名を指定する。
            */
            var relationshipSchemaNameList = [
                "contact_customer_accounts",
                "account_parent_account"
            ];
            return new Config(id, description, cardStyle, smallerSizeEnabled, cardsLayoutEnabled, defaultCardsLayoutDescription, isDefault, entitiesForConnectionList, relationshipSchemaNameList);
        };
        /**
        * 営業部門向けのRectangleスタイルのコンフィグ情報を返す。
        * @return 営業部門向けのRectangleスタイルのコンフィグのインスタンス
        */
        Config.getDefaultConfigForSalesRectangle = function () {
            var id = "SalesRectangle";
            var description = "営業部門向けのRectangleスタイルのコンフィグです。取引先企業と取引先担当者、およびつながりレコードとして営業案件が対象です。";
            var cardStyle = CardStyleEnum.Rectangle;
            var smallerSizeEnabled = false;
            var cardsLayoutEnabled = true;
            var defaultCardsLayoutDescription = "営業部門向けのカードレイアウト";
            var isDefault = true;
            /*
            * つながりレコードの対象とするエンティティ名を指定する。
            */
            var entitiesForConnectionList = [
                "account",
                "contact",
                "opportunity"
            ];
            /*
            * 関連付けのスキーマ名を指定する。
            */
            var relationshipSchemaNameList = [
                "contact_customer_accounts",
                "account_parent_account"
            ];
            return new Config(id, description, cardStyle, smallerSizeEnabled, cardsLayoutEnabled, defaultCardsLayoutDescription, isDefault, entitiesForConnectionList, relationshipSchemaNameList);
        };
        /**
        * サービス部門向けのデフォルトのコンフィグ情報を返す。
        * @return サービス部門向けのデフォルトのコンフィグのインスタンス
        */
        Config.getDefaultConfigForService = function () {
            var id = "Service";
            var description = "サービス部門向けのコンフィグです。取引先企業、取引先担当者およびサポート案件が対象です。";
            var cardStyle = CardStyleEnum.Circle;
            var smallerSizeEnabled = true;
            var cardsLayoutEnabled = true;
            var defaultCardsLayoutDescription = "サービス部門向けのカードレイアウト";
            var isDefault = false;
            var entitiesForConnectionList = [
                "account",
                "contact",
                "incident"
            ];
            /*
            * 関連付けのスキーマ名を指定する。
            */
            var relationshipSchemaNameList = [
                "contact_customer_accounts",
                "account_parent_account",
                "incident_customer_accounts"
            ];
            return new Config(id, description, cardStyle, smallerSizeEnabled, cardsLayoutEnabled, defaultCardsLayoutDescription, isDefault, entitiesForConnectionList, relationshipSchemaNameList);
        };
        /**
        * 有効なコンフィグ情報を保持しているかどうかをチェックする。問題があったらその内容を含むエラーをthrowする。
        * @function
        * @return 有効と判断したらtrueを返す。
        */
        Config.validate = function (configToCheck) {
            if (!configToCheck.ID)
                throw new Error("IDがありません。");
            if (!configToCheck.EntitiesForConnectionList)
                throw new Error("EntitiesForConnectionListがありません。");
            if (!configToCheck.RelationshipSchemaNameList)
                throw new Error("RelationshipSchemaNameListがありません。");
            return true;
        };
        return Config;
    }());
    CV.Config = Config;
    /**
    * カードスタイルの選択肢
    * @enum
    */
    var CardStyleEnum;
    (function (CardStyleEnum) {
        CardStyleEnum[CardStyleEnum["Circle"] = 0] = "Circle";
        CardStyleEnum[CardStyleEnum["Rectangle"] = 1] = "Rectangle";
    })(CardStyleEnum = CV.CardStyleEnum || (CV.CardStyleEnum = {}));
    ;
    /**
    * カードスタイルの選択肢
    * enum にすると JSON の stringfy() する際に問題がある。
    */
})(CV || (CV = {}));
//# sourceMappingURL=CV.Config.js.map