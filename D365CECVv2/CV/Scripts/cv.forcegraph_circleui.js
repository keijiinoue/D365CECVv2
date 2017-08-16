/// <reference path="CV.Config.ts" />
/// <reference path="CV.CardControl.ts" />
/// <reference path="CV.ConnectorControl.ts" />
/// <reference path="CV.Helper.ts" />
/// <reference path="CV.ConnectionViewer.ts" />
/// <reference path="../../scripts/typings/d3/d3.d.ts" />
/// <reference path="cv.forcegraph_common.ts" />
/// <reference path="typings/my.d3.d.ts" />
var CV;
(function (CV) {
    /**
    * 力学モデルで表現するオブジェクトを管理するクラス。
    * カードの描画は丸い円。
    * d3.jsのforce layoutを使用。
    * @class
    */
    var ForceGraph_CircleUI = (function () {
        /**
        * 力学モデルで表現するオブジェクトのコンストラクタ
        * @constructor
        * @param svgGForCards {string} カードを描画する領域を示すSVG内のg要素のID。#から始まる。
        * @param svgGForLines {string} つながりの線を描画する領域を示すSVG内のg要素のID。#から始まる。
        * @param svgGForConnectionDescriptions {string} つながりの説明文を描画する領域を示すSVG内のg要素のID。#から始まる。
        * @param svgGForConnectionRoles {string} つながりロールを描画する領域を示すSVG内のg要素のID。#から始まる。
        */
        function ForceGraph_CircleUI(svgGForCardsID, svgGForLinesID, svgGForConnectionDescriptions, svgGForConnectionRoles) {
            /**
            * 現在フォーカスされているカードのCRMレコードのID
            * @property
            */
            this.currentFocusedCardID = null;
            /**
            * 現在のイベント処理中のd3オブジェクト
            * @property
            */
            this.currentEventD3obj = null;
            this.force = d3.layout.force();
            this.forceList = { nodes: this.force.nodes(), links: this.force.links() };
            this.svgGForCards = d3.select(svgGForCardsID);
            this.svgGForLines = d3.select(svgGForLinesID);
            this.svgGForConnectionDescriptions = d3.select(svgGForConnectionDescriptions);
            this.svgGForConnectionRoles = d3.select(svgGForConnectionRoles);
            this.svg = d3.select("svg")
                .attr("width", window.innerWidth).attr("height", window.innerHeight);
            CV.ForceGraph_CircleUI.radius_for_l = parseInt($("#MyDefCircleL").attr("r"));
            CV.ForceGraph_CircleUI.radius_for_m = parseInt($("#MyDefCircleM").attr("r"));
            CV.ForceGraph_CircleUI.radius_for_role_l = parseInt($("#MyDefCircleL").attr("r")) + parseInt($("#MyDefCircleL").attr("stroke-width"));
            CV.ForceGraph_CircleUI.radius_for_role_m = parseInt($("#MyDefCircleM").attr("r")) + parseInt($("#MyDefCircleM").attr("stroke-width"));
            d3.select("#MySVG").attr("pointer-events", "all");
        }
        /**
        * ノードを追加する。
        * d3で扱うidの文字列は、数字で始まってはいけない可能性があり、格納するidにはprefixを付与する。
        * 引数でxとyを指定しなかった場合には、固定しない。
        * @function
        * @param nodeObj 名前とIDとiconURLとxとy。xとyは明示的に指定する場合以外はnullでよい。
        */
        ForceGraph_CircleUI.prototype.addNode = function (nodeObj) {
            if (nodeObj.x && nodeObj.y) {
                this.forceList.nodes.push({
                    name: nodeObj.name,
                    entityImage: nodeObj.entityImage,
                    id: CV.IDPrefix + nodeObj.id,
                    iconURL: nodeObj.iconURL,
                    x: nodeObj.x,
                    y: nodeObj.y,
                    fixed: nodeObj.fixed,
                    entityName: nodeObj.entityName,
                    sizeType: "L",
                    radius: CV.ForceGraph_CircleUI.radius_for_role_l
                });
            }
            else {
                this.forceList.nodes.push({
                    name: nodeObj.name,
                    entityImage: nodeObj.entityImage,
                    id: CV.IDPrefix + nodeObj.id,
                    iconURL: nodeObj.iconURL,
                    entityName: nodeObj.entityName,
                    sizeType: "L",
                    radius: CV.ForceGraph_CircleUI.radius_for_role_l
                });
            }
            this.refreshWhenAdd(nodeObj);
        };
        /**
        * リンク（つながり）を追加する。
        * @function
        * @param linkObj つながり元のID、つながり先のID、CRMLinkインスタンスのLinkId、つながりの説明、つながりロール1表示名、つながりロール2表示名
        */
        ForceGraph_CircleUI.prototype.addLink = function (linkObj) {
            var foundSource = this.findNode(CV.IDPrefix + linkObj.source);
            var foundTarget = this.findNode(CV.IDPrefix + linkObj.target);
            if (foundSource != null && foundTarget != null) {
                this.forceList.links.push({
                    source: foundSource,
                    target: foundTarget,
                    id: linkObj.linkId,
                    description: linkObj.description,
                    role1: linkObj.role1,
                    role2: linkObj.role2,
                    connector: linkObj.connector
                });
                this.refreshWhenAdd(null);
            }
        };
        /**
        * 1つのリンク（つながり）において、複数のCRMLinkインスタンスが関係付くことが分かった処理をする。
        * パラメータで渡されたCRMLinkのLinkIdが既存のリンク群のうちのどれかを検索するが、
        * リンクが作成された最初に指定したCRMLinkが渡されているという前提である。
        * @function
        * @param crmLink {CRMLink} CRMLinkインスタンス
        */
        ForceGraph_CircleUI.prototype.setMultipleCRMConnetionFound = function (crmLink) {
            var found = false;
            for (var i in this.forceList.links) {
                var link = this.forceList.links[i];
                if (link["id"] == crmLink.LinkId) {
                    link["description"] = crmLink.Connector.Description;
                    link["role1"] = crmLink.Connector.Role1;
                    link["role2"] = crmLink.Connector.Role2;
                    link["connector"] = crmLink.Connector;
                    found = true;
                }
            }
            if (found) {
                // リンクの説明文
                this.updateForceConnectionDescriptionG();
                this.updateForceConnectionRole1();
                this.updateForceConnectionRole2();
            }
        };
        /**
        * IDでthis.forceListを検索してノードを返す。
        * @function
        * @param id {string} NodeのID。prefix付き。
        * @return 検索してヒットしたノード。ヒットしなければnullを返す。
        */
        ForceGraph_CircleUI.prototype.findNode = function (id) {
            for (var i in this.forceList.nodes) {
                if (this.forceList.nodes[i]["id"] == id)
                    return this.forceList.nodes[i];
            }
            return null;
        };
        /**
        * サイズが変更された際の処理をする。
        * @function
        */
        ForceGraph_CircleUI.prototype.setForceSizeAndStart = function () {
            d3.selectAll("#MySVG,#MyDragDropRect")
                .attr("width", window.innerWidth)
                .attr("height", window.innerHeight);
            if (CV.connectionViewer.config.SmallerSizeEnabled) {
                this.force.size([window.innerWidth, window.innerHeight])
                    .linkDistance(function (d) {
                    if (d.source.sizeType == "M" && d.target.sizeType == "M")
                        return CV.ForceGraph_CircleUI.CARD_DISTANCE_MM;
                    else if (d.source.sizeType == "L" && d.target.sizeType == "L")
                        return CV.ConnectionViewer.CARD_DISTANCE;
                    else
                        return CV.ForceGraph_CircleUI.CARD_DISTANCE_LM;
                })
                    .charge(-5000)
                    .start();
            }
            else {
                this.force.size([window.innerWidth, window.innerHeight])
                    .linkDistance(CV.ConnectionViewer.CARD_DISTANCE)
                    .charge(-5000)
                    .start();
            }
        };
        /**
        * force.on("tick", ...) の処理をする。
        * @function
        */
        ForceGraph_CircleUI.prototype.setForceOnTick = function (forceConnectionLine, forceConnectionDescriptionG, forceConnectionRole1, forceConnectionRole2, forceNodeCard) {
            this.force.on("tick", function () {
                forceConnectionLine
                    .attr("x1", function (d) { return d.source.x; })
                    .attr("y1", function (d) { return d.source.y; })
                    .attr("x2", function (d) { return d.target.x; })
                    .attr("y2", function (d) { return d.target.y; });
                forceConnectionDescriptionG
                    .attr("transform", function (d, i) {
                    var x = (d.source.x + d.target.x) / 2;
                    var y = (d.source.y + d.target.y) / 2;
                    return "translate(" + x + " " + y + ")";
                });
                forceConnectionRole1
                    .each(function (d, index, outerIndex) {
                    var textElem = forceConnectionRole1[outerIndex][index];
                    // UpdatePositionARole の戻り値はオブジェクト
                    //{ "position": Helper.Point, "text-anchor": string, "alignment-baseline": string }
                    var obj = CV.ForceGraph_CircleUI.UpdatePositionARole(d.source.radius, d.source.x, d.source.y, d.target.x, d.target.y, false, index);
                    d.x = obj.position.x;
                    d.y = obj.position.y;
                    textElem.setAttribute("text-anchor", obj["text-anchor"]);
                    textElem.setAttribute("dominant-baseline", obj["dominant-baseline"]);
                    textElem.setAttribute("x", d.x);
                    textElem.setAttribute("y", d.y);
                });
                forceConnectionRole2
                    .each(function (d, index, outerIndex) {
                    var textElem = forceConnectionRole2[outerIndex][index];
                    var obj = CV.ForceGraph_CircleUI.UpdatePositionARole(d.target.radius, d.source.x, d.source.y, d.target.x, d.target.y, true);
                    d.x = obj.position.x;
                    d.y = obj.position.y;
                    textElem.setAttribute("x", d.x);
                    textElem.setAttribute("y", d.y);
                    textElem.setAttribute("text-anchor", obj["text-anchor"]);
                    textElem.setAttribute("dominant-baseline", obj["dominant-baseline"]);
                });
                forceNodeCard
                    .attr("transform", function (d) { return "translate(" + d.x + " " + d.y + ")"; });
            });
        };
        /**
        * つながりの線を表すd3.Selectionを作成し、取得する。
        * @function
        * @return つながりの線を表すd3.Selection
        */
        ForceGraph_CircleUI.prototype.appendAndGetForceConnectionLine = function () {
            var forceConnectionLine = this.svgGForLines.selectAll("line.connectionLine")
                .data(this.forceList.links);
            forceConnectionLine.enter().append("line")
                .classed("connectionLine", true);
            forceConnectionLine.exit().remove();
            return forceConnectionLine;
        };
        /**
        * つながりの説明文とマスクを表すd3.Selectionを作成し、取得する。
        * SVG外で用意した<a>のclickイベントを強制的に発行する。
        * @function
        * @return つながりの説明文を表すd3.Selection
        */
        ForceGraph_CircleUI.prototype.appendAndGetForceConnectionDescriptionG = function () {
            // d3のfilterの挙動が理解できない。事前にフィルター済みのデータを用意することにした。
            var hasDescriptionArray = this.forceList.links.filter(function (value, index, array) {
                return !(value.connector.Description == null || value.connector.Description == "");
            });
            var forceConnectionDescriptionG = this.svgGForConnectionDescriptions.selectAll("g.connectionDescriptionG")
                .data(hasDescriptionArray);
            var connectionDescriptionG = forceConnectionDescriptionG
                .enter()
                .append("g")
                .classed("connectionDescriptionG", true);
            // マスク部分
            var rect = connectionDescriptionG.append("rect")
                .classed("connectionMask", true)
                .attr("x", 0) // この時点で位置は気にしない。後で変更
                .attr("y", 0) // この時点で位置は気にしない。後で変更
                .attr("width", 100) // この時点でサイズは気にしない。後で変更
                .attr("height", 16); // この時点でサイズは気にしない。後で変更
            // つながりの説明文部分
            connectionDescriptionG.append("text")
                .classed("connectionDescription", true)
                .attr("x", 0)
                .attr("y", 4)
                .attr("pointer-events", "visibleFill")
                .attr("text-anchor", "middle")
                .text(function (d) { return d.connector.Description; })
                .on("touchstart", function (d, i) { CV.forceGraph.connectionMaskToClickTouchPointerMouseStart(d, i); }) // タッチ用
                .on("pointerdown", function (d, i) { CV.forceGraph.connectionMaskToClickTouchPointerMouseStart(d, i); }) // PCでのIE用
                .on("mousedown", function (d, i) { CV.forceGraph.connectionMaskToClickTouchPointerMouseStart(d, i); }); // PCでのChromeやFirefox用
            // マスクの位置とサイズを調整
            rect.each(function (d, index, outerIndex) {
                var svgTextObj = d3.selectAll("text.connectionDescription")[outerIndex][index];
                var w = svgTextObj.getBBox().width;
                var h = svgTextObj.getBBox().height;
                var thisRectObj = d3.selectAll("rect.connectionMask")[outerIndex][index];
                thisRectObj.setAttribute("x", -w / 2);
                thisRectObj.setAttribute("y", -h / 2);
                thisRectObj.setAttribute("width", w);
                thisRectObj.setAttribute("height", h);
            });
            forceConnectionDescriptionG.exit().remove();
            return forceConnectionDescriptionG;
        };
        /**
        * つながりの説明文を表すd3.Selectionを最新状態に更新する。
        * @function
        */
        ForceGraph_CircleUI.prototype.updateForceConnectionDescriptionG = function () {
            // d3のfilterの挙動が理解できない。事前にフィルター済みのデータを用意することにした。
            var hasDescriptionArray = this.forceList.links.filter(function (value, index, array) {
                return !(value.connector.Description == null || value.connector.Description == "");
            });
            // つながりの説明文部分
            var forceConnectionDescriptionG = this.svgGForConnectionDescriptions.selectAll("text.connectionDescription")
                .data(hasDescriptionArray)
                .text(function (d) { return d.description; });
            // マスクの位置とサイズを調整
            var forceRect = this.svgGForConnectionDescriptions.selectAll("rect.connectionMask");
            forceRect.each(function (d, index, outerIndex) {
                var svgTextObj = d3.selectAll("text.connectionDescription")[outerIndex][index];
                var w = svgTextObj.getBBox().width;
                var h = svgTextObj.getBBox().height;
                var thisRectObj = d3.selectAll("rect.connectionMask")[outerIndex][index];
                thisRectObj.setAttribute("x", -w / 2);
                thisRectObj.setAttribute("y", -h / 2);
                thisRectObj.setAttribute("width", w);
                thisRectObj.setAttribute("height", h);
            });
        };
        /**
        * つながり1を表すd3.Selectionを作成し、取得する。
        * @function
        * @return つながり1を表すd3.Selection
        */
        ForceGraph_CircleUI.prototype.appendAndGetForceConnectionRole1 = function () {
            var linkRole1HasTextList = this.forceList.links.filter(function (value, index, array) {
                return value.role1;
            });
            var forceConnectionRole1 = this.svgGForConnectionRoles.selectAll("text.connectionRole1")
                .data(linkRole1HasTextList);
            forceConnectionRole1.enter().append("text")
                .classed("connectionRole1", true)
                .text(function (d, i) { return d.role1; });
            forceConnectionRole1.exit().remove();
            return forceConnectionRole1;
        };
        /**
        * つながり1を表すd3.Selectionを更新する。
        * @function
        * @return つながり1を表すd3.Selection
        */
        ForceGraph_CircleUI.prototype.updateForceConnectionRole1 = function () {
            var linkRole1HasTextList = this.forceList.links.filter(function (value, index, array) {
                return value.role1;
            });
            var forceConnectionRole1 = this.svgGForConnectionRoles.selectAll("text.connectionRole1")
                .data(linkRole1HasTextList);
            forceConnectionRole1
                .text(function (d, i) { return d.role1; });
            forceConnectionRole1.exit().remove();
            return forceConnectionRole1;
        };
        /**
        * つながり2を表すd3.Selectionを作成し、取得する。
        * @function
        * @return つながり2を表すd3.Selection
        */
        ForceGraph_CircleUI.prototype.appendAndGetForceConnectionRole2 = function () {
            var linkRole2HasTextList = this.forceList.links.filter(function (value, index, array) {
                return value.role2;
            });
            var forceConnectionRole2 = this.svgGForConnectionRoles.selectAll("text.connectionRole2")
                .data(linkRole2HasTextList);
            forceConnectionRole2.enter().append("text")
                .classed("connectionRole2", true)
                .text(function (d, i) { return d.role2; });
            forceConnectionRole2.exit().remove();
            return forceConnectionRole2;
        };
        /**
        * つながり2を表すd3.Selectionを更新する。
        * @function
        * @return つながり2を表すd3.Selection
        */
        ForceGraph_CircleUI.prototype.updateForceConnectionRole2 = function () {
            var linkRole2HasTextList = this.forceList.links.filter(function (value, index, array) {
                return value.role2;
            });
            var forceConnectionRole2 = this.svgGForConnectionRoles.selectAll("text.connectionRole2")
                .data(linkRole2HasTextList);
            forceConnectionRole2
                .text(function (d, i) { return d.role2; });
            forceConnectionRole2.exit().remove();
            return forceConnectionRole2;
        };
        /**
        * コネクタの説明文をクリックできる<a>領域を表すd3.Selectionについて、
        * タッチ操作など開始のイベントリスナー。touchstart、pointerdown、mousedownすべて。
        * @param d this.forceList.linksの1つの要素。
        */
        ForceGraph_CircleUI.prototype.connectionMaskToClickTouchPointerMouseStart = function (d, i) {
            ///console.log("in connectionMaskToClickTouchPointerMouseStart");
            ///console.log("d.role1, d.role2, i, this", d.role1, d.role2, i, this);
            d3.event.preventDefault(); // 2度このfunctionが呼ばれるのを防ぐ。
            d3.event.stopPropagation();
            // なぜか d には異なる情報が入っているため、iを利用する。
            var hasDescriptionArray = this.forceList.links.filter(function (value, index, array) {
                return !(value.connector.Description == null || value.connector.Description == "");
            });
            var data = hasDescriptionArray[i];
            $("#MyMultipleLlinksRecordDisplayNameLeft").html(data.connector.Card1.DisplayName);
            $("#MyMultipleLlinksRecordDisplayNameRightt").html(data.connector.Card2.DisplayName);
            $("#MyMultipleLlinksEntityDisplayNameLeft").html(CV.connectionViewer.EntityMetadataCacheKeyIsEntityLogicalName[data.connector.Card1.EntityLogicalName].DisplayName.UserLocalizedLabel.Label);
            $("#MyMultipleLlinksEntityDisplayNameRight").html(CV.connectionViewer.EntityMetadataCacheKeyIsEntityLogicalName[data.connector.Card2.EntityLogicalName].DisplayName.UserLocalizedLabel.Label);
            var html = '';
            for (var l in data.connector.CrmLinkArray) {
                var crmLink = data.connector.CrmLinkArray[l];
                var r1 = (crmLink.Record1DisplayRoleName) ? crmLink.Record1DisplayRoleName : "・";
                var r2 = (crmLink.Record2DisplayRoleName) ? crmLink.Record2DisplayRoleName : "・";
                var desc = (crmLink.LinkType == CV.CRMLinkTypeEnum.ManyToMany) ? "(N:N関係)" : crmLink.Description;
                if (desc) {
                    html += '<table class="multipleLlinksOneLink" style="width: 100%;">';
                    html += '    <tr>';
                    html += '        <td class="multipleLlinksTD" style="text-align: left; width: auto;">' + r1 + '</td>';
                    html += '        <td class="multipleLlinksTD" style="width: 50%;"><div><img class="multipleLlinksLine" src="Images/line.png" /></div></td>';
                    html += '        <td class="multipleLlinksTD" style="text-align: center;"><p class="multipleLlinksDescription">' + desc + '</p></td>';
                    html += '        <td class="multipleLlinksTD" style="width: 50%;"><div><img class="multipleLlinksLine" src="Images/line.png" /></div></td>';
                    html += '        <td class="multipleLlinksTD" style="text-align: right;">' + r2 + '</td>';
                    html += '    </tr>';
                    html += '</table>';
                }
                else {
                    html += '                    <table class="multipleLlinksOneLink" style="width: 100%;">';
                    html += '                        <tr>';
                    html += '                            <td class="multipleLlinksTD" style="text-align: left; width: auto;">' + r1 + '</td>';
                    html += '                            <td class="multipleLlinksTD" style="width: 100%;"><div><img class="multipleLlinksLine" src="Images/line.png" /></div></td>';
                    html += '                            <td class="multipleLlinksTD" style="text-align: right;">' + r2 + '</td>';
                    html += '                        </tr>';
                    html += '                    </table>';
                }
            }
            $("#MyMyMultipleCRMLinkPanelAllLinks").html(html);
            $("#MyShowMultipleCRMLinkPanel").click();
        };
        /**
        * タッチ操作など開始のイベントリスナー。touchstart、pointerdown、mousedownすべて。
        * @param d d3のdiv.card セレクション
        */
        ForceGraph_CircleUI.prototype.touchPointerMouseStart = function (d) {
            ///console.log("in touchPointerMouseStart");
            if (!CV.forceGraph.currentEventD3obj) {
                // 当該d3オブジェクトが他のイベントでの処理がまだなされていない場合。
                CV.forceGraph.currentEventD3obj = d;
                CV.forceGraph.dragStartedPoint = new CV.Helper.Point(d.x, d.y);
                CV.forceGraph.focusACardControl(d);
            }
        };
        /**
        * タッチ操作など終了のイベントリスナー。touchend、pointerup、mouseupすべて。
        * @param d d3のdiv.card セレクション
        */
        ForceGraph_CircleUI.prototype.touchPointerMouseEnd = function (d) {
            ///console.log("in touchPointerMouseEnd");
            CV.forceGraph.currentEventD3obj = null;
        };
        /**
        * タップホールド（マウスクリック長押し）した際のイベントを処理を実装する。
        * カードをドラッグ中も呼び出されるので、そのハンドリングもしている。
        * @param event jQueryの"taphold"イベントで呼び出され渡されるもの
        */
        ForceGraph_CircleUI.prototype.taphold = function (event) {
            ///console.log("in taphold");
            var cardEl;
            if (event.target.className.baseVal == "circleCard") {
                cardEl = event.target;
            }
            else if (event.currentTarget.className.baseVal == "circleCard") {
                cardEl = event.currentTarget;
            }
            else {
                ///console.log("in taphold. 未実装");
                return;
            }
            var id = cardEl.id; // prefix付きのカードDIV要素のID
            var d3obj = this.findNode(id);
            var currentPoint = new CV.Helper.Point(d3obj.x, d3obj.y);
            // ドラッグしているのか、長押ししているだけなのかを判断する。
            var dx = currentPoint.x - CV.forceGraph.dragStartedPoint.x;
            var dy = currentPoint.y - CV.forceGraph.dragStartedPoint.y;
            if (dx * dx + dy * dy < 100) {
                // ドラッグせずに、長押ししている
                CV.forceGraph.cardToggleFixed(d3obj);
            }
            else {
                // ドラッグして、長押ししている
                CV.forceGraph.cardFixed(d3obj);
            }
        };
        /**
        * 指定したカードについて、d3 forceの挙動を固定するか、固定しないかオンオフする。
        * d3obj.fixedの1ビット目で管理している。
        * @param d3obj カードを表すd3オブジェクト
        */
        ForceGraph_CircleUI.prototype.cardToggleFixed = function (d3obj) {
            ///console.log("in cardToggleFixed() d3obj.fixed = ", d3obj.fixed);
            var cardCircle = $("#" + d3obj.id + " .circleInCard");
            if (!(d3obj.fixed & 1)) {
                cardCircle.attr("filter", "url(#MyDefDropShadow)");
                d3obj.fixed |= 1; // fixedをオン
            }
            else {
                cardCircle.attr("filter", "");
                d3obj.fixed &= ~1; // fixedをオフ
            }
        };
        /**
        * 指定したカードについて、d3 forceの挙動を固定する。
        * d3obj.fixedの1ビット目で管理している。
        * @param d3obj カードを表すd3オブジェクト
        */
        ForceGraph_CircleUI.prototype.cardFixed = function (d3obj) {
            ///console.log("in cardFixed() d3obj.fixed = ", d3obj.fixed);
            var cardCircle = $("#" + d3obj.id + " .circleInCard");
            cardCircle.attr("filter", "url(#MyDefDropShadow)");
            d3obj.fixed |= 1; // fixedをオン
        };
        /**
        * ノードやリンクが追加された際に、表示をリフレッシュする。d3 の enter の挙動のみを扱う。
        * 引数は、直近でthis.forceListに追加したものがnodeのオブジェクトである場合に渡されるべきものであり、
        * もし追加したものがlinkのオブジェクト、またはlinkを変更したものであればnullを渡してよい。
        * @param nodeObj 名前とIDとiconURL
        * @function
        */
        ForceGraph_CircleUI.prototype.refreshWhenAdd = function (nodeObj) {
            var forceConnectionLine = this.appendAndGetForceConnectionLine();
            var forceConnectionDescriptionG = this.appendAndGetForceConnectionDescriptionG();
            var forceConnectionRole1 = this.appendAndGetForceConnectionRole1();
            var forceConnectionRole2 = this.appendAndGetForceConnectionRole2();
            var forceNodeCard = this.svgGForCards.selectAll("g.circleCard")
                .data(this.forceList.nodes);
            var nodeEnter = forceNodeCard.enter()
                .append("g") // カードの全体。クラスは circleCard
                .attr("id", function (d) { return d.id; }) // d.idにはすでにprefix付き。
                .classed("circleCard", true)
                .on("touchstart", this.touchPointerMouseStart) // タッチ用
                .on("touchend", this.touchPointerMouseEnd) // タッチ用
                .on("pointerdown", this.touchPointerMouseStart) // PCでのIE用
                .on("pointerup", this.touchPointerMouseEnd) // PCでのIE用
                .on("mousedown", this.touchPointerMouseStart) // PCでのChromeやFirefox用
                .on("mouseup", this.touchPointerMouseEnd); // PCでのChromeやFirefox用
            // タップホールド（マウスクリック長押し）した際のイベントを設定する。これは jQuery Mobile を利用する。
            if (nodeObj) {
                // もし直近でnodeのオブジェクトが渡された場合にのみ行う。
                $("#" + CV.IDPrefix + nodeObj.id).bind("taphold", function (event) { CV.forceGraph.taphold(event); });
            }
            nodeEnter = nodeEnter
                .call(this.force.drag);
            nodeEnter
                .append("title")
                .text(function (d) { return d.name; });
            nodeEnter
                .append("use") // カードの中の丸。クラスは circleInCard
                .classed("circleInCard", true)
                .attr("xlink:href", function (d) { return "#MyDefCircle" + d.sizeType; }) // MyDefCircleL あるいは MyDefCircleM
                .attr("fill", "rgb(166,166,166)")
                .attr("stroke", function (d) { return CV.CardControl.getEntityColor(d.entityName); })
                .attr("filter", function (d) {
                return (d.fixed) ? "url(#MyDefDropShadow)" : "";
            });
            nodeEnter
                .append("image")
                .attr("x", -16)
                .attr("y", -46)
                .attr("xlink:href", function (d) {
                if (d.entityImage)
                    return "data:image/png;base64," + d.entityImage;
                else
                    return d.iconURL;
            })
                .attr("cursor", "move")
                .attr("width", 32)
                .attr("height", 32)
                .attr("visibility", function (d) { return (d.sizeType == "L") ? "visible" : "collapse"; });
            // まずは普通にSVG上に文字列を置いてみる。
            var nodeEnterText = nodeEnter
                .append("text")
                .classed("nameInCard", true)
                .attr("font-family", "Meiryo UI")
                .attr("font-size", "9pt")
                .attr("fill", "white")
                .attr("text-decoration", function (d) { return (d.sizeType == "L") ? "underline" : null; })
                .attr("cursor", function (d) { return (d.sizeType == "L") ? "pointer" : "move"; })
                .text(function (d) { return d.name; }); // いったんここに文字列を置いて、横幅のチェックをする。複数行になる場合には、後からここの文字列は削除されてtextPathの中に書かれる。
            // text のカードの名前の表示上の長さを d.computedTextLength に格納する。この情報は今後変更されない前提。
            // また、text が何行で収まるのかどうかの情報を d.numberOfLines に付与する。
            // d3.selectAll()の中で、SVG要素にアクセスするための this が期待通り動作しない。理由は TypeScript にあると考える。
            // そのため、SVG要素にアクセスするために、ちょっと変な方法で実装した。
            nodeEnterText.each(function (d, index, outerIndex) {
                var thisSvgText = d3.selectAll("text.nameInCard")[outerIndex][index];
                var computedTextLength = thisSvgText.getComputedTextLength();
                d.computedTextLength = computedTextLength;
                d.numberOfLines = CV.ForceGraph_CircleUI.getNumberOfLines(computedTextLength, d.sizeType);
            });
            // 一行に収まるSVG Textの処理
            nodeEnterText.filter(function (d) { return (d.numberOfLines == 1); })
                .attr("x", 0)
                .attr("y", 4)
                .attr("font-family", "Meiryo UI")
                .attr("font-size", "9pt")
                .attr("fill", "white")
                .attr("text-decoration", function (d) { return (d.sizeType == "L") ? "underline" : null; })
                .attr("text-anchor", "middle");
            // 複数行になるSVG Textの処理
            nodeEnterText.filter(function (d) { return !(d.numberOfLines == 1); })
                .attr("font-family", "Meiryo UI")
                .attr("font-size", "9pt")
                .attr("fill", "white")
                .attr("text-decoration", function (d) { return (d.sizeType == "L") ? "underline" : null; })
                .text("")
                .append("textPath")
                .attr("xlink:href", function (d) { return "#MyDefTextPath" + d.sizeType + d.numberOfLines; }) // 次のいずれか。"MyDefTextPathL2", "MyDefTextPathL3", "MyDefTextPathM2", "MyDefTextPathM3"
                .text(function (d) { return d.name; });
            // "…" の処理
            nodeEnter
                .append("text")
                .classed("cardToBeRetrieved", true)
                .attr("x", 0)
                .attr("y", function (d) { return (d.sizeType == "L") ? 43 : 27; })
                .attr("font-family", "Meiryo UI")
                .attr("font-size", "9pt")
                .attr("fill", "white")
                .attr("text-anchor", "middle")
                .attr("cursor", "move")
                .text("…");
            forceNodeCard.exit().remove();
            this.setForceOnTick(forceConnectionLine, forceConnectionDescriptionG, forceConnectionRole1, forceConnectionRole2, forceNodeCard);
            this.setForceSizeAndStart();
        };
        /**
         * ノードやリンクが変更された際に、表示をリフレッシュする。d3 の既存のオブジェクトについてのみを扱う。
         */
        ForceGraph_CircleUI.prototype.refreshWhenUpdate = function () {
            // ID は、IDPrefix 付きで扱う。
            var focusedId = CV.IDPrefix + CV.forceGraph.currentFocusedCardID;
            var directlyConnectedId = []; // フォーカスしているカードに直接つながっているカードのIdを格納する。
            for (var i in this.forceList.links) {
                var link = this.forceList.links[i];
                if (link.source.id == focusedId) {
                    directlyConnectedId.push(link.target.id);
                }
                else if (link.target.id == focusedId) {
                    directlyConnectedId.push(link.source.id);
                }
            }
            // まず、g.circleCardをみて、"L" か "M" かのフラグをdに付与する。
            var forceNodeCard = this.svgGForCards.selectAll("g.circleCard")
                .data(this.forceList.nodes)
                .each(function (d, index, outerIndex) {
                var id = d.id;
                if (id == focusedId || 0 <= directlyConnectedId.indexOf(id)) {
                    // フォーカスしているカード、あるいは
                    // フォーカスしているカードに直接つながっているカード
                    var previousSizeType = d.sizeType;
                    d.sizeType = "L";
                    d.radius = CV.ForceGraph_CircleUI.radius_for_role_l;
                    if (previousSizeType != d.sizeType)
                        d.sizeChanged = true;
                    else
                        d.sizeChanged = false;
                }
                else {
                    // それ以外のカード
                    var previousSizeType = d.sizeType;
                    d.sizeType = "M";
                    d.radius = CV.ForceGraph_CircleUI.radius_for_role_m;
                    if (previousSizeType != d.sizeType)
                        d.sizeChanged = true;
                    else
                        d.sizeChanged = false;
                }
            });
            // 次に、use.circleInCard
            this.svgGForCards.selectAll("g.circleCard > use.circleInCard")
                .data(this.forceList.nodes)
                .attr("xlink:href", function (d) {
                // カードの大きさに違いがなければ MyDefCircleL あるいは MyDefCircleM
                // カードの大きさに違いがあれば、 MyDefCircleMtoL あるいは MyDefCircleLtoM
                if (d.sizeChanged) {
                    return (d.sizeType == "L") ? "#MyDefCircleMtoL" : "#MyDefCircleLtoM";
                }
                else {
                    return (d.sizeType == "L") ? "#MyDefCircleL" : "#MyDefCircleM";
                }
            });
            // 大きさの変化をアニメーションにする。
            d3.select("#MyDefCircleLtoM").attr("r", CV.ForceGraph_CircleUI.radius_for_l);
            d3.select("#MyDefCircleMtoL").attr("r", CV.ForceGraph_CircleUI.radius_for_m);
            d3.select("#MyDefCircleLtoM").transition().attr("r", CV.ForceGraph_CircleUI.radius_for_m).ease('exp').duration(500);
            d3.select("#MyDefCircleMtoL").transition().attr("r", CV.ForceGraph_CircleUI.radius_for_l).ease('exp').duration(500);
            // 次に、image
            this.svgGForCards.selectAll("g.circleCard > image")
                .data(this.forceList.nodes)
                .attr("visibility", function (d) { return (d.sizeType == "L") ? "visible" : "collapse"; });
            // 次に、text.nameInCard
            // text が何行で収まるのかどうかの情報を d.numberOfLines に付与する。
            var nodeNameInCard = this.svgGForCards.selectAll("g.circleCard > text.nameInCard")
                .data(this.forceList.nodes)
                .each(function (d, index, outerIndex) {
                d.numberOfLines = CV.ForceGraph_CircleUI.getNumberOfLines(d.computedTextLength, d.sizeType);
            });
            // 一行に収まるSVG Textの処理
            nodeNameInCard.filter(function (d) { return (d.numberOfLines == 1) ? true : false; })
                .attr("x", 0)
                .attr("y", 4)
                .attr("text-decoration", function (d) { return (d.sizeType == "L") ? "underline" : null; })
                .attr("cursor", function (d) { return (d.sizeType == "L") ? "pointer" : "move"; })
                .attr("text-anchor", "middle")
                .attr("onclick", function (d) { return (d.sizeType == "L") ? "CV.CardControl.OpenNewCRMFormWindow(this)" : null; })
                .text(function (d) { return d.name; })
                .select("textPath")
                .style("visibility", "collapse");
            // 複数行になるSVG Textの処理
            nodeNameInCard.filter(function (d) { return !(d.numberOfLines == 1); })
                .attr("x", 0)
                .attr("y", 0)
                .attr("text-decoration", function (d) { return (d.sizeType == "L") ? "underline" : null; })
                .attr("cursor", function (d) { return (d.sizeType == "L") ? "pointer" : "move"; })
                .attr("text-anchor", null)
                .attr("onclick", function (d) { return (d.sizeType == "L") ? "CV.CardControl.OpenNewCRMFormWindow(this)" : null; })
                .text("")
                .append("textPath")
                .attr("xlink:href", function (d) { return "#MyDefTextPath" + d.sizeType + d.numberOfLines; }) // 次のいずれか。"MyDefTextPathL2", "MyDefTextPathL3", "MyDefTextPathM2", "MyDefTextPathM3"
                .text(function (d) { return d.name; });
            // "…" の処理
            this.svgGForCards.selectAll("g.circleCard > text.cardToBeRetrieved")
                .data(this.forceList.nodes)
                .attr("y", function (d) { return (d.sizeType == "L") ? 43 : 27; });
            // linkDistanceの処理
            this.force
                .linkDistance(function (d) {
                if (d.source.sizeType == "M" && d.target.sizeType == "M")
                    return CV.ForceGraph_CircleUI.CARD_DISTANCE_MM;
                else if (d.source.sizeType == "L" && d.target.sizeType == "L")
                    return CV.ConnectionViewer.CARD_DISTANCE;
                else
                    return CV.ForceGraph_CircleUI.CARD_DISTANCE_LM;
            })
                .start();
        };
        /**
         * 丸いカードの中に表示する文字列を表示するSVGのtextオブジェクトについて、
         * 表示サイズ上、何行に収まるかどうかを判断し、その行数を返すが、意味はサイズによってことなる。
         * "L"サイズの場合、1あるいは2を返す。2を返すのは、2行以上必要である、という意味。
         * "M"サイズの場合、1あるいは2あるいは3を返す。3を返すのは、3行以上必要である、という意味。
         * @param svgTextObj SVG Text のオブジェクト
         * @param size string カードの大きさを表す文字列で、"L" か "M" を想定。
         */
        ForceGraph_CircleUI.getNumberOfLines = function (computedTextLength, size) {
            if (size == "L") {
                return (computedTextLength < CV.ForceGraph_CircleUI.SVG_TEXT_SINGLE_LINE_L_LENGTH) ? 1 : 2;
            }
            else if (size == "M" && computedTextLength < CV.ForceGraph_CircleUI.SVG_TEXT_SINGLE_LINE_M2_LENGTH) {
                return 1;
            }
            else if (size == "M" && computedTextLength < CV.ForceGraph_CircleUI.SVG_TEXT_SINGLE_LINE_M3_LENGTH) {
                return 2;
            }
            else if (size == "M") {
                return 3;
            }
            else {
                throw new Error("size '" + size + "' はサポートしていません。");
            }
        };
        /**
        * 特定のカードをフォーカス表示する。引数はCRMレコードのid
        * 既にフォーカス状態のカードがあれば、それをアンフォーカスする処理も行う。
        * @function
        * @param id {string} CRMレコードのid
        */
        ForceGraph_CircleUI.focusACardControlByCRMRecordId = function (id) {
            if (CV.forceGraph.currentFocusedCardID != id) {
                //既にフォーカス状態のカードがあれば、それをアンフォーカスする
                if (CV.forceGraph.currentFocusedCardID != null) {
                    for (var i = 0; i < CV.connectionViewer.CRMRecordArray.length; i++) {
                        if (CV.connectionViewer.CRMRecordArray[i].Id == CV.forceGraph.currentFocusedCardID) {
                            CV.connectionViewer.CRMRecordArray[i].Card.Unfocus();
                            break;
                        }
                    }
                }
                CV.forceGraph.currentFocusedCardID = id;
                // UIとしてのフォーカス処理
                if (d3.select("g#" + CV.IDPrefix + id + ".circleCard .circleInCard") != null) {
                    d3.select("g#" + CV.IDPrefix + id + ".circleCard .circleInCard").attr("fill", function (d) { return CV.CardControl.getEntityColor(d.entityName); });
                }
            }
        };
        /**
        * 特定のカードをアンフォーカス表示する。引数はCRMレコードのid
        * @function
        * @param id {string} CRMレコードのid
        */
        ForceGraph_CircleUI.unfocusACardControlByCRMRecordId = function (id) {
            //アンフォーカス
            if (d3.select("g#" + CV.IDPrefix + id + ".circleCard .circleInCard") != null) {
                d3.select("g#" + CV.IDPrefix + id + ".circleCard .circleInCard").attr("fill", "rgb(166,166,166)");
            }
        };
        /**
        * 特定のカードをフォーカスする。引数はd3セレクション
        * 既にフォーカス状態のカードがあれば、それをアンフォーカスする処理も行う。
        * @function
        * @param d d3 div.card セレクション
        */
        ForceGraph_CircleUI.prototype.focusACardControl = function (d) {
            ///console.log("in focusACardControl d.id=" + d.id);
            // d.idからprefixを取り除いてから処理する
            if (d.id.indexOf(CV.IDPrefix) == 0) {
                var id = d.id.substr(CV.IDPrefix.length);
                // 既にフォーカスされている場合には何もしない。
                if (CV.forceGraph.currentFocusedCardID == id)
                    return;
                // 該当するCRMRecordを見つけて、そのカードコントロールをフォーカスする。
                for (var i = 0; i < CV.connectionViewer.CRMRecordArray.length; i++) {
                    var crmRecord = CV.connectionViewer.CRMRecordArray[i];
                    if (crmRecord.Id == id) {
                        crmRecord.Card.Focus();
                        break;
                    }
                }
            }
        };
        /**
        * 特定のカードについて、「関連するつながりデータを取得済みである」状態の表示を変更する。
        * booleanの引数がtrueだと取得済みである状態の表示に、falseだと取得済みではない状態の表示にする。
        * 引数はCRMレコードのid
        * @function
        * @param id {string} CRMレコードのid
        */
        ForceGraph_CircleUI.prototype.connectionRetrieved = function (id, retrieved) {
            ///console.log("in connectionRetrieved() CRM record id=" + id);
            if (d3.select("g#" + CV.IDPrefix + id + ".circleCard") != null) {
                if (retrieved) {
                    d3.select("g#" + CV.IDPrefix + id + ".circleCard").select("text.cardToBeRetrieved").style("opacity", "0.0");
                }
                else {
                    d3.select("g#" + CV.IDPrefix + id + ".circleCard").select("text.cardToBeRetrieved").style("opacity", "1.0");
                }
            }
        };
        /**
        * つながりロールの文字列の <text> を適切な状態で描画するための情報を返す。
        * その情報とは、位置、text-anchor属性の値、alignment-baseline属性の値である。
        * 位置はコネクターの線が丸いカードと接する位置Pである。
        * 他の２つの属性の値については、位置Pが、カードの中心から見て、第何象限に位置するか、
        * に応じて変える。
        * @param r 丸いカードの半径
        * @param X1 connectionRole1のオブジェクトのx位置
        * @param Y1 connectionRole1のオブジェクトのy位置
        * @param X2 connectionRole2のオブジェクトのx位置
        * @param Y2 connectionRole2のオブジェクトのy位置
        * @param reverse role1のカードを処理する場合はfalse、role2のカードを処理する場合はtrue
        * @return 位置、text-anchor属性の値、alignment-baseline属性の値の3つを含むオブジェクト
        */
        ForceGraph_CircleUI.UpdatePositionARole = function (r, X1, Y1, X2, Y2, reverse, index) {
            var position = new CV.Helper.Point(0, 0);
            var textAnchor;
            var dominantBaseline;
            // コネクターの線を1次直線y=ax+bに置く
            // 座標は、X1, Y1を中心 (0, 0) とした場合の計算である。
            // reverse = trueの場合には、X2, Y2を中心 (0, 0) とした場合
            var dx = (!reverse) ? X2 - X1 : X1 - X2;
            var dy = (!reverse) ? Y2 - Y1 : Y1 - Y2;
            // angleの値は、-PI < angle <= PI
            var angle = Math.atan2(dy, dx);
            // position
            position.x = r * Math.cos(angle);
            position.y = r * Math.sin(angle);
            // 座標の中心を考慮して、移動する。
            position.x += (!reverse) ? X1 : X2;
            position.y += (!reverse) ? Y1 : Y2;
            // 他の２つ
            // 象限は数学上の位置
            if (angle < -Math.PI / 2) {
                // 第2象限
                textAnchor = "end";
                dominantBaseline = "text-after-edge";
            }
            else if (angle < 0) {
                // 第1象限
                textAnchor = "start";
                dominantBaseline = "text-after-edge";
            }
            else if (angle < Math.PI / 2) {
                // 第4象限
                textAnchor = "start";
                dominantBaseline = "text-before-edge";
            }
            else {
                // 第3象限
                textAnchor = "end";
                dominantBaseline = "text-before-edge";
            }
            return { "position": position, "text-anchor": textAnchor, "dominant-baseline": dominantBaseline };
        };
        /**
         * キャンバスをドラッグする処理の初期化
         */
        ForceGraph_CircleUI.prototype.initCanvasToDrag = function () {
            /**
            * MyDragDropRect にてマウス操作のドラッグ＆ドロップを検知して、
            * 実際の描画は MyDragDropG の transform にて操作する。
            */
            // カードをドラッグ中でないことを確認
            if (!CV.forceGraph.currentEventD3obj) {
                var drag = d3.behavior.drag()
                    .on("dragstart", function () {
                    this.isNowDragging = true;
                    d3.event.sourceEvent.preventDefault();
                    d3.event.sourceEvent.stopPropagation(); // silence other listeners
                }).on("drag", function () {
                    if (this.isNowDragging) {
                        d3.event.sourceEvent.preventDefault();
                        d3.event.sourceEvent.stopPropagation(); // silence other listeners
                        // 実際に動かす対象
                        CV.forceGraph.moveCanvasPosition(d3.event.dx, d3.event.dy);
                    }
                }).on("dragend", function () {
                    this.isNowDragging = false;
                    d3.event.sourceEvent.preventDefault();
                    d3.event.sourceEvent.stopPropagation(); // silence other listeners
                });
                // 初期値の設定
                CV.forceGraph.setCanvasPosition(0, 0);
                // マウス操作を検知する対象にdragを設定
                d3.select("#MyDragDropRect").call(drag);
            }
        };
        /**
         * キャンバスの位置を指定の位置にセットする。
         * MyDragDropRect に位置を記録し、
         * MyDragDropG で実際の描画をセットする。
         * @param x
         * @param y
         */
        ForceGraph_CircleUI.prototype.setCanvasPosition = function (x, y) {
            // 位置を記録する要素に属性値を設定
            d3.select("#MyDragDropRect")
                .attr("data-dragx", x) // ドラッグしたx位置を管理するための独自の属性。MyCanvasToDrag自身は移動しない。
                .attr("data-dragy", y); // ドラッグしたy位置を管理するための独自の属性。MyCanvasToDrag自身は移動しない。
            // 実際の描画
            d3.select("#MyDragDropG")
                .attr("transform", "translate(" + x + " " + y + ")");
        };
        /**
        * 現在のキャンバスの位置を取得する。
        */
        ForceGraph_CircleUI.prototype.getCanvasPosition = function () {
            var x = parseInt(d3.select("#MyDragDropRect").attr("data-dragx"));
            var y = parseInt(d3.select("#MyDragDropRect").attr("data-dragy"));
            return new CV.Helper.Point(x, y);
        }; /**
         * キャンバスの位置を指定の位置に変位量だけ移動する。
         * MyDragDropRect に位置を記録し、
         * MyDragDropG で実際の描画をセットする。
         * @param dx
         * @param dy
         */
        ForceGraph_CircleUI.prototype.moveCanvasPosition = function (dx, dy) {
            d3.select("#MyDragDropG")
                .attr("transform", function () {
                var x = parseInt($("#MyDragDropRect").attr("data-dragx")) + dx;
                var y = parseInt($("#MyDragDropRect").attr("data-dragy")) + dy;
                $("#MyDragDropRect").attr("data-dragx", x);
                $("#MyDragDropRect").attr("data-dragy", y);
                return "translate(" + x + " " + y + ")";
            });
        };
        /**
         * カード内のタイトルをクリックした際に渡されるDOM上のelmを受け取り、
         * 対象となるCRMRecordのidを返す。
         * @param elm
         */
        ForceGraph_CircleUI.prototype.getIdFromTitle = function (elm) {
            return $(elm).parent()[0].id;
        };
        /**
         * フォーカスしているカードからみて、遠くのカードのサイズを小さく表示する機能。
         */
        ForceGraph_CircleUI.prototype.changeUISizeForFarCards = function () {
            this.refreshWhenUpdate();
        };
        return ForceGraph_CircleUI;
    }());
    /**
    * 丸の中の文字列が、この値未満の場合にのみ1行で表示すると判断するための閾値（Lサイズ用）
    * htmlファイル上のMyDefTextPathLで並んでいるhの値群のうち、最大のものと一致するべき。
    * @constant
    */
    ForceGraph_CircleUI.SVG_TEXT_SINGLE_LINE_L_LENGTH = 90;
    /**
    * 丸の中の文字列が、この値未満の場合にのみ2行で表示すると判断するための閾値（Mサイズ用）
    * htmlファイル上のMyDefTextPathM2とMyDefTextPathM3で並んでいるhの値群のうち、最大のものと一致するべき。
    * @constant
    */
    ForceGraph_CircleUI.SVG_TEXT_SINGLE_LINE_M2_LENGTH = 58;
    /**
    * 丸の中の文字列が、この値未満の場合にのみ3行以上で表示すると判断するための閾値（Mサイズ用）
    * htmlファイル上のMyDefTextPathM2で並んでいるhの値群の和と一致するべき。
    * @constant
    */
    ForceGraph_CircleUI.SVG_TEXT_SINGLE_LINE_M3_LENGTH = 96;
    /**
    * カード間の距離で、片方のノードがサイズ "L"、もう片方のノードがサイズ "M"の場合のもの。
    * なお、両方のノードがサイズ "L" の場合、CV.ConnectionViewer.CARD_DISTANCE を利用すべし
    * @constant
    */
    ForceGraph_CircleUI.CARD_DISTANCE_LM = 163; // = 180 - ((50 + 6) - (34 + 5))
    /**
    * カード間の距離で、両方のノードがサイズ "M"の場合のもの。
    * なお、両方のノードがサイズ "L" の場合、CV.ConnectionViewer.CARD_DISTANCE を利用すべし
    * @constant
    */
    ForceGraph_CircleUI.CARD_DISTANCE_MM = 146; // = 180 - ((50 + 6) - (34 + 5)) * 2
    CV.ForceGraph_CircleUI = ForceGraph_CircleUI;
})(CV || (CV = {}));
//# sourceMappingURL=cv.forcegraph_circleui.js.map