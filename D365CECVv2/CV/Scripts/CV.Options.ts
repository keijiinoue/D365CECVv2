/// <reference path="cv.connectorcontrol.ts" />
/// <reference path="cv.helper.ts" />

namespace CV {
    /**
    * ユーザーによるオプションを管理するためのユーティリティクラス
    * ユーザーオプションの設定は、ブラウザの localStorage に格納する。HTML5対応のブラウザである必要がある。
    * なお、Config情報は、keyが"CV.Config"で格納する。
    * @class
    */
    export class Options {
        static ConfigString = "CV.Config";
        /**
        * ConfigのID
        * @property
        */
        ConfigID: string;
        /**
        * コンストラクタ
        * @constructor
        */
        constructor(configID: string) {
            this.ConfigID = configID;
        }
        /**
        * オプション設定のすべてのプロパティを、ソースからターゲットにコピーする
        * @function
        * @param source ソースのオプション設定
        * @param target ターゲットのオプション設定
        */
        static copyAllProperties(source: Options, target: Options): void {
            target.ConfigID = source.ConfigID; // 文字列なので値をコピーして渡すのである。
        }
        /**
        * ユーザーによるオプション設定をlocalStorageから取得する。取得できなければnullを返す。
        * @function
        */
        static getUserOptions(): Options {
            if (typeof (localStorage) !== 'undefined' && Options.ConfigString in localStorage) {
                try {
                    return JSON.parse(localStorage[Options.ConfigString]);
                } catch (error){
                    return null;
                }
            } else {
                return null;
            }
        }
        /**
        * ユーザーによるオプション設定をlocalStorageに保存する。エラーが発生すればnullを返す。
        * @function
        */
        static setUserOptions(options: Options): Options {
            try {
                localStorage.setItem(Options.ConfigString, JSON.stringify(options));
            } catch (error) {
                return null;
            }
            return options;
        }
    }
}

