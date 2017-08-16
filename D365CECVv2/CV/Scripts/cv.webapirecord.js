/// <reference path="cv.connectorcontrol.ts" />
/// <reference path="cv.options.ts" />
/// <reference path="cv.helper.ts" />
var CV;
(function (CV) {
    /**
    * Web API から取得した CRM レコードを表すクラスで、扱いやすいようにいくつかのプロパティを追加している。
    * @class
    */
    var WebAPIRecord = (function () {
        /**
        * コンストラクタ
        * @constructor
        */
        function WebAPIRecord(entitySetName, entityRecord) {
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
        WebAPIRecord.CreateWebAPIRecordSingle = function (requestResponseSingle) {
            try {
                var odataContext = requestResponseSingle["@odata.context"];
                var entitySetName = CV.WebAPIRecord.getEntitySetNameFromOdataContext(odataContext);
                var entityRecord = requestResponseSingle;
                return new WebAPIRecord(entitySetName, entityRecord);
            }
            catch (e) {
                CV.Helper.addErrorMessageln("CV.WebAPIRecord.CreateWebAPIRecordSingle にてエラーが発生しました。" + e.message);
            }
        };
        /*
        * Web API で複数件の CRM レコードを返すリクエストのレスポンスの生データを JSON.parse した直後の Object から、
        * 新規の複数の WebAPIRecord インスタンスを作成して返す。
        */
        WebAPIRecord.CreateWebAPIRecordMultiple = function (requestResponseMultiple) {
            var odataContext = requestResponseMultiple["@odata.context"];
            var entitySetName = CV.WebAPIRecord.getEntitySetNameFromOdataContext(odataContext);
            var records = requestResponseMultiple["value"];
            var webAPIRecords = [];
            for (var i = 0; i < records.length; i++) {
                var entityRecord = records[i];
                webAPIRecords.push(new WebAPIRecord(entitySetName, entityRecord));
            }
            return webAPIRecords;
        };
        /*
        * 以下のような Web API のレスポンス内の @odata.context の値の文字列から、エンティティセット名を返す。
        * "@odata.context":"https://yourcrminstance.crm7.dynamics.com/api/data/v8.1/$metadata#accounts"
        *   ⇒ "accounts" を返す
        * "@odata.context":"https://yourcrminstance.crm7.dynamics.com/api/data/v8.2/$metadata#contacts(cont…name,parentcustomerid_account,parentcustomerid_account(accountid))/$entity"
        *   ⇒ "contacts" を返す
        * "@odata.context":"https://yourcrminstance.crm7.dynamics.com/api/data/v8.1/$metadata#accounts/$entity"
        *   ⇒ "accounts" を返す
        */
        WebAPIRecord.getEntitySetNameFromOdataContext = function (odataContext) {
            return odataContext.split(/\$metadata#/)[1].split(/\(|\//)[0];
        };
        // 引数は本来 cv ほど大きなものでないべきなのだろう
        WebAPIRecord.prototype.getEntityLogicalName = function (cv) {
            var entityLogicalName = cv.EntityLogicalNameKeyIsEntitySetName[this.EntitySetName];
            if (!entityLogicalName)
                throw new Error("エンティティセット名 '" + this.EntitySetName + "' から対応するエンティティロジカル名を取得できません。");
            return entityLogicalName;
        };
        // 引数は本来 cv ほど大きなものでないべきなのだろう
        WebAPIRecord.prototype.getId = function (cv) {
            try {
                var entityLogicalName = this.getEntityLogicalName(cv);
                var primaryIdAttributeName = cv.EntityMetadataCacheKeyIsEntityLogicalName[entityLogicalName].PrimaryIdAttribute;
                return this.EntityRecord[primaryIdAttributeName];
            }
            catch (e) {
                CV.Helper.addErrorMessageln(e.message);
            }
        };
        return WebAPIRecord;
    }());
    CV.WebAPIRecord = WebAPIRecord;
})(CV || (CV = {}));
//# sourceMappingURL=cv.webapirecord.js.map