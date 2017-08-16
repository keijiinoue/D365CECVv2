/// <reference path="cv.connectorcontrol.ts" />
/// <reference path="cv.options.ts" />
/// <reference path="cv.helper.ts" />


namespace CV {
    /**
    * Web API から取得した CRM レコードを表すクラスで、扱いやすいようにいくつかのプロパティを追加している。
    * @class
    */
    export class WebAPIRecord {
        /**
        * エンティティセット名。小文字"accounts"など。
        * @property
        */
        EntitySetName: string;
        /**
        * Web API から取得した CRM 上のレコードを表す生データの Object データ。Entity。
        * @property
        */
        EntityRecord: Object;
        /**
        * コンストラクタ
        * @constructor
        */
        public constructor(entitySetName: string, entityRecord: Object) {
            if (!entitySetName) {
                throw new Error("entitySetName が値を持っていません。CV.WebAPIRecord コンストラクタにて。");
            }
            if (!entityRecord) {
                throw new Error("EntityRecord が値を持っていません。CV.WebAPIRecord コンストラクタにて。");
            }
            this.EntitySetName = entitySetName;
            this.EntityRecord = entityRecord;
        }
        /*
        * Web API で1件の CRM レコードを返すリクエストのレスポンスの生データを JSON.parse した直後の Object から、
        * 新規の1つの WebAPIRecord インスタンスを作成して返す。
        */
        static CreateWebAPIRecordSingle(requestResponseSingle: Object): WebAPIRecord {
            try {
                let odataContext = requestResponseSingle["@odata.context"];
                let entitySetName = CV.WebAPIRecord.getEntitySetNameFromOdataContext(odataContext);
                let entityRecord = requestResponseSingle;

                return new WebAPIRecord(entitySetName, entityRecord);
            } catch (e) {
                        
                        Helper.addErrorMessageln("CV.WebAPIRecord.CreateWebAPIRecordSingle にてエラーが発生しました。" + e.message);
            }
        }
        /*
        * Web API で複数件の CRM レコードを返すリクエストのレスポンスの生データを JSON.parse した直後の Object から、
        * 新規の複数の WebAPIRecord インスタンスを作成して返す。
        */
        static CreateWebAPIRecordMultiple(requestResponseMultiple: Object): WebAPIRecord[] {
            let odataContext = requestResponseMultiple["@odata.context"];
            let entitySetName =  CV.WebAPIRecord.getEntitySetNameFromOdataContext(odataContext);
            let records = requestResponseMultiple["value"];
            let webAPIRecords: WebAPIRecord[] = [];
            for (let i = 0; i < records.length; i++) {
                let entityRecord = records[i];
                webAPIRecords.push(new WebAPIRecord(entitySetName, entityRecord));
            }
            return webAPIRecords;
        }
        /*
        * 以下のような Web API のレスポンス内の @odata.context の値の文字列から、エンティティセット名を返す。
        * "@odata.context":"https://yourcrminstance.crm7.dynamics.com/api/data/v8.1/$metadata#accounts"
        *   ⇒ "accounts" を返す
        * "@odata.context":"https://yourcrminstance.crm7.dynamics.com/api/data/v8.2/$metadata#contacts(cont…name,parentcustomerid_account,parentcustomerid_account(accountid))/$entity"
        *   ⇒ "contacts" を返す
        * "@odata.context":"https://yourcrminstance.crm7.dynamics.com/api/data/v8.1/$metadata#accounts/$entity"
        *   ⇒ "accounts" を返す
        */
        private static getEntitySetNameFromOdataContext(odataContext: string): string {
            return odataContext.split(/\$metadata#/)[1].split(/\(|\//)[0];
        }
        // 引数は本来 cv ほど大きなものでないべきなのだろう
        getEntityLogicalName(cv: CV.ConnectionViewer): string {
            let entityLogicalName = cv.EntityLogicalNameKeyIsEntitySetName[this.EntitySetName];
            if (!entityLogicalName) throw new Error("エンティティセット名 '" + this.EntitySetName + "' から対応するエンティティロジカル名を取得できません。");
            return entityLogicalName;
        }
        // 引数は本来 cv ほど大きなものでないべきなのだろう
        getId(cv: CV.ConnectionViewer): string {
            try {
                let entityLogicalName = this.getEntityLogicalName(cv);
                let primaryIdAttributeName = cv.EntityMetadataCacheKeyIsEntityLogicalName[entityLogicalName].PrimaryIdAttribute;
                return this.EntityRecord[primaryIdAttributeName];
            } catch (e) {
                        
                        Helper.addErrorMessageln(e.message);
            }
        }
    }
}
