namespace MyGeneralLibrary {
    /**
    * 新規GUIDを得る。
    * @function
    * @return {string} GUIDの文字列
    */
    export function getNewGuid(): string {
        function fourD() {
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        }
        return fourD() + fourD() + '-' + fourD() + '-' + fourD() + '-' + fourD() + '-' + fourD() + fourD() + fourD();
    }
    /**
    * WebページのURLで渡されるパラメータを解析して連想配列として返す。
    * @return パラメータの連想。エラーが発生したらnullを返す。
    */
    export function getParams(): Object {
        var params = new Array();
        var obj = {};
        if (location.search != "") {
            params = location.search.substr(1).split("&");
            for (var i in params) {
                try {
                    params[i] = params[i].replace(/\+/g, " ").split("=");
                    obj[params[i][0]] = params[i][1];
                } catch (e) {
                    return null;
                }
            }
        }

        return obj;
    }
    /**
    * CRMのWebリソースに渡されるURL内のdataパラメータを解析して連想配列として返す。
    * @return パラメータの連想。エラーが発生したらnullを返す。
    */
    export function getCRMDataParams(): Object {
        var params = new Array();
        var obj = {};
        if (location.search != "") {
            params = location.search.substr(1).split("&");
            for (var i in params) {
                try {
                    params[i] = params[i].replace(/\+/g, " ").split("=");
                    if (params[i][0].toLowerCase() == "data") {
                        var dataParams = new Array();
                        dataParams = decodeURIComponent(params[i][1]).split("&");
                        for (var i in dataParams) {
                            dataParams[i] = dataParams[i].replace(/\+/g, " ").split("=");
                            obj[dataParams[i][0]] = dataParams[i][1];
                        }
                    }
                } catch (e) {
                    return null;
                }
            }
        }

        return obj;
    }
    /**
     * 連想配列を受け取って、それらをWebぺ時のURLで渡されるパラメータとして
     * 有効な文字列として返す。
     * 例： "OrgLCID=1041&UserLCID=1041&id=%7b0683F907-720F-E711-80E8-480FCFF29761%7d&orgname=org34cba2f6&type=2&typename=contact"
     * @param obj
     */
    export function getParamsString(obj: Object): string {
        let paramsString = "";

        for (let key in obj) {
            let value = obj[key];
            if (paramsString != "") paramsString += "&";
            paramsString += key + "=" + value;
        }

        return paramsString;
    }
}