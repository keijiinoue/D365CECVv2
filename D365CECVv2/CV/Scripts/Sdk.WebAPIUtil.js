"use strict";
// Dynnamics 365 (CRM) SDK v8.2.1.1 に付属のサンプル WebAPIQuery.js をデバッグして修正している。// tester 部分

//var Sdk = window.Sdk || {};
// tester
var WebAPI = window.WebAPI || {};
/**
 * @function getClientUrl 
 * @description Get the client URL.
 * @returns {string} The client URL.
 */
// Sdk.getClientUrl = function () {
// tester
WebAPI.getClientUrl = function () {
    var context;
    // GetGlobalContext defined by including reference to 
    // ClientGlobalContext.js.aspx in the HTML page.
    if (typeof GetGlobalContext !== "undefined")
    { context = GetGlobalContext(); }
    else {
        if (typeof Xrm !== "undefined") {
            // Xrm.Page.context defined within the Xrm.Page object model for form scripts.
            context = Xrm.Page.context;
        }
        // tester
        else if (typeof parent.Xrm !== "undefined") {
            context = parent.Xrm.Page.context;
        }
        else {
            // tester
            return document.location.origin;
            //throw new Error("Context is not available.");
        }
    }
    return context.getClientUrl();
}

// Global variables.
var clientUrl = WebAPI.getClientUrl();     // e.g.: https://org.crm.dynamics.com
var webAPIPath = "/api/data/v8.1";      // Path to the web API.

/**
 * @function request
 * @description Generic helper function to handle basic XMLHttpRequest calls.
 * @param {string} action - The request action. String is case-sensitive.
 * @param {string} uri - An absolute or relative URI. Relative URI starts with a "/".
 * @param {object} data - An object representing an entity. Required for create and update action.
 * @param {boolean} formattedValue - If "true" then include formatted value; "false" otherwise.
 *    For more info on formatted value, see:
 *    https://msdn.microsoft.com/en-us/library/gg334767.aspx#bkmk_includeFormattedValues
 * @param {number} maxPageSize - Indicate the page size. Default is 10 if not defined.
 * @param {string} _webAPIPath - "/api/data/v8.1" や "/api/data/v8.2" という Web API 用のパス。Web API のバージョンを指定しているはず。 // tester
 * @returns {Promise} - A Promise that returns either the request object or an error object.
 */
// tester
//Sdk.request = function (action, uri, data, formattedValue, maxPageSize) {
WebAPI.request = function (action, uri, data, formattedValue, maxPageSize, _webAPIPath) {
    if (!RegExp(action, "g").test("POST PATCH PUT GET DELETE")) { // Expected action verbs.
        throw new Error("Sdk.request: action parameter must be one of the following: " +
            "POST, PATCH, PUT, GET, or DELETE.");
    }
    if (!typeof uri === "string") {
        throw new Error("Sdk.request: uri parameter must be a string.");
    }
    if ((RegExp(action, "g").test("POST PATCH PUT")) && (data === null || data === undefined)) {
        throw new Error("Sdk.request: data parameter must not be null for operations that create or modify data.");
    }
    if (maxPageSize === null || maxPageSize === undefined) {
        //maxPageSize = 10; // Default limit is 10 entities per page.
        // tester
        maxPageSize = 5000;
    }

    // Construct a fully qualified URI if a relative URI is passed in.
    if (uri.charAt(0) === "/") {
        uri = clientUrl + ((_webAPIPath != null) ? _webAPIPath : webAPIPath) + uri;
    }

    return new Promise(function (resolve, reject) {
        var request = new XMLHttpRequest();
        request.open(action, encodeURI(uri), true);
        request.setRequestHeader("OData-MaxVersion", "4.0");
        request.setRequestHeader("OData-Version", "4.0");
        request.setRequestHeader("Accept", "application/json");
        request.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        if (action == "GET") request.setRequestHeader("Prefer", "odata.maxpagesize=" + maxPageSize); // tester
        if (action == "GET" && formattedValue) { // tester
            request.setRequestHeader("Prefer",
                "odata.include-annotations=OData.Community.Display.V1.FormattedValue");
        }
        request.onreadystatechange = function () {
            if (this.readyState === 4) {
                request.onreadystatechange = null;
                switch (this.status) {
                    case 200: // Success with content returned in response body.
                    case 204: // Success with no content returned in response body.
                        resolve(this);
                        break;
                    default: // All other statuses are unexpected so are treated like errors.
                        var error;
                        try {
                            error = JSON.parse(request.response).error;
                        } catch (e) {
                            error = new Error("Unexpected Error");
                        }
                        reject(error);
                        break;
                }
            }
        };
        request.send(JSON.stringify(data));
    });
};
