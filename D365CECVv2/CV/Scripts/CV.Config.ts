/// <reference path="cv.connectorcontrol.ts" />
/// <reference path="cv.options.ts" />
/// <reference path="cv.helper.ts" />

namespace CV {
    /**
    * コンフィグ情報を格納するクラス
    * @class
    */
    export class Config {
        /**
        * このコンフィグのIDとなるものの文字列。CRMレコードではないので、自由に付けてよい。
        * @property
        */
        ID: string;
        /**
        * このコンフィグの内容を説明するユーザー向けの文字列
        * @property
        */
        Description: string;
        /**
        * カードレイアウトを保存／読み込みする機能を利用するかしないかのフラグ
        * @property
        */
        CardsLayoutEnabled: boolean;
        /**
        * カードレイアウトを保存する際の既定の説明文字列
        * @property
        */
        DefaultCardsLayoutDescription: string;
        /**
        * デフォルトのコンフィグであるかどうかのフラグ。複数のConfigを持つConfigSet内でどれが既定であるかを示す。
        * @property
        */
        IsDefault: boolean;
        /**
        * 対象とする「つながり」レコードを表示するエンティティを指定する。
        * ここに指定したエンティティ間のつながりレコードのみ表示する。
        * 例："contact"
        */
        EntitiesForConnectionList: string[];
        /**
        * 対象とする「1:N関連付け」、「N:1関連付け」あるいは「N:N関連付け」を指定する。
        * 文字列として、「スキーマ名」にて指定する。
        * 例："contact_customer_accounts"
        * N:1関連付け名は、1側のエンティティからみても、N側のエンティティから見ても、同一（同じスキーマ名）の関連付けである。
        */
        RelationshipSchemaNameList: string[];
        /**
        * カードスタイル
        */
        CardStyle: CardStyleEnum;
        /**
        * 「遠くのカードのサイズを小さく表示する」機能を有効化するかどうかを指定する。
        * カードスタイルがCircleの場合のみ、trueに指定することが有効。
        */
        SmallerSizeEnabled: boolean;
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
        constructor(id: string, description: string, cardStyle: CardStyleEnum = CardStyleEnum.Circle, smallerSizeEnabled: boolean, cardsLayoutEnabled: boolean, defaultCardsLayoutDescription: string = "カードレイアウト", isDefault: boolean, entitiesForConnectionList: string[], relationshipSchemaNameList: string[]) {
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
        static initConfigWithOptions(configSet: ConfigSet): Config {
            try {
                let userOptions = CV.Options.getUserOptions();
                if (userOptions) {
                    // ①
                    // Config IDを元に、Configのインスタンスを取得する。
                    for (let i = 0; i < CV.connectionViewer.configSet.ConfigArray.length; i++) {
                        let config = CV.connectionViewer.configSet.ConfigArray[i];
                        if (config.ID == userOptions.ConfigID) {
                            return config;
                        }
                    }
                }
                // ②
                for (let i = 0; i < CV.connectionViewer.configSet.ConfigArray.length; i++) {
                    let config = CV.connectionViewer.configSet.ConfigArray[i];
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
        }
        /**
        * 与えられたConfigSetを解析して、既定のConfigとみなされるConfigを1つ返す。そのロジックは以下の通り。
        * ①与えられたConfigSetの中から、デフォルトフラグのついている（複数あればそのうちの最初の）Configインスタンスを返す。
        * さもなければ、②与えられたConfigSetの最初のConfigインスタンスを返す。
        * さもなければ、③プログラムでハードコードされた既定のConfigインスタンスを返す。
        * @function
        * @return コンフィグ情報。
        */
        static getCurrentDefaultConfig(configSet: ConfigSet): Config {
            // ①
            for (let i = 0; i < CV.connectionViewer.configSet.ConfigArray.length; i++) {
                let config = CV.connectionViewer.configSet.ConfigArray[i];
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
        }
        /**
        * デフォルトのコンフィグ情報を返す。
        * @return デフォルトのコンフィグのインスタンス。営業部門向け。
        */
        static getDefaultConfig(): Config {
            let id = "Sales";
            let description = "営業部門向けのコンフィグです。取引先企業と取引先担当者、およびつながりレコードとして営業案件が対象です。";
            let cardStyle = CardStyleEnum.Circle;
            let smallerSizeEnabled = true;
            let cardsLayoutEnabled = true;
            let defaultCardsLayoutDescription = "営業部門向けのカードレイアウト";
            let isDefault = true;
            /*
            * つながりレコードの対象とするエンティティ名を指定する。
            */
            let entitiesForConnectionList = [
                "account"
                , "contact"
                , "opportunity"
            ];
            /*
            * 関連付けのスキーマ名を指定する。
            */
            let relationshipSchemaNameList = [
                "contact_customer_accounts",
                "account_parent_account"
            ];

            return new Config(id, description, cardStyle, smallerSizeEnabled, cardsLayoutEnabled, defaultCardsLayoutDescription, isDefault, entitiesForConnectionList, relationshipSchemaNameList);
        }
        /**
        * 営業部門向けのRectangleスタイルのコンフィグ情報を返す。
        * @return 営業部門向けのRectangleスタイルのコンフィグのインスタンス
        */
        static getDefaultConfigForSalesRectangle(): Config {
            let id = "SalesRectangle";
            let description = "営業部門向けのRectangleスタイルのコンフィグです。取引先企業と取引先担当者、およびつながりレコードとして営業案件が対象です。";
            let cardStyle = CardStyleEnum.Rectangle;
            let smallerSizeEnabled = false;
            let cardsLayoutEnabled = true;
            let defaultCardsLayoutDescription = "営業部門向けのカードレイアウト";
            let isDefault = true;
            /*
            * つながりレコードの対象とするエンティティ名を指定する。
            */
            let entitiesForConnectionList = [
                "account"
                , "contact"
                , "opportunity"
            ];
            /*
            * 関連付けのスキーマ名を指定する。
            */
            let relationshipSchemaNameList = [
                "contact_customer_accounts",
                "account_parent_account"
            ];

            return new Config(id, description, cardStyle, smallerSizeEnabled, cardsLayoutEnabled, defaultCardsLayoutDescription, isDefault, entitiesForConnectionList, relationshipSchemaNameList);
        }
        /**
        * サービス部門向けのデフォルトのコンフィグ情報を返す。
        * @return サービス部門向けのデフォルトのコンフィグのインスタンス
        */
        static getDefaultConfigForService(): Config {
            let id = "Service";
            let description = "サービス部門向けのコンフィグです。取引先企業、取引先担当者およびサポート案件が対象です。";
            let cardStyle = CardStyleEnum.Circle;
            let smallerSizeEnabled = true;
            let cardsLayoutEnabled = true;
            let defaultCardsLayoutDescription = "サービス部門向けのカードレイアウト";
            let isDefault = false;
            let entitiesForConnectionList = [
                "account"
                , "contact"
                , "incident"
            ];
            /*
            * 関連付けのスキーマ名を指定する。
            */
            let relationshipSchemaNameList = [
                "contact_customer_accounts",
                "account_parent_account",
                "incident_customer_accounts"
            ];

            return new Config(id, description, cardStyle, smallerSizeEnabled, cardsLayoutEnabled, defaultCardsLayoutDescription, isDefault, entitiesForConnectionList, relationshipSchemaNameList);
        }
        /**
        * 有効なコンフィグ情報を保持しているかどうかをチェックする。問題があったらその内容を含むエラーをthrowする。
        * @function
        * @return 有効と判断したらtrueを返す。
        */
        static validate(configToCheck: Config): boolean {
            if (!configToCheck.ID) throw new Error("IDがありません。");
            if (!configToCheck.EntitiesForConnectionList) throw new Error("EntitiesForConnectionListがありません。");
            if (!configToCheck.RelationshipSchemaNameList) throw new Error("RelationshipSchemaNameListがありません。");
            
            return true;
        }
    }
    /**
    * カードスタイルの選択肢
    * @enum
    */
    export enum CardStyleEnum { Circle = 0, Rectangle = 1 };
    /**
    * カードスタイルの選択肢
    * enum にすると JSON の stringfy() する際に問題がある。
    */
}
